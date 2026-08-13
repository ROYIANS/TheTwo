# Research: Java AI 底包的 RAG 与结构化输出证据

- Query: 核验所给 Java AI Maven 展开构件是否实现本地 RAG/向量检索管线，以及新版 Agent runtime 是否暴露并强制结构化输出契约。
- Scope: internal（仅基于脱敏后的源码证据；未运行模型、知识库或远端服务）
- Date: 2026-08-13

## Findings

### 1. 结论摘要

1. **所给构件没有形成可核验的本地 RAG 管线。** `model-core` 可以创建、注册并按 key 取得 Spring AI `EmbeddingModel`；旧知识库插件可以做问题改写和检索参数编排，但实际检索、按数据集检索、案例写入、文件解析和术语查询都委托给注入的知识库能力端口。展开源码没有该端口的实现，也未发现 Spring AI `VectorStore`、本地向量索引、文档切分/入库、相似度查询，或“召回结果自动注入模型上下文”的完整实现链。
2. **新版 Agent runtime 没有把结构化输出做成可用的公共契约。** 它有 `structuredOutput` 能力描述位，但 AIV2 adapter 明确返回 `false`；`AgentModelRequest`、`AgentModelConfig`、Spring AI options 映射和 `AgentInvocationResult` 都没有 response format、JSON Schema 或 typed output 字段。响应校验只确认文本、思考或工具调用是否为空，没有业务 schema validation、typed decode 或 repair loop。
3. **底层工具存在，但不能向上推导完整能力。** `model-core` 的 `ResponseFormatBuilder` 能构造 `json_object` 和 JSON Schema provider options，遗留 graph adapter 也能设置这些 options；这只证明“可向部分 provider 发送格式提示/约束”，不证明新版 runtime 会验证最终业务对象、保留 schema 失败语义或自动修复不合法结果。

### 2. RAG 证据链

#### 2.1 已实现：EmbeddingModel 的创建、注册和轮询取得

模型工厂接口同时暴露 chat、embedding、image 创建方法；OpenAI-compatible 工厂会校验 embedding path，构造 OpenAI API 和 `OpenAiEmbeddingModel`，并注入 RetryTemplate 与 ObservationRegistry（`<java-ai-source>\model-core\client\ModelFactory.java:33`；`<java-ai-source>\model-core\client\OpenAIModelFactory.java:229`、`:240`、`:252`）。

模型管理器为 embedding model 维护注册表、锁、轮询计数器与动态缓存：

- 注册时调用 ModelFactory 创建 EmbeddingModel 并写入按 modelKey 分组的列表（`<java-ai-source>\model-core\client\AIModelManager.java:226`、`:230`、`:234`）。
- 取得模型时先从注册列表按原子计数器轮询；没有静态模型且配置了网关时，才按 modelKey 动态创建并缓存（同文件 `:683`、`:687`、`:689`、`:698`、`:700`）。
- 支持清空全部或单个 modelKey 的动态 embedding 缓存（同文件 `:1018`、`:1022`、`:1034`）。

这些代码证明模型调用基础设施支持 embedding，不证明文档如何切分、embedding 如何持久化、查询如何召回，更不证明召回结果如何进入 LLM prompt。

#### 2.2 已实现：旧知识库插件的查询改写和远端请求编排

旧知识库搜索插件的执行链是：

```text
PluginRequest + PluginContext
  -> KbSearchPlugin.checkValid
  -> optional QuestionOptimizationAbility
  -> KbAbilityClient.search
  -> injected KnowledgeBaseAbilityApi.search
  -> map remote response into plugin output DTO
```

源码证据：

