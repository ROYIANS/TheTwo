# Research: Java AI 底包架构、迁移与全栈学习价值

- Query: 静态审计一组 Java AI Maven 展开构件，厘清模型接入、Agent/工具/记忆、Spring 自动配置、RAG/MCP、生产工程成熟度，并评估其对择途和 Java AI 全栈能力建设的价值。
- Scope: mixed（脱敏后的外部 Maven 展开源码证据 + 仓库内已接受的择途产品契约；未联网、未安装依赖、未调用模型或内部服务）
- Date: 2026-08-13

## Findings

### 1. 执行摘要

这组源码不是一套单体“AI 平台”，而是三个世代、数条职责不同的构件集合：

1. **`agent-runtime` 是最新、最值得精读的主线。** 它自研了 Agent 请求/响应协议、ReAct 节点编排、工具注册与权限、人工审批、取消、事件投影、任务控制面和 Spring Boot 装配；图执行由 Spring AI Alibaba Graph 承担，模型协议由 Spring AI 与 `model-core` 适配器承担。POM 将其描述为基于图框架封装的 ReAct 调度引擎，并固定使用 Java 21 和 Spring AI Alibaba Graph `1.1.2.2`（`<java-ai-source>\agent-runtime\pom.xml:15`、`:23`、`:24`、`:28`）。
2. **`model-core` 与 `model-starter-v2` 是模型和协议接入层。** 前者提供 OpenAI-compatible Chat/Embedding/Image 模型、模型管理器、MCP、OpenAPI/HTTP 工具、结构化响应构造器和模型日志；后者主要做 Spring 自动配置、RetryTemplate、配置刷新、RestClient/WebClient 超时和日志装配。推理、工具协议、重试与 observation 的底层语义仍主要来自 Spring AI 和 MCP SDK。
3. **`legacy-hub-*`、`ontology-sdk`、`orchestration-gateway` 是外围或遗留体系。** 旧 Hub 是数据库定义的插件平台；知识库插件把检索请求委托给外部能力端口，不是本地 RAG。Ontology SDK 是查询/函数远端客户端。Orchestration Gateway 主要用代理注解转发 HTTP/SSE，其控制器空返回值不能被误认为本地编排实现。

最值得吸收的不是类数量，而是协议所有权和控制面设计：模型 SDK 只产生工具调用意图，真正副作用由 Agent runtime 经过预检、权限、审批、执行和结果映射后完成；每次运行有独立 run ID 与定义快照；每轮在 settle 节点形成稳定 save point；取消可以传到模型上游；公开事件与内部事件分离；大工具输出会资源化。

主要成熟度缺口同样明确：默认存储大量使用 Noop/InMemory；图缓存名义有界、实际无界；工具计划中的 timeout 没有进入执行器；流式工具在虚拟线程中 `blockLast()`；持久 MCP 客户端缺少明确销毁契约；模型错误分类与重试范围过粗；租户、每用户 BYOK、成本预算、限流熔断没有成为强制边界；展开构件中找不到 JUnit/Mockito 测试源码。

对择途而言，应复用**接口思想与故障语义**，而不是直接引入整套 starter。择途需要把关键机制重写为 tenant-scoped、evidence-first、durable、可恢复并带成本预算的窄纵切；不能把内存默认、完整模型正文日志、内部配置中心/网关耦合、旧插件数据库模型带入首版。

### 2. 证据边界与版本地图

源码集合共有 3,058 个文件，其中 Java 2,777 个、Maven POM 78 个、MANIFEST 77 个、properties 77 个、Boot 自动配置 imports 45 个。目录没有 Git 历史，也没有可构建全部模块的根 POM；它是 Maven 构件展开物，不是可运行仓库。类数量只能说明审计面，不能证明测试、部署或生产成熟度。

| 中性模块名 | 代表版本 | Java 文件数 | 定位与版本理由 |
|---|---:|---:|---|
| `legacy-hub-core` | `1.3.5-RELEASE` | 66 | 旧插件协议、请求上下文与知识库能力 DTO。|
| `legacy-hub-plugin` | `1.4.4-RELEASE` | 121 | 数据库定义的本地/HTTP/知识库插件，固定依赖对应 core RELEASE。|
| `ontology-sdk` | `1.0.0-SNAPSHOT` | 57 | 本体查询 DSL 与远端函数 SDK；样本中只有 SNAPSHOT。|
| `orchestration-gateway` | `1.0.0-SNAPSHOT` | 67 | 网关/Facade 和 SSE 代理；样本中只有 SNAPSHOT。|
| `agent-runtime` | `1.0.0-SNAPSHOT` | 474 | 当前 Agent 协议与运行时主线，Java 21；样本中只有 SNAPSHOT。|
| `model-starter-v1` | `1.0.0-RELEASE` | 29 | 老一代 Spring AI starter；RELEASE 与 SNAPSHOT Java 内容一致，采用 RELEASE。|
| `model-starter-v2` | `1.0.0-SNAPSHOT` | 6 | 新装配层；SNAPSHOT 比 RELEASE 多 RestClient/WebClient 超时支持，故用于行为审计，但不视为稳定发布契约。|
| `model-core` | `1.0.0-SNAPSHOT` | 89 | 模型、MCP 与工具底层；SNAPSHOT 比 RELEASE 多协议 mapper 和 transport 调整。|

