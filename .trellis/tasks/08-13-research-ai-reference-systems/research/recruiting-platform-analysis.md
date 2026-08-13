# Research: 求职平台参考项目 源码能力审计与择途对照

- Query: 基于本地源码核验 求职平台参考项目 面向求职者和招聘者实际实现了什么，区分 API、浏览器/CDP 自动化、MCP/Agent 宿主、占位与 roadmap，并分析对择途（Zetu）的产品启示。
- Scope: mixed（本地外部项目的一手 README、docs、source、tests，与择途已接受产品文档和 ADR 对照；未访问真实招聘平台）
- Date: 2026-08-13

## Findings

### 1. 结论摘要

`求职平台参考项目` 的实际产品中心不是“职业决策”，而是**把招聘平台能力封装成可由真人、脚本或外部 Agent 调用的本地 CLI 工具层**。它已经形成相当完整的操作基础设施：登录态复用、职位搜索与详情、候选池、聊天和投递记录、招聘者命令、AI 文本处理、MCP 工具目录、可恢复 workflow、浏览器/CDP 适配和有界批量采集。README 也直接把价值描述为将职位发现、筛选、简历与 AI、投递沟通、招聘者处理和采集统一到 CLI（`<recruiting-platform-source>\README.md:43`、`<recruiting-platform-source>\README.md:45`）。

但它与择途不是同一种产品：

1. 求职平台参考项目 以**平台动作、命令和本地流水状态**为核心；择途以**用户拥有的职业事实、外部证据和可追溯决定**为核心。择途已经明确自己是个人职业研究系统，而不是职位、简历和申请状态后台（`D:\Code\Study\TheTwo\docs\product\product-brief.md:48`）。
2. 求职平台参考项目 的 AI 能力主要是“把简历/JD/聊天文本塞进任务 prompt，要求模型返回 JSON”；没有实现择途所需的职业事实分层、用户确认、更正传播、公司证据调查和判断快照。
3. 求职平台参考项目 已实现真实外部写操作，甚至默认可运行自动招聘动作；择途明确要求第一版只到“申请就绪”，不得自动发送、沟通或投递（`D:\Code\Study\TheTwo\docs\decisions\0015-application-ready-mvp-boundary.md:25`、`D:\Code\Study\TheTwo\docs\decisions\0015-application-ready-mvp-boundary.md:27`）。
4. 求职平台参考项目 对平台不稳定性的工程处理有参考价值，尤其是 `NOT_SUPPORTED`、结构化恢复动作、`run_id`、checkpoint、预算、stop 和通道分级；但其私有接口、页面脚本、CDP 和 Hook 路径不应成为择途 MVP 的依赖。

**对择途近期路线没有需要推翻 accepted 决策的新发现。** 相反，该项目强化了择途当前的收窄是合理的：首版继续采用文本/截图输入、用户亲自申请、证据优先和职业事实源。新增建议只应落在工程契约层：尽早定义能力可用性、外部副作用分级、可恢复长任务和明确降级，而不是提前接入招聘平台。

### 2. 研究对象与版本口径

本地源码包元数据仍标记为 `1.18.0`、Beta、Python >= 3.10（`<recruiting-platform-source>\pyproject.toml:5`、`<recruiting-platform-source>\pyproject.toml:7`、`<recruiting-platform-source>\pyproject.toml:17`）。Roadmap 记录 `v1.18.0` 于 2026-07-29 发布（`<recruiting-platform-source>\ROADMAP.md:5`、`<recruiting-platform-source>\ROADMAP.md:7`）。

然而当前源码和 README 已包含 2026-08 的“开放全部已实现能力”设计：`assisted` 与 `research` 权限相同（`<recruiting-platform-source>\src\platform_cli\compliance.py:10`、`<recruiting-platform-source>\src\platform_cli\compliance.py:14`），而 7 月 roadmap 仍将低风险阻断和受限 Research Mode 标为已完成治理项（`<recruiting-platform-source>\ROADMAP.md:41`、`<recruiting-platform-source>\ROADMAP.md:44`）。因此本报告区分：

- **当前源码树事实**：本文最主要判断依据；可能包含尚未正式发布的改动。
- **v1.18.0 发布事实**：以 `ROADMAP.md` 与 `CHANGELOG.md` 的已发布条目为准。
- **营销/使用说明**：README、quickstart、capability matrix；需要源码交叉验证。
- **未来或历史设计**：roadmap 未勾选项、已 superseded ADR，不视为当前产品能力。

### 3. 实现形态总览：API、浏览器、MCP、Agent 与占位必须分开