- 插件从输入取得原问题；若开启优化，则调用模型生成补充查询；最后委托知识库客户端并记录 original/optimized questions（`<java-ai-source>\legacy-hub-plugin\kb\KbSearchPlugin.java:40`、`:43`、`:45`、`:52`、`:53`）。
- 按数据集搜索插件执行同样的可选查询改写，再委托 `searchByCollections`（`<java-ai-source>\legacy-hub-plugin\kb\KbCollectionSearchPlugin.java:42`、`:50`、`:52`、`:62`）。
- 客户端只把 repo IDs、topK、最低相关分、search mode、rerank、拦截开关和 questions 组装成 request，然后调用注入的能力端口（`<java-ai-source>\legacy-hub-plugin\kb\KbAbilityClient.java:23`、`:25`、`:27`、`:29`、`:37`）。
- 客户端也只是把按数据集检索、案例批量写入、术语查询转发到同一能力端口（同文件 `:50`、`:63`、`:76`、`:82`、`:85`）。

这条链说明旧插件层负责 DTO 转换和 query orchestration，真实知识库检索算法在当前展开源码之外。

#### 2.3 未找到：本地检索管线的必要组件

在所给构件内，没有找到能够连接成以下流程的实现证据：

```text
source document
  -> parser / chunker
  -> embedding
  -> local vector store/index write
  -> metadata and tenant filters
  -> similarity/hybrid retrieval
  -> rerank
  -> citation-bearing context
  -> prompt assembly
  -> grounded answer validation
```

特别未找到：

- Spring AI `VectorStore` 或等价本地持久化端口的实现；
- 文档 chunk identity、去重、增量重建、删除传播和索引版本；
- 向量查询、全文/向量混合召回、tenant filter 和 ACL；
- retrieval result 到新版 Agent prompt/context view 的桥接；
- citation span、source time、冲突、未知与 unsupported claim 校验；
- Recall@k、MRR、citation precision 或 groundedness 评测。

因此报告只能说“具备 embedding 模型接入与远端知识库 adapter”，不能说“Java AI 底包实现了 RAG”。

### 3. 结构化输出证据链

#### 3.1 底层已实现：ResponseFormat 构造工具

`ResponseFormatBuilder` 基于 Spring AI 类型提供多种构造方式：

- `jsonObject()` 生成 `ResponseFormat.Type.JSON_OBJECT`（`<java-ai-source>\model-core\utils\ResponseFormatBuilder.java:20`、`:26`）。
- `fromClass` 用 Spring AI `JsonSchemaGenerator` 从 Java Class 生成 schema，默认 strict=true，并构造 `ResponseFormat.Type.JSON_SCHEMA`（同文件 `:43`、`:50`、`:75`、`:80`、`:83`）。
- 还可以从 schema 字符串或 Map 构造 JSON Schema response format（同文件 `:121`、`:127`、`:170`、`:186`、`:193`）。

OpenAI-compatible 模型工厂会读取 provider options 的 `responseFormat` 字符串；静态配置只显式映射 `json_object`，然后交给 Spring AI chat options（`<java-ai-source>\model-core\client\OpenAIModelFactory.java:91`、`:93`、`:94`、`:133`）。这说明底层存在 provider-specific format option，但配置入口的能力还弱于通用 builder。

#### 3.2 新 runtime 有能力位，但 adapter 明确关闭

`AgentModelCapability` 包含 `structuredOutput` 布尔位，注释称支持时 runtime 可为调度节点使用 JSON Schema 约束输出；默认 capability 为 false（`<java-ai-source>\agent-runtime\model\AgentModelCapability.java:25`、`:29`、`:31`、`:50`）。

AIV2 model client 的 capability 则固定返回：streaming、tool calls、parallel tools、reasoning 为 true，structured output 为 false（`<java-ai-source>\agent-runtime\model\springai\Aiv2AgentModelClient.java:96`、`:98`）。因此当前主适配器明确没有宣称结构化输出可用。

#### 3.3 新 runtime request/config 没有 schema 契约

`AgentModelRequest` 只包含：

- model run ID 与 model key；
- `AgentModelConfig`；
- 已组装消息；
- available tool schemas 与 tool choice；
- context metadata。

该 record 没有 response format、schema、output class、decoder 或 validation policy（`<java-ai-source>\agent-runtime\model\AgentModelRequest.java:16`、`:21`、`:25`、`:30`、`:34`、`:38`、`:42`、`:46`）。