`agent-runtime` 的关键依赖包括 Spring AI Alibaba Graph、模型 v2 starter、模型核心、Spring AI chat client 与 Reactor（`<java-ai-source>\agent-runtime\pom.xml:28`）。`model-core` 的 MCP 实现依赖 MCP Java SDK `1.1.2`（`<java-ai-source>\model-core\pom.xml:65`）。Spring AI 与 Spring Boot 的精确版本由缺失的父 POM/BOM 管理，无法从单个展开构件确认。

### 3. 架构与责任边界

#### 3.1 Agent runtime：自研控制协议，第三方图引擎

公共接口将运行入口压缩为 `Flux<AgentStreamEvent> stream` 与 `Mono<AgentInvocationResult> invoke`，业务无需直接依赖图框架 API（`<java-ai-source>\agent-runtime\api\AgentRuntime.java:14`、`:22`、`:30`）。自动配置 imports 依次装入模型、核心 runtime、assembly、Redis 和两种 SSE 适配（`<java-ai-source>\agent-runtime\META-INF\spring\org.springframework.boot.autoconfigure.AutoConfiguration.imports:1`）。

自研责任包括：

- 定义快照、run/session/task/thread ID 与编译图缓存；
- model request/message/tool/result/usage 的内部协议；
- ReAct 节点、工具预检、权限/审批、执行、settle 与 report；
- 取消 token、人工交互、资源引用、计划、委派与上下文压缩接口；
- 内外事件分层、SSE 投影、生命周期、队列与 replay 接口；
- Spring Boot 条件装配和业务扩展点。

第三方责任包括：

- `StateGraph`、`CompiledGraph` 与运行图：Spring AI Alibaba Graph；
- `ChatModel`、`Prompt`、消息、tool callback、usage、OpenAI options、retry 与 observation：Spring AI；
- `Flux`、`Mono`、`Sinks` 与 scheduler：Reactor；
- MCP JSON-RPC 客户端与 transport contract：MCP Java SDK。

因此更准确的成熟度描述是：**在第三方图与模型 SDK 之上，自研了较完整的 Agent runtime 协议和控制面**，而不是“自研全部 Agent 引擎底层”。

#### 3.2 模型层：可替换模型键与协议映射

模型自动配置在 `AIModelManager` 存在时把它适配成 `AgentModelClient`，并允许业务自定义 bean 覆盖（`<java-ai-source>\agent-runtime\autoconfigure\AgentModelAutoConfiguration.java:24`、`:40`、`:58`）。`Aiv2AgentModelClient` 按 `modelKey` 取得 ChatModel，同步调用或流式调用；流式取消通过 `takeUntilOther` 传播到 Spring AI/WebClient 上游（`<java-ai-source>\agent-runtime\model\springai\Aiv2AgentModelClient.java:54`、`:68`、`:73`）。

`SpringAiAgentModelMapper` 集中转换 Prompt、Message、ToolCall 与 Usage，并强制关闭 Spring AI 内部工具执行，让 runtime 自己控制权限、并发、事件与结果落点（`<java-ai-source>\agent-runtime\model\springai\SpringAiAgentModelMapper.java:78`、`:258`、`:267`、`:278`、`:286`）。这是最有价值的边界之一：供应商模型只产生工具调用意图，领域运行时拥有副作用执行权。

模型管理器为同一 `modelKey` 维护模型列表与原子计数器，选择策略是轮询，而不是健康、延迟或成本感知路由（`<java-ai-source>\model-core\client\AIModelManager.java:451`、`:467`、`:474`）。它也能注册 EmbeddingModel，并允许通过网关按 modelKey 动态创建和缓存（同文件 `:683`、`:698`）。

#### 3.3 模型 v2 starter：装配层，不是独立模型网关

`model-starter-v2` 依赖模型核心、Spring AI retry/openai/chat 与配置刷新 starter（`<java-ai-source>\model-starter-v2\pom.xml:26`）。SNAPSHOT 新增的专用 RestClient/WebClient 配置给非流式模型调用设置 connect/read timeout，并给流式 Reactor Netty 设置 response/read/write timeout（`<java-ai-source>\model-starter-v2\autoconfigure\ModelAutoConfiguration.java:131`；`<java-ai-source>\model-starter-v2\http\ModelRestClientSupport.java:39`；`<java-ai-source>\model-starter-v2\http\ModelWebClientAutoConfiguration.java:64`、`:76`）。它的本质是 Boot glue，不应描述为独立 Agent 框架。

#### 3.4 外围和遗留模块

