# Research: 社会模拟参考项目 全栈、AI 后端、择途迁移与作品集价值

- Query: 静态审计 社会模拟参考项目 从文件输入、知识图谱、双平台多 Agent 模拟、报告生成到深度互动的完整实现，并与择途（Zetu / TheTwo）已接受产品契约对照。
- Scope: mixed（外部源码快照 + 仓库内权威产品文档；未联网、未运行服务、未调用 LLM/Zep/OASIS）
- Date: 2026-08-13

## Findings

### 1. 执行摘要

社会模拟参考项目 是一个面向“种子材料 + 自然语言推演需求”的社会模拟应用：它把上传材料交给 LLM 设计图谱本体，把文本批量写入 Zep Cloud GraphRAG，依据图谱实体生成人设与活动配置，再用 OASIS/CAMEL 在 Twitter、Reddit 两个虚拟平台运行 Agent，最后让自研 ReportAgent 检索图谱、采访模拟 Agent、逐章写报告，并继续支持报告问答和单 Agent 采访。README 对外称其为“群体智能预测引擎”，输入输出承诺与五阶段流程见 `<social-simulation-source>\README-ZH.md:27`、`:31`、`:86`。

从工程事实看，它更准确地是一个**单实例、单信任域的研究型 Demo/原型**，而不是生产级预测服务：项目、模拟、动作、报告确实落盘，Zep 写入也有相当认真​​的幂等协调与终态屏障；但后台线程/子进程没有通用工作队列或可接管执行器，部分长任务不能跨后端重启继续，前端没有真正的流式传输，系统没有登录、租户隔离、配额、审计授权或成本账本，Docker 还在运行 Flask/Vite 开发服务。它提供的是可观察的 LLM 驱动社会仿真，不提供预测有效性的科学校准、基线对照或结果置信度证明。

对择途最有价值的不是复制“千 Agent + GraphRAG + 双平台沙盘”，而是借鉴其长流程工程机制：显式阶段状态、磁盘化中间产物、增量日志、外部写入的 operation identity、读写屏障、失败不伪装为空结果、终态前 drain、生成上限与降级路径。择途当前的职业事实源、证据分层、用户最终权威、多用户隔离和最小外部披露则比 社会模拟参考项目 更严格，不能被它的“模拟结果即报告”模型替换（`docs/product/product-brief.md:70`、`:94`、`:101`、`:133`）。

### 2. 产品目的与完整闭环

社会模拟参考项目 的主要用户动作和系统职责如下：

1. 用户上传 PDF/Markdown/TXT 与模拟需求；后端保存原文件、抽取并预处理文本，同步调用 LLM 生成本体。
2. 用户进入图谱构建阶段；后端切块，在 Zep Cloud 创建图、安装动态 Pydantic 本体、通过 Batch API 写入 graph episodes，并轮询批次及每个 episode 的处理终态。
3. 用户创建 simulation；准备线程从 Zep 读取实体和关系上下文，并行生成人设，生成时间、事件、Agent 活动配置，分别写出 Twitter CSV、Reddit JSON 和 `simulation_config.json`。
4. 后端启动独立 Python 子进程；OASIS/CAMEL 创建两个社交平台环境，两个协程并行运行轮次，动作写入 SQLite 和 JSONL。后端监控 JSONL，持久化进度，并可把成功动作异步追加回 Zep 图谱。
5. 模拟轮次完成后，子进程默认不退出，而是保持环境，轮询文件 IPC；报告工具或用户可采访 Agent。
6. ReportAgent 先从图谱取上下文并生成大纲，再逐章运行有限 ReACT 循环，调用图谱检索/全景搜索/快速搜索/Agent 采访工具，逐章落盘并组装 Markdown。
7. 用户可以查看报告、与 ReportAgent 普通 HTTP 对话，或经文件 IPC 与某个模拟 Agent 对话。

这条链路符合 README 的产品叙述，但“预测万物”“高保真”“精准推演”是愿景/营销表达，源码只证明流程会生成模拟和报告，不证明预测准确率、外部有效性或反事实校准（`<social-simulation-source>\README-ZH.md:29`、`:36`）。

### 3. 源码支持的端到端调用链

#### 3.1 文件输入到图谱

```text
Home.startSimulation
  -> pendingUpload 内存 store
  -> /process/new
  -> MainView.handleNewProject
  -> POST /api/graph/ontology/generate (multipart)
  -> ProjectManager.create_project/save_file/save_extracted_text
  -> FileParser + TextProcessor
  -> OntologyGenerator.generate
  -> LLMClient.chat_json(JSON mode + local validation)
  -> POST /api/graph/build
  -> daemon Thread build_task
  -> GraphBuilderService.create_graph/set_ontology/add_text_batches
  -> Zep Batch process + poll batch/items/episodes
  -> project.json = graph_completed
  -> 前端 GET /api/graph/task/:id 每 2 秒轮询
```

证据：

- 首页只把 `File` 对象和需求放进 Vue 进程内 reactive store，随后导航到 `/process/new`，没有浏览器持久化（`frontend/src/views/Home.vue:297`，`frontend/src/store/pendingUpload.js:5`）。刷新或新标签会丢失待上传输入。
- `MainView` 在 Process 页组装 `FormData`、调用本体接口，得到真实 `project_id` 后替换 URL，并立即启动构图（`frontend/src/views/MainView.vue:194`、`:208`、`:218`、`:221`）。
- Flask 本体接口验证需求/文件、创建项目目录、保存文件、抽取全文、调用 `OntologyGenerator`，然后把本体与项目状态写入 `project.json`（`backend/app/api/graph.py:265`、`:319`、`:324`、`:354`、`:359`、`:368`）。
- `OntologyGenerator` 使用 JSON mode，最多两次内容尝试，随后做名称、属性、端点、数量等本地归一化；它不是远端 JSON Schema 约束（`backend/app/services/ontology_generator.py:203`、`:234`、`:245`、`:432`）。
- 构图接口创建进程内 `TaskManager` 任务与 daemon thread，把 task ID、graph ID、Zep batch ID 和 operation ID 写回项目（`backend/app/api/graph.py:637`、`:642`、`:650`）。
- Zep 写操作不盲重试：客户端先持久化 graph ID；批次使用由 graph ID 和所有 chunks 内容哈希形成的 operation ID，模糊失败后以 GET/list 协调，不重放非幂等 POST（`backend/app/services/graph_builder.py:218`、`:227`、`:264`、`:270`、`:407`）。
- 批处理只有在服务端批次 `succeeded`、item 数量一致且每个 item 有 episode UUID 后才成功；随后仍可逐 episode 等待 `processed`，避免“请求返回就算建图完成”（`backend/app/services/graph_builder.py:631`、`:669`、`:673`、`:684`、`:720`）。
- 前端对 Task API 每 2 秒轮询，并对图数据提供 10 秒轮询函数；没有 WebSocket/SSE（`frontend/src/views/MainView.vue:306`、`:330`、`:335`）。