`AgentModelConfig` 管理 temperature、topP、max completion tokens、thinking、reasoning effort 等模型参数，但没有 output schema（`<java-ai-source>\agent-runtime\definition\AgentModelConfig.java:14`、`:25`、`:34`、`:43`）。

Spring AI mapper 会根据目标 ChatModel 的默认 options 类型构造通用、OpenAI 或内部兼容 options，并设置工具、stream usage 和模型参数；没有读取或设置 response schema（`<java-ai-source>\agent-runtime\model\springai\SpringAiAgentModelMapper.java:101`、`:245`、`:258`、`:278`、`:297`）。

#### 3.4 新 runtime result/validation 没有 typed decode

`AgentInvocationResult` 投影执行 IDs、状态、文本 output、resource ref 与 metadata，没有泛型 typed result 或 schema validation errors（`<java-ai-source>\agent-runtime\invocation\AgentInvocationResult.java:12`、`:16`）。默认 runtime 从 final graph state 读取字符串 output，再构造 terminal result（`<java-ai-source>\agent-runtime\runtime\DefaultAgentRuntime.java:237`、`:239`、`:244`）。

模型节点对响应的核心有效性判断是：成功标记、文本/思考/tool calls 是否存在，以及 tool calls 是否满足基本协议；没有把最终文本反序列化为业务类型并做 JSON Schema 校验（`<java-ai-source>\agent-runtime\graph\react\node\AbstractModelNode.java:331`、`:345`）。

因此当前链路缺少：

- per-call JSON Schema/typed output 输入；
- provider 是否支持 schema 的真实 capability negotiation；
- 输出 JSON parse + schema validation；
- validation error 的稳定 error code/event；
- repair prompt、最大修复次数和失败终态；
- typed result 与原始输出、schema version 的共同持久化。

#### 3.5 遗留 graph adapter 只能作为历史证据

遗留 graph 相关代码可以在特定模型节点上设置 response format，并可能调用底层 builder；但它不在新版 Agent runtime 的 request/result 主链内。即使遗留模块能要求 provider 返回 JSON，也不能推导新版 runtime 会做本地 schema validation 或 typed decode。两代实现应分开评价，不能拼接成一个虚构的完整功能。

### 4. 对择途的直接含义

择途的机会研究和职业事实更新不能依赖“模型通常会返回 JSON”。其结构化结果至少需要：

1. 每类 AI 操作使用版本化 schema；请求同时保存 schema ID/version、prompt version、model/provider 与 disclosure scope。
2. provider response 先保留原文，再本地 parse 和 schema validate；失败进入明确的 repair 或人工检查状态，不能静默丢字段或当成功。
3. 事实、推断、未知、冲突、source ref 与 confidence 必须是领域 schema 的一部分，而不是只在自然语言 prompt 中要求。
4. repair 有独立次数与成本预算；原始错误、修复尝试和最终结果可审计。
5. RAG 先围绕 evidence retrieval 建设：tenant/ACL filter、source span、时间、冲突与 citation 优先于通用“长期记忆”。
6. EmbeddingModel、VectorStore、retriever、reranker、context assembler 和 judgment 分层测试，不把任一组件存在视为端到端 RAG 完成。

建议的最小验证纵切：

```text
tenant-scoped job
  -> evidence query with source spans
  -> versioned structured LLM request
  -> local schema validation
  -> at most one bounded repair
  -> preserve raw + validated result
  -> publish recoverable event
  -> user review/correction
```

验收指标应至少包括 schema-valid rate、repair success rate、unsupported-claim rate、citation precision、Recall@k、每次成功结果的 token/金额与跨租户授权测试。

### 5. Files found