- 旧知识库插件可以先做问题优化，再调用能力端口；客户端只负责构造 repo/topK/score/rerank 等请求并委托外部 API（`<java-ai-source>\legacy-hub-plugin\kb\KbSearchPlugin.java:40`、`:52`；`<java-ai-source>\legacy-hub-plugin\kb\KbAbilityClient.java:25`、`:37`）。展开源码没有索引、切块、向量库、embedding 写入或召回算法实现。
- Ontology SDK 组装查询对象，把查询或函数请求包装成 JSON，经 JDK HttpClient 发往远端 endpoint，再 hydrate 返回值（`<java-ai-source>\ontology-sdk\client\DefaultOsdkClient.java:45`、`:67`；`<java-ai-source>\ontology-sdk\remote\HttpTransportService.java:38`、`:46`、`:60`）。其中的 `AgentInvokeRequest` 只是远端协议 DTO，不在本地运行 Agent（`<java-ai-source>\ontology-sdk\function\AgentInvokeRequest.java:20`、`:45`）。
- Orchestration Gateway 的 workflow/ontology controller 方法由代理注解转发到其他服务；执行上下文、结果和 SSE 都是转发（`<java-ai-source>\orchestration-gateway\workflow\ExecutionForwardController.java:23`、`:30`、`:37`）。空返回值由代理基础设施接管，不能证明目标服务内部如何编排。
- 旧插件体系与新 Agent 工具体系没有找到源码支持的桥接。两者同时引入会形成两套注册、校验、日志与执行语义。

### 4. Java Agent 端到端调用链

```text
Spring Boot AutoConfiguration.imports
  -> AgentModelAutoConfiguration
  -> AIModelManager -> Aiv2AgentModelClient
  -> Agent core / assembly / Redis / SSE auto-configuration
  -> AgentRuntime.stream | invoke
  -> DefaultAgentRuntime: new runId + definition snapshot
  -> ReactAgentGraphTemplate -> CompiledGraph
  -> Start -> ContextLoader -> TurnPrepare -> Dispatch(model)
  -> SpringAiAgentModelMapper -> ChatModel.call | stream
  -> model text or tool calls
  -> ToolPreflight -> PermissionGuard -> ToolExecutor
  -> TurnSettle(save point + loop decision)
  -> next turn | Report | End
  -> terminal records + conversation memory + public events/SSE
```

1. `DefaultAgentRuntime` 为每次实际执行生成新 run ID，加载运行时定义并冻结快照；随后保存 started 记录、编译图、构造初始 state 与 RunnableConfig（`<java-ai-source>\agent-runtime\runtime\DefaultAgentRuntime.java:213`、`:217`、`:225`、`:231`）。
2. 同步路径调用 `CompiledGraph.invoke`，从最终 state 投影 output、status 和 resource ref，再保存 terminal records、会话记忆与终态事件（同文件 `:234`、`:237`、`:244`、`:251`）。取消与失败分别进入 CANCELLED 结果和稳定 runtime exception（同文件 `:256`、`:264`）。
3. `ReactAgentGraphTemplate` 注册 ContextLoader、TurnPrepare、Dispatch、ToolPreflight、PermissionGuard、ToolExecutor、TurnSettle、End 以及可选 Report 节点（`<java-ai-source>\agent-runtime\graph\react\ReactAgentGraphTemplate.java:141`）。条件边把模型输出路由到工具或 settle，工具执行后再 settle，settle 决定继续、报告或结束（同文件 `:163`、`:173`、`:177`、`:183`）。
4. 模型节点通过 model client 与 mapper 进入 Spring AI ChatModel；mapper 复用目标模型原生 Options，关闭 SDK 内部工具执行并映射 tool call/usage（`<java-ai-source>\agent-runtime\model\springai\SpringAiAgentModelMapper.java:90`、`:101`、`:267`）。
5. `ToolPreflightNode` 校验参数与工具存在性、决定整批顺序或并行、保留模型调用顺序，并生成 maxConcurrency/timeout 计划（`<java-ai-source>\agent-runtime\graph\react\node\ToolPreflightNode.java:43`、`:90`、`:115`）。
6. `ToolPermissionGuardNode` 根据 ALLOW/DENY/ASK 分流；ASK 创建 approval 并把执行置为 `WAITING_TOOL_APPROVAL`（`<java-ai-source>\agent-runtime\graph\react\node\ToolPermissionGuardNode.java:54`、`:111`、`:138`）。
7. `ToolExecutorNode` 调用执行器，按模型原始次序排序 tool results；遇到 human interaction 切到 `WAITING_HUMAN`，否则转换为下一轮模型可读消息（`<java-ai-source>\agent-runtime\graph\react\node\ToolExecutorNode.java:52`、`:68`、`:79`、`:82`）。
8. `AgentToolExecutionSupport` 校验 JSON、运行 interceptor、执行同步/流式工具并发布 delta；超过阈值的输出写入 resource gateway，只把 preview 与 `read_resource` 指令交还模型（`<java-ai-source>\agent-runtime\tool\AgentToolExecutionSupport.java:137`、`:174`、`:203`、`:315`、`:326`、`:393`）。
9. `TurnSettleNode` 是 assistant/tool 消息进入稳定历史的边界；它生成不可变 save point，发布 turn/loop 事件并写入下一步 loop decision（`<java-ai-source>\agent-runtime\graph\react\node\TurnSettleNode.java:69`、`:75`、`:80`、`:86`、`:100`、`:116`）。
10. 流式路径为每次调用创建专属 publisher，把 Graph 放到 `boundedElastic` 执行；取消订阅会 dispose graph subscription（`<java-ai-source>\agent-runtime\runtime\DefaultAgentRuntime.java:273`、`:288`、`:300`、`:320`、`:390`）。公开事件先经过可见性和 payload/metadata 白名单，再由 WebFlux SSE 输出（`<java-ai-source>\agent-runtime\event\DefaultAgentStreamEventMapper.java:35`、`:74`；`<java-ai-source>\agent-runtime\web\AgentSseHandler.java:39`、`:54`）。

