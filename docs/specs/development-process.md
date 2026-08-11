---
title: Trellis 主导的开发与 AI 协作过程
type: spec
status: accepted
created: 2026-08-11
updated: 2026-08-11
owners:
  - ROYIANS
related:
  - ../decisions/0002-trellis-led-development-workflow.md
  - ../work/discussions/2026-08-11-agent-workflow-and-skills.md
  - ../README.md
---

# Trellis 主导的开发与 AI 协作过程

## Purpose

本规范定义择途项目中 AI 与开发者如何组织工作、保存上下文、选择技能和完成任务。它适用于需求讨论、研究、文档、设计、代码、调试和复盘。

当前仓库尚无业务代码，因此本规范只描述已经真实存在的开发过程，不预设前端、后端、数据库或测试约定。

## Work Focus

项目会话保持工作聚焦。

以下内容属于项目工作：

* 产品讨论、需求澄清和范围收敛；
* 技术研究、方案比较和架构决策；
* 文档、设计、实现、测试、评审和调试；
* 任务状态询问、风险说明、复盘和交接；
* 与择途产品、仓库或开发过程直接相关的教学和解释。

对于与项目无关的闲聊，AI 应简短说明当前会话以项目工作为中心，并邀请用户回到当前任务。该规则不能用于回避合理的澄清、质疑或设计争论。

## CodeGraph-First Code Discovery

仓库根目录存在 `.codegraph/` 时，定位和理解代码优先使用 CodeGraph：

* 用 `codegraph explore "<问题或符号>"` 获取相关符号的源码和调用路径；
* 用 `codegraph node <符号或源码文件>` 查看单个符号、调用者或源码文件；
* CodeGraph 已返回所需源码时，不再重复进行同范围的广泛搜索；
* CodeGraph 不可用、没有索引结果、索引不足，或目标是未被索引的 Markdown、配置和资源文件时，回退到 `rg`、文件列表和直接读取；
* 修改前仍需读取准确的当前文件上下文，不能仅凭摘要或过期结论编辑。

这一顺序减少无目标的文件遍历和上下文消耗，但 CodeGraph 不是文档搜索或事实来源的替代品。

## Trellis Is The Outer Workflow

Trellis 是项目开发的外层状态机。任何会改变仓库、产品方向或长期知识的工作都必须归属一个 Trellis 任务。

### 1. Enter Or Resume

* 新会话先使用 `trellis-start` 获取开发者、Git、任务和规范上下文。
* 已有活动任务时使用 `trellis-continue` 恢复正确阶段。
* 用户明确切换任务时，先保存当前任务状态，再切换指针。

纯只读的一次性问题可以直接回答，但不得借此执行未归属任务的修改。只要工作需要多步研究、产生文件或形成长期决策，就必须创建或选择任务。

### 2. Plan

* 需求不清晰、有多个合理方案或权衡显著时，使用 `trellis-brainstorm`。
* 已知事实通过仓库和资料检查获得，不把可调查的问题推给用户。
* 用户回答后立即更新任务 `prd.md`，不要只在聊天中保留决定。
* 研究写入任务的 `research/`，一个主题一个文件。

### 3. Execute

* 写代码前必须使用 `trellis-before-dev` 读取当前适用规范。
* 实现必须以任务 PRD 和已接受的公开 spec 为边界。
* 阶段内可以使用 Matt Pocock 技能提供的访谈、研究、原型、TDD、调试或设计方法，但 Trellis 任务状态不因此改变所有权。

### 4. Check

* 完成修改后使用 `trellis-check` 验证 PRD、spec、lint、类型检查、测试和跨层一致性。
* 专门的固定点评审可以叠加 `code-review`，但不能替代 Trellis 质量门。
* 发现问题时直接修复并重新检查；无法修复的风险必须写入任务或公开文档。

### 5. Capture Learning

* 新的代码契约、惯例、反模式和调试经验使用 `trellis-update-spec` 或 `trellis-break-loop` 固化。
* 产品和系统的当前真相写入 `docs/product/` 或 `docs/specs/`。
* 重要选择及其代价写入 `docs/decisions/`。
* AI 讨论和阶段工作按 [`docs/README.md`](../README.md) 的规则保存。

### 6. Commit And Finish