| 能力面 | 实际实现形态 | 当前边界 | 关键证据 |
|---|---|---|---|
| 平台 A 求职者搜索/推荐/打招呼/申请 | BrowserClient，经 CDP、Browser Bridge 或 patchright 页面上下文发请求 | 搜索并非纯公开 API；`apply` 实际复用“立即沟通/greet”端点 | `<recruiting-platform-source>\src\platform_cli\api\client.py:28`、`:62`、`:65`、`:108`、`:116` |
| 平台 A 求职者详情/资料/历史/聊天读取 | 直接 httpx 为主，详情必要时浏览器降级 | 依赖本地登录态和非官方网页接口 | `<recruiting-platform-source>\src\platform_cli\api\client.py:140`、`:142`、`:146`、`:164`、`:175`；`<recruiting-platform-source>\src\platform_cli\commands\detail.py:66`、`:75`、`:81` |
| 智联求职者侧 | 直接 httpx client | search/detail/recommend/user_info、greet/apply 等已有代码；聊天等仍缺实现 | `<recruiting-platform-source>\src\platform_cli\api\zhilian_client.py:249`、`:275`、`:278`、`:281`、`:221`、`:235`；`<recruiting-platform-source>\tests\test_zhilian_stub.py:167`、`:183` |
| 51job/前程无忧 | 稳定占位适配器 | 不构造网络 client，所有能力返回 `NOT_SUPPORTED` | `<recruiting-platform-source>\src\platform_cli\platforms\qiancheng.py:1`、`:20`、`:37`、`:70`；`<recruiting-platform-source>\tests\test_qiancheng_stub.py:70`、`:117` |
| 平台 A 招聘者 `hr` | `PlatformARecruiterClient`：读取走 httpx，写入走浏览器/API 混合 | 只有 `zhipin-recruiter` 注册为 `hr` 平台 | `<recruiting-platform-source>\src\platform_cli\api\recruiter_client.py:1`、`:3`、`:326`、`:436`、`:526`、`:529`；`<recruiting-platform-source>\src\platform_cli\platforms\__init__.py:34` |
| 智联招聘者自动化 | `招聘自动化 Agent` 下的可见浏览器/CDP adapter | 不属于 `hr` 命令；依赖页面 selector 和已登录招聘者页面 | `<recruiting-platform-source>\README.md:94`、`:102`；`<recruiting-platform-source>\tests\test_zhilian_browser_automation.py:148`、`:215`、`:226` |
| MCP | 73 个 Tool 定义，参数映射后通过 subprocess 调本机 `boss` CLI | 是协议适配层，不是第二套业务实现；能力仍受 CLI/平台实际支持度限制 | `<recruiting-platform-source>\src\platform_cli\mcp_server.py:101`、`:104`、`:125`、`:130`；`<recruiting-platform-source>\tests\test_mcp_server.py:225` |
| Agent host | Codex/Claude/Cursor/Windsurf/Shell/Python 等外部宿主 | 项目提供 schema、JSON 信封、MCP/SDK 接口；通用 LLM 编排由宿主负责 | `<recruiting-platform-source>\docs\agent-hosts.md:14`、`:21`、`:24` |
| `招聘自动化 Agent run/train` | 内置招聘者会话规则引擎 + 可选 AI 回复策略 | 不是通用规划 Agent；一次扫描会话、规则决策、阈值执行、记录事件 | `<recruiting-platform-source>\src\platform_cli\commands\agent.py:34`、`:39`、`:218`、`:368`；`<recruiting-platform-source>\src\platform_cli\automation\execution.py:69`、`:82`、`:121` |
| `wizard` workflow | 固定 goal -> 固定 step 计划，SQLite 持久化 `run_id` | 是确定性业务工作流，不是模型自由规划 | `<recruiting-platform-source>\src\platform_cli\wizard\catalog.py:22`、`:72`、`:143`；`<recruiting-platform-source>\src\platform_cli\cache\store.py:131` |
| crawl | 独立 Chrome profile + DrissionPage + Cookie 注入 + httpx 详情 | 真实批量采集，额外依赖；可注入用户提供的页面 Hook，风险高 | `<recruiting-platform-source>\src\platform_cli\commands\crawl.py:28`、`:92`、`:106`；`<recruiting-platform-source>\src\platform_cli\crawler\transport.py:385`；`<recruiting-platform-source>\src\platform_cli\crawler\hooks.py:41`、`:58` |

### 4. 求职者侧实际工作流

#### 4.1 登录与认证

`AuthManager.login()` 实现了多级降级：本机浏览器 Cookie 提取 -> 已运行 Chrome 的 CDP -> 平台 A QR/httpx -> 可见 patchright 浏览器扫码（`<recruiting-platform-source>\src\platform_cli\auth\manager.py:38`、`:63`、`:76`、`:88`、`:103`）。这不是项目自己的账户体系，而是**复用第三方招聘平台登录态**。

登录态保存在 `<data-dir>/auth`，Token 使用机器标识和随机 salt 经 PBKDF2 派生 Fernet key 后加密（`<recruiting-platform-source>\src\platform_cli\auth\token_store.py:20`、`:72`、`:79`、`:91`）。优点是 Cookie 不明文落盘；限制是它仍是单机、单目录的本地工具安全模型，不是 Web 产品的多用户身份与授权模型。

#### 4.2 搜索、筛选、详情与候选池

主要链路是：

```text
job-cli login
  -> job-cli search / recommend
  -> 本地缓存搜索结果与职位描述
  -> job-cli show / detail
  -> shortlist / favorites / preset / watch
  -> AI fit / resume optimize（可选）
  -> greet / apply / chat / pipeline
```

实现事实：

- 平台 A 搜索是 BrowserClient 通道，而不是无登录公开 API（`<recruiting-platform-source>\src\platform_cli\api\client.py:62`、`:65`、`:102`）。
- 详情有明确的 httpx 优先、缓存 job id、浏览器降级顺序（`<recruiting-platform-source>\src\platform_cli\commands\detail.py:66`、`:75`、`:81`、`:119`、`:161`）。
- 本地 SQLite 使用 WAL，保存搜索缓存、职位详情、打招呼/申请记录、shortlist、招聘者缓存、crawl 和 workflow 状态（`<recruiting-platform-source>\src\platform_cli\cache\store.py:14`、`:19`、`:23`、`:25`、`:30`、`:40`、`:54`、`:101`、`:131`）。
- 本地匹配分是城市、薪资、经验、学历、关键词和“福利信息完整”等固定加权，最高截断到 100；它不是证据化综合职业判断（`<recruiting-platform-source>\src\platform_cli\match_score.py:36`、`:42`、`:51`、`:53`、`:61`、`:69`、`:76`、`:80`）。

#### 4.3 沟通、申请与过程管理