### 5. AI 能力矩阵

| 能力 | 源码事实 | 判定 |
|---|---|---|
| 多模型接入 | OpenAI-compatible Chat/Embedding/Image 工厂；modelKey 注册、轮询与动态缓存；可注入自定义 ModelFactory。 | 可用接入层，路由策略较浅。|
| 同步/流式模型 | Runtime 与 model client 均提供 sync/stream；取消信号可传到 WebClient。 | 主链完整。|
| 工具/function calling | 内部 tool schema/choice/result 协议；关闭 Spring AI 自动执行，由 runtime 管控。 | 设计较深，值得学习。|
| ReAct/Agent graph | 自研节点和边，底层 Graph/CompiledGraph 来自 Spring AI Alibaba Graph。 | 自研控制逻辑 + 第三方图引擎。|
| 结构化输出 | 模型核心能从 Class/JSON Schema 生成 Spring AI `JSON_SCHEMA`（`<java-ai-source>\model-core\utils\ResponseFormatBuilder.java:43`、`:75`）；但 Agent request 没有 response schema 字段，AIV2 capability 固定 `structuredOutput=false`（`<java-ai-source>\agent-runtime\model\AgentModelRequest.java:16`；`<java-ai-source>\agent-runtime\model\springai\Aiv2AgentModelClient.java:97`）。 | 底层工具存在，Agent 主链未暴露或强制业务 schema。|
| RAG/向量检索 | 模型管理器可注册 EmbeddingModel；旧知识库插件委托外部能力端口。 | 没有本地 vector store/retrieval pipeline 证据。|
| 会话记忆 | Runtime 有 memory 抽象与保存点，但默认 `NoopAgentConversationMemoryStore`。 | 接口存在，默认不持久。|
| 上下文压缩 | 有 compression store、prompt-too-long 特殊分类与摘要链路接口。 | 有控制面，展开源码不能验证真实质量。|
| MCP | 支持 STDIO、SSE、Streamable HTTP、工具发现与调用；基于 MCP SDK 1.1.2。 | 功能存在，生命周期和阻塞调用有风险。|
| OpenAPI/HTTP 工具 | 模型核心引入 Swagger parser，并存在 HTTP/OpenAPI tool adapter。 | 可作适配器参考，不等于安全执行沙箱。|
| 人工介入/审批 | 工具 ASK、approval TTL、waiting state、human interaction envelope 与 resume plan。 | 控制协议较完整，默认存储多为内存。|
| 计划/子 Agent | Plan、delegation、task queue、inbox 接口和可选 Redis 实现。 | 广度高，耐久性需业务补齐。|
| 事件/SSE/replay | 内外事件、单调 sequence、公开白名单、WebFlux/MVC SSE、可选 Redis Stream。 | 实时主链完整；默认 replay archive 是 Noop。|

### 6. 生产工程成熟度矩阵

