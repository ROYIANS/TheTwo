# 文档信息架构模式调研

## 调研目标

为择途设计一个适合开源协作、AI 辅助开发和长期演进的 `docs/` 目录，重点解决以下问题：

* 当前有效的规范与历史讨论如何隔离；
* 需求、方案、决策、交付物和原始证据如何关联；
* `docs/` 与 `.trellis/` 如何避免成为两套互相冲突的事实来源。

## 参考模式

### Diataxis：按读者需求区分文档类型

来源：<https://diataxis.fr/>

Diataxis 将技术文档分为教程、操作指南、参考资料和解释材料。它的重要启发不是照搬四个目录，而是：不同目的的文档不应混写。面向执行的规范、用于理解背景的说明、记录探索过程的讨论稿，需要有清楚边界。

### MADR / ADR：一个决策一条记录

来源：<https://adr.github.io/madr/>

ADR 用状态、上下文、候选方案、最终选择和后果记录重要决策。它适合回答“为什么这样做”，但不适合替代描述“现在系统必须怎样工作”的规范。被替代的 ADR 仍保留，当前规范则更新到最新状态。

### Trellis：工作流状态与长期规范分离

来源：本仓库 `.trellis/workflow.md`、`.trellis/tasks/`、`.trellis/spec/`。

Trellis 已经区分任务、研究、执行上下文和编码规范。它说明临时工作材料与长期知识需要不同生命周期，但也带来一个约束：如果 `docs/` 再保存一份同内容的 PRD 或编码规范，必须明确谁是权威来源，否则会出现双写和漂移。

## 可选方案

### 方案 A：按交付职能分类

示例：`product/`、`engineering/`、`operations/`、`ai/`。

优点：直观，接近截图中的“产品输出 / 研发输出 / 运维输出”。

缺点：原始需求、讨论稿、已批准规范和过期方案容易混在同一目录；随着跨领域功能增加，归属会变得模糊。

### 方案 B：按文档生命周期分类

示例：`inputs/`、`proposals/`、`specs/`、`decisions/`、`archive/`。

优点：文档权威性最清楚，适合规范驱动开发和审计。

缺点：查找某个领域的全部资料时需要跨多个目录；对刚进入项目的人不够直观。

### 方案 C：生命周期优先、领域次级分类

示例：先分 `product/`、`specs/`、`decisions/`、`work/`、`evidence/`，再在内部按产品、AI、前端、后端、数据、运维分类。

优点：同时回答“这份文档有多权威”和“它属于哪个领域”；能容纳截图中的交付物，也能保存 AI 讨论和原始截图。

缺点：需要一个简短但严格的文档治理规则，并在文档晋升时维护链接。

## 初步建议

采用方案 C，并明确四种语义：

1. `specs/` 描述当前必须成立的事实和契约；
2. `decisions/` 解释重要选择及其代价；
3. `work/` 保存尚在推进的讨论、方案和阶段报告；
4. `evidence/` 保存原始需求、截图、访谈和外部参考，不直接构成需求。

产品愿景、原则、目标用户和路线图不完全属于实现规范，单独放入 `product/` 作为稳定的产品上下文。

`.trellis/` 建议继续承担 AI 工作流状态、任务上下文和执行约束；`docs/` 承担可供项目成员和开源社区阅读的项目知识。两者需要通过引用连接，而不是长期复制同一正文。

## 截图文档映射示例

| 截图中的文档 | 建议位置 |
|---|---|
| MVP 评估报告 | `docs/work/milestones/mvp/mvp-evaluation.md` |
| 系统需求规格说明书 | `docs/specs/product/system-requirements.md` |
| 原型地址和截图 | `docs/evidence/prototypes/` |
| 需求与范围冻结 | `docs/decisions/product/` 或对应里程碑基线 |
| 前端 / 后端架构设计 | `docs/specs/engineering/architecture/` |
| 前端 / 后端开发规范 | `docs/specs/engineering/frontend/`、`backend/` |
| 数据模型与 ERD | `docs/specs/engineering/data/` |
| 权限与服务集成规范 | `docs/specs/engineering/security/`、`integrations/` |
| 部署方案 | `docs/specs/operations/deployment.md` |

最终路径仍需在顶层分类方案和 `docs/` 与 `.trellis/` 的权威边界确认后冻结。