这些不是“草稿”或“模拟接口”，而是可产生真实第三方副作用的能力：

- `greet` 在去重与可选 Hook veto 后直接调用平台写操作并记录成功（`<recruiting-platform-source>\src\platform_cli\commands\greet.py:27`、`:41`、`:53`、`:70`、`:82`）。
- `batch-greet` 默认不是 dry-run，数量上限 10，顺序执行并有有限重试/间隔（`<recruiting-platform-source>\src\platform_cli\commands\greet.py:111`、`:121`、`:122`、`:133`、`:192`、`:239`）。
- `apply` 没有交互式确认，直接调用 `platform.apply`；平台 A 实现又复用立即沟通端点，因此命令语义不等于传统上传简历式投递（`<recruiting-platform-source>\src\platform_cli\commands\apply.py:10`、`:16`、`:42`、`:54`；`<recruiting-platform-source>\src\platform_cli\api\client.py:116`、`:124`）。
- chat/pipeline/follow-up/digest 主要从第三方会话和面试数据读取，再做本地聚合；capability matrix 也将其标为“平台读取 + 本地聚合”（`<recruiting-platform-source>\docs\capability-matrix.md:41`、`:52`、`:56`）。

因此它实现的是“求职操作闭环”，不是择途定义的“形成完整申请决策包后由用户亲自行动”。

### 5. 招聘者侧实际工作流

#### 5.1 平台 A `hr` 命令

源码具备候选人搜索、投递列表、在线简历、聊天读取/回复、联系方式/附件简历请求，以及职位列表、详情和上下线委托。`PlatformARecruiterPlatform` 对这些方法进行了真实 client 委托（`<recruiting-platform-source>\src\platform_cli\platforms\zhipin_recruiter.py:63`、`:80`、`:119`、`:136`、`:150`）。

但“完整链路”应理解为**命令面和调用链齐全**，不等于所有真实端点长期稳定：

- Client 注释明确来自逆向确认的网页端点（`<recruiting-platform-source>\src\platform_cli\api\recruiter_client.py:1`、`:4`）。
- 读取主要走 httpx，发送消息、上下线、交换联系方式、面试邀请等写操作走浏览器或页面 Vue 组件（`<recruiting-platform-source>\src\platform_cli\api\recruiter_client.py:326`、`:355`、`:430`、`:436`、`:526`、`:529`、`:544`、`:659`、`:664`）。
- 代码已经记录旧回复端点被 WS + Protobuf 通道替代的漂移（`<recruiting-platform-source>\src\platform_cli\platforms\zhipin_recruiter.py:27`、`:57`）。这正说明其维护成本由平台内部实现变化决定。
- 大部分命令测试 patch 平台实例并使用 mock 返回包络，能验证 CLI 契约，但不能证明真实账号 live 可用（例如 `<recruiting-platform-source>\tests\test_recruiter_commands.py:31`、`:48`、`:105`、`:124`）。

#### 5.2 智联招聘者自动化

智联招聘者侧不在 `RecruiterPlatform` 注册表中，当前 `hr` 只有 平台 A（`<recruiting-platform-source>\src\platform_cli\platforms\__init__.py:34`）。智联走另一条 `agent` browser/CDP V1：选择已登录招聘者页面，扫描会话 DOM，读取消息，并通过 selector 填写/点击发送或交换联系方式。测试覆盖 selector 健康、错误 hostname、安全页截图和阻断（`<recruiting-platform-source>\tests\test_zhilian_browser_automation.py:95`、`:132`、`:148`、`:181`、`:226`、`:242`）。

这应标记为**浏览器自动化实现**，不能与稳定 API 适配器等同；页面 DOM/selector 漂移会直接导致能力失效。

### 6. AI、MCP 与 Agent host 的真实边界

#### 6.1 AI 是任务型文本生成，不是职业事实系统

`AIService` 对 OpenAI-compatible `/chat/completions` 做薄封装；AI 命令构造 prompt、调用模型、剥离 Markdown code fence 并 `json.loads`，没有更强 schema 校验或证据绑定（`<recruiting-platform-source>\src\platform_cli\commands\ai_cmd.py:40`、`:90`、`:108`、`:115`）。

已实现的主要 AI 任务包括：

- JD 与本地简历匹配分析；
- 简历润色、定向优化、改进建议；
- shortlist 的逐岗 `match_score/gaps/keyword_hits/recommendation`；
- 求职信/打招呼草稿、聊天回复、沟通教练；
- 面试题与准备建议。

命令会把完整本地简历和 JD/职位列表直接放进 prompt（`<recruiting-platform-source>\src\platform_cli\commands\ai_cmd.py:142`、`:160`、`:244`、`:248`）。Prompt 虽明确要求不得虚构经历，并在求职信结果中提供 warnings（`<recruiting-platform-source>\src\platform_cli\ai\prompts.py:291`、`:302`、`:313`），但源码没有把生成句子追溯到已确认职业事实，也没有用户更正后对下游资产的传播机制。

AI provider 支持云端兼容接口，也把 Ollama/vLLM 作为 localhost OpenAI-compatible provider（`<recruiting-platform-source>\src\platform_cli\ai\config.py:19`、`:28`、`:29`）。所谓“本地模型支持”是**对本地推理服务的配置与调用**，不是项目内置模型或推理引擎；包依赖中也没有模型运行时（`<recruiting-platform-source>\pyproject.toml:30`）。

#### 6.2 MCP 是 CLI 适配层

MCP Server 的 73 个工具数有测试钉死（`<recruiting-platform-source>\tests\test_mcp_server.py:225`、`:829`），但每个工具最终通过 `_build_args` 映射成 CLI 参数，再由 `subprocess.run` 调 `boss`（`<recruiting-platform-source>\src\platform_cli\mcp_server.py:101`、`:104`、`:130`）。所以：