#### 3.2 图谱到模拟、报告和互动

```text
Step1GraphBuild -> POST /api/simulation/create
  -> SimulationManager -> simulations/<id>/state.json
Step2EnvSetup -> POST /api/simulation/prepare
  -> daemon Thread
  -> ZepEntityReader.filter_defined_entities
  -> OasisProfileGenerator(ThreadPoolExecutor)
  -> SimulationConfigGenerator
  -> profiles + simulation_config.json + state.json=ready
Step3Simulation -> POST /api/simulation/start
  -> SimulationRunner.start_simulation
  -> subprocess.Popen(run_parallel_simulation.py)
  -> asyncio.gather(Twitter OASIS, Reddit OASIS)
  -> actions.jsonl/SQLite + monitor thread
  -> optional ZepGraphMemoryUpdater queue/batch/drain
  -> run_state.json terminal state
Step3Simulation -> POST /api/report/generate
  -> daemon Thread -> ReportAgent.generate_report
  -> outline -> section ReACT/tool loop -> per-section Markdown
  -> full_report.md + meta.json
Step5Interaction
  -> POST /api/report/chat -> new ReportAgent -> graph tools
  -> POST /api/simulation/interview/batch -> disk IPC -> resident OASIS env
```

证据：simulation 创建只要求项目和 graph ID，然后把状态写到模拟目录（`backend/app/api/simulation.py:195`、`:234`、`:248`；`backend/app/services/simulation_manager.py:208`）。准备接口先同步读取实体计数，再创建进程内 task 和 daemon thread；线程完成实体读取、人设、配置及状态落盘（`backend/app/api/simulation.py:501`、`:520`、`:537`、`:613`、`:645`）。人设用 `ThreadPoolExecutor(max_workers=parallel_count)` 并行，单体失败时生成基础 profile，不使整个批次失败（`backend/app/services/oasis_profile_generator.py:895`、`:983`、`:1002`）。

运行阶段由 Flask 产生 `Popen`，不是在请求线程里跑 OASIS；子进程使用独立进程组，stdout/stderr 写 `simulation.log`，监控线程每 2 秒读平台 JSONL（`backend/app/services/simulation_runner.py:509`、`:527`、`:538`、`:554`、`:620`）。双平台脚本在各自的 `oasis.make` 中设置 `semaphore=30`，并通过 `asyncio.gather` 同时执行（`backend/scripts/run_parallel_simulation.py:1155`、`:1346`、`:1584`）。轮次完成后默认进入 0.5 秒文件 IPC 轮询，直到 `close_env` 或信号，再关闭 OASIS env（同文件 `:1595`、`:1603`、`:1613`、`:1635`）。

报告端首先设置跨线程 graph reader lease，确认模拟已 `COMPLETED/STOPPED`、无活跃 Zep updater、项目图仍为完成态，再启动 daemon thread（`backend/app/api/report.py:84`、`:103`、`:127`、`:159`、`:243`、`:245`）。每章写完立即保存，最后组装 `full_report.md` 并保存 completed 元数据（`backend/app/services/report_agent.py:1576`、`:1622`、`:1680`、`:1716`、`:1741`、`:1750`）。互动页把最多 10 条对话历史交回一个新建的 ReportAgent；与模拟 Agent 的对话则通过 batch interview 文件 IPC（`frontend/src/components/Step5Interaction.vue:682`、`:685`、`:730`；`backend/app/api/simulation.py:2433`）。

### 4. Agent / LLM 内部执行链

#### 4.1 模型抽象与结构化输出

- 所有模型最终走 OpenAI Python SDK 的 Chat Completions 兼容接口。适配层对 GPT-5 去掉 temperature、把 `max_tokens` 改为 `max_completion_tokens`，其他兼容提供方保留旧请求形状（`backend/app/utils/openai_chat_compat.py:20`、`:32`、`:46`、`:51`）。这是协议兼容层，不是多厂商能力抽象、路由器或模型治理层。
- 通用 `LLMClient.chat_json` 请求 `response_format={type: json_object}`；只有提供方以明确 400/422 结构化错误拒绝参数时，才降级为 prompt-only JSON。它拒绝截断、空内容、非 stop 终止、顶层数组和多个 JSON 值（`backend/app/utils/llm_client.py:159`、`:181`、`:185`、`:197`、`:235`）。默认只有一次内容尝试；本体显式使用两次。
- 这不是 JSON Schema enforcement。结构只由 prompt、`json.loads` 和随后手写归一化保证。Zep 本体安装阶段才动态建立 Pydantic `EntityModel/EdgeModel` 类，约束的是 Zep ontology SDK 输入，不是 LLM 输出协议（`backend/app/services/graph_builder.py:313`、`:317`、`:330`）。
- 人设和模拟配置没有统一走严格的 `LLMClient.chat_json`：它们直接用兼容 helper，三次重试、降低温度，并尝试修补截断/无效 JSON；最终规则降级可能掩盖模型质量问题（`backend/app/services/oasis_profile_generator.py:568`、`:622`；`backend/app/services/simulation_config_generator.py:435`、`:439`、`:459`、`:470`）。

#### 4.2 ReportAgent 的 ReACT、工具与终止

ReportAgent 是 社会模拟参考项目 自己实现的文本协议 Agent，不是 CAMEL Agent，也没有使用 OpenAI 原生 function calling：

1. `plan_outline` 先调用 `get_simulation_context`，再用 `chat_json` 生成标题、摘要和章节；失败则回退固定三章（`backend/app/services/report_agent.py:1176`、`:1196`、`:1215`、`:1247`）。
2. 每章最多 5 个 LLM iteration，要求至少 3 次工具调用，工具调用总上限 5；每个 iteration 只执行解析出的第一个工具（同文件 `:1324`、`:1326`、`:1327`、`:1445`、`:1460`）。
3. 模型输出 `<tool_call>{...}</tool_call>` 或兜底裸 JSON，由正则和 `json.loads` 手工解析；白名单为 `insight_forge`、`panorama_search`、`quick_search`、`interview_agents`（同文件 `:1071`、`:1073`）。这比原生 tool schema 弱：嵌套 JSON/格式漂移可能解析失败，参数也没有统一 Pydantic 校验。
4. 若同一回复同时含工具调用与 `Final Answer:`，前两次拒绝重答，第三次截断到第一个工具调用；若模型伪造 `<tool_result>`，系统会剥离并注入真实结果（同文件 `:1144`、`:1368`、`:1375`、`:1391`）。
5. 达到足够工具次数并出现 `Final Answer:` 时终止；若有正文但无前缀，也可直接接受；耗尽 iteration 后再发一次强制 final 请求，仍失败则写失败占位文本（同文件 `:1414`、`:1532`、`:1546`、`:1556`）。因此有明确的有限终止，不会无限循环，但“至少三次工具”是固定启发式，会强制增加费用，不等同于证据充分性。
6. 对话模式更轻：最多 2 iteration、每轮最多一个工具、总工具上限 2，工具结果只保留前 1500 字，报告正文只保留前 15000 字（同文件 `:1835`、`:1840`、`:1867`、`:1892`）。

