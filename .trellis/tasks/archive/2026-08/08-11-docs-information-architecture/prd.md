# 设计择途 docs 文档体系

## Goal

为择途建立一套适合开源项目、AI 协作和规范驱动开发的文档信息架构，使产品从原始想法、讨论、方案、决策到可执行规范和阶段交付物都有明确位置、状态和追溯关系。

## What I already know

* 仓库目前基本为空，尚未进入代码结构和技术实现阶段。
* 产品暂定名为“择途 THE TWO”，定位是开源、可信、以求职者为中心的 AI 求职与职业决策平台。
* 当前阶段优先保存产品形成过程，不急于创建代码骨架。
* `docs/` 需要容纳 AI 讨论（包括后续 `grill-me` 记录）、方案、原始需求、截图与原型，以及产品、研发和运维交付物。
* 截图列出的典型交付物包括 MVP 评估、系统需求规格、原型与截图、范围冻结、前后端架构与开发规范、数据模型、权限、集成和部署方案。
* 仓库已启用 Trellis；`.trellis/tasks/` 管理任务过程，`.trellis/spec/` 管理 AI 开发上下文和编码规范。
* 交接文档已经形成产品定义、能力地图、MVP 草案、价值观边界和待决问题，但这些内容尚未成为正式产品规范。

## Assumptions (temporary)

* 项目文档以 Markdown 为主，二进制截图和图表作为附件保存。
* `docs/` 中的内容会随开源仓库公开，因此不应保存敏感信息、密钥或包含个人隐私的原始对话。
* 文档应优先按权威性和生命周期分层，再按产品或工程领域细分。
* AI 对话原文不是规范；只有经整理和确认的结论才能晋升为决策或 spec。

## Open Questions

* 无。

## Requirements

* `docs/README.md` 必须作为文档地图，解释各目录用途和权威等级。
* 顶层目录采用“生命周期优先、领域次级分类”的混合结构。
* AI 讨论以结构化纪要为主，记录背景、关键问题、候选方案、结论、未决事项和原始来源。
* 只有具有长期追溯价值且适合公开的完整对话才保存到 `evidence/ai-transcripts/`；原文不直接构成需求或 spec。
* `docs/` 是产品、架构和工程规范的权威正文；`.trellis/` 是 AI 工作流与执行适配层，不保存另一份完整正文。
* `.trellis/spec/` 只保留 AI 必须直接遵守的精炼约束、项目特定编码规则以及指向 `docs/` 权威文档的链接。
* `.trellis/tasks/` 中的研究和 PRD 属于工作过程；确认后的长期结论应晋升到 `docs/`，而不是复制后双向维护。
* 提交到 `docs/` 的全部内容默认适合公开，不在其中设置“看似私密但仍被 Git 跟踪”的区域。
* 仓库根目录可设置被 Git 忽略的 `private/`，仅保存少量不宜公开的开发期项目材料。
* `private/` 不是产品用户数据目录；未来简历和真实求职数据必须由系统内部的隐私、存储和删除机制管理。
* 目录与文件名使用 ASCII 英文 `kebab-case`，正文默认使用中文，代码标识符和不可翻译术语保留英文。
* 长期有效文档使用稳定的语义名称，不在文件名中添加日期或版本号。
* 讨论纪要和阶段报告使用 `YYYY-MM-DD-topic.md`；决策记录使用四位顺序编号，如 `0001-docs-information-architecture.md`。
* `specs/`、`decisions/` 和 `work/` 中需要治理的文档使用轻量 YAML front matter，至少记录 `title`、`status`、`updated` 和 `related`。
* 必须区分当前有效规范、决策依据、进行中工作和原始证据。
* 每份重要文档应能表达状态，例如 draft、proposed、accepted、superseded、archived。
* 需求、方案、决策、spec 和实现任务之间应能通过相对链接追溯。
* 文档结构应覆盖产品、AI、体验、前端、后端、数据、安全、集成和运维，但第一版只创建实际需要的目录，避免空目录森林。
* 需要明确 `.trellis/` 与 `docs/` 的职责边界和内容晋升流程。
* 第一版采用带治理能力的最小骨架：包含入口索引、当前产品摘要、讨论记录、首条决策记录、证据索引和三种模板。
* 第一版必须在 `docs/README.md` 中定义文档分类、状态、命名、链接、归档和从讨论到 spec 的晋升流程。
* 第一版提供 discussion、decision 和 spec 三种 Markdown 模板。
* 第一版不加入文档站、链接检查器、front matter 校验脚本或 CI 配置。

## Confirmed Direction

采用“生命周期优先、领域次级分类”的混合结构：