- MCP 工具数真实存在，但不是 73 套独立业务实现；
- MCP 可暴露写操作，不自动提升用户确认或合规级别；
- 平台分支仍可能返回 `NOT_SUPPORTED`；
- stdio/SSE/HTTP streaming 是传输支持，不代表远程多用户服务或权限隔离。

#### 6.3 “Agent”有三种不同含义

1. **外部 Agent host**：Codex、Claude Code、Cursor、Windsurf、自建 Shell/Python Agent 读取 schema 并调用工具；模型和编排不在项目内（`<recruiting-platform-source>\docs\agent-hosts.md:14`、`:29`、`:30`）。
2. **固定 wizard workflow**：role/platform/goal 映射到预定义步骤，可用 `run_id` 恢复；这是确定性 workflow。
3. **招聘自动化 `招聘自动化 Agent`**：规则决定是否发问卷、跟进、交换联系方式或生成线索；可选 AI 只参与回复策略。它不是根据自由目标自主规划全求职过程。

Roadmap 所说“Agent 自主完成搜索 -> 筛选 -> 打招呼 -> 跟进 -> 面试准备”仍列在长期愿景（`<recruiting-platform-source>\ROADMAP.md:71`、`:74`），不应当作当前闭环已经实现。

### 7. 自动化、Browser Bridge 与 crawl

#### 7.1 招聘自动化的执行与安全模型

`招聘自动化 Agent run` 默认 `dry_run=False`，而 `train` 才默认演练（`<recruiting-platform-source>\src\platform_cli\commands\agent.py:39`、`:41`、`:43`、`:218`、`:220`、`:222`）。自动化默认允许的动作、人工复核阈值 0.65、自动执行阈值 0.82 和单 tab 上限 20 来自配置（`<recruiting-platform-source>\src\platform_cli\automation\config.py:11`、`:32`、`:33`、`:34`、`:38`）。

执行层会先做规则决策和风险/置信度门控；满足阈值后直接调用 adapter，状态记为 `AUTO_EXECUTED`（`<recruiting-platform-source>\src\platform_cli\automation\execution.py:79`、`:82`、`:121`、`:128`、`:134`、`:136`）。`review` 命令被源码明确描述为“旧版本遗留的人工复核队列”（`<recruiting-platform-source>\src\platform_cli\commands\agent.py:238`、`:240`），不能把它理解为当前所有动作的强制人审。

安全优点包括：阈值、allowed actions、dry-run、每日/会话预算、错误停止、circuit breaker、事件记录和 pending/review 状态。根本限制是：这些是**自动执行的风险控制**，不是“用户对每次对外表达与行动拥有最终权威”。

#### 7.2 Browser Bridge 的权限面

Bridge 是本地 daemon 与 Chrome MV3 扩展之间的 HTTP/WebSocket 转发层：协议 action 包括 `exec`、`navigate`、`cookies`、`close-window`（`<recruiting-platform-source>\src\platform_cli\bridge\protocol.py:11`、`:27`）；扩展能在 tab 中执行传入代码、导航并读取指定 domain Cookie（`<recruiting-platform-source>\extension\background.js:196`、`:211`、`:218`、`:238`）。

实现只绑定 `127.0.0.1`，降低远程暴露面，但在已读的 daemon/protocol 中未发现 token、origin 或调用方鉴权字段；daemon 收到 `/command` JSON 后会直接转发给已连接扩展（`<recruiting-platform-source>\src\platform_cli\bridge\daemon.py:153`、`:160`、`:165`、`:228`）。这是高权限本地执行面，若未来参考，必须补独立威胁模型、调用授权、域名白名单和每次敏感动作确认。

#### 7.3 可恢复 crawl

crawl 的工程设计较完整：独立 Chrome profile、显式页数、请求/详情/墙钟/重试预算、SQLite checkpoint、stop flag、风险页检测和恢复命令（`<recruiting-platform-source>\src\platform_cli\commands\crawl.py:92`、`:99`、`:106`、`:109`、`:397`、`:476`；`<recruiting-platform-source>\src\platform_cli\crawler\operations.py:20`、`:47`）。

但实际采集会将登录 Cookie 注入独立浏览器 profile，并用页面/HTTP 读取职位列表与详情（`<recruiting-platform-source>\src\platform_cli\commands\crawl.py:120`、`:133`；`<recruiting-platform-source>\src\platform_cli\crawler\transport.py:288`、`:315`、`:385`）。可选 `screenshot-full` Hook 会校验用户目录的 `SHA256SUMS` 后把 7 个脚本注入每个新文档（`<recruiting-platform-source>\src\platform_cli\crawler\hooks.py:10`、`:41`、`:49`、`:58`、`:80`）。

因此其“可恢复、有预算”值得借鉴，具体采集和 Hook 技术则与择途首版明确不自动抓 URL、后置浏览器插件的边界冲突。

### 8. 数据、存储、隐私与合规

#### 8.1 实际本地数据边界

| 数据 | 存储方式 | 结论 |
|---|---|---|
| 招聘平台 Cookie/Token | Fernet 加密文件，机器标识 + salt 派生 key | 有静态加密，但仍是单机登录态复用，不是 OAuth/用户授权系统 |
| AI API key | 独立 Fernet 加密文件 | 做到了 key 不明文落盘（`<recruiting-platform-source>\src\platform_cli\ai\config.py:42`、`:49`、`:74`、`:87`） |
| 本地简历 | `~/.reference-cli/resumes/*.json` 明文文件 | 高敏职业内容未加密；没有事实/推断/证据分层（`<recruiting-platform-source>\src\platform_cli\resume\store.py:14`、`:15`） |
| 搜索、详情、shortlist、动作记录、招聘者缓存、crawl、workflow | 单个 SQLite WAL 数据库 | 本地可恢复，但不是用户隔离的数据域（`<recruiting-platform-source>\src\platform_cli\cache\store.py:19`、`:23`） |
| 自动化事件/状态 | data-dir 下本地 JSON/JSONL 状态 | 便于审计与恢复，但无多用户访问控制 |
| 导出/日志/诊断截图 | 本地文件 | 依赖调用者保管与清理；部分命令默认脱敏 |