工具职责：`insight_forge` 让 LLM 拆子问题并做多次图检索，`panorama_search` 做跨实体/关系全景，`quick_search` 做直接 Zep 搜索，`interview_agents` 选择 profiles、生成问题、经 IPC 采访再摘要。实现入口位于 `backend/app/services/zep_tools.py:406`、`:943`、`:1143`、`:1235`、`:1270`。其中图搜索、分页和 Zep SDK 调用是 社会模拟参考项目 包装；真正的语义检索/图谱抽取由 Zep Cloud 提供，Agent 行为/社交环境由 OASIS/CAMEL 提供。

### 5. 前端路由、状态恢复、错误与“实时”机制

路由是六个 Vue history routes：主页、项目构图、模拟准备、模拟运行、报告、互动；ID 全部在 URL 中（`frontend/src/router/index.js:9`）。服务器持久化 ID 使用户能从历史卡片恢复项目、模拟或报告页面，历史页从 `/api/simulation/history` 重载磁盘状态并导航（`frontend/src/components/HistoryDatabase.vue:403`、`:412`、`:423`、`:434`、`:445`）。

恢复能力分层：

| 状态 | 存储 | 刷新/重启结果 |
|---|---|---|
| 首页待上传 File/需求 | Vue reactive 内存 | 刷新即丢，`/process/new` 显示 “No pending files” |
| 项目/原文/ontology/graph IDs | `uploads/projects/<id>/` JSON/文本/文件 | 可恢复读取 |
| 准备结果/profiles/config | `uploads/simulations/<id>/` | 可恢复为 ready/failed；已生成结果可避免重复准备 |
| 通用 Task 进度 | Python 单例字典 | 后端重启丢失 |
| 模拟 run state/actions/SQLite | 磁盘 JSON/JSONL/DB | 可查看历史；不能据此自动接管旧 Popen |
| 报告章节/日志/meta/progress | `uploads/reports/<id>/` | 已落盘部分可读；没有章节级 resume 调度器 |
| 互动 chatHistoryCache | Vue 组件内存 | 刷新即丢；每次请求由前端重传最近历史 |

前端没有 Pinia/Vuex/localStorage/sessionStorage；`chatHistoryCache` 也只是组件 ref（`frontend/src/components/Step5Interaction.vue:439`、`:490`）。错误状态主要存在组件内：轮询遇到显式 `failed` 会停定时器并展示错误，但网络轮询错误通常只 `console.warn`，不会退避、熔断或给用户明确恢复动作（`frontend/src/components/Step2EnvSetup.vue:857`、`:908`、`:912`；`frontend/src/components/Step4Report.vue:2024`、`:2082`）。

“实时”几乎全部是 polling：构图 2 秒，profile 3 秒，config 2 秒，模拟 status 2 秒/detail 3 秒，报告 agent log 2 秒/console log 1.5 秒（`frontend/src/views/MainView.vue:330`；`frontend/src/components/Step2EnvSetup.vue:835`、`:846`、`:962`；`frontend/src/components/Step3Simulation.vue:469`；`frontend/src/components/Step4Report.vue:2157`）。后端名称含 `/stream` 的两个端点明确“一次性获取全部”，仍返回普通 `jsonify`，不是 SSE 或 chunked stream（`backend/app/api/report.py:936`、`:939`、`:953`、`:1018`、`:1021`、`:1035`）。

存在一个静态契约漂移：前端 `getReportStatus(reportId)` 发 GET，并把 `report_id` 放 query；后端 `/generate/status` 只接受 POST，且读取 JSON 中的 `task_id`/`simulation_id`（`frontend/src/api/report.js:15`；`backend/app/api/report.py:322`、`:345`）。当前报告 UI 主要靠日志轮询，因而可能未触发这个 helper，但它不应被视为可用接口。

### 6. Flask API、服务边界与持久化模型

Flask 应用只注册 graph/simulation/report 三个 blueprint，使用 threaded development server；没有数据库 ORM、消息队列或工作进程（`backend/app/__init__.py:65`；`backend/run.py:36`、`:45`）。边界大致合理：API 层验证和状态机，service 层负责 Zep/OASIS/LLM，model 层其实是 JSON 文件仓储而非关系模型。

- `ProjectManager` 在 `uploads/projects/<project_id>` 保存 `project.json`、上传文件和 `extracted_text.txt`（`backend/app/models/project.py:107`、`:119`、`:124`、`:129`、`:134`）。写入直接覆盖目标 JSON，没有临时文件 + rename 或文件锁，多线程/崩溃时存在部分写或 last-write-wins 风险。
- `SimulationManager` 保存 `state.json`、profiles、配置和平台数据库；`SimulationRunner` 另存 `run_state.json` 与动作日志（`backend/app/services/simulation_manager.py:145`、`:158`；`backend/app/services/simulation_runner.py:301`、`:357`）。
- `ReportManager` 按 report 文件夹保存 meta、outline、progress、section 和 full report，因此 completed 报告可跨重启访问（`backend/app/services/report_agent.py:1576`、`:2474`、`:2494`）。
- `TaskManager` 是线程安全单例字典，不持久化，重启后 graph/prepare/report task ID 都查不到（`backend/app/models/task.py:56`、`:65`、`:71`、`:103`）。

重启生存性不能笼统称为“支持”：

