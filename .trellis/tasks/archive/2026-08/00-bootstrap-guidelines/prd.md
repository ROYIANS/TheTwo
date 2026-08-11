# Bootstrap Project Development Guidelines

## Goal

在尚无业务代码的阶段，建立项目真实存在的开发过程、文档协作和 AI 工作规范。Trellis 负责外层任务生命周期与知识持久化，`.agents/skills/` 中的 Matt Pocock 技能作为阶段内方法按需使用，不能创建与 Trellis 竞争的任务、spec 或决策体系。

## Current Context

* 仓库尚无前端、后端、数据库或测试代码，不能从源码提炼编码规范。
* `docs/` 已建立生命周期优先的文档体系，`docs/README.md` 是文档治理权威正文。
* Trellis 已管理任务、PRD、研究、归档、会话日志和 `.trellis/spec/`。
* `.agents/skills/` 同时包含 Trellis 技能和来自 `mattpocock/skills` 的工程、产品讨论与协作技能。
* 仓库根目录已有 `.codegraph/` 索引，可用于源码定位、符号阅读和调用路径探索。
* 现有 `.trellis/spec/backend/` 与 `.trellis/spec/frontend/` 是初始化占位模板，不代表项目现实。

## Requirements

* 删除没有源码依据的前端、后端和通用代码模式占位规范，不保留 “To be filled” 内容。
* 新增公开的 `docs/specs/development-process.md`，作为项目开发过程的权威正文。
* 新增 ADR，记录 Trellis 主导、技能从属、工作聚焦和延迟代码规范的决定。
* `AGENTS.md` 只保留高命中率触发条件和指向详细规范的上下文指针。
* 所有会改变仓库、产品方向或长期知识的工作必须归属一个 Trellis 任务。
* 无关闲聊应被简短重定向；需求澄清、产品讨论、技术争论、状态询问和复盘属于项目工作。
* Trellis 是外层状态机：开始/恢复、需求探索、执行、检查、spec 更新、提交、归档和日志记录均由 Trellis 驱动。
* Matt Pocock 技能只作为活动 Trellis 阶段内的方法，不得默认运行 `setup-matt-pocock-skills`、创建 `.scratch/` issue tracker、根目录 `CONTEXT.md` 或另一套 ADR 目录。
* Matt 技能输出必须映射回当前 Trellis 任务的 `prd.md`、`research/`、子任务，或晋升到 `docs/`。
* 研究结果、关键决策、当前规范、实现经验和会话结果必须落盘，不能只存在于对话上下文。
* 持久化采用 write-through：确认决定、范围变化、接受假设、研究结论、风险和下一动作后，在下一项实质工作前更新任务或权威文档。
* `trellis-start` / `trellis-continue`、任务切换、handoff 和结束时必须核对用户意图、活动任务、PRD、accepted docs 与 Git 状态。
* `.codegraph/` 存在时，定位和理解代码优先使用 `codegraph explore` / `codegraph node`；无索引结果或目标是文档、配置时回退到 `rg` 和直接读取。
* 不承诺无法机械证明的绝对实时性；可验证边界是下一项实质动作前落盘、恢复时完成对账。
* 真实代码出现后，另建 Trellis 任务分析源码和测试，再创建对应 package/layer 规范。

## Skill Integration

* `trellis-start` / `trellis-continue`：进入项目工作的默认入口。
* `trellis-brainstorm`：不清晰或多方案任务的需求收敛，并持续更新 PRD。
* `grilling`、`grill-me`、`grill-with-docs`：作为压力测试和访谈方法；产物写回当前任务和 `docs/`。
* `research`：高可信资料调研；结果写入当前任务 `research/`。
* `prototype`：回答无法仅靠文档决定的问题；结论回写 PRD/研究，原型不替代正式实现。
* `to-spec` / `to-tickets`：分别映射为更新 Trellis PRD/公开 spec 与创建 Trellis 子任务，不发布平行 issue 体系。
* `implement` / `tdd`：在 Trellis 执行阶段内使用，仍需遵守 `trellis-before-dev` 和质量门。
* `code-review` / `trellis-check`：分别提供固定点双轴评审与项目质量门；发现的问题必须修复或记录。
* `diagnosing-bugs` / `trellis-break-loop`：诊断、回归测试、复盘与预防规范更新。
* `domain-modeling` / `codebase-design`：提供领域语言和深模块设计词汇，结论进入项目 glossary、ADR 或 spec。
* `triage` / `wayfinder`：用于外部请求或超大决策地图，最终仍转换为 Trellis 任务与子任务。
* `handoff`：仅在真实上下文边界使用，并引用已有持久化材料，避免复制。
* `wizard`、`teach`、`wait-what`、`to-questionnaire`、`resolving-merge-conflicts`：按其专用场景独立使用。

## Acceptance Criteria

* [x] `.trellis/spec/` 不再包含前后端占位模板或 “To be filled” 文本。
* [x] 公开开发过程 Spec 明确任务焦点、Trellis 生命周期、持久化和技能协作规则。
* [x] `AGENTS.md` 能可靠触发 Trellis 入口和项目规范读取，同时保持简短。
* [x] `AGENTS.md` 能触发 write-through 持久化、恢复对账和 CodeGraph-first 代码检索。
* [x] `.trellis/spec/guides/index.md` 能导航到当前真正适用的指南和权威正文。
* [x] Matt Pocock 技能用途已盘点，并按 Trellis 阶段给出映射。
* [x] 文档链接、Markdown 格式和状态元数据检查通过。
* [x] 明确记录代码规范延迟到真实代码出现之后。
* [x] 公开 spec 和 Trellis guide 明确 durable event、写入位置、完成边界、恢复对账和失败处理。
* [x] `.trellis/workflow.md` 的 live breadcrumb 状态会逐轮提醒 write-through 和状态对账。
* [x] CodeGraph 优先级与无索引结果、非源码目标的回退规则已记录。

## Out of Scope

* 选择前端、后端、数据库或部署技术栈。
* 编写不存在的目录结构、组件、错误处理、日志、ORM 或测试规范。
* 运行 `setup-matt-pocock-skills` 或配置另一套 issue tracker。
* 修改已安装技能本身。
* 编写业务代码、脚本或 CI。

## Verification

* [x] `.trellis/spec/` 中没有占位文本，只有当前适用的项目指南。
* [x] `AGENTS.md` 的项目策略位于 Trellis 托管区块之外，且各区块只出现一次。
* [x] 公开 Spec、ADR、讨论记录和 agent 指南的相对链接全部可解析。
* [x] Markdown 尾随空格、路径字符和 front matter 字段检查通过。
* [x] `get_context.py --mode packages` 返回单仓库且无 package 配置，符合当前无代码状态。
* [x] `codegraph explore` 可运行；Markdown 文档无索引结果时按规则回退到直接读取。
* [x] 没有代码项目、lint、类型检查或测试配置，因此未运行代码质量命令。
