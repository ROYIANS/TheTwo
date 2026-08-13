# 调研 AI 求职与研究系统参考项目

## Goal

基于三个本地参考项目，理解招聘平台工具、社会模拟系统与 Java AI 底包的产品能力、全栈架构、AI 后端、长流程编排和生产边界，并与择途已确认的 MVP 和产品原则对照。研究同时服务择途后续架构，以及个人 AI 全栈求职作品集建设。

## Privacy Convention

* 研究产物只使用“求职平台参考项目”“社会模拟参考项目”“Java AI 底包”等中性名称。
* 不在仓库文档中记录原项目名、本机绝对源码路径、内部 Maven group/artifact 前缀或可识别的内部包名。
* 源码证据使用中性源码根目录占位符、相对路径和行号；真实位置只由本地研究者掌握。
* Spring AI、MCP、Reactor、Redis、PostgreSQL 等公开技术名称可保留。

## Requirements

* 审计求职平台参考项目的求职/招聘命令、MCP、浏览器桥接、自动化、AI 和持久化边界。
* 审计社会模拟参考项目的前端、后端、Agent/图谱/模拟、状态恢复、部署测试与工程成熟度。
* 建立 Java AI 底包的模块/版本地图，分析模型接入、流式、结构化输出、Agent、工具、记忆、RAG/MCP、自动配置和生产机制。
* 区分自研领域协议、第三方框架能力、自动配置 glue、远程客户端、遗留实现和未完成占位。
* 将三个参考项目与择途按领域模型、证据、用户控制、外部行动、长任务、多租户、隐私、成本和可恢复性进行对照。
* 给出可直接借鉴思想、适合重写吸收、仅作学习材料和不应引入的分级建议。
* 给出面向 AI 全栈求职的代码学习顺序、实践任务、测试证据和面试讲述点。

## Acceptance Criteria

* [x] 三个参考方向均有独立 Markdown 研究报告。
* [x] 关键结论引用一手源码或元数据，并区分源码事实与说明/营销宣称。
* [x] 求职平台报告覆盖产品闭环、平台副作用、AI/MCP、自动化、安全与择途对照。
* [x] 社会模拟报告覆盖前端、后端、AI/Agent、图谱/模拟、状态、部署测试与择途对照。
* [x] Java AI 报告覆盖模块/版本、模型、Agent/工具/记忆、自动配置、RAG/MCP、生产机制和测试成熟度。
* [x] Java AI 报告还原至少一条端到端调用链，并区分自研与第三方责任。
* [x] 给出择途迁移分级和可验证的 AI 全栈作品集路线。
* [x] 不修改择途 accepted 产品文档或决策。
* [x] 研究文档不出现被研究项目的原始名称和本机源码绝对路径。

## Research References

* [`research/recruiting-platform-analysis.md`](research/recruiting-platform-analysis.md) - 求职平台工具、执行通道、外部副作用和择途对照。
* [`research/social-simulation-platform-analysis.md`](research/social-simulation-platform-analysis.md) - 社会模拟系统的全栈、AI 编排、图谱、任务状态与作品集价值。
* [`research/java-ai-foundation-analysis.md`](research/java-ai-foundation-analysis.md) - Java AI 底包架构、Agent 调用链、生产成熟度、迁移分级与学习路线。
* [`research/java-ai-rag-structured-output-evidence.md`](research/java-ai-rag-structured-output-evidence.md) - RAG、Embedding、远程知识库和结构化输出边界专项核验。

## Consolidated Findings