- graph build 有专项恢复。若本地 task 丢失但已持久化 Zep batch + operation ID，构图接口可重新创建 task 并继续等待该 batch；否则将项目改为 failed 并要求 reset/force（`backend/app/api/graph.py:529`、`:543`、`:558`）。对应单元测试明确覆盖可恢复和不可恢复分支（`backend/tests/test_zep_graph_lifecycle.py:150`、`:186`）。
- prepare/report 的工作线程在进程退出时消失，重启后没有 resume；磁盘中间产物可以观察，但没有重建线程从阶段 checkpoint 接续。prepare 只在结果满足“配置已生成”等条件时判为已完成（`backend/app/api/simulation.py:270`、`:339`）。
- simulation 保存 PID，却只通过内存 `_processes: Dict[str,Popen]` 控制进程。重启后读取 `run_state.json` 不会把 PID 重新包装成可控进程，也不会重建 monitor；旧子进程若仍存活可能继续写文件，但新后端不能可靠 stop/monitor/接管。优雅 shutdown 会清理本进程已知子进程，但 `kill -9`、宿主崩溃或独立后端重启不受保证（`backend/app/services/simulation_runner.py:227`、`:294`、`:333`、`:1001`、`:1449`）。

### 7. Zep / GraphRAG 生命周期与一致性

这是代码质量相对最强的一层。

**构建**：本体先经过 社会模拟参考项目 归一化，再动态映射到 pinned `zep-cloud==3.25.0` 的实体/边模型；文本 chunks 通过 Zep Batch API 作为 graph episodes 写入（`backend/pyproject.toml:19`；`backend/app/services/graph_builder.py:313`、`:407`）。社会模拟参考项目 拥有切块、operation identity、协调和状态机；实体抽取、关系抽取、图存储与语义搜索由 Zep Cloud 完成。

**读取**：`ZepEntityReader`、`ZepToolsService` 和 paging helpers 封装全量节点/边、实体上下文、图检索和分页。只对 transport/408/429/5xx 的安全读做指数退避，并尊重 Retry-After；权限/认证/永久错误不会被吞成“无数据”（`backend/app/utils/zep.py:92`、`:126`；`backend/app/services/zep_entity_reader.py:87`；`backend/app/services/zep_tools.py:447`）。

**动态记忆更新**：后端 monitor 读取成功 Agent action，把它转换成带平台、轮次和时间的 episode；更新器按平台缓冲、后台线程发送，并记录 pending episode UUID（`backend/app/services/simulation_runner.py:786`、`:870`；`backend/app/services/zep_graph_memory_updater.py:243`、`:265`、`:268`）。`stop()` 关闭接收、排空 queue/buffer、等待所有已接受 episode 处理完成；失败 updater 保留在 manager 中，使报告和删除继续被屏障阻止，而不是宣称成功（`backend/app/services/zep_graph_memory_updater.py:313`、`:560`、`:599`、`:730`）。

**删除与读写屏障**：project reset/delete 先在 per-graph lock 下确认无活跃 simulation/updater/report reader，再删除 Cloud graph，最后清除/删除本地引用（`backend/app/api/graph.py:36`、`:76`、`:172`、`:188`、`:213`、`:237`）。报告启动时登记 reader lease，finally 注销；模拟终态必须先完成 Zep drain，之后才发布 completed/stopped（`backend/app/api/report.py:159`、`:291`；`backend/app/services/simulation_runner.py:710`、`:732`）。

**保证边界**：这些 lock、reader registry、updater registry 都是进程内结构，能解决单 Flask 进程内的竞争，不能跨多个 WSGI worker/多个容器协调。graph/project 文件也没有数据库事务。因此它是精心加固的单进程一致性，而非分布式生命周期保证。

### 8. OASIS/CAMEL、进程、IPC、取消与故障恢复

社会模拟参考项目 自己实现的是进程编排、配置翻译、动作日志、文件 IPC 和状态投影；OASIS/CAMEL 提供 Agent graph、LLM action、Twitter/Reddit 环境与 `env.step`。版本被固定为 `camel-oasis==0.2.5`、`camel-ai==0.2.78`（`backend/pyproject.toml:23`）。

并发分三层：profile 生成线程池默认 5；双平台用 `asyncio.gather`；每个 OASIS env 的 LLM semaphore 为 30。这个上限避免单环境无限并发，但两平台合计仍可能产生大量并行 LLM 请求，且 `parallel_profile_count` 来自 API 请求、未见范围校验（`backend/app/api/simulation.py:497`；`backend/app/services/oasis_profile_generator.py:1003`；`backend/scripts/run_parallel_simulation.py:1159`、`:1350`）。

IPC 不是 socket/RPC，而是 `ipc_commands/` 和 `ipc_responses/` JSON 文件加 `env_status.json`：Flask 写命令并轮询 response，驻留子进程每 0.5 秒扫描命令（`backend/app/services/simulation_ipc.py:288`、`:303`、`:323`、`:332`、`:362`；`backend/scripts/run_parallel_simulation.py:1613`）。优点是可观察、跨进程简单；缺点是缺少原子 rename、durable queue semantics、并发消费者租约、过期命令清理和可靠 exactly-once。环境 `alive` 只是文件标志，若进程崩溃而未改文件，会产生陈旧存活判断。

stop 路径先把状态写为 STOPPING，再终止完整进程树，等待 monitor 读完日志尾部和 Zep drain；超时返回 pending 而不是误标 failed/completed（`backend/app/services/simulation_runner.py:965`、`:995`、`:1000`、`:1015`、`:1026`）。Windows 使用 `taskkill /T` 后必要时 `/F`，Unix 对进程组 SIGTERM 后 SIGKILL（同文件 `:908`、`:918`、`:947`）。`close-env` 则通过 IPC 让 OASIS env 优雅 close（`backend/app/api/simulation.py:2811`）。

取消仍不是可恢复作业语义：运行脚本每轮只在 `env.step` 之间检查 shutdown event，单个长 LLM/OASIS step 内无法协作取消；强杀可能中断 SQLite/JSON 写入。没有 pause/resume 实现，尽管类注释宣称支持暂停/恢复（`backend/app/services/simulation_runner.py:204`、`:212`）；公开 API 也只有 start/stop/close-env。

### 9. ReportAgent 工具、报告产物与后续互动

报告工具集合形成了“先检索/采访，再写章节”的完整可观察过程，结构化 JSONL 日志会记录 planning、thought、tool call/result、LLM response、section complete 和 report complete；控制台日志另存纯文本（`backend/app/services/report_agent.py:36`、`:67`、`:307`）。前端增量读取日志并在 `section_complete` 时即时展示章节（`frontend/src/components/Step4Report.vue:2024`、`:2045`、`:2055`）。

报告产物是清晰的文件协议：`meta.json`、`outline.json`、`progress.json`、`section_XX.md`、`full_report.md`，适合调试和演示，也给失败后的人工检查留下证据（`backend/app/services/report_agent.py:1582`）。但自动恢复未完成报告尚未实现：重新生成会产生新 report ID；已有部分章节没有作为 checkpoint 自动复用。

后续互动有两条不同语义：