| 维度 | 已实现证据 | 缺口与风险 | 评价 |
|---|---|---|---|
| Retry | Spring AI RetryTemplate 注入模型；Agent interceptor 默认再重试 5 次，等待 5/10/20/30/30 秒（`<java-ai-source>\agent-runtime\model\AgentModelRetryOptions.java:29`；`<java-ai-source>\agent-runtime\model\AgentModelRetryInterceptor.java:60`）。 | 除 `PROMPT_TOO_LONG` 外所有失败均重试；错误分类只有 NONE/UNKNOWN/EMPTY/PROMPT_TOO_LONG，可能重试认证和参数等永久错误（`<java-ai-source>\agent-runtime\model\AgentModelErrorCode.java:10`；`<java-ai-source>\agent-runtime\model\AgentModelErrorClassifier.java:43`）。还需警惕 SDK retry 与 Agent retry 叠乘。 | 部分成熟。|
| Timeout | v2 starter 为 RestClient/WebClient 配超时；MCP 初始化和 listTools 有 timeout。 | 工具执行计划虽含 10 分钟 timeout，注释明确后续再接入细粒度控制，执行器没有消费该字段（`<java-ai-source>\agent-runtime\graph\react\node\ToolPreflightNode.java:58`、`:115`）。 | 模型传输有，Agent/tool 不完整。|
| Cancel | Runtime token、节点检查、stream subscription dispose、模型 `takeUntilOther` 上游传播；并行异常会 `shutdownNow`。 | 同步第三方 ToolCallback 必须自行响应中断；阻塞 SDK 是否真正取消网络请求需运行验证。 | 主链设计良好，端到端依赖适配器。|
| Backpressure/streaming | 单订阅 Sinks 使用 `onBackpressureBuffer`，发布串行化并分配 sequence（`<java-ai-source>\agent-runtime\event\StreamingAgentEventPublisher.java:41`、`:43`、`:74`）。 | 缓冲没有源码可见的上限或丢弃策略；图跑在 boundedElastic，流式工具 `blockLast()`；慢 SSE 消费者可能积压内存。 | 语义明确但不是全非阻塞。|
| 并发 | 并行工具用 semaphore 限流，每批创建虚拟线程 executor，结束时 shutdown（`<java-ai-source>\agent-runtime\tool\AgentToolExecutionSupport.java:433`）。 | 每批新建 executor；没有跨 run、provider、tenant 的全局并发和公平配额。 | 单批可控，全局治理不足。|
| Cache | 动态模型缓存可 clear；编译图按 snapshot key `computeIfAbsent`。 | `maximumSize` 只记录配置，实际是无界 ConcurrentHashMap（`<java-ai-source>\agent-runtime\graph\AgentCompiledGraphCache.java:23`、`:30`、`:50`）。 | 有泄漏风险。|
| Persistence/recovery | session/task/thread/run、queue、inbox、approval、replay、resource、plan 均有接口；Redis 提供 stream/queue/inbox/delegation（`<java-ai-source>\agent-runtime\autoconfigure\AgentRedisAutoConfiguration.java:35`、`:59`、`:82`、`:103`）。 | 默认会话 memory/replay 为 Noop，task/approval/resource/plan/delegation/context/inbox 多为 InMemory（`<java-ai-source>\agent-runtime\autoconfigure\AgentAutoConfiguration.java:311`、`:617`）。Redis 不覆盖全部状态，不能据此宣称完整跨进程恢复。 | 控制面广，默认实现偏原型。|
| Tenant isolation | metadata 可携带 tenant，自定义存储可以自行隔离。 | 公共 request/store key 没有统一强制 TenantContext；模型缓存和 graph cache 进程共享；未找到行级隔离、访问策略或 tenant quota。 | 不满足择途首版多用户隔离契约。|
| Secrets/BYOK | provider properties 支持 baseUrl/apiKey，可从业务配置系统注入。 | `apiKey` 是普通字符串字段（`<java-ai-source>\model-core\client\AIProviderProperties.java:33`）；没有 per-user secret vault、加密、轮换或最小披露策略证据。 | 配置能力，不是秘密治理。|
| Audit/privacy | Agent 内外事件分离，公开映射白名单；工具权限与 approval 有决策事件。 | 模型日志对象保存完整 requestBody/responseBody、token、user/app/task（`<java-ai-source>\model-core\log\ModelLog.java:68`、`:104`）；WebClient 会捕获流式正文（`<java-ai-source>\model-core\log\ModelLogWebClientCustomizer.java:104`、`:142`）。未见默认脱敏、字段授权和 retention 强制。 | Agent 事件边界好，模型日志有高敏风险。|
| Metrics/observability | Chat/Embedding 工厂注入 Micrometer `ObservationRegistry`；模型日志有 token、耗时、错误、trace/user/task。 | 未发现 SLO dashboard、业务质量/eval 指标或统一 trace 跨工具/作业证明。日志异步为每次记录启动一个虚拟线程（`<java-ai-source>\model-core\log\ModelLogWebClientCustomizer.java:335`）。 | 基础观测存在，运营闭环未证实。|
| Cost/budget | max tokens、usage/token capture、Agent maxIterations/graph node budget 防止无限循环。 | `costTime` 表示耗时而非金额；未找到 price ledger、tenant/model 金额预算、quota、hard stop 或对账。 | 没有成本治理。|
| Circuit breaker/rate limit | 单批工具 semaphore，modelKey 轮询。 | 未找到 provider rate limiter、circuit breaker 或 health-aware failover。 | 缺失。|
| Resource lifecycle | 临时 MCP 客户端在发现/调用后关闭；stdio transport close 时 terminate process 并 dispose scheduler（`<java-ai-source>\model-core\mcp\McpToolCallback.java:99`；`<java-ai-source>\model-core\mcp\CustomStdioClientTransport.java:375`）。 | keepAlive callback/provider 不实现 Closeable/销毁方法；异步 HTTP MCP 初始化失败路径未像同步路径显式关闭；工具流阻塞聚合。 | 局部处理，所有权契约不完整。|
| Exception semantics | Agent runtime 有稳定 message code；模型错误会裁剪，prompt-too-long 单独分类。 | 模型错误分类严重不足，常依赖异常文本；MCP/Ontology SDK 多包装 Runtime/IllegalState，远端响应可能进入异常文本。 | Agent 层较好，adapter 层偏粗。|
| Testing | POM 声明 Spring Boot test/JUnit；重试 sleeper 可替换，若干接口适合 fake。 | 2,777 个展开 Java 文件中未找到 `org.junit`、Mockito 或 `@Test` 源码；没有根构建，不能编译运行，也不能证明发布前测试通过。 | 可测试性不等于已有测试证据。|