* AI 只提交当前任务范围内、能够解释来源的文件。
* 提交前列出逻辑提交计划，避免混入用户或其他任务的改动。
* 工作提交完成后使用 `trellis-finish-work` 归档任务并记录会话日志。
* 归档提交和日志提交不得与工作提交混在一起。

## Persistence Contract

| 信息 | 权威位置 | 规则 |
|---|---|---|
| 当前任务范围与验收 | `.trellis/tasks/<task>/prd.md` | 用户决定后立即更新 |
| 调研与资料阅读 | `.trellis/tasks/<task>/research/` | 一个主题一个文件，记录来源 |
| 产品当前上下文 | `docs/product/` | 只保留当前采用的内容 |
| 产品或系统契约 | `docs/specs/` | accepted 后驱动设计与实现 |
| 重要决策 | `docs/decisions/` | 保留上下文、选择和后果 |
| 讨论与阶段材料 | `docs/work/` | 不直接构成当前规范 |
| 原始截图和输入 | `docs/evidence/` | 证据不直接构成需求 |
| AI 执行约束 | `.trellis/spec/` | 精炼规则和权威正文指针 |
| 会话记录 | `.trellis/workspace/` | 由 Trellis 收尾流程追加 |

任何关键结论如果只存在于聊天中，该工作就没有完成。

## Write-Through Persistence

本项目采用 write-through 持久化。这里的“实时”不是逐字转录对话，而是： durable event 发生后，AI 必须在下一项实质动作或依赖该结论的回复前更新权威文件。

| 触发事件 | 必须更新 | 完成边界 |
|---|---|---|
| 用户确认决定、改变范围或接受假设 | 当前任务 `prd.md` | 继续规划、研究或执行前 |
| 调研形成可使用结论 | 当前任务 `research/` | 引用或基于结论决策前 |
| 产品当前事实或系统契约被接受 | `docs/product/` 或 `docs/specs/` | 进入后续设计或实现前 |
| 形成重要且有后果的选择 | `docs/decisions/` | 离开该决策阶段前 |
| 发现风险、开放问题或下一动作 | 当前任务对应章节 | 开始长时间操作、切换任务或结束前 |
| `trellis-start` / `trellis-continue` | 对账并修正任务或文档 | 恢复实质工作前 |

恢复对账至少比较：用户当前意图、活动任务、`prd.md`、accepted docs、Git 状态和已生成产物。聊天与文件冲突时，不依赖记忆猜测；先依据用户最新明确决定和可验证仓库状态修正文档。

checkpoint 复用已有权威载体，不创建新的聊天转储、`CONTEXT.md` 或平行日志体系。任务态至少应能回答：已确认决定、未决问题、风险和下一动作。

如果 AI 当前无法写入，应停止依赖未持久化结论继续工作并明确报告。指令和 hooks 能提高可靠性，但不能构成绝对的零故障保证；可检验承诺是“下一项实质动作前落盘，恢复时完成对账”。

## Skill Layering

`.agents/skills/` 中存在两类技能：

1. Trellis 技能负责生命周期、任务、质量和持久化；
2. Matt Pocock 技能负责某个阶段内的思考或执行方法。

使用规则：

* Trellis 的阶段和当前任务始终优先；
* Matt 技能的输出必须写回当前 Trellis 任务或晋升到 `docs/`；
* 不默认运行 `setup-matt-pocock-skills`，因为项目已经使用 Trellis 作为任务系统，并已有自己的 `docs/` 信息架构；
* 不默认创建 `.scratch/`、根目录 `CONTEXT.md`、`docs/adr/` 或平行 issue tracker；
* 当 Matt 技能要求这些载体时，使用下面的映射。

| Matt 技能产物 | 在本项目中的落点 |
|---|---|
| 访谈上下文、范围和开放问题 | 当前 Trellis 任务 `prd.md` |
| 高可信研究 | 当前任务 `research/` |
| Spec | 更新任务 PRD，确认后晋升到 `docs/specs/` |
| Tickets | Trellis 子任务及其阻塞关系 |
| 领域术语 | 按需创建 `docs/product/glossary.md` |
| ADR | `docs/decisions/` |
| 原型结论 | 当前任务研究或 PRD；原型使用独立任务/分支 |
| 评审和调试发现 | 当前任务、测试、spec 或决策记录 |
| Handoff | 当前任务或 `docs/work/` 中的引用式交接文档 |