`clean` 支持按表、目录和 privacy 范围删除缓存、动作与 crawl 数据（`<recruiting-platform-source>\src\platform_cli\commands\clean.py:121`、`:132`、`:179`、`:184`、`:189`）。这是有价值的本地生命周期机制，但没有择途要求的个人完整数据导出、备份期限说明、按用户删除或敏感更正历史删除契约。

#### 8.2 合规机制的实际强度

当前源码的 capability policy 给敏感命令记录 `risk_class` 和 `data_class`，但所有策略同时允许 `assisted`/`research`，且 `requires_explicit_consent=False`（`<recruiting-platform-source>\src\platform_cli\compliance.py:30`、`:57`、`:60`、`:63`）。风险文档也明确 `COMPLIANCE_BLOCKED` 只保留为历史错误码，当前路径不产生（`<recruiting-platform-source>\docs\platform-risk.md:14`）。

项目真正提供的保护主要是：

- 随机节流与数量上限；
- 登录态静态加密；
- 风险码/安全页停止；
- checkpoint、retry/timeout budget 与 kill switch；
- 默认导出脱敏、隐私清理；
- 文档要求遵守平台协议和保护候选人数据（`<recruiting-platform-source>\README.md:235`、`:237`）。

未实现或未找到的产品级合规能力包括：

- 对每个外部服务说明“提供方、用途、发送字段”并按用途授权；
- 在调用模型前展示实际发送摘要或对职业画像做最小片段选择；
- 多用户身份、准入、数据隔离和管理员信任边界；
- 对真实平台写操作的强制逐次用户确认；
- 对招聘候选人数据的同意、合法基础、保留期限和主体权利流程。

这不是穷尽式法律或安全审计，但足以说明它的“本地 + 免责声明 + 运行护栏”不能替代择途已经接受的隐私与用户权力契约。

### 9. README、roadmap 与源码之间的差异

| 对外说法或规划 | 源码核验 | 判定 |
|---|---|---|
| “招聘者完整链路” | 平台 A 的命令与 client 委托确实覆盖完整操作面，但部分写动作依赖页面 Vue/浏览器，端点已有漂移记录，测试大量使用 mock | **已实现调用链；live 稳定性不能由仓库离线证据证明** |
| “73 个已实现 MCP 工具” | 工具定义数和参数映射有测试钉死；统一 subprocess 调 CLI | **工具协议真实；不是 73 个独立后端，且某些平台组合会 `NOT_SUPPORTED`** |
| “多平台” | 平台 A 求职者+招聘者；智联求职者 httpx + 招聘者 CDP V1；51job 只注册占位 | **部分实现，不能简写成三平台能力对等** |
| “Agent 自动化” | 内置的是招聘会话规则引擎和外部 Agent host 接口；全求职自主闭环仍在长期愿景 | **部分实现；名称容易让人误解为通用自主 Agent** |
| “本地模型” | 支持 Ollama/vLLM 的 OpenAI-compatible localhost endpoint；不打包模型或运行时 | **接口支持，不是内置本地 AI 栈** |
| “纯本地存储/隐私” | 核心状态本地，Token/key 加密；简历和 SQLite 内容明文，AI/招聘平台调用会外发 | **本地优先属实；不能推导为端到端隐私或多用户隔离** |
| “浏览器扩展深度集成”在 roadmap 未完成 | 仓库已有 Bridge 扩展，但它是本地执行/调试基础设施，不是面向用户的职位采集体验 | **当前 Bridge 与规划中的产品级扩展不是同一能力** |
| Roadmap 智联招聘者“暂不接入” | 当前 README/源码已有 CDP browser adapter V1 | **roadmap 条目落后或语义限于 `RecruiterPlatform/hr`；需以当前源码为准** |
| 默认低风险 assisted 模式 | 历史 ADR 和 7 月 roadmap如此描述；当前源码已开放两种模式全部能力 | **已被当前源码 supersede；发布版与源码树行为可能不同** |
| Web UI | `agent control` 只返回 CLI 命令并说明 Web 控制台后续接入（`<recruiting-platform-source>\src\platform_cli\commands\agent.py:324`、`:332`、`:335`） | **未实现** |

### 10. 与择途的能力和原则对照