综合判断：这套底包具有**认真设计的框架骨架与若干生产意识**，但不能从展开源码称为“开箱即用的生产级 Agent 平台”。最成熟的是协议边界、工具执行控制、取消与事件投影；最薄弱的是强制租户边界、完整 durable state、成本/限流/熔断、资源关闭、错误分类和可验证测试。

### 7. API、扩展性与深层设计评价

值得学习的设计：

- `AgentRuntime`、`AgentModelClient`、`AgentToolExecutor` 等接口把业务协议与 Spring AI/Graph 类型隔离，降低框架替换成本。
- 定义 snapshot 和 run ID 把“配置版本”与“实际运行尝试”分开；save point 是每轮稳定消息边界，取消不会把已产生消息静默丢掉。
- 模型 SDK 不执行工具。工具意图必须经过预检、权限、审批、执行和结果映射，这是副作用安全的正确所有权划分。
- 内部事件与公开 SSE 分离，公开 payload/metadata 白名单优于直接序列化 provider response。
- 大工具输出资源化，避免把全文塞回模型上下文；模型只能按窗口调用 `read_resource`。
- Spring 自动配置普遍使用 `@ConditionalOnMissingBean`，业务可以替换存储、权限、模型与映射器。

需要改进或避免的设计：

- 模块广度远超默认实现深度。Plan、delegation、human、approval、replay、resource 都有类型，但生产默认多为内存或 Noop；接口存在不能当能力闭环。
- `structuredOutput` 能力位注释承诺调度节点可用 JSON Schema，但 AIV2 adapter 固定返回 false，request 也不带 schema，能力模型与真实主链存在漂移。
- timeout 被建模但没有执行，maximumSize 被配置但没有约束。这类“字段先行”会给运维造成虚假安全感。
- MCP callback/provider 把同步阻塞隐藏在普通 `call()` 内，persistent client 的所有权没有暴露；适合易用原型，不适合严谨服务生命周期。
- 旧插件体系与新 Agent 工具体系并存且没有桥接证据，同时引入会制造重复抽象与历史包袱。

### 8. 与择途产品契约的对照

择途要求用户拥有并可纠正职业事实，并保持用户事实、AI 推断、未知与冲突可区分（`docs/decisions/0007-user-owned-career-profile.md:24`；`docs/decisions/0008-user-final-authority-over-profile.md:24`）。它还要求自部署/BYOK、最小必要外发、证据优先、用户亲自沟通投递，以及同一实例内多用户和凭据隔离（`docs/decisions/0009-self-hosted-open-source-product.md:24`；`docs/decisions/0011-minimum-necessary-external-disclosure.md:24`；`docs/decisions/0014-evidence-first-decision-support.md:25`；`docs/decisions/0015-application-ready-mvp-boundary.md:25`；`docs/decisions/0022-isolated-multi-user-self-hosting.md:25`）。MVP 还要求保存证据来源、时间、强弱、冲突和未知，并允许失败后继续或重试（`docs/product/mvp-experience-backbone.md:289`、`:318`、`:380`）。

Java AI 底包解决的是通用执行协议，没有择途的 career fact/evidence/judgment 领域模型。其 metadata、permission、resource、event 机制能承载一部分需求，但不会自动产生用户最终权威、证据追溯、最小披露或租户隔离。

### 9. 四级迁移建议

| 级别 | 建议 | 原因与择途落点 |
|---|---|---|
| **可直接复用思想或小接口** | `AgentRuntime` sync/stream 边界、model/tool 内部协议、run ID 与 definition snapshot、取消 token、公开事件信封、工具 permission/approval 效果、大结果 resource ref。 | 这些是领域无关的稳定契约，适合用择途命名重新实现；优先复用思想而非复制内部包。|
| **适合重写吸收** | durable job/session/run、tenant-scoped memory/evidence/resource、模型 gateway/BYOK、schema-validated output、recoverable SSE、bounded cache、工具 timeout、成本预算与审计。 | 必须把择途的 user/evidence/disclosure/credential 约束放入主键、事务和授权层，不能靠 metadata 约定。|
| **仅作学习材料** | Spring AI mapper 的 options/tool/usage 转换、ReAct 节点拆分、MCP 三种 transport、OpenAPI/HTTP 工具、Ontology 查询 DSL、旧 plugin enhancer chain。 | 有助理解适配器与扩展点，但领域和基础设施耦合强，直接迁移收益低。|
| **不应引入** | 老/新两套模型 starter 与两套工具体系并存、内部配置中心/网关/代理注解耦合、完整模型正文日志、Noop/InMemory 作为生产默认、无界 graph cache、把远端知识库调用宣称为本地 RAG。 | 会扩大历史包袱，违反择途多用户、最小披露和可恢复要求，并制造能力错觉。|

