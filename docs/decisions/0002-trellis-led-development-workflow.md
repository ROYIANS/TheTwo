---
title: 采用 Trellis 主导的 AI 开发工作流
type: decision
status: accepted
id: ADR-0002
created: 2026-08-11
updated: 2026-08-11
related:
  - ../specs/development-process.md
  - ../work/discussions/2026-08-11-agent-workflow-and-skills.md
---

# ADR-0002：采用 Trellis 主导的 AI 开发工作流

## Context

仓库已经使用 Trellis 管理任务、PRD、研究、执行阶段、spec、归档和会话日志，同时安装了来自 `mattpocock/skills` 的访谈、研究、spec、tickets、实现、TDD、评审和调试技能。

Matt 技能的默认主流程会配置 issue tracker、`.scratch/` tickets、根目录 `CONTEXT.md` 和自己的 ADR 布局。如果完整照搬，就会与 Trellis 和现有 `docs/` 形成两套状态机与事实来源。

当前仓库没有业务代码，因此初始化生成的前端和后端规范没有事实依据。

## Decision

1. Trellis 是所有项目工作的外层状态机，负责任务从规划到归档的完整生命周期。
2. 所有会改变仓库、产品方向或长期知识的工作都必须归属活动 Trellis 任务。
3. 项目会话保持工作聚焦，与项目无关的闲聊被简短重定向；合理的产品与技术讨论不受影响。
4. Matt Pocock 技能作为 Trellis 阶段内的方法按需使用，其产物映射回 Trellis 任务和现有 `docs/`。
5. 不默认运行 `setup-matt-pocock-skills`，也不创建 `.scratch/`、根目录 `CONTEXT.md` 或第二套 ADR/issue 体系。
6. 研究、决策、新规范和会话结果必须持久化，不能只保留在聊天上下文。
7. 删除无代码证据的前后端占位规范；真实代码出现后再基于源码和测试建立 layer spec。
8. 持久化采用 write-through：用户决定、范围变化、研究结论、风险和下一动作在下一项实质工作前写入权威载体；开始、恢复、切换和结束时进行状态对账。
9. 仓库存在 `.codegraph/` 时，代码定位和理解优先使用 CodeGraph；无索引结果或目标是文档、配置时回退到文本和文件检索。

## Consequences

正面影响：

* 每项工作都有统一状态、范围、验收和日志；
* Matt 技能仍可提供专业方法，但不会造成任务和文档分裂；
* 项目知识在上下文压缩、会话切换和不同 AI 工具之间保持连续；
* 关键事实不再依赖 AI 预知上下文压缩时机，恢复时可以依据文件和 Git 状态校验；
* CodeGraph 减少无目标的源码遍历和重复上下文消耗；
* 当前规范只描述真实存在的过程，不会误导未来实现。

代价与风险：

* 使用部分 Matt 技能时需要把默认产物映射到 Trellis，而不是逐字执行其 issue tracker 假设；
* AI 必须在阶段边界主动落盘，增加少量文档维护成本；
* write-through 会增加写入频率，CodeGraph 无索引结果时仍需可靠回退；
* 代码规范要等真实实现出现后再补充，早期不会提供框架级指导。

## Alternatives Considered

### 以 Matt Pocock 主流程替代 Trellis

会丢失现有任务、归档、会话日志和 spec 更新机制，并引入新的 issue tracker，未采用。

### 两套流程并行

同一范围会出现 Trellis task、issue、`.scratch/` ticket 和多套 ADR，维护成本与漂移风险过高，未采用。

### 保留空白前后端规范等待未来填写

未来 AI 可能把占位模板误认为项目约定；规范应描述现实而不是愿望，因此未采用。