| 维度 | 求职平台参考项目 | 择途 accepted 方向 | 对择途含义 |
|---|---|---|---|
| 产品目标 | 让真人/Agent 在招聘平台搜索、管理、沟通、申请或招聘 | 个人职业研究和决策系统 | 不应把平台操作效率改成产品中心 |
| 核心对象 | command、平台 job/candidate/chat、缓存、run | 职业事实源、研究材料、机会证据、判断快照、用户决定 | job-cli 的 schema/run 可作基础设施参考，领域模型不可照搬 |
| 首次输入 | 平台登录态、本地/在线简历、搜索条件 | 简历或基本经历 + 结构化访谈 + 用户确认（`D:\Code\Study\TheTwo\docs\decisions\0017-resume-plus-structured-interview-onboarding.md:26`、`:28`） | job-cli 未解决择途 onboarding 的事实可信度问题 |
| 职位输入 | 直接搜索/推荐/抓取平台，强平台依赖 | 用户粘贴文本/截图；URL 仅来源元数据（`D:\Code\Study\TheTwo\docs\decisions\0023-manual-text-and-screenshot-job-intake.md:24`、`:26`） | 首版继续保持来源无关，避免平台适配牵制主链 |
| 公司与岗位调查 | 读取平台职位字段；未见公司主体核验、公开证据调查 | 一手来源优先，保留来源、时间、冲突、未知 | 这是择途相对 job-cli 最重要的差异能力之一 |
| 个人事实 | 本地结构化简历 JSON | 用户拥有的长期职业事实，事实/推断/未知分层（`D:\Code\Study\TheTwo\docs\decisions\0007-user-owned-career-profile.md:24`、`:28`） | 简历不能成为唯一事实源 |
| 匹配判断 | 固定 `match_score` 或 LLM 0-100 分、关键词/差距 | 明确但非强制建议，含依据、不利证据、风险、机会成本、未知（`D:\Code\Study\TheTwo\docs\decisions\0020-explicit-advisory-job-recommendation.md:25`、`:27`） | 不采用简单总分作为主判断 |
| 材料生成 | prompt 生成优化建议/求职信，强调不虚构 | 从已确认事实源派生，并解释修改和证据 | 可借 prompt 边界，但需结构化事实守卫和逐项审核 |
| 外部行动 | 可 greet、batch-greet、apply、reply、自动招聘执行 | 用户亲自沟通和投递；AI 只生成草稿 | 明确冲突，首版不能复制 |
| 用户控制 | CLI 参数、dry-run、stop、阈值；当前敏感能力不要求显式 consent | 用户对事实、表达和职业行动有最终权威 | 运行控制不能替代决定权 |
| 外部服务披露 | BYOK/本地 provider 配置，AI 命令直接传完整任务输入 | 最小必要披露，用户知道接收方和数据类型（`D:\Code\Study\TheTwo\docs\decisions\0011-minimum-necessary-external-disclosure.md:24`、`:29`） | 择途需在 adapter 之上增加披露计划与授权界面 |
| 数据/部署 | 单用户本地 data-dir；敏感凭据加密，其余多为明文 | 自部署、多用户隔离、管理员不可浏览、个人 BYOK（`D:\Code\Study\TheTwo\docs\decisions\0022-isolated-multi-user-self-hosting.md:25`、`:30`） | job-cli 的本地目录模式不满足择途产品基础 |
| 可恢复性 | run_id、SQLite checkpoint、status/resume/stop、错误 recovery action | 研究空间和机会工作需可恢复 | 值得尽早吸收为横切工程契约 |
| Agent/MCP | schema 真源、JSON 信封、MCP/SDK 外部宿主 | AI 是产品内顾问，MCP 尚非当前产品目标 | 可参考工具边界，但不应让 Agent 协议先于产品领域闭环 |

### 11. 对择途的建议分类

#### 11.1 Borrow now：现在就值得吸收

1. **能力可用性必须显式建模。** 为未来模型、搜索、OCR、调查源和导出能力定义 `available / unavailable / not_supported / degraded`，并给出明确受影响步骤和恢复动作。job-cli 对 51job 稳定返回 `NOT_SUPPORTED`，比“注册了就算支持”更诚实。
2. **统一错误与恢复契约。** 内部 API/任务可以采用类似 `{code, recoverable, recovery_action, details}` 的错误模型；这与择途“外部能力失败时不得伪装完成”一致。
3. **长任务采用显式 `run_id` + checkpoint + status/resume/stop。** 适用于公司公开信息调查、批量证据抓取和大型材料解析。尤其要保留“不要扫描最新任务隐式恢复”的原则（`<recruiting-platform-source>\docs\agent-hosts.md:38`）。
4. **从第一天区分执行通道。** 在能力/审计元数据中区分 local、external model、public web、authenticated API、browser page、platform write、stub；不要用一个泛化“连接器”掩盖风险与稳定性差异。
5. **外部副作用与幂等记录。** 即使 MVP 不执行平台动作，导出、删除、外部模型调用和联网调查也应有显式副作用分类、输入摘要、去重键和审计事件。
6. **隐私清理与默认脱敏。** 对日志、错误、导出和诊断产物采用字段级脱敏，并提供可预览的隐私清理；job-cli 对 security id、Cookie、Token 和 crawl 数据的处理可作为反例驱动测试素材。
7. **契约测试覆盖 schema 与文档。** job-cli 用测试钉住 MCP 工具数量和参数 schema。择途可以为能力元数据、外部披露摘要、判断包必填项和“不允许自动外部行动”建立同类契约门禁。

#### 11.2 Later reference：后续扩展时参考

1. **平台/数据源 adapter 注册表。** 等择途进入合规连接器阶段后，参考“基类 + 注册表 + 稳定 `NOT_SUPPORTED` + 平台错误归一化”，但 adapter 粒度应围绕“职位输入/公开证据源”，而不是复制平台全操作面。
2. **浏览器当前页采集。** 只在 ADR-0023 所列 MVP 后续阶段参考扩展桥；优先最小权限读取当前页，并把读取、导航、Cookie、执行脚本拆成不同授权等级。
3. **本地模型/OpenAI-compatible provider 适配。** 可参考 Ollama/vLLM endpoint 模式，但择途还需要任务级数据最小化、提供方披露和云/本地能力差异说明。
4. **结果反馈和求职过程。** shortlist、pipeline、digest 和 stats 可作为择途 MVP 后续“真实结果关联”的输入形态参考；不要让它们反向把产品变成 CRM。
5. **MCP/Agent host。** 在择途领域 API、权限和副作用契约稳定后，再考虑把读取、研究和草稿能力暴露给宿主；外部行动默认不暴露或要求一次性用户批准。
6. **独立浏览器 profile 和 selector health。** 若后续确需 browser adapter，独立 profile、准确 hostname 校验、selector 健康检查、安全页截图和失败即停值得参考。