择途近期不需要先建设通用大型 Agent 框架。更合理的第一步是一个窄纵切：tenant-scoped 机会研究 job -> 结构化模型调用 -> evidence 保存 -> 可恢复事件 -> cancel/retry -> budget -> 用户审核。只有第二个真实工作流出现重复时，再抽取通用 runtime。

### 10. Java AI 全栈学习顺序与可验证实践

学习目标不是“会调用 Spring AI”，而是能解释协议所有权、失败语义、耐久状态、隐私成本与验证证据。

| 顺序 | 读懂对象 | 亲自实践 | 可验证验收物 |
|---:|---|---|---|
| 1 | `AgentModelRequest/Response/Message/ToolSchema` 与 Spring AI mapper | 写一个 provider-neutral LLM gateway，支持 sync/stream、usage、typed errors、JSON Schema。 | Contract tests 覆盖正常、空响应、schema invalid、429/401/timeout、stream cancel；两个 fake provider 通过同一套测试。|
| 2 | `AgentRuntime`、run ID/snapshot、默认 runtime | 做一个只有 3 个阶段的 durable job，状态落 PostgreSQL，worker 重启可接管。 | 故障注入：每阶段 crash 后恢复；重复消息不产生重复 evidence；run attempt 历史可查询。|
| 3 | ToolPreflight/PermissionGuard/Executor/TurnSettle | 实现 read-only research tool 与显式 side-effect tool；副作用必须 approval + idempotency key。 | 非法 JSON、越权、审批过期、重复提交、取消、工具 timeout、并发上限测试。|
| 4 | Streaming publisher、public mapper、Redis bridge | 实现带 event ID/sequence 的 SSE，断线用 `Last-Event-ID` 恢复。 | 慢消费者与重连测试；事件不乱序、不丢终态、不泄露内部 prompt/provider body。|
| 5 | Memory/resource/context compression | 建立 tenant-scoped evidence/resource store，大输出分页读取；不要先做通用“长期记忆”。 | 两租户交叉 ID 访问全部 403/404；资源 hash/source/time 可追溯；被用户否定的事实不再进入 prompt。|
| 6 | Retry/timeout/circuit/rate/cost | 实现 typed retry policy、provider circuit breaker、全局/tenant concurrency、token 与金额 hard budget。 | 测试证明 401 不重试、429 遵循 backoff、预算耗尽终止、熔断恢复、成本账本与 provider usage 对账。|
| 7 | RAG/evidence retrieval | 用关系数据库先做 evidence filter + full-text/vector hybrid retrieval，并返回 citation；不要把 embedding model 注册当 RAG。 | 固定评测集记录 Recall@k、citation precision、无证据拒答率；每个结论可跳回 source span。|
| 8 | Evaluation/operations | 为机会研究建立离线 eval 和生产观测。 | dataset/version/prompt/model 可追踪；质量、延迟、token、金额、失败率 dashboard；发布前 regression gate。|

可以形成的真实简历证据：

- 设计 provider-neutral Java LLM gateway，用同一套 contract test 覆盖两种 OpenAI-compatible provider，流式取消后上游连接在可测时间内终止。
- 实现 PostgreSQL durable AI job，注入多个 crash point 验证重启恢复与幂等，重复执行不产生重复 evidence。
- 实现 tenant-scoped BYOK 与最小披露策略，跨租户授权测试覆盖职业事实、证据、凭据、事件和导出。
- 实现 token/金额账本与 hard budget，基于真实 usage 做差异对账，明确重试成本与缓存命中。
- 建立带 citation 的研究评测集，公开 Recall@k、citation precision、schema-valid rate 与 unsupported-claim rate，而不是只展示聊天截图。

面试时应能回答：为什么工具执行权不交给 SDK；save point 与 durable checkpoint 有何区别；SSE 取消如何传到 HTTP；哪些错误可重试；如何防止 retry 叠乘；tenant ID 应进入哪些主键与缓存键；为什么完整 prompt 日志违反最小披露；embedding、retrieval、RAG 与 evidence judgment 分别是什么。

### 11. 关键文件索引

