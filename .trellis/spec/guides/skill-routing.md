# Skill Routing

权威正文：[`docs/specs/development-process.md`](../../../docs/specs/development-process.md)。

## Invariant

Trellis 决定任务、阶段、质量门和持久化位置；`.agents/skills/` 中的其他技能只提供当前阶段内的方法。

## Routing

| 需要 | 方法 | 持久化位置 |
|---|---|---|
| 需求收敛 | `trellis-brainstorm`，必要时叠加 `grilling` | 当前任务 `prd.md` |
| 高可信调研 | `research` | 当前任务 `research/` |
| 单一可运行设计问题 | `prototype` | 独立任务/分支，结论回写原任务 |
| 领域语言 | `domain-modeling` | `docs/product/glossary.md` 或 ADR |
| 拆分执行单元 | `to-tickets` 方法 | Trellis 子任务 |
| 实现与测试先行 | `implement` / `tdd` | Trellis 执行阶段 |
| 固定点评审 | `code-review` | 当前任务发现与修复 |
| 困难 bug | `diagnosing-bugs` | debug 任务、回归测试、spec |
| 超大决策地图 | `wayfinder` | Trellis 父子任务及阻塞关系 |
| 上下文边界 | `handoff` | 当前任务或 `docs/work/` |

## Guardrails

* 不默认运行 `setup-matt-pocock-skills`。
* 不默认创建 `.scratch/`、根目录 `CONTEXT.md`、`docs/adr/` 或平行 issue tracker。
* `to-spec` 更新 Trellis PRD 或 `docs/specs/`。
* `to-tickets` 创建 Trellis 子任务。
* 技能要求的载体与本项目冲突时，保留方法并使用 Trellis/docs 映射。

完成标准：技能产物已回写当前 Trellis 任务或晋升到 `docs/`，没有平行事实来源。