- ReportAgent chat 是同步普通 HTTP，服务端每次新建 Agent，状态由前端把最近十条 history 重传；它可以重新查图，但没有会话持久化和流式 token 输出（`backend/app/api/report.py:591`、`:663`、`:670`）。
- 模拟 Agent chat 依赖驻留 OASIS 环境，后端给 prompt 加“直接回答、不要调用工具”等指令，再走 interview IPC（`backend/app/api/simulation.py:58`、`:2389`、`:2396`）。环境一旦关闭或后端/子进程关系丢失，就不能只靠保存的人设继续相同对话。

报告的“sources”主要是工具 query 字符串或图事实文本，不是面向用户的稳定来源 ID、原始文档片段引用、时间戳和证据强弱契约。因而它的可解释性更多是“展示 Agent 用过哪些工具”，还没有达到择途所要求的结论到证据可追溯。

### 10. 非功能性审计

| 维度 | 已有机制 | 关键缺口 |
|---|---|---|
| 持久化 | 项目、模拟、动作、报告落磁盘；Zep 云图 | Task、进程句柄、chat 在内存；JSON 非原子写；无迁移/备份 |
| 重启 | graph batch 有专项 reconcile/resume；完成产物可读 | prepare/report 线程不可接续；运行中子进程不可重新 attach |
| 日志 | Flask、simulation.log、平台 JSONL、report JSONL/console | 无统一 request/run correlation、轮转、集中日志或保留策略；多处 API 返回 traceback |
| 重试 | LLM JSON 有界重试；Zep 只重试安全读；非幂等写做协调 | OASIS step/报告章节无通用 retry policy；部分 JSON “修复”可能接受语义损坏输出 |
| 并发 | per-project/per-graph 进程锁、线程池、async gather、semaphore | 锁不跨进程；API 可创建任意并发任务；无全局队列/背压 |
| 幂等性 | completed graph/report 复用；Zep operation hash；force 显式 | simulation create 会生成新 ID；prepare force 与文件覆盖缺少事务；IPC 无 exactly-once |
| 成本 | max rounds、profile 并行数、OASIS semaphore、Report tool/iteration 上限、上下文截断 | 无 token/调用/金额预算、用户配额、速率限制、取消账单、缓存命中指标；README 仅提示“小于 40 轮” |
| 安全 | 上传扩展名白名单、50 MB 上限、模型错误部分脱敏 | 无 auth/tenant/CSRF/rate limit；CORS `*`；默认 secret；traceback 泄漏；不安全 Markdown HTML |
| 多用户 | 无 | 所有 ID/列表/删除 API 对任何访问者开放；共享 API key、目录和 Zep 账户 |

安全证据尤其明确：CORS 对全部 `/api/*` origin 开放（`backend/app/__init__.py:42`），SECRET_KEY 有固定默认值（`backend/app/config.py:21`），多个异常响应直接带 `traceback.format_exc()`（例如 `backend/app/api/simulation.py:2424`、`:2429`），项目列表/详情/删除没有身份检查（`backend/app/api/graph.py:132`、`:151`、`:166`）。前端把模型/图谱/用户消息生成的字符串经自写正则“Markdown”转换后交给 `v-html`，没有 HTML escaping/sanitizer，构成明显的 stored/reflected XSS 面（`frontend/src/components/Step5Interaction.vue:273`、`:557`；`frontend/src/components/Step4Report.vue:51`）。这套服务只能放在受信本机/隔离网络，不能直接暴露公网。

### 11. 部署与测试成熟度

部署支持源码和单容器：README 要求 Node 18+、Python 3.11-3.12、uv，并提供 `npm run dev` 和 Docker Compose（`README-ZH.md:96`、`:100`、`:147`、`:165`）。Compose 只持久化 `backend/uploads`，这能保留本地成果，但图谱仍依赖 Zep Cloud；它不是纯本地/self-hosted GraphRAG（`docker-compose.yml:7`、`:13`；`backend/app/config.py:71`）。Dockerfile 最终执行 `npm run dev`，即 concurrently 启动 Flask development server 与 Vite dev server，没有 Gunicorn/Waitress、反向代理、TLS、健康依赖、资源限制或滚动升级（`Dockerfile:28`；`package.json:9`）。镜像 CI 只 build/push 多架构镜像，没有运行 Python/前端测试（`.github/workflows/docker-image.yml:21`、`:52`）。

快照中有 18 个后端测试文件、约 110 个 `test_` 函数，前端没有测试文件。本次按任务边界未安装依赖、未执行测试；以下是静态阅读对它们证明力的判断：

- **真实证明较强**：LLM JSON 截断/空内容/response_format 降级；ontology/Zep SDK schema；Zep 分页/错误分类；批次模糊写入协调；graph reset/delete 顺序；memory updater drain；simulation/report barrier；prepare 失败状态。例：`backend/tests/test_llm_json_responses.py:49`、`test_zep_cloud_contracts.py:192`、`test_zep_graph_lifecycle.py:150`、`test_zep_simulation_barrier.py:58`、`test_zep_report_barrier.py:26`。
- **没有证明**：真实模型跨供应商兼容、真实 Zep 数据规模和配额、真实 OASIS 多 Agent 长时稳定性、预测质量、断电/kill -9 恢复、多 worker 竞争、浏览器 E2E、API 合约一致性、前端轮询泄漏、XSS/auth/租户隔离、成本上限、Docker 生产可用性。
- `validate_zep_cloud_integration.py` 是需要真实云服务的验证脚本，不等于 CI 集成测试；单元测试大量 monkeypatch 第三方边界。它们很好地证明了作者近期加固的 Zep 一致性意图，但不能证明完整五阶段在现实环境下端到端成功。

### 12. 所有权与成熟度分层

| 能力 | 主要归属 | 性质判断 |
|---|---|---|
| 五阶段产品流程、Flask API、Vue 工作台 | 社会模拟参考项目 | 自研应用逻辑，完整 Demo 流程 |
| prompt、本体归一化、profile/config 翻译 | 社会模拟参考项目 | 自研 AI glue；部分有降级，schema 强度不一 |
| Zep operation ID、batch reconcile、drain/barrier | 社会模拟参考项目 对 Zep 的加固封装 | 接近生产思维，但只保证单进程协调 |
| 图实体/关系抽取、GraphRAG、语义检索、云存储 | Zep Cloud | 第三方核心能力；社会模拟参考项目 不能据此声称自研图引擎 |
| Agent graph、LLMAction、Twitter/Reddit env.step | OASIS/CAMEL | 第三方模拟核心；社会模拟参考项目 负责配置和编排 |
| ReportAgent ReACT 与工具协议 | 社会模拟参考项目 | 自研有限状态循环；手工文本 tool calling，非框架原生 schema |
| 文件 IPC、进程监控、JSONL action logger | 社会模拟参考项目 | 实用 Demo glue；可观察但非可靠队列 |
| JSON 文件仓储、历史恢复 | 社会模拟参考项目 | 单机可用；非多用户/事务型持久层 |
| Docker/Vite/Flask dev 启动 | 社会模拟参考项目 | 开发便利机制，不是生产部署栈 |
| “预测万物/高保真/精准” | README 愿景 | 未由评测、基线或科学验证支持 |