#### 11.3 Do not copy：不应照搬

1. **自动打招呼、批量触达、自动投递和自动招聘回复。** 这直接违反择途的用户主体性与申请就绪边界。
2. **以逆向私有接口、页面内部 Vue 对象、DOM selector 或 CDP 为核心数据基础。** 可维护性、账号风控、条款与隐私风险都过高。
3. **把“有预算/可停止”当成合规授权。** 运行护栏只能限制损害，不能替代用户同意、数据合法基础和第三方服务条款。
4. **用单一 `match_score` 或 LLM 0-100 分驱动机会排序。** 它会隐藏证据强弱、硬约束、价值偏好和机会成本，与择途 ADR-0014/0020 冲突。
5. **把本地简历 JSON 当成完整用户上下文。** 择途需要唯一职业事实源、证据、推断/未知、确认和更正传播。
6. **直接复用单用户 `~/.reference-cli` 存储模式。** 它没有择途所需的账户准入、用户隔离、管理员边界、备份/删除语义和个人 BYOK 隔离。
7. **在 MCP 中无差别暴露所有写工具。** 工具协议不会自动产生人审；当前 job-cli 源码甚至将敏感能力 `requires_explicit_consent` 设为 false。
8. **把浏览器 Bridge 的通用 `exec`/Cookie 能力交给产品主流程。** 这种权限面过深，且当前 localhost daemon 未见调用鉴权，不符合最小权限设计。

### 12. 对近期路线的明确回答

**不建议因本次研究新增招聘平台连接器、浏览器扩展、MCP 或自动申请到择途 MVP。** 求职平台参考项目 展示的恰恰是这些能力进入真实运行后产生的长期成本：认证兼容、私有端点漂移、CDP/selector、账号风控、Cookie 保管、批量预算和平台差异会迅速占据产品研发，而这些都不能替代择途尚需验证的核心价值：可信职业事实、公司证据调查、明确机会判断和完整申请决策包。

建议为后续独立任务保留三项工程研究：

1. 设计择途统一的“能力可用性 + 数据披露 + 副作用等级 + 恢复动作”契约；
2. 为联网调查设计 `run_id/checkpoint/status/resume/stop` 长任务模型；
3. 为所有未来 adapter 制定 `local / public-web / authenticated-api / browser-read / browser-write / unsupported` 分级准入清单。

这些建议不改变当前 accepted 产品文档，只补充后续设计时应验证的工程约束。

## Files Found

### 求职平台参考项目 一手资料

