---
title: AI 工作流与技能协作讨论
type: discussion
status: closed
created: 2026-08-11
updated: 2026-08-11
related:
  - ../../specs/development-process.md
  - ../../decisions/0002-trellis-led-development-workflow.md
---

# AI 工作流与技能协作讨论

## 背景

项目开始 `00-bootstrap-guidelines` 时尚无业务代码，因此无法填写初始化模板中的前端、后端、数据库、日志和测试规范。当前已经真实存在的是文档治理、Trellis 任务过程和一组安装在 `.agents/skills/` 中的协作技能。

用户希望 AI 保持项目聚焦，始终由 Trellis 主导开发，并灵活使用 Matt Pocock 的技能。

## 技能盘点结论

Trellis 技能负责：

* 会话进入与恢复；
* 任务创建、PRD 和需求收敛；
* 实现前规范加载；
* 质量检查、调试复盘和 spec 更新；
* 提交、归档和会话日志。

Matt Pocock 技能主要提供：

* 压力访谈和领域建模；
* 高可信研究和可运行原型；
* spec、tickets、实现和 TDD 方法；
* 双轴代码评审、困难 bug 诊断和架构深化；
* triage、wayfinding、handoff、wizard 和教学等专用流程。

## 发现的冲突

Matt 技能默认假设已经配置独立 issue tracker、triage 标签、根目录 `CONTEXT.md`、`docs/adr/` 和 `.scratch/` tickets。这些载体与 Trellis task/PRD/research 及项目现有 `docs/decisions/` 重叠。

`implement` 还会自行驱动 TDD、代码评审和提交；如果不受 Trellis 阶段约束，可能绕过 `trellis-before-dev`、`trellis-check` 和统一归档日志。

## 已确认结论

1. Trellis 永远是外层工作流和状态来源；
2. Matt 技能只作为当前 Trellis 阶段内的方法；
3. `to-spec` 更新 Trellis PRD 或公开 spec；
4. `to-tickets` 创建 Trellis 子任务；
5. `research` 写入活动任务 `research/`；
6. `domain-modeling` 的术语和 ADR 写入项目 `docs/`；
7. `setup-matt-pocock-skills` 不默认运行；
8. 与项目无关的闲聊被重定向，但正当的项目讨论不被拒绝；
9. 无代码证据时删除前后端占位规范，等真实代码出现后重新 bootstrap。

## 后续补充：持久化与代码检索

用户进一步确认：不能把长对话中的知识连续性只交给模型记忆或收尾日志。

因此补充两项约束：

1. 采用 write-through 持久化。用户决定、范围变化、研究结论、风险和下一动作在下一项实质工作前写入当前任务或公开文档；恢复、切换和结束时对账。
2. 仓库存在 `.codegraph/` 时，定位和理解代码先使用 `codegraph explore` / `codegraph node`，减少无目标遍历；没有索引结果或目标是文档、配置时再回退到 `rg` 和直接读取。

该约束提供可检查的高可靠过程，但不声称模型、hooks 或运行环境能够形成绝对零故障的“实时”保证。

## 晋升结果

* 当前规范：[`development-process.md`](../../specs/development-process.md)
* 决策记录：[`ADR-0002`](../../decisions/0002-trellis-led-development-workflow.md)