### 13. 与择途（Zetu / TheTwo）的权威对照

| 维度 | 社会模拟参考项目 源码事实 | 择途已接受契约 | 结论 |
|---|---|---|---|
| 产品中心 | 从种子材料构建群体模拟并生成预测报告 | 用户拥有的职业事实源与持续决策记录（`docs/product/product-brief.md:68`） | 领域中心不同，不能用图谱/模拟替代事实源 |
| 输入 | PDF/MD/TXT + 一段模拟需求 | 简历/访谈建立事实源；职位文本或截图保留原文和来源（`product-brief.md:246`、`:250`） | 可借鉴上传/解析流程，不借鉴“输入即真相” |
| AI 判断 | LLM 设计 ontology/persona/config，Agent 涌现后再总结 | 区分可验证事实、用户事实、AI 推断、价值判断和未知（`product-brief.md:94`） | 择途需要更强 provenance/schema，而非更多 Agent |
| 证据 | Zep fact/episode 与工具日志；报告引用多为文本 | 证据保留来源、时间、强弱、冲突，结论可回溯（`product-capability-map.md:479`） | 借鉴 graph reader/barrier，不照搬弱引用格式 |
| 用户权力 | 用户输入需求、启停和提问；模拟输出没有确认/纠正模型 | 用户确认事实，系统建议与用户决定分开保存（`mvp-experience-backbone.md:380`、`:386`） | 择途必须保留人的最终解释权 |
| 长任务 | ID + polling + 文件状态；部分专项恢复 | 体验要求研究可恢复、可追溯和可更正（`mvp-experience-backbone.md:63`、`:67`） | 应实现真正 durable job/checkpoint，而非仅磁盘状态 |
| 解释性 | 显示 Agent thought/tool/log/章节 | 明确建议必须含依据、不利证据、未知及改变结论的信息（`product-brief.md:103`） | “过程可见”不等于“结论可审计” |
| 外部行动 | OASIS 在虚拟平台自动行动，不触达真实招聘平台 | 用户亲自沟通和投递，系统不冒充/海投（`product-brief.md:115`、`:120`） | 模拟可用于内部辅助，不能演变成代用户行动 |
| 数据/部署 | 本地 uploads + 强制 Zep Cloud +共享 keys；单信任域 | 自部署优先、多用户隔离、BYOK、最小必要披露（`product-brief.md:133`、`:138`、`:149`） | 社会模拟参考项目 架构不满足择途隐私和多用户底线 |
| 终点 | 预测报告 + 可互动模拟世界 | 完整申请决策包，用户作出申请/暂缓/放弃（`mvp-experience-backbone.md:332`、`:363`） | 不应把“生成报告”误当择途价值终点 |
| 复杂度 | 图谱 + 两平台 + 多 Agent + ReportAgent | MVP 主链是事实、职位、调查、判断、材料（`product-capability-map.md:51`） | 社会模拟参考项目 的多 Agent 模拟属于后续研究，不进近期主链 |

### 14. 对择途的建议

#### Borrow now（近期可借鉴）

1. **显式作业与产物协议**：每个研究任务使用稳定 `run_id`，分离 job status、阶段 checkpoint、结构化事件日志和最终 artifact；前端按 `last_event_id` 增量取状态。不要直接复制 社会模拟参考项目 的进程内 TaskManager。
2. **外部写入协调**：为联网检索、模型调用后的持久化和索引构建设计 deterministic operation key；只对明确幂等读重试，对模糊写先 reconcile。社会模拟参考项目 的 graph/batch operation identity 是最值得复用的工程思想。
3. **终态屏障**：职位调查只有在已接受 evidence 全部持久化、引用可解析后才发布完成；生成申请包时建立 read snapshot/lease，避免后台证据更新让结论与引用错位。
4. **失败即一等状态**：认证失败不能等价“没有证据”，部分调查不能冒充完整结论；保留 `failed/recoverable/retry_after/next_action`。
5. **结构化模型边界**：使用真实 JSON Schema/Pydantic validation，区分 provider JSON mode 和业务 schema；记录每次降级/修复，而不是默默填默认值。
6. **可观察的有限 Agent 循环**：step/attempt/tool call 都有上限，工具结果大小有限，明确 termination reason；但最少工具次数应由任务需求/证据门槛驱动，不硬编码为 3。

#### Later（验证主链后再考虑）

1. 职业事实和机会证据的图关系视图，前提是先有稳定 provenance 数据模型；不必先引入 Zep。
2. 多视角“审稿人”或反例 Agent，用于挑战机会结论，而不是模拟几百个虚构求职者。
3. SSE/WebSocket 的实时事件流，以及 worker heartbeat、lease、resume/cancel；先有 durable queue 再做动画式实时 UI。
4. 对少量职业路径做情景推演，但输出必须标为假设/推断，提供参数、反例和敏感性，不宣称预测未来。
5. 可替换的本地/云模型与检索 provider，配合每用户 BYOK、最小上下文披露和费用预算。

#### Do not copy（不应照搬）

1. 为展示“AI 感”堆叠 Twitter/Reddit 双平台、数百 Agent 和模拟轮次；它与择途 MVP 的职位判断无直接必要性。
2. 把 LLM 生成人设或模拟行为当真实用户/公司事实，或用涌现叙事制造确定性。
3. 共享目录、共享 API key、CORS `*`、无 auth 的单用户服务模型。
4. 以手写正则 Markdown + `v-html` 渲染模型输出，或把服务器 traceback 返回浏览器。
5. 把开发服务器放入生产 Docker，或用 daemon thread 替代可恢复 worker。
6. 把第三方 Zep/OASIS 集成或跑通 Demo 写成“自研 GraphRAG/多 Agent 引擎”。

### 15. AI 全栈作品集路线

仅克隆 社会模拟参考项目、填 API key、跑出一份报告，最多证明依赖安装和 API 集成，不足以证明 AI 全栈能力。面试官真正会追问的是：模型输出如何验证、任务如何恢复、重复请求是否重复扣费、证据如何引用、取消是否可靠、租户如何隔离、provider 出错如何降级、你如何测量质量和成本。建议用户亲自实现以下模块：

