# Research: Palantir Ontology 对个人职业决策产品的启发

- Query: Palantir Foundry 的 Ontology 与 object-centric operating model 能让一个个人 AI 职业决策产品学到什么，如何避免传统 menu/header/sidebar UI，形成独特且连贯的对象驱动系统？
- Scope: mixed（Palantir 官方一手资料 + 当前原型/产品文档）
- Date: 2026-08-13

## Executive Summary

Foundry 最值得借鉴的不是深色控制台、地图、指挥中心或企业权限墙，而是一个更底层的产品判断：**把用户真正要理解和改变的现实对象作为系统入口，把关系、证据、逻辑、动作和决定放回同一上下文**。在这种模型里，页面不是“某个模块的首页”，而是当前对象的一个可配置工作视图；导航不是长期菜单，而是对象之间的链接、待办动作和返回路径。

对个人职业决策产品，这意味着：

1. 将“机会、职业事实、证据、面试、Offer、用户决定”建模为可持续的领域对象，而不是散落在资料库、研究页、申请页等模块中的记录。
2. 将“确认事实、补充证据、质疑建议、生成沟通草稿、记录面试、保存决定”建模为有明确输入、影响范围和审核边界的动作。
3. 将每条建议拆成数据（事实/证据）、逻辑（匹配与取舍推理）、动作（下一步）和决定（用户最终选择），保留当时快照与后续结果，不以新信息改写历史判断。
4. 用“今天的一个主任务 + 当前对象 + 相关对象/证据 + 一个下一动作”组织无壳工作台；深入时沿对象链接进入局部视图，始终能回到今天，不需要固定 header、左栏或持久模块菜单。
5. AI 是对象上下文中的可追问协作者，必须显示它看见了哪些对象、使用了哪些证据、正在执行哪一步，以及它提出的动作是否需要用户确认；它不是一个脱离上下文的通用聊天页。

这是一种可迁移的**对象驱动产品原则**，不是把企业运营系统缩小后照搬到个人身上。个人职业场景应明确拒绝 Foundry 语境中的组织监控、实时指挥、跨主体追踪、复杂角色治理和大屏仪表盘审美。

## 1. Palantir 官方材料中的可验证事实

### 1.1 Ontology 是连接数据与现实对象的 operational layer

Palantir 官方将 Ontology 描述为组织的 operational layer：它位于 datasets、virtual tables、models 等数字资产之上，并把它们连接到现实世界的实体或事件；语义元素包括 objects、properties、links，动态/kinetic 元素包括 actions、functions 和 dynamic security。官方还明确说它在很多场景中充当组织的 digital twin。