```text
docs/
├── README.md
├── product/                # 当前产品上下文：愿景、原则、用户、范围、路线图
├── specs/                  # 已确认、驱动设计与实现的当前契约
│   ├── product/
│   ├── experience/
│   ├── ai/
│   ├── engineering/
│   └── operations/
├── decisions/              # 产品决策记录与技术 ADR
│   ├── product/
│   └── technical/
├── work/                   # 阶段性工作：讨论、提案、评估、里程碑材料
│   ├── discussions/
│   ├── proposals/
│   └── milestones/
├── evidence/               # 原始需求、原型、截图、访谈和外部参考
│   ├── requirements/
│   ├── prototypes/
│   └── references/
└── templates/              # 确认需要后再创建的文档模板
```

该结构的关键不是目录名本身，而是晋升路径：

```text
evidence / discussion
  -> proposal
  -> decision
  -> spec
  -> implementation task
  -> result / retrospective
```

### 第一版实际创建的文件

概念结构中的领域子目录只在出现第一份正文时创建。首批骨架为：

```text
.gitignore                         # 忽略根目录 private/
private/
└── README.md                      # 仅本地存在，不进入 Git

docs/
├── README.md                      # 文档地图、权威边界和治理规则
├── product/
│   └── product-brief.md           # 从现有交接材料提炼的当前产品上下文
├── specs/
│   └── README.md                  # spec 定义、状态和后续领域目录规则
├── decisions/
│   ├── README.md                  # 决策编号和状态规则
│   └── 0001-docs-information-architecture.md
├── work/
│   ├── README.md                  # 讨论、提案、报告与里程碑的用途
│   └── discussions/
│       ├── 2026-08-11-product-direction-handoff.md
│       └── 2026-08-11-docs-information-architecture.md
├── evidence/
│   ├── README.md                  # 证据不直接构成需求
│   └── references/
│       └── 2026-08-11-document-deliverables.png
└── templates/
    ├── discussion.md
    ├── decision.md
    └── spec.md
```

截图中的前后端架构、开发规范、数据模型、权限、集成和部署文档暂不创建空文件；等相关工作开始时，再按 `docs/specs/` 的规则建立对应领域目录。

## Decisions (ADR-lite)

### D1：顶层目录组织方式

**Context**：按产品、研发、运维等交付职能分类虽然直观，但无法直接表达文档是原始材料、讨论稿、已批准决策还是当前有效规范。纯生命周期分类又会增加按领域查找资料的成本。

**Decision**：`docs/` 顶层按文档的权威性和生命周期分为 `product/`、`specs/`、`decisions/`、`work/`、`evidence/` 和按需创建的 `templates/`；各目录内部再按产品、体验、AI、工程、运维等领域细分。

**Consequences**：每份材料能够清楚表达其可信程度和用途，但项目需要维护文档状态、交叉链接以及从讨论到 spec 的晋升规则。

### D2：AI 讨论保存粒度

**Context**：完整保存每次 AI 对话能够提供最大追溯性，但会产生大量噪声、重复内容和隐私风险；只保存最终结论则会丢失候选方案和决策推理。

**Decision**：默认在 `work/discussions/` 保存结构化纪要。仅当完整原文具有长期证据价值、内容适合公开且已移除敏感信息时，才保存到 `evidence/ai-transcripts/`，并由纪要链接过去。

**Consequences**：主要文档保持可读和可检索，同时保留按需审计的能力；整理讨论时需要人工或 AI 进行一次提炼，而不能直接倾倒聊天记录。

### D3：`docs/` 与 `.trellis/` 的权威边界

**Context**：截图中的前后端架构和开发规范既需要项目成员阅读，也需要 AI 在执行任务时遵守。如果在 `docs/specs/` 与 `.trellis/spec/` 各保存一份完整正文，就会形成双写和规则漂移；如果只放在 `.trellis/`，项目知识又会依赖特定工具。

**Decision**：`docs/` 保存面向项目和社区的权威正文，包括产品需求、系统架构、工程约定和运维规范。`.trellis/` 只负责 AI 工作流状态、任务上下文、精炼执行约束和对权威正文的引用。

**Consequences**：项目文档不依赖 Trellis，普通贡献者可以直接阅读；AI 侧仍可获得紧凑的执行规则。任何内容发生冲突时以 `docs/` 权威正文为准，但仅服务于 Trellis 运行机制的规则仍由 `.trellis/` 自身管理。

### D4：公开文档与私密材料边界

**Context**：项目最终会开源，但开发过程中仍可能出现不适合公开的讨论附件或临时材料。另一方面，择途未来处理的简历和求职数据属于产品运行数据，不能混入项目文档目录。

**Decision**：所有提交到 `docs/` 的内容默认可公开。少量开发期私密项目材料可存放在仓库根目录、由 Git 忽略的 `private/` 中。`private/` 不承担任何产品运行数据存储职责。

**Consequences**：公开边界简单清楚，降低误提交敏感信息的风险；私密材料无法通过 Git 在不同环境间同步，需要使用者自行备份。未来产品数据的安全边界需在独立的系统设计中定义。