| 中性文件引用 | 一行说明 |
|---|---|
| `<java-ai-source>\model-core\client\ModelFactory.java` | 底层模型工厂接口，创建 chat、embedding、image 模型。 |
| `<java-ai-source>\model-core\client\AIModelManager.java` | 注册、缓存并轮询选择 chat/embedding/image 模型。 |
| `<java-ai-source>\model-core\client\OpenAIModelFactory.java` | 创建 OpenAI-compatible chat/embedding client，并映射静态 `json_object` 配置。 |
| `<java-ai-source>\model-core\utils\ResponseFormatBuilder.java` | 使用 Spring AI 类型构造 JSON object / JSON Schema response format。 |
| `<java-ai-source>\legacy-hub-core\kb\KnowledgeBaseAbilityApi.java` | 旧知识库平台的能力端口，定义搜索、数据集搜索、写案例、文件解析与术语查询。 |
| `<java-ai-source>\legacy-hub-plugin\kb\KbAbilityClient.java` | 把插件 DTO 转为能力端口请求并直接调用该端口。 |
| `<java-ai-source>\legacy-hub-plugin\kb\KbSearchPlugin.java` | 可选 LLM 查询改写，然后委托知识库检索。 |
| `<java-ai-source>\legacy-hub-plugin\kb\KbCollectionSearchPlugin.java` | 可选查询改写，然后委托按数据集检索。 |
| `<java-ai-source>\legacy-hub-plugin\kb\QuestionOptimizationAbility.java` | 调用模型生成多条检索问题并解析 JSON 数组。 |
| `<java-ai-source>\agent-runtime\model\AgentModelCapability.java` | 新 Agent 模型能力描述，包含尚未接通的 `structuredOutput` 位。 |
| `<java-ai-source>\agent-runtime\model\AgentModelRequest.java` | 新 Agent 模型请求只携带模型配置、消息、工具、工具策略和上下文元数据。 |
| `<java-ai-source>\agent-runtime\definition\AgentModelConfig.java` | 新 Agent 显式模型参数不含 response format 或 output schema。 |
| `<java-ai-source>\agent-runtime\model\springai\SpringAiAgentModelMapper.java` | 映射模型参数和工具协议，不设置 response schema，也不解析 typed result。 |
| `<java-ai-source>\agent-runtime\model\springai\Aiv2AgentModelClient.java` | 新 Agent 的主要模型 adapter，明确报告 structured output 不可用。 |
| `<java-ai-source>\agent-runtime\invocation\AgentInvocationResult.java` | 运行结果是文本 output/resource ref/metadata，不是 typed result。 |
| `<java-ai-source>\agent-runtime\graph\react\node\AbstractModelNode.java` | 检查模型响应与工具调用基本有效性，没有业务 schema validation。 |
| `<java-ai-source>\legacy-graph\model\LegacyModelNode.java` | 遗留 graph 模型节点可设置 provider response format，只能作为历史能力证据。 |

### 6. Related specs

- `.trellis/spec/guides/index.md` - Trellis 工作流与规范路由。
- `../prd.md` - 本次 Java AI 参考系统研究范围。
- `docs/decisions/0007-user-owned-career-profile.md`、`0008-user-final-authority-over-profile.md`、`0011-minimum-necessary-external-disclosure.md`、`0014-evidence-first-decision-support.md`、`0022-isolated-multi-user-self-hosting.md` - 用户事实权威、最小披露、证据优先和多用户隔离契约。
- `docs/product/mvp-experience-backbone.md` - 来源、冲突、未知、证据与用户审核要求。

## Caveats / Not Found

- 这是 Maven 展开源码快照，没有 Git 历史、根构建与完整父 POM/BOM。所有“未找到”只适用于所给构件，不能证明未提供的远端知识库服务没有自己的 RAG 实现。
- 未运行知识库、模型或 Agent 服务，无法验证 provider 对 JSON Schema 的实际支持差异、streaming structured output 行为或远端知识库的召回质量。
- 没有能力端口的服务端实现，无法确认远端检索使用向量、全文、混合检索、rerank 或何种 tenant/ACL 机制。
- 底层 response format 工具的存在不等于新版 Agent runtime 已暴露、执行和校验结构化业务结果；两者属于不同层级。
- 未找到本地 schema validation、typed decode、repair loop、schema version persistence 与针对结构化输出的测试源码。
- 未找到 RAG 评测集、Recall@k、citation precision、groundedness 或 unsupported-claim 指标。