来源：[Ontology building / Overview](https://www.palantir.com/docs/foundry/ontology/overview)（页面标题为 “Ontology building”）。

**可转译含义：** 产品的核心数据不应停留在“职位文本”“一条简历”“一次聊天”这些输入层。需要有一个比输入更稳定的对象层，将材料映射为用户可以持续查看、修正、关联和行动的现实对象。

### 1.2 Object、property、link 是现实语义的基本单位

官方定义：object type 是现实实体或事件的 schema；object 是单个实体/事件实例；object set 是一组实例。link type 是两个 object type 之间关系的 schema；link 是具体对象之间的一次关系，且关系可双向遍历。Ontology 的核心概念页还给出 dataset 到 Ontology 的类比：dataset → object type、row → object、column → property、join → link type。

来源：[Object types](https://www.palantir.com/docs/foundry/object-link-types/object-types-overview/)、[Link types](https://www.palantir.com/docs/foundry/object-link-types/link-types-overview/)、[Core concepts](https://www.palantir.com/docs/foundry/ontology/core-concepts/)。

**可转译含义：** “林舟的职业事实”不是一张 profile 表；“澄屿科技资深前端岗位”也不是一条 CRM 卡片。它们应当有属性、来源、时间、状态和与其他对象的链接，使用户可以从任一对象回到相关上下文。

### 1.3 Action 把“改变现实”的意图封装成一次受控事务

官方定义 action type 是一组可一次性应用于一个或多个对象、属性和链接的变更定义，也包含提交后的副作用；用户以整体目标思考，而不是编辑具体字段。Action 可以修改对象属性、创建/删除链接，加入参数、规则、通知等副作用，并用 submission criteria 编码提交条件和治理要求。官方还说明 action log 会把所有 action submissions 建模为可分析的对象。

来源：[Action types](https://www.palantir.com/docs/foundry/action-types/overview/)、[Rules](https://www.palantir.com/docs/foundry/action-types/rules/)、[Submission criteria](https://www.palantir.com/docs/foundry/action-types/submission-criteria/)、[Action log](https://www.palantir.com/docs/foundry/action-types/action-log/)。

**可转译含义：** 原型中的按钮不应只是“改变某个 React state”。每个关键按钮都应表达一个用户能理解的领域动作，显示将改变什么、依据什么、是否需要审核、是否会触发后续阶段。原型可以只在内存中模拟，但交互语义要接近真实动作记录。

### 1.4 Foundry 将决策拆成 data、logic、action、security

“Why create an Ontology?” 官方页明确提出：Ontology 表示的是 enterprise 的 decisions，而不只是 data；每个 operational decision 由 Data、Logic、Action、Security 四部分组成。Data 不仅包含外部数据，也包含用户和 agent 在决策时产生的 decision data，例如当时评估的选项、下游影响和决策上下文。官方还强调 decision lineage：可以追溯决定是在什么数据版本、何时、通过哪个应用做出的。

来源：[Why create an Ontology?](https://www.palantir.com/docs/foundry/ontology/why-ontology/)。

**可转译含义：** 个人产品不需要企业级 security 模型，但必须保留“决定发生的上下文”：当时哪些职业事实被确认、哪些证据被使用、哪些未知项存在、AI 给了什么建议、用户为何申请/暂缓/放弃、后来发生了什么。

### 1.5 Object View 是围绕单个对象的中心工作站

官方把 Object Views 定义为可复用的对象表示，作为某个对象的 central hub，包含属性、对象链接、相关指标、分析、dashboard 和应用。标准 Object View 自动反映 object type 的配置；configured Object View 可为具体工作流提供定制体验；两者都支持 full 和 panel 两种形态。标准视图还支持在当前视图内分组浏览 linked objects、内联预览并打开关联对象。

来源：[Ontology-aware applications](https://www.palantir.com/docs/foundry/ontology/applications/)、[Object Views](https://www.palantir.com/docs/foundry/object-views/overview/)、[Standard Object Views](https://www.palantir.com/docs/foundry/object-views/standard-object-views/)。

**可转译含义：** “机会研究台”可以被重新理解为“机会对象视图”：顶部先给对象身份、当前判断与下一动作，中部显示链接对象（职业事实、证据、沟通、面试、Offer），下部显示可执行动作与历史决定。不同阶段只切换视图的焦点，不把用户送进互不相干的模块页面。

### 1.6 Object-aware applications 既支持探索，也支持工作流

官方将 object-aware applications 分为 Object Views、Object Explorer、Quiver、Workshop、Slate、Carbon 等，并区分 Discovery、Analysis、Dashboards、Applications 四类用途；工作流风格又分 exploratory 与 workflow-specific；配置模型则有 walk-up usable 与 customizable。Object Explorer 通过搜索、过滤、Search Arounds 和对象集探索；Workshop/Slate 则为特定用户组和问题提供工作流应用。

来源：[Ontology-aware applications](https://www.palantir.com/docs/foundry/ontology/applications/)。

**可转译含义：** 本产品不应在“万能图谱”与“僵硬步骤向导”之间二选一。默认入口可以是 walk-up 的“今天”与当前对象；需要深研时允许用户沿证据/关系探索；关键外部行动仍使用有边界的 workflow-specific 动作。

### 1.7 AI/Agent 必须接入对象上下文和可见动作

Palantir AIP 官方页称 AIP 将 AI 与数据和运营连接起来；AIP Chatbots 可以使用 custom content sources、Ontology context 和 functions；AIP Assist 还可以在对话后建议导航或应用内动作。AIP Logic 的官方说明支持把 Ontology edits 自动应用或 staged for human review。AIP Evals 用测试用例、评估函数、指标和多次运行比较来应对 LLM 非确定性；AIP Observability 提供 metrics、execution history、distributed tracing、logs 和 token/prompt 等执行细节。

来源：[AIP overview](https://www.palantir.com/docs/foundry/aip/overview/)、[Deploy AIP Chatbots to AIP Assist](https://www.palantir.com/docs/foundry/assist/agents-in-aip-assist/)、[Suggested actions in AIP Assist](https://www.palantir.com/docs/foundry/assist/aip-assist-suggested-actions/)、[AIP Logic integration with Automate](https://www.palantir.com/docs/foundry/logic/aip-logic-integration-automate/)、[AIP Evals](https://www.palantir.com/docs/foundry/aip-evals/overview/)、[AIP observability](https://www.palantir.com/docs/foundry/aip-observability/overview/)。

**可转译含义：** 原型需要让 Agent 的“看见什么、做了什么、建议什么、是否待审核”成为对象视图中的一等信息，而不是只在聊天气泡里回一句总结。生产技术栈仍未决定，因此这里应先定义交互契约，不预设具体模型、编排框架或数据库。

## 2. 可迁移到个人职业产品的原则

### 原则 A：对象优先于模块

传统后台先问“你要去哪个模块”；对象驱动系统先问“你现在面对哪个现实对象”。本产品的首个对象入口可以是：

* **今天（Today context）**：不是一个模块，而是当前用户、当前机会、待决定事项和最近变化的临时聚合上下文。
* **机会（Opportunity）**：特定公司、职位、原始材料、来源和当前职业方向组成的研究对象。
* **职业事实（Career fact）**：用户经历、能力、目标、限制或偏好中的一条当前有效事实。
* **证据（Evidence）**：支持、反驳或限制某个判断的来源材料片段，带来源、时间、强度和冲突状态。
* **沟通/面试/Offer/结果（Event objects）**：机会生命周期中发生的事件或外部现实记录。
* **建议（Advisory conclusion）与决定（User decision）**：同一机会在某个时间点的判断快照，前者由系统形成，后者由用户选择。

对象应有稳定身份；标题、状态、当前阶段等属性可以变化，但不能因为页面阶段改变就创建互相断裂的记录。

### 原则 B：关系比菜单更能表达产品结构

建议建立以下链接（名称只是原型语言，最终数据结构保持开放）：

| 起点对象 | 关系 | 终点对象 | 用户价值 |
| --- | --- | --- | --- |
| 机会 | `以…为依据` | 职业事实 | 说明匹配/硬约束来自哪里 |
| 机会 | `有…证据` | 证据 | 从结论回看来源与冲突 |
| 证据 | `支持/限制/反驳` | 建议 | 避免“证据列表”和结论脱节 |
| 建议 | `关于` | 机会 + 决策标准 | 解释建议适用语境 |
| 建议 | `被用户决定为` | 用户决定 | 分离 AI 建议与人类选择 |
| 机会 | `产生` | 沟通、申请、面试、Offer、结果 | 延续完整求职生命周期 |
| 面试 | `验证` | 未知项/职业事实 | 让面试成为证据采集而非孤立日历事件 |
| 结果 | `反馈给` | 职业事实/策略 | 支持后续复盘和画像修正 |
| Agent 任务 | `读取/建议/等待确认` | 对象集合或动作 | 让 AI 过程可见、可质疑 |

关系应在对象视图中按当前任务显现，而不要求用户打开全局“关系图”。只有当关系本身帮助下一步判断时才显示；不要为了模仿图谱而把所有边画成网络。

### 原则 C：动作是动词，且必须说明影响

原型可以把关键交互表达为下列领域动作：

| 动作 | 输入 | 预期影响 | 审核边界 |
| --- | --- | --- | --- |
| `确认职业事实` | AI 推断 + 用户确认/修正 | 将推断转为当前有效事实，并记录来源/时间 | 必须用户确认 |
| `否定推断` | 推断对象 | 标记为 rejected，阻止进入下游判断 | 必须用户确认；不得静默复活 |
| `带入机会` | 原始职位材料 + 公司名 + 来源元数据 | 创建机会对象并保留原始材料 | 解析可自动；创建前给用户预览 |
| `启动研究` | 机会 + 当前职业上下文 | 创建 Agent 任务，逐步产生证据、未知和建议草稿 | 原型展示步骤；不伪装真实联网完成 |
| `补充/质疑判断` | 用户问题、事实或反例 | 新增用户输入，刷新建议解释但保留旧快照 | 用户确认后才进入当前判断 |
| `生成沟通草稿` | 机会 + 已确认事实 + 待确认问题 | 生成可编辑草稿 | 仅草稿；不得自动发送 |
| `记录外部事件` | 沟通/申请/面试/Offer/结果内容 | 追加事件对象并链接回机会 | 用户主动记录 |
| `作出用户决定` | 建议快照 + 用户选择 + 可选理由 | 保存申请/暂缓/放弃及当时上下文 | 必须明确这是用户决定，不覆盖建议 |
| `回写复盘` | 结果 + 用户解释 | 生成待确认的事实/策略更新 | AI 只能提出，用户确认后生效 |

每个动作反馈至少显示：动作名称、影响的对象、是否已完成、下一步和可撤回/更正入口。对于原型，可用 toast 加局部状态；长期模型需要 action log 或等价事件记录。

### 原则 D：把决策呈现为“数据—逻辑—行动—决定”链

机会判断不应是一个总分或颜色标签，而应显示一条可读链：

```text
已确认职业事实 + 当前目标/硬约束 + 外部证据
        ↓（匹配、冲突、机会成本、未知项的推理）
系统建议：谨慎投入
        ↓（下一动作：向招聘方确认工作方式）
用户决定：申请 / 暂缓 / 放弃
        ↓（后续沟通、面试、Offer、结果）
复盘：哪些假设被验证，哪些事实需要修正
```

这条链要允许反向追溯：点击“谨慎投入”可以看到影响最大的两条证据、涉及的三条职业事实、仍未解决的未知项、以及哪条新信息会改变结论。点击“申请”可以看到该决定所依据的建议快照，而不是被后续信息覆盖后的新结论。

### 原则 E：证据是对象的一部分，不是脚注

证据对象应至少包含 `source`、`capturedAt`、`strength`、`tone`、`excerpt`、`impact` 和与结论的关系。可将当前原型的 `EvidenceItem`（[prototype/src/model.ts:21-31](../../../../prototype/src/model.ts#L21-L31)）视为最小字段起点；`demoEvidence` 已经区分一手来源、二手来源、弱信号及支持/风险/冲突语气（[prototype/src/demo-data.ts:48-93](../../../../prototype/src/demo-data.ts#L48-L93)）。

实现含义：

* 证据列表只做发现；关键结论旁边要有“依据”链接或内联展开。
* 冲突证据不被平均成一个分数，应显式告诉用户“哪两条来源冲突、目前不能确认什么”。
* 弱信号只能转成待确认问题，不能升级为事实。
* 来源失效时保留支持判断所需的最小快照，遵守隐私、版权和服务条款。
* AI 读取证据时记录读取范围和时间；展示“本次分析使用了哪些材料”，避免无来源的综合句。

### 原则 F：把用户决定当成一等对象，并与建议分离

Foundry 强调 decision data 和 decision lineage；在本产品中，`系统建议` 与 `用户决定` 必须有不同身份、状态和时间。用户可以选择与建议不同的结果；新证据只能产生新的建议版本，不得改写旧决定的历史语境。

最小决定快照建议包含：`opportunityId`、`careerContextVersion`、`evidenceSnapshotIds`、`advisoryId`、`choice`、`reason`、`createdAt`、`nextReviewAt`。原型未必实现持久化，但应在 UI 中模拟“已记录决定，建议仍保留；之后可在结果复盘中回看”。当前原型已具备这一语言基础（[prototype/src/App.tsx:97-101](../../../../prototype/src/App.tsx#L97-L101)、[prototype/src/App.tsx:178-179](../../../../prototype/src/App.tsx#L178-L179)）。

## 3. 适合无固定菜单的对象驱动 UI

### 3.1 “今天”不是 Dashboard，也不是隐藏的模块菜单

可以借鉴 Object View 的“对象中心”思想，但将中心对象从企业资产改为**当前生活中的一个待决定事项**。今天视图只回答四个问题：

1. 你是谁、现在面对哪一个机会/事件？
2. 哪一个事实、证据或未知最影响判断？
3. AI 正在处理什么，已经得到什么，仍缺什么？
4. 你下一步可以做的唯一高价值动作是什么？

当前原型的 TodayView 已有“现在最值得做”、旅程、最近发生、AI 研究面板和职业事实入口（[prototype/src/App.tsx:140-141](../../../../prototype/src/App.tsx#L140-L141)）。下一步应把这些区域从“多个模块入口”进一步收敛为对象关系：主任务直接指向某个未知项/证据；旅程条点击后定位到机会对象的对应阶段；最近发生的事件打开其来源或动作结果。

### 3.2 深层页采用“局部对象视图”，只保留回到今天

机会页应是全生命周期的对象视图，而不是“研究台模块”；职业页应是职业事实对象集的视图；面试页应是面试事件对象的视图。每个深层视图可有局部返回和对象间跳转，但不常驻展示“职业事实源/资料库/研究台”等空间菜单。

建议的页面骨架：

```text
对象身份（公司 + 岗位 / 某条事实 / 某次面试）
  → 当前状态或建议（可追溯）
  → 当前最重要的证据、链接对象与未知
  → 一个主要动作
  → 最近变更与历史决定
  → 局部返回“回到今天”
```

这与 Foundry 的 full Object View / panel Object View 形成对应：桌面可展示完整对象，移动端把最关键的属性、证据和动作按优先级堆叠；无需在移动端压缩一套桌面侧栏。

### 3.3 关系式导航的交互规则

* 点击“这次判断使用 3 条已确认职业事实” → 打开事实对象集，返回时保留机会与当前阶段。
* 点击证据中的“影响判断” → 高亮建议链中受影响的判断，不跳到新的资料库页面。
* 点击“面试验证” → 打开面试事件对象，并显示它要验证的未知项。
* 点击“结果反馈给职业底座” → 显示待用户确认的事实更新，不直接覆盖当前事实。
* 使用浏览器后退或局部“回到今天”时，恢复进入前的对象与滚动位置（原型阶段可只恢复对象/阶段）。

禁止把关系式导航实现成：

* 需要用户记住的模块层级；
* 到处出现“打开 Agent”的重复按钮；
* 让所有对象都进入一张无任务目标的全局图谱；
* 仅用面包屑堆叠路径而不说明对象关系。

### 3.4 唯一 Agent 入口的对象绑定

当前原型已将 Agent 入口集中为右下角浮动按钮，并通过 `agentContext` 绑定机会阶段、面试或职业事实（[prototype/src/App.tsx:82-83](../../../../prototype/src/App.tsx#L82-L83)、[prototype/src/App.tsx:125-126](../../../../prototype/src/App.tsx#L125-L126)）。这与 AIP Assist 的“对话后给出应用内建议动作”方向一致，但个人产品应进一步做到：

* 抽屉标题显示当前对象和阶段，而不是泛化的“AI 助手”；
* 对话开场展示 `它能看见` 的对象摘要与最近使用证据；
* 每条 Agent 回复分为“理解/依据/建议动作/待你确认”四段，避免一段话混合事实与判断；
* 建议动作以可审核按钮呈现，例如“把这条冲突加入待确认问题”“确认这条事实”“生成沟通草稿”，按钮只创建草稿或待审动作；
* Agent 可以导航到当前对象相关的局部视图，但不应凭空改变用户决定、发送外部消息或提交申请；
* 关闭抽屉后，尚未处理的 Agent 任务和待确认项应留在当前对象上，而不是只存在聊天记录。

### 3.5 AI 过程可见，但不要伪装企业级遥测

Foundry 的 AIP Observability 面向生产运维，提供 execution history、traces、logs、token usage 等。原型只需取其“过程可见”原则：研究任务、当前步骤、来源读取、完成/阻塞、待用户确认和产出结果。不要把 token 数、模型延迟、trace ID 或大面积日志做成主体验；那会把个人决策产品重新变成开发者控制台。

当前原型的 `AnalysisPanel` 已有四步过程、处理中/已完成状态和重跑动作（[prototype/src/App.tsx:22-27](../../../../prototype/src/App.tsx#L22-L27)、[prototype/src/App.tsx:153-154](../../../../prototype/src/App.tsx#L153-L154)）。可将每一步升级为可展开的 Agent task object，显示：读取了哪些对象、产出了哪些中间发现、发现了什么未知、是否需要用户确认。

## 4. 面向本产品的建议对象模型（技术栈保持未决）

以下是产品语义建议，不是数据库 schema 或框架选型。它可以先用 TypeScript 内存对象实现，未来再映射到任意持久化方案。

### 4.1 核心对象

| 对象 | 最小属性 | 状态/版本 | 说明 |
| --- | --- | --- | --- |
| `PersonContext` | 用户标识、当前方向、目标、硬约束 | 当前版本、历史版本 | 不是“用户画像标签”，而是用户拥有的职业语境 |
| `CareerFact` | 标签、细节、来源、确认者、时间 | confirmed / inferred / unknown / rejected | AI 推断不能静默成为事实 |
| `Opportunity` | 公司、岗位、薪资、地点、原文、来源 URL、采集时间 | lifecycle stage、active/closed | 机会是跨研究、申请、面试、Offer 的持续主对象 |
| `Evidence` | 来源、摘录、获取时间、强度、语气、影响 | available / stale / conflicting | 每条证据要能链接到事实或判断 |
| `Unknown` | 未知问题、影响、验证方式 | open / resolved / accepted-risk | 未知是主动管理的对象，不是空字段 |
| `Advisory` | 建议、理由、反证、未知、改变结论的信息 | draft / published / superseded | 保存形成时的职业事实和证据快照 |
| `UserDecision` | choice、理由、时间、建议引用 | apply / hold / decline | 与 Advisory 分离，用户拥有最终权威 |
| `ResearchTask` | 目标、步骤、输入对象、输出对象、状态 | queued / running / blocked / complete | AI 的工作可见且可重试 |
| `CommunicationDraft` | 场景、草稿、基于的事实、待审核项 | draft / reviewed / exported | 只生成和审核，不自动发送 |
| `InterviewEvent` | 时间、参与人、验证目标、问题、反馈 | planned / in-progress / reviewed | 面试既是行动也是证据输入 |
| `OfferTerm` | 薪资、职级、工作方式、条件、来源 | stated / verified / unknown | 不以数字单字段替代生活取舍 |
| `Outcome` | 结果、来源、时间、与预期差异 | recorded / reviewed | 产生可回写的复盘建议 |

### 4.2 建议的通用对象契约

不论底层实现如何，每个可见对象都应能回答：

```ts
type DecisionObject<T> = {
  id: string;
  type: string;
  data: T;
  status: string;
  links: Array<{ relation: string; objectId: string }>;
  provenance: Array<{ source: string; capturedAt: string; excerpt?: string }>;
  createdAt: string;
  updatedAt: string;
  version: number;
};
```

这只是语义示例，不要求当前原型立即引入泛型基类。当前 `CareerFact` 与 `EvidenceItem` 已分别具备来源、状态和时间/影响字段，可作为最小对象契约的起点（[prototype/src/model.ts:13-31](../../../../prototype/src/model.ts#L13-L31)）。

### 4.3 对象与动作的验收级约束

* 任何结论必须能通过对象链接回至少一条依据，或明确标记为用户价值判断/未知。
* 任何 AI 推断都能执行确认、否定或修正；否定后不得被后续自动分析重新当作当前事实。
* 任何外部行动都由用户发起并确认；生成草稿不等于发送，记录申请不等于提交。
* 任何系统建议都保存形成时的上下文快照；用户决定可覆盖建议，但不得删除建议历史。
* 任何结果回写都先生成待确认变更，用户确认后才更新当前职业事实或策略。
* 所有状态变化都能在当前对象视图中即时看到下一动作、影响对象和撤回/更正入口。

## 5. 不适合直接复制的企业模式

### 5.1 不要复制“组织数字孪生”与全域监控

Foundry 的 digital twin 目标是整合企业资产、人员、订单、设备、交易和实时条件，用于组织级运营。个人职业系统没有也不应拥有这种跨人、跨组织、跨来源的监控视野。尤其不能把公开公司资料、匿名评价和用户职业事实拼成一个“企业风险雷达”或对他人做隐蔽画像。

**替代：** 只围绕用户主动带入的具体机会，收集完成当前判断所需的最小证据；将匿名评价保持为弱信号和待确认问题；不做跨用户统计和组织级排行。

### 5.2 不要复制 command center / 大屏 / 地图优先审美

Foundry 的 Map、Workshop、Carbon 等应用服务供应链、国防、医疗等 operational workflows，地图、密集表格、状态色和多面板布局在那些场景有价值。个人职业选择更需要阅读、比较、反思和对话。大屏、发光点、全局指标、复杂筛选器会把用户从“理解一个选择”推向“管理一套系统”。

**替代：** 使用安静的对象标题、证据摘录、局部状态和单一主动作；将密度限制为“一个主任务 + 一条旅程 + 一组证据/状态 + 一个下一动作”，与当前 PRD 的无壳工作台方向一致。

### 5.3 不要复制企业角色/权限/安全墙作为主交互

Foundry 需要 marking/purpose/role-based policies、动态 lineage、运行时授权和细粒度提交标准，以保护组织边界。个人产品仍需隐私、BYOK、最小披露和数据删除，但不应把角色选择、租户切换、权限矩阵或审计日志放在普通用户主路径。

**替代：** 把“数据发送范围、来源、用户控制权、外部行动审批”做成上下文中的轻量可见说明；复杂部署权限留在设置/管理员边界，不改变职业对象视图。

### 5.4 不要把行动闭环误解为自动执行

Foundry 的价值在于将 action 安全写回企业 substrate。个人职业产品的责任边界不同：任何沟通、投递、接受 Offer 或改变职业事实都可能产生不可逆后果，且需要用户语气、时机和价值判断。

**替代：** 采用 staged action：AI 只能生成草稿、待确认问题、候选事实更新或建议动作；用户确认后才记录“已采取”或执行本地可逆操作；外部发送永远由用户在目标平台完成。

### 5.5 不要复制“对象万能化”

如果所有东西都被建模为对象，产品会退化成无穷图谱、属性表和关系浏览器。对象建模的目的应是支持当前判断和下一动作，而不是展示建模能力本身。

**替代：** 只为会改变判断、行动、复盘或用户控制权的实体建模；短暂 UI 状态（toast、加载、折叠）不必成为领域对象；对象关系按任务逐步显露。

## 6. 原型实现建议（不预设生产技术栈）

### 6.1 将现有页面映射为对象视图

当前原型已经具备可复用的语义部件：

* `TodayView`：当前主任务、机会旅程、最近事件和 Agent 研究过程（[prototype/src/App.tsx:140-141](../../../../prototype/src/App.tsx#L140-L141)）。
* `OpportunityView`：机会身份、阶段、研究结论、证据、下一动作、事实快照和用户决定（[prototype/src/App.tsx:157-160](../../../../prototype/src/App.tsx#L157-L160)）。
* `CareerView` / `FactCard`：事实状态、AI 推断、来源和用户确认/否定（[prototype/src/App.tsx:214-220](../../../../prototype/src/App.tsx#L214-L220)）。
* `AgentDrawer`：唯一全局 Agent 入口、上下文标题、可见对象范围、建议问题和对话动作（[prototype/src/App.tsx:223-224](../../../../prototype/src/App.tsx#L223-L224)）。

下一轮原型升级可沿这些边界重命名/重组，而不必先引入路由、数据库或 UI 组件库：

1. 将 `OpportunityView` 的标题区固定为 Opportunity object header；把“当前机会 · 研究”变成对象状态属性，而非模块眉题。
2. 将 `EvidenceSection` 由“证据列表 + 详情”扩展为“证据链接 + 它影响的未知/建议”，实现点击关系后局部定位。
3. 将 `DecisionBlock` 拆成 `Advisory` 与 `UserDecision` 两个视觉区块，增加“这份建议形成于…”的快照入口。
4. 将 `AnalysisPanel` 的四个步骤表示为 `ResearchTask` 的阶段记录；每步都显示输入对象与产出对象。
5. 将 `LifecycleStrip` 从全量菜单式阶段条改为当前机会的旅程状态；点击阶段应定位到该阶段对象/事件，而不是变成第二套全局导航。
6. 将 `InterviewView`、Offer、Outcome 作为 Opportunity 的 linked event object views；局部返回只回到今天或机会对象。
7. 让所有 Agent 建议动作回调进入统一的 staged-action 处理器，避免每个页面各自生成不可追溯的临时文本。

### 6.2 建议的 UI 状态词汇

对象视图中的状态应描述现实进度，不描述后台模块：

* 事实：`已确认` / `AI 推断` / `未知项` / `已否定`
* 证据：`一手来源` / `二手来源` / `弱信号` / `来源冲突` / `已过期`
* Agent 任务：`待开始` / `处理中` / `等待你确认` / `已完成` / `受阻`
* 建议：`值得投入` / `谨慎投入` / `暂不投入` / `已被新信息取代`
* 用户决定：`申请` / `暂缓` / `放弃`
* 外部动作：`草稿` / `待审核` / `已记录`；不要把本地草稿写成“已发送”。

避免把状态颜色设计成绩效分数。颜色只用于区分支持、风险、冲突、处理中等状态，文本必须完整表达含义。

### 6.3 对象驱动验收场景

原型测试可以用以下行为验收，而不是只截图检查页面：

1. 从“今天”的主任务进入一条未知项，看到它关联的冲突证据和建议影响；返回后仍停留在机会当前阶段。
2. 在职业事实视图否定一条 AI 推断，回到机会后该推断不再出现在“参与判断的事实”中，且有即时反馈。
3. 重新启动研究，逐步看到 Agent 读取的对象、步骤和结果；关闭页面后，任务状态仍在当前机会中可见（原型可用内存状态）。
4. 质疑建议并补充一条用户事实，看到新建议说明更新，同时旧建议/决定快照保持可回看。
5. 从机会进入面试事件，看到该面试要验证的未知项；记录结果后生成待确认的职业事实更新，而不是自动修改事实源。
6. 在移动宽度下，顺序变为对象身份 → 当前判断 → 风险/未知 → 证据 → 主动作；不把桌面多栏压缩成难以滚动的卡片墙。

## 7. 相关内部规格与文档

补充视角：[从“交互哲学”到职业决策产品原则](interaction-philosophy-product-principles.md)进一步描述对象随时间变化时的自由度、人与 AI 的对称性、关键动作的可逆/可重访性，以及“过程可见”不等于暴露模型思维链。

### Files found / code patterns

* `.trellis/tasks/08-13-interactive-product-concept-demo/prd.md`：当前原型验收边界，明确无固定 header/侧栏/常驻菜单、唯一 Agent 入口、可见 AI 过程和完整求职生命周期。
* `docs/product/product-brief.md`：产品定位、证据优先、用户最终权威、建议与决定分离、最小必要披露及非自动外部行动边界。
* `docs/product/glossary.md`：领域术语，尤其是职业事实源、研究对象、机会研究、研究成果、系统建议和用户决定。
* `prototype/src/model.ts:13-44`：已有 `CareerFact`、`EvidenceItem`、`Opportunity` 等领域类型，具备来源、状态、时间和影响等字段。
* `prototype/src/App.tsx:35-127`：当前内存状态、登录模拟、机会阶段、Agent 上下文、分析过程和用户决定的状态更新入口。
* `prototype/src/App.tsx:140-224`：Today、Opportunity、Interview、Career、AnalysisPanel 和 AgentDrawer 的现有对象/工作流视图边界。

* [任务 PRD](../prd.md)：要求无固定 header/侧栏/常驻菜单，唯一 Agent 入口，完整求职生命周期和可见 AI 过程。
* [产品摘要](../../../../docs/product/product-brief.md)：个人中心、证据优先、用户最终权威、建议与决定分离、最小必要披露。
* [产品术语](../../../../docs/product/glossary.md)：职业事实源、研究对象、机会研究、研究成果、系统建议、用户决定。
* [能力地图](../../../../docs/product/product-capability-map.md)：职业画像、公司调查、机会判断、申请决策包、结果反馈和决策/证据追溯横切能力。
* 当前原型对象模型 [prototype/src/model.ts](../../../../prototype/src/model.ts)：已有 `CareerFact`、`EvidenceItem`、`Opportunity`、`UserDecision` 等最小类型。
* 当前原型交互入口 [prototype/src/App.tsx](../../../../prototype/src/App.tsx)：Today、Opportunity、Interview、Career、AnalysisPanel、AgentDrawer 和用户决定动作。

## Caveats / Not Found

* 本研究只使用 Palantir 官方文档页面；官方页面部分内容动态渲染，某些链接会重定向到新命名（例如 AIP Chatbot Studio），因此引用以页面标题和 URL 为准，不据此推断具体产品版本或 API 稳定性。
* Foundry 文档面向企业/政府 operational use cases；其中的 security、audit、writeback、automation 和 observability 不能直接等同于个人产品需求。本文件只抽取对象语义、决策沿革、动作分层和 AI 可见性原则。
* 当前原型是 React/Vite 内存 Demo；本研究没有做生产数据库、后端、模型供应商、联网调查、权限系统或部署技术选型。
* “对象驱动 UI”不是要求绘制全局知识图谱。若关系不能帮助用户理解当前选择或采取下一动作，就不应进入主视图。
* Palantir 官方资料没有提供针对个人求职或个人职业隐私的设计答案；个人产品的同意、最小披露、删除和用户最终权威仍以本项目既有产品契约为准。