| 亲自实现模块 | 可交付的简历证据 | 面试讲述点 |
|---|---|---|
| 职业事实/证据/推断/未知的 typed domain model | JSON Schema + DB migration + invariants + correction history tests | 为什么事实与推断不能共用一个字段；用户确认如何覆盖但不抹历史 |
| Durable AI job engine | job/step/attempt/event/checkpoint 表；重启恢复、幂等、cancel 集成测试 | at-least-once 下如何防重复副作用；heartbeat/lease/terminal barrier |
| Provider-agnostic structured LLM gateway | schema validation、capability negotiation、retry matrix、redaction、token/cost ledger | JSON mode 与 JSON Schema 的区别；哪些错误可重试；如何预算 |
| Evidence research pipeline | source snapshot、claim-evidence links、冲突/未知、citation validator | 如何避免把搜索结果当事实；结论变更怎样可追溯 |
| Opportunity decision engine | 明确建议 + 不利证据 + unknown + counterfactual；golden eval dataset | 不是黑盒分数；如何评估建议质量、忠实性和用户 agency |
| 多用户/BYOK安全层 | tenant-scoped repository、授权测试、secret envelope、disclosure audit | IDOR、跨租户缓存、共享 key 与个人 key、最小外发字段 |
| 真实流式前后端 | SSE event cursor、reconnect、backpressure、terminal event contract | polling 与 streaming 的取舍；断线重连和去重 |
| AI eval/observability | trace/span、prompt/schema version、cost/latency dashboards、offline regression | 如何知道换模型没有让事实忠实度退化；成本和质量怎么权衡 |

可信的简历表述应包含可核验数字，例如：“实现支持进程重启的 6 阶段研究作业；以 deterministic step key 保证重复请求不产生重复外部调用；用 40 个故障注入用例覆盖 provider 429/timeout、worker crash、取消和 schema 漂移；每次结论可回溯到带时间和来源的 evidence snapshot；按用户记录 token/费用并在预算耗尽时停止。”数字必须来自真实测试/运行记录，不能预先编造。

可准备的面试故事：

1. 解释为什么不用“多 Agent 数量”衡量工程含量，而用可恢复性、证据忠实度、评测与成本边界衡量。
2. 画出浏览器 -> API -> durable job -> LLM/search adapters -> evidence store -> artifact -> SSE 的链路，并指出每个一致性边界。
3. 比较 社会模拟参考项目 的进程内 lock/daemon thread/文件 IPC 与生产 worker/DB lease/outbox 的取舍。
4. 解释 Zep/OASIS 分别替你做了什么，你自己做了什么；能替换依赖才说明理解了边界。
5. 展示一个失败案例如何从 trace、raw provider response、schema error、retry decision 定位并通过 eval 防回归。

### 16. 风险与建议的下一任务

**主要风险**：

- 把“社会模拟生成了一致叙事”误认作预测准确；报告缺少真实世界校准和证据置信度。
- 在择途引入外部 GraphRAG 时把完整职业画像发送到云端，违反最小必要披露。
- 抄用 daemon thread + JSON 状态后误以为长任务可恢复，实际后端重启会丢执行主体。
- 多 Agent/多工具造成不可见成本放大；当前 社会模拟参考项目 没有 token/金额预算与租户配额。
- 无鉴权 API 和不安全 HTML 渲染若被带入择途，会直接破坏多用户与隐私底线。
- 将第三方框架集成包装成个人核心能力，面试时无法解释内部协议、失败语义和替代方案。

**建议的下一实现任务**：建立“择途可恢复 AI 研究作业最小纵切”独立任务，不修改产品定位。范围只含一个机会研究：PostgreSQL（或已选持久层）的 `job/step/attempt/event/artifact`、单个结构化 LLM adapter、一个证据保存工具、SSE 状态流、cancel/retry、每用户 budget 与 tenant scope；用故障注入证明重启恢复、重复请求不重复写、未知/失败不被吞掉。完成后再决定是否需要图数据库或多 Agent。

**建议的后续研究任务**：对比 Temporal/DB-backed worker/轻量队列三种 durable execution 方案，以及 PostgreSQL relational evidence model 与 graph projection 的边界，产出明确的恢复、幂等、成本和多租户威胁模型。此研究不应直接改动已接受 `docs/product/`，任何技术选择另走决策任务。

### 17. 主要一手来源索引

- 产品与工作流：`<social-simulation-source>\README-ZH.md:27`、`:86`、`:193`
- 依赖版本：`<social-simulation-source>\backend\pyproject.toml:11`
- Flask 工厂/安全默认：`<social-simulation-source>\backend\app\__init__.py:19`；`backend/app/config.py:17`
- 项目/任务持久化：`backend/app/models/project.py:107`；`backend/app/models/task.py:56`
- 图谱 API 与构建：`backend/app/api/graph.py:265`、`:448`；`backend/app/services/graph_builder.py:218`、`:407`、`:631`
- LLM JSON 与兼容：`backend/app/utils/llm_client.py:91`；`backend/app/utils/openai_chat_compat.py:20`
- 模拟准备/运行：`backend/app/api/simulation.py:389`、`:1501`；`backend/app/services/simulation_manager.py:128`；`backend/app/services/simulation_runner.py:204`
- OASIS 双平台脚本：`backend/scripts/run_parallel_simulation.py:1093`、`:1293`、`:1492`
- Zep 动态记忆：`backend/app/services/zep_graph_memory_updater.py:213`
- ReportAgent：`backend/app/api/report.py:32`；`backend/app/services/report_agent.py:871`、`:1260`、`:1576`
- 前端路由/轮询：`frontend/src/router/index.js:9`；`frontend/src/views/MainView.vue:185`；`frontend/src/components/Step2EnvSetup.vue:779`；`frontend/src/components/Step4Report.vue:2020`
- 部署：`Dockerfile:28`；`docker-compose.yml:1`; `.github/workflows/docker-image.yml:21`
- 择途权威文档：`docs/product/product-brief.md:38`；`docs/product/mvp-experience-backbone.md:24`；`docs/product/product-capability-map.md:32`；`docs/product/glossary.md:17`

### 18. 研究清单

以下 社会模拟参考项目 路径均相对于 `<social-simulation-source>`；择途路径均相对于本仓库根目录。

#### Files found