* 求职平台参考项目的中心是把招聘平台动作封装成 CLI/JSON/MCP/Python API，而择途的中心是用户拥有的职业事实、外部证据和可追溯决定。
* 平台私有接口、浏览器脚本、自动打招呼/投递和招聘自动化不应进入择途 MVP；显式能力状态、统一错误信封、`run_id`、checkpoint、stop、预算、脱敏、熔断和 dry-run 值得参考。
* 社会模拟参考项目是单实例、单信任域原型。部分业务对象和结果落盘，但通用任务、进程和聊天状态仍在内存，不能把“磁盘可见”称为完整任务恢复。
* 社会模拟项目最值得参考的是外部写入 operation identity、batch reconcile、终态屏障和图谱读取屏障，而不是多 Agent 数量。
* Java AI 底包最值得学习的是自有 Agent 协议、执行 ID、工具预检/权限/审批、取消传播、公开事件投影和大结果资源化，而不是 Starter 数量或 SDK 接入数量。
* Java AI 底包的图执行和模型协议依赖公开第三方框架；类数量不能等价为自研了完整 Agent 引擎。
* 所给 Java 构件未形成可核验的本地 RAG 管线：能注册 EmbeddingModel，旧知识库插件会做查询改写并委托远程端口，但未发现本地 VectorStore、切分/入库/召回闭环。
* 底层存在 response-format/JSON Schema 构造器，但新版 Agent request 未暴露 schema，模型 capability 对结构化输出返回 false，响应 validator 主要检查非空，因此不能宣称 Agent 主链支持强类型结构化结果。
* Java AI 底包默认会话记忆/replay/persistence 多为 Noop，任务/审批/资源/计划等多为 InMemory；图缓存配置了 maximumSize 但实际无界。
* `save point`、Redis Stream replay 和等待态重新入队不等于 durable Graph checkpoint。择途必须自己实现可接管、幂等且 tenant-scoped 的作业状态。
* 模型层有 token usage、Observation 和请求日志，但未形成价格账本、金额预算、tenant quota、统一限流熔断或默认脱敏；完整 prompt/响应日志属于高敏风险。

## Risks And Next Action

* 风险：不能把第三方框架接入、Starter 自动配置、远程 API 包装或 Demo 跑通当作自研 AI 后端能力。
* 风险：不能把事件可回放误称为执行可恢复，否则会造成重复副作用、重复模型成本和错误接管。
* 风险：完整模型请求/响应与工具输入输出日志可能泄露职业事实、凭据和第三方数据。
* 风险：同时引入遗留插件协议和新 Agent 工具协议会扩大权限、日志、校验与生命周期的重复边界。
* 下一动作：建立独立的“择途可恢复 AI 研究作业最小纵切”任务，实现 tenant-scoped durable job、结构化 LLM adapter、证据保存、状态事件、cancel/retry、预算和故障注入。
* 学习顺序：provider-neutral Java LLM gateway -> PostgreSQL durable job -> 工具审批 -> SSE replay -> tenant-safe evidence -> 成本/限流/熔断 -> evidence RAG/eval。

## Final Conclusion

* 本次研究不改变择途 accepted 产品路线：职业事实源、证据分层、明确但非强制的建议、用户亲自沟通投递、自部署与多用户隔离仍是主线。
* 三个参考项目带来的主要增量是工程契约，不是新的 MVP 功能。
* 择途应先完成一个窄领域、可恢复、可审计、可评测的 AI 工作流，第二个真实工作流出现重复后再抽象通用 Agent runtime。
* 可信的 AI 全栈作品集应展示契约测试、故障恢复、幂等、租户隔离、证据追溯、成本账本和离线评测，而不是框架名称清单。

## Scope And Limits

* 研究仅做静态源码与 Maven/项目元数据审计，不安装依赖、不调用真实模型或内部服务、不操作真实招聘平台。
* 外部源码快照缺少统一 Git 历史或根构建时，只能描述所给构件中的事实，不能推断未提供服务的实现。
* 不在本任务中实现择途后端，不作最终技术选型，不把内部构件直接复制进择途。

## Documentation Promotion

* [x] 将本次研究的长期有效摘要晋升到 [`docs/work/milestones/2026-08-13-ai-reference-system-research.md`](../../../../../docs/work/milestones/2026-08-13-ai-reference-system-research.md)。
* [x] 保留四份任务研究报告作为详细证据，不在 `docs/product/`、`docs/specs/` 或 `docs/decisions/` 复制尚未接受的产品或技术结论。
* [x] 阶段工作已结束，归档前无需新增实现任务；下一步另建“可恢复 AI 研究作业最小纵切”任务。