- `<java-ai-source>\agent-runtime\pom.xml` - Agent 定位、Java/图框架版本与依赖。
- `<java-ai-source>\agent-runtime\META-INF\spring\org.springframework.boot.autoconfigure.AutoConfiguration.imports` - 自动配置入口清单。
- `<java-ai-source>\agent-runtime\api\AgentRuntime.java` - 同步/流式公共 API。
- `<java-ai-source>\agent-runtime\runtime\DefaultAgentRuntime.java` - run、图执行、终态保存、取消与流式调度。
- `<java-ai-source>\agent-runtime\graph\react\ReactAgentGraphTemplate.java` - 默认 ReAct 节点与条件边。
- `<java-ai-source>\agent-runtime\graph\react\node\ToolPreflightNode.java` - 工具预检与执行计划。
- `<java-ai-source>\agent-runtime\graph\react\node\ToolPermissionGuardNode.java` - ALLOW/DENY/ASK 与审批挂起。
- `<java-ai-source>\agent-runtime\tool\AgentToolExecutionSupport.java` - 工具执行、流式聚合、并发与资源化。
- `<java-ai-source>\agent-runtime\graph\react\node\TurnSettleNode.java` - 稳定消息、save point 与循环边界。
- `<java-ai-source>\agent-runtime\model\springai\SpringAiAgentModelMapper.java` - Spring AI 协议映射与工具执行权隔离。
- `<java-ai-source>\agent-runtime\model\springai\Aiv2AgentModelClient.java` - 模型管理器接入与取消传播。
- `<java-ai-source>\agent-runtime\autoconfigure\AgentAutoConfiguration.java` - 默认 Noop/InMemory 服务与扩展点。
- `<java-ai-source>\agent-runtime\autoconfigure\AgentRedisAutoConfiguration.java` - Redis stream/queue/inbox/delegation 范围。
- `<java-ai-source>\agent-runtime\event\DefaultAgentStreamEventMapper.java` - 对外事件白名单。
- `<java-ai-source>\model-core\client\AIModelManager.java` - 模型注册、轮询与动态缓存。
- `<java-ai-source>\model-core\client\OpenAIModelFactory.java` - Chat/Embedding 工厂、retry 与 observation 注入。
- `<java-ai-source>\model-core\utils\ResponseFormatBuilder.java` - JSON object/schema ResponseFormat 工具。
- `<java-ai-source>\model-core\mcp\McpToolCallback.java`、`<java-ai-source>\model-core\mcp\McpToolCallbackProvider.java` - MCP 工具发现与临时/持久客户端。
- `<java-ai-source>\model-core\mcp\AbstractMcpCreator.java`、`<java-ai-source>\model-core\mcp\CustomStdioClientTransport.java` - MCP 初始化、timeout 与 stdio 进程关闭。
- `<java-ai-source>\model-core\log\ModelLog.java`、`<java-ai-source>\model-core\log\ModelLogWebClientCustomizer.java` - 请求/响应、token、用户/任务与流式日志捕获。
- `<java-ai-source>\legacy-hub-plugin\kb\KbAbilityClient.java` - 知识库检索的远端委托边界。
- `<java-ai-source>\ontology-sdk\remote\HttpTransportService.java` - Ontology SDK 远端 HTTP 执行。
- `<java-ai-source>\orchestration-gateway\workflow\ExecutionForwardController.java` - HTTP/SSE proxy 边界。

### 12. 公开依赖与相关规范

公开依赖版本证据：

- Java 21；Spring AI Alibaba Graph `1.1.2.2`（agent runtime POM）。
- Spring AI chat/openai/retry/observation；具体版本由缺失的父 POM/BOM 管理。
- MCP Java SDK `1.1.2`（model core POM）。
- Reactor、Spring Boot WebFlux/MVC/Redis；具体版本同样由未提供父 POM/BOM 管理。

相关仓库规范与产品文档：

- `.trellis/spec/guides/index.md` - Trellis 工作流和规范路由。
- `../prd.md` - 本次参考系统研究范围与验收条件。
- ADR-0007/0008/0009/0011/0014/0015/0022 与 `docs/product/mvp-experience-backbone.md` - 择途对照依据。

## Caveats / Not Found

- 源码来自 Maven 构件展开目录，没有 Git 历史、tag/commit、根构建和完整父 POM/BOM；无法确认作者意图、分支关系、实际部署配置、精确 Spring AI/Spring Boot 版本或哪些 SNAPSHOT 已投入生产。
- 未安装依赖、未编译、未启动服务，也未连接配置中心、Redis、模型、MCP、知识库、本体或工作流服务。所有结论是静态源码契约，不是运行性能或可用性证明。
- POM 声明测试依赖，但展开的 2,777 个 Java 文件中未找到 JUnit/Mockito/`@Test` 测试源码。无法判断原仓库是否另有测试、测试是否在发布前通过或覆盖率多少。
- 未找到本地 VectorStore、索引、chunking、retriever 或完整 RAG pipeline；只能确认 embedding model 注册和旧知识库远端 API adapter。
- 底层存在 JSON Schema response format 构造器，但未找到 Agent runtime 请求传入 schema、业务校验、repair 或 schema failure 事件主链，不能宣称 Agent 已支持强结构化业务结果。
- 未找到强制 tenant context、per-user BYOK secret vault、行级隔离、价格表/金额账本、tenant quota、provider rate limiter/circuit breaker 或健康感知路由。
- Redis 自动配置只覆盖事件 stream、任务队列、inbox 和 delegation；其他默认状态多为内存或 Noop，不能推断完整故障恢复。
- Gateway 代理目标与知识库能力端口的服务端源码不在当前可确认调用链中；无法评价真实工作流、知识库检索算法及其持久化、租户和成本机制。
- 代码中的注释和字段不等于已执行约束：工具 timeout 与 graph cache maximumSize 是两个明确反例。