## Skill Routing

### Requirements And Decisions

* `trellis-brainstorm` 是默认需求收敛流程。
* `grilling`、`grill-me`、`grill-with-docs` 用于用户明确要求压力测试，或普通 brainstorm 无法暴露关键假设时。访谈结论仍写入 Trellis PRD。
* `domain-modeling` 用于术语、边界和 ubiquitous language；重要不可逆选择写入项目 ADR。
* `wayfinder` 只用于单个上下文无法容纳的超大、模糊工作，并把决策地图表现为 Trellis 父子任务。

### Research And Design

* `research` 用于需要高可信一手资料的调研，输出写入当前任务 `research/`。
* `prototype` 用于必须通过可运行状态或视觉结果回答的单一设计问题。
* `codebase-design` 提供 deep module、interface、seam 等设计词汇。
* `improve-codebase-architecture` 只在存在真实代码后用于寻找模块深化机会。

### Planning And Execution

* `to-spec` 映射为整理当前 PRD或公开 spec，不发布第二套 issue。
* `to-tickets` 映射为创建 Trellis 子任务，不写 `.scratch/` tickets。
* `implement` 只能在 Trellis 执行阶段使用。
* `tdd` 用于适合测试先行的垂直切片，实现仍受任务 PRD 和当前 spec 约束。

### Quality And Recovery

* `code-review` 用于相对固定提交、分支或 merge-base 的 Standards + Spec 双轴评审。
* `diagnosing-bugs` 用于困难 bug 或性能回归，先建立会失败的紧反馈环，再修复并补回归测试。
* `trellis-break-loop` 用于修复后提炼为什么反复发生以及如何预防。
* `resolving-merge-conflicts` 只在已经处于 merge/rebase 冲突时使用。

### Support Tools

* `handoff` 用于真正的上下文边界，并引用现有材料而不是复制。
* `triage` 用于外部提交的原始 issue/PR，内部 Trellis 子任务不需要再次 triage。
* `wizard` 用于只有人类能完成的外部控制台、凭证或迁移步骤。
* `to-questionnaire` 用于答案在其他人手中时生成问卷。
* `teach` 用于项目相关的多轮教学。
* `wait-what` 用于重新解释没有传达清楚的上一条消息。
* `ask-matt` 只作为技能选择参考，不改变 Trellis 当前阶段。

## Current No-Code State

当前不得创建前端、后端、数据库、日志、错误处理、状态管理或测试风格规范，因为没有源码、测试或正式技术决策作为证据。

真实代码出现后，应创建新的 Trellis 规范引导任务：

1. 检查包清单、构建脚本、源码和测试；
2. 找到重复出现的真实模式；
3. 按实际 package/layer 创建 `.trellis/spec/`；
4. 每条重要规则引用真实文件、符号或测试；
5. 删除不适用的模板部分，不编写理想化规范。

## Failure And Edge Cases

* 当前任务与新请求不一致：保存当前状态，再由用户确认切换或创建任务。
* 用户在执行中改变目标：回到规划阶段更新 PRD，不把变更悄悄塞进实现。
* 技能要求发布 issue 或新建文档体系：应用本规范的载体映射，不创建平行事实来源。
* 对话可能压缩或切换上下文：不依赖预知压缩时机；每个 durable event 都 write-through，并在 handoff 或切换前再次对账。
* 公开规范与 `.trellis/spec/` 冲突：公开 `docs/` 是项目知识正文；`.trellis/spec/` 只保留执行适配。

## Acceptance Criteria

* [ ] 每项仓库修改都可追溯到活动 Trellis 任务。
* [ ] 每项关键决定、研究或新约定都已持久化。
* [ ] 每个 durable event 都在下一项实质动作前落盘，恢复时完成状态对账。
* [ ] 存在 `.codegraph/` 时，代码定位和理解优先使用 CodeGraph，并在无索引结果时正确回退。
* [ ] Matt 技能没有创建与 Trellis 竞争的任务或文档体系。
* [ ] 实现前读取了相关规范，完成后通过质量门。
* [ ] 工作提交、任务归档和会话日志按顺序完成。