- `<recruiting-platform-source>\README.md`：当前定位、核心能力、平台状态、Agent/MCP、存储和免责声明。
- `<recruiting-platform-source>\ROADMAP.md`：v1.18.0 已发布记录、当前/中期路线与长期 Agent 愿景。
- `<recruiting-platform-source>\CHANGELOG.md`：发布版实现和修复边界。
- `<recruiting-platform-source>\docs\capability-matrix.md`：官方命令、登录要求和执行通道矩阵。
- `<recruiting-platform-source>\docs\platform-risk.md`：Cookie、CDP、批量、风险停止和平台漂移边界。
- `<recruiting-platform-source>\docs\agent-hosts.md`：外部 Agent 宿主接入形态。
- `<recruiting-platform-source>\docs\agent-quickstart.md`：Agent/wizard/crawl/recruiter 推荐工作流。
- `<recruiting-platform-source>\mcp-server\README.md`：MCP 73 工具目录和传输说明。
- `<recruiting-platform-source>\src\platform_cli\api\client.py`：平台 A 求职者 browser/httpx 双通道。
- `<recruiting-platform-source>\src\platform_cli\api\zhilian_client.py`：智联求职者 httpx 客户端。
- `<recruiting-platform-source>\src\platform_cli\api\recruiter_client.py`：平台 A 招聘者 API、浏览器和页面前端动作。
- `<recruiting-platform-source>\src\platform_cli\platforms\`：求职者/招聘者平台注册表、实现与 51job 占位。
- `<recruiting-platform-source>\src\platform_cli\commands\`：CLI 求职者、招聘者、AI、agent、crawl 与 wizard 入口。
- `<recruiting-platform-source>\src\platform_cli\automation\`：招聘自动化决策、执行、安全、存储与 平台 A/智联/mock adapter。
- `<recruiting-platform-source>\src\platform_cli\bridge\` 与 `extension\`：localhost daemon、协议和 Chrome 扩展执行面。
- `<recruiting-platform-source>\src\platform_cli\crawler\`：DrissionPage 采集、预算、checkpoint、Hook 和导出。
- `<recruiting-platform-source>\src\platform_cli\ai\`：AI provider、OpenAI-compatible 调用和 prompt。
- `<recruiting-platform-source>\src\platform_cli\cache\store.py`、`resume\store.py`、`auth\token_store.py`：本地 SQLite、明文简历和加密凭据边界。
- `<recruiting-platform-source>\tests\`：CLI/MCP/平台/自动化契约测试；多数真实平台行为由 mock/fake 验证。

### 择途对照资料

- `D:\Code\Study\TheTwo\docs\product\product-brief.md`：产品中心、责任边界、隐私与 MVP 总览。
- `D:\Code\Study\TheTwo\docs\product\product-capability-map.md`：能力阶段、横切契约和明确不做。
- `D:\Code\Study\TheTwo\docs\product\mvp-experience-backbone.md`：六阶段体验、持续状态、异常和申请就绪终点。
- `D:\Code\Study\TheTwo\docs\decisions\0007-user-owned-career-profile.md`：职业画像和用户拥有原则。
- `D:\Code\Study\TheTwo\docs\decisions\0008-user-final-authority-over-profile.md`：用户对职业事实的最终解释权。
- `D:\Code\Study\TheTwo\docs\decisions\0011-minimum-necessary-external-disclosure.md`：外部模型/联网服务最小披露。
- `D:\Code\Study\TheTwo\docs\decisions\0014-evidence-first-decision-support.md`：事实、推断、判断与证据契约。
- `D:\Code\Study\TheTwo\docs\decisions\0015-application-ready-mvp-boundary.md` 与 `0016-complete-application-decision-package.md`：不自动申请和完整决策包。
- `D:\Code\Study\TheTwo\docs\decisions\0017-resume-plus-structured-interview-onboarding.md` 与 `0018-one-career-source-multiple-resume-positionings.md`：职业事实启动与派生关系。
- `D:\Code\Study\TheTwo\docs\decisions\0019-user-mediated-source-agnostic-job-intake.md` 与 `0023-manual-text-and-screenshot-job-intake.md`：来源无关、手动文本/截图输入。
- `D:\Code\Study\TheTwo\docs\decisions\0020-explicit-advisory-job-recommendation.md`：明确但非强制的建议。
- `D:\Code\Study\TheTwo\docs\decisions\0022-isolated-multi-user-self-hosting.md`：自部署多用户隔离、BYOK 和管理员边界。

## Code Patterns

1. **Platform/RecruiterPlatform 注册表**：命令层通过抽象调用，平台实现负责包络和错误归一化；未实现能力稳定失败，而不是假成功（`<recruiting-platform-source>\src\platform_cli\platforms\__init__.py:27`、`:34`、`:39`）。
2. **Hybrid transport**：同一业务 client 将低风险读取放在 httpx，将易触发风控或依赖页面状态的动作放在 BrowserClient（`<recruiting-platform-source>\src\platform_cli\api\client.py:28`、`:62`）。
3. **Schema/JSON envelope first**：CLI、wizard、MCP 和宿主通过统一 schema、参数和错误信封协作；MCP 复用 CLI 而非复制业务逻辑。
4. **Persisted workflow**：SQLite 保存 run/step，显式 status/resume/stop；适合不可一次完成的外部任务。
5. **Bounded automation**：阈值、allowed actions、数量预算、dry-run、熔断和事件日志共同限制自动化，但当前不是强制人审。
6. **Local-first secrets**：Cookie 与 AI key 机器绑定加密；业务内容仍多为本地明文，因此“凭据安全”和“内容隐私”是两层不同问题。
7. **Offline contract tests**：大量 fake/mock 可稳定验证命令、错误、selector health 和工具 schema；真实平台可用性必须另行 smoke 验证，不能由单元测试推导。

## External References

本次没有使用互联网二手资料，也没有访问真实招聘平台。所谓 external 是指工作区之外的本地项目一手资料：

- 求职平台参考项目 package metadata: `1.18.0`, Beta, Python >= 3.10（`<recruiting-platform-source>\pyproject.toml:7`、`:10`、`:17`）。
- MCP Python optional dependency: `mcp>=1.0.0`（`<recruiting-platform-source>\pyproject.toml:59`）。
- Browser/crawl dependencies: patchright 为核心依赖；DrissionPage/openpyxl 为 crawl extra（`<recruiting-platform-source>\pyproject.toml:34`、`:62`）。
- v1.18.0 release date and scope: 2026-07-29（`<recruiting-platform-source>\ROADMAP.md:7`；`<recruiting-platform-source>\CHANGELOG.md:7`）。

## Related Specs

- `D:\Code\Study\TheTwo\docs\product\product-brief.md`
- `D:\Code\Study\TheTwo\docs\product\product-capability-map.md`
- `D:\Code\Study\TheTwo\docs\product\mvp-experience-backbone.md`
- Accepted ADRs 0007、0008、0011、0014 至 0020、0022、0023，具体关联见上文“Files Found”。

## Caveats / Not Found

1. 本报告是静态源码研究；按任务要求没有运行登录、搜索、抓取、沟通、申请、招聘者或任何会访问真实平台的命令。
2. 没有安装依赖或运行完整测试套件。测试文件只作为一手契约和 fake/mock 行为证据读取，不能证明 2026-08-13 的真实平台接口仍可用。
3. 当前工作树版本号仍为 1.18.0，但文档和源码含 2026-08 的未发布/后发布设计；无法仅凭本地目录确定具体 commit，因此报告没有把当前源码行为归入某个未标记 release。
4. 未找到 求职平台参考项目 内部实现的通用 LLM planner；“Agent”主要指外部宿主、固定 wizard workflow 和招聘者规则自动化三类能力。
5. 未找到公司主体核验、公开来源证据调查、来源/时间/强弱/冲突模型、机会成本判断或决策快照；这可能在仓库外的独立 `外部提示层项目` 中存在提示层能力，但该外部仓库不在本任务范围，不能据此归为 求职平台参考项目 已实现。
6. 未找到多用户账户、邀请制准入、用户数据隔离、管理员权限边界或共享凭据隔离；`--data-dir` 可物理分目录，但不等于产品级访问控制。
7. 未做穷尽式安全审计。Browser Bridge“未见鉴权”的判断仅限已读 protocol/daemon/extension 源码，不代表不存在操作系统、浏览器或部署层的其他保护。
8. README、capability matrix、roadmap 存在时间差与语义冲突；重要判断均优先采用当前源码和测试，并在上文显式标注差异。