- `README-ZH.md`：产品定位、五阶段工作流、环境要求和 Docker 使用说明。
- `package.json`、`frontend/package.json`、`backend/pyproject.toml`：应用版本、运行时范围和直接依赖版本的声明来源。
- `backend/app/api/graph.py`、`backend/app/services/graph_builder.py`：文件输入、本体生成、构图任务、Zep batch 协调和构图恢复。
- `backend/app/api/simulation.py`、`backend/app/services/simulation_manager.py`、`backend/app/services/simulation_runner.py`：模拟创建、准备、状态持久化、子进程管理和互动 IPC。
- `backend/scripts/run_parallel_simulation.py`、`backend/app/services/zep_graph_memory_updater.py`：OASIS/CAMEL 双平台运行、动作日志与动态记忆回写。
- `backend/app/api/report.py`、`backend/app/services/report_agent.py`：报告任务、有限 ReACT 循环、工具文本协议、章节产物和报告互动。
- `frontend/src/views/MainView.vue`、`frontend/src/components/Step2EnvSetup.vue`、`frontend/src/components/Step4Report.vue`、`frontend/src/components/Step5Interaction.vue`：前端阶段状态、轮询、历史恢复、报告展示与交互。
- `backend/tests/`：LLM JSON、Zep 生命周期、模拟/报告屏障等后端单元和契约测试；未发现前端测试目录或测试文件。
- `Dockerfile`、`docker-compose.yml`、`.github/workflows/docker-image.yml`：单容器开发服务和仅构建镜像的 CI 配置。
- `docs/product/product-brief.md`、`docs/product/mvp-experience-backbone.md`、`docs/product/product-capability-map.md`、`docs/product/glossary.md`：与 社会模拟参考项目 对照时采用的择途 accepted 产品契约。

#### Code patterns

- **持久产物与易失执行器分离**：`ProjectManager`、`SimulationManager` 将业务状态写入 JSON，但通用任务和进程句柄留在内存；恢复能力必须按阶段逐项证明，不能从“状态落盘”推导“执行可接管”（`backend/app/models/project.py:107`、`backend/app/models/task.py:56`、`backend/app/services/simulation_manager.py:128`）。
- **确定性操作身份 + 模糊写协调**：构图以内容哈希生成 operation ID，非幂等写失败后先查询服务端状态，不直接重放 POST（`backend/app/services/graph_builder.py:218`、`:264`、`:407`）。
- **终态屏障**：Zep batch、episode、memory updater 和报告读取之间存在显式等待/drain，避免“请求返回”被误判为“可供下游读取”（`backend/app/services/graph_builder.py:631`、`:720`；`backend/app/services/zep_graph_memory_updater.py:213`）。
- **有限 Agent 循环**：ReportAgent 对迭代数、工具调用和上下文做上限控制，但工具调用依赖手写 XML/JSON 文本解析，不具备 provider 原生 function schema 的约束强度（`backend/app/services/report_agent.py:871`、`:1260`、`:1576`）。
- **轮询式前端状态机**：前端用路由参数和后端落盘状态恢复已完成阶段，用固定间隔 HTTP polling 观察长任务；命名为 stream 的接口并不构成真正 SSE/WebSocket（`frontend/src/views/MainView.vue:185`、`:306`；`frontend/src/components/Step4Report.vue:2020`）。
- **单信任域安全假设**：无身份边界的资源 API、CORS `*`、traceback 响应和未经 sanitizer 处理的 `v-html` 共同限定了它只能作为受信环境原型（`backend/app/__init__.py:42`；`backend/app/api/simulation.py:2424`；`frontend/src/components/Step5Interaction.vue:557`）。

#### External references

- 本研究未联网引用第三方官网、博客或二手评测，也未读取 Zep/OASIS/CAMEL 包内部源码；第三方能力判断仅以 社会模拟参考项目 的调用边界为准。
- 快照自身声明 社会模拟参考项目、前端和后端版本均为 `0.1.0`；Python 要求 `>=3.11,<3.13`，Node 要求 `>=18.0.0`（`package.json:3`、`:17`；`frontend/package.json:4`；`backend/pyproject.toml:3`、`:5`）。
- 关键固定依赖是 `zep-cloud==3.25.0`、`camel-oasis==0.2.5`、`camel-ai==0.2.78`；Vue、Vite、Axios、D3 等前端依赖采用 caret 范围，不能从 manifest 单独确定实际安装版本（`backend/pyproject.toml:20`、`:24`、`:25`；`frontend/package.json:12`、`:14`、`:15`、`:20`）。

#### Related specs

- `.trellis/spec/guides/index.md`、`.trellis/spec/guides/project-workflow.md`、`.trellis/spec/guides/documentation.md`、`.trellis/spec/guides/skill-routing.md`：规定本研究进入活动任务、写入 `research/`、使用一手来源并保持唯一权威位置。
- `docs/specs/development-process.md`：accepted 的 Trellis 协作、write-through persistence 与研究产物契约。
- `docs/product/product-brief.md`：择途的事实/推断分层、用户权威、隐私、多用户和外部行动边界。
- `docs/product/mvp-experience-backbone.md`：机会调查、建议形成、用户决定和恢复体验的主流程契约。
- `docs/product/product-capability-map.md`：MVP 能力边界、证据可追溯要求和后续能力分层。
- `docs/product/glossary.md`：对照所用领域术语的权威定义。

## Caveats / Not Found

- 外部快照 `<social-simulation-source>` 没有 `.git`，无法确认 commit、tag、分支、发布日期或这些文件是否对应公开仓库最新版本；只能把根/前后端声明的 `0.1.0` 和 pinned 依赖视为快照事实（`package.json:3`、`frontend/package.json:4`、`backend/pyproject.toml:3`）。
- 本研究严格静态、离线：没有安装依赖、启动 Flask/Vite、执行 pytest、调用真实 LLM、Zep Cloud 或 OASIS。因此没有声称实际五阶段在当前机器可运行，也没有实测延迟、费用、Agent 数量上限或预测质量。
- 没有找到认证、账户、tenant、RBAC、CSRF、rate limit、token/cost accounting、预算强制或生产 WSGI 配置。依赖锁文件中的 JWT/OAuth 包是传递依赖，不能算应用已实现认证。
- 没有找到前端单元/组件/E2E 测试，也没有找到 CI 执行后端测试的 workflow。
- 没有找到预测准确率数据集、基线模型、校准指标、人工盲评协议、随机种子复现契约或多次模拟方差报告；因此不能从源码验证“高保真/精准预测”。
- 没有找到通用后台任务 resume、报告章节 checkpoint resume、运行中 OASIS 子进程跨后端重启 reattach、真正 SSE/WebSocket token streaming 或 pause/resume API。
- 社会模拟参考项目 对 Zep Cloud、OASIS、CAMEL 的行为依赖 pinned 第三方版本。本报告只确认调用边界，不把未包含在快照中的第三方内部实现当成 社会模拟参考项目 自有能力。