### D5：文件命名、语言与元数据

**Context**：中文路径阅读直观，但会增加命令行、链接和跨平台工具的处理成本；所有文件统一编号或日期又会使长期规范的链接不稳定。文档同时需要服务中文贡献者、AI 和未来可能采用的文档工具。

**Decision**：路径使用英文 `kebab-case`，正文默认中文。长期规范使用语义文件名，讨论与阶段报告使用日期前缀，决策记录使用四位顺序编号。需要生命周期治理的 Markdown 使用轻量 YAML front matter。

**Consequences**：路径稳定且适合自动化，中文正文保持项目受众友好；不同文档类型存在不同命名规则，因此必须在 `docs/README.md` 中提供简短速查表。

### D6：第一版落地范围

**Context**：只创建目录和入口文件无法约束后续 AI 讨论与 spec 的格式；此时加入自动校验和 CI 又会过早引入工具与维护成本。

**Decision**：第一版创建带治理能力的最小骨架，包括文档地图、状态与晋升规则、discussion / decision / spec 模板、当前产品摘要、两份讨论纪要、首条文档架构决策记录和现有截图证据。暂不加入自动化检查。

**Consequences**：项目从第一天就有一致的记录方式，并为未来扩展保留接口；格式遵循暂时依靠贡献者和 AI 自觉，等文档规模增长后再评估自动校验。

## Acceptance Criteria

* [x] 顶层目录原则和命名得到用户确认。
* [x] AI 讨论的纪要与原文保存规则得到用户确认。
* [x] `docs/` 与 `.trellis/` 的单一事实来源边界得到用户确认。
* [x] 公开文档与开发期私密材料的边界得到用户确认。
* [x] 文件命名、正文语言、编号和元数据规则得到用户确认。
* [x] 第一版采用带模板、晋升流程和治理规则的最小骨架。
* [x] 交接文档与截图中的每类材料都有唯一、可解释的归属。
* [x] 明确当前真相、历史记录和原始证据之间的区别。
* [x] 定义文档状态、命名、链接、归档和变更规则。
* [x] 给出首批需要创建或迁移的最小文件清单。
* [x] 最终目录没有为遥远未来预建大量空文件夹。

## Definition of Done

* 用户确认完整文档信息架构和治理规则。
* 在确认后创建最小 `docs/` 骨架和入口索引。
* 将本次产品交接材料迁移或整理到约定位置，并保留来源信息。
* 不创建业务代码或提前决定代码目录结构。

## Out of Scope

* 前后端技术选型与代码架构。
* 具体功能实现。
* 最终 MVP 产品范围收敛。
* 完整撰写截图中列出的所有交付文档。
* 建立公开文档网站或选择文档站生成器。
* 设计产品运行时的用户数据存储、加密和删除机制。
* 编写文档链接、YAML 元数据或状态流转的自动校验脚本和 CI。

## Implementation Summary

1. [x] 创建 `.gitignore` 中的 `/private/` 规则、本地 `private/README.md`，以及首批 `docs/` 目录与索引文件。
2. [x] 将现有产品交接材料整理为当前 `product-brief.md` 和可追溯的历史讨论纪要，复制截图证据并记录来源。
3. [x] 创建文档架构 ADR 与 discussion、decision、spec 模板，补齐相互链接。
4. [x] 检查目录树、Markdown 链接、元数据和公开边界；未运行或引入代码级构建工具。

## Verification

* [x] 首批文件清单全部存在，`docs/` 下没有空目录。
* [x] 所有本地 Markdown 链接均可解析。
* [x] 受治理文档包含约定的 front matter 字段。
* [x] `docs/` 内的目录和文件路径均为 ASCII。
* [x] `private/README.md` 被 `/private/` 规则正确忽略。
* [x] 截图副本与用户提供的原文件 SHA-256 一致，并已完成视觉检查。
* [x] Markdown 尾随空格检查通过。
* [x] `.trellis/spec/` 更新评估完成：本次没有产生代码级可执行契约，不复制 `docs/` 正文。
* [x] 仓库尚无代码项目和 lint、类型检查、测试配置，因此没有可运行的代码质量命令。

## Research References

* [`research/docs-ia-patterns.md`](research/docs-ia-patterns.md) - 对比 Diataxis、ADR 和 Trellis 的分层方式，推荐生命周期与领域结合。

## Technical Notes

* 产品交接来源：`C:\Users\12946\AppData\Local\Temp\the-two-product-handoff-2026-08-11.md`。
* 截图来源：`C:\Users\12946\AppData\Local\Temp\codex-clipboard-348ec664-f84e-422b-86f4-073d19f66a1b.png`。
* 当前仓库没有 `docs/`，也没有 `.codegraph/` 索引。
* 当前任务路径：`.trellis/tasks/08-11-docs-information-architecture/`。
