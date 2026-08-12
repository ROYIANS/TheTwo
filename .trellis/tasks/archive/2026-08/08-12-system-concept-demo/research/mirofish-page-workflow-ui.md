# MiroFish 页面工作流与 UI 排布研究

## 研究范围

- 参考项目：`C:\Users\12946\Downloads\MiroFish-main`
- 一手来源：项目 README、Vue 前端路由、页面组件、样式与本地化文件。
- 目标：还原 MiroFish 从新建项目到图谱、仿真、报告、深度交互的完整体验，并判断哪些结构适合转译到择途 D“职业决策研究台”。
- 约束：只研究页面工作流和 UI 组织，不评价后端能力，也不把参考项目的代码结构当作择途的正式技术方案。

## 结论摘要

MiroFish 的成熟感主要不是来自黑白配色，而是来自一条非常明确的“对象持续、阶段推进、上下文不丢失”的工作流：用户从种子材料和问题进入一个项目，此后在稳定的全屏壳层内，通过顶部 `Step n/5`、中部视图模式和右侧工作面板推进；左侧图谱始终保存同一个世界上下文。到报告阶段，工作台内部再次分为“可阅读成果”和“可检查生成过程”；到深度互动阶段，左侧成果继续保留，右侧过程面板才被对话工具替代。这种连续性比具体颜色、圆角或点阵背景更值得择途借鉴。

同时，MiroFish 是明显的桌面优先仿真工具：主工作区固定 `100vh`，常用 50/50 分栏，报告内部左栏还设置 `45%` 和 `450px` 最小宽度；五个核心步骤组件基本没有响应式媒体查询。择途可以借鉴其工作台逻辑，但必须重新设计窄屏信息优先级，不能直接复制尺寸与分栏实现。

## 1. 信息架构与路由

前端只有六条顶级路由，分别承载入口和五个阶段。`App.vue` 只是 `router-view`，因此每个阶段页面自行拥有全局 Header、布局模式和阶段状态，而不是共享一个持久 Layout 组件。[来源：`frontend/src/router/index.js:9-44`；`frontend/src/App.vue:1-7`]

| 路由 | 页面 | 用户语义 | 主要对象标识 |
|---|---|---|---|
| `/` | `Home.vue` | 新建预测、选择历史项目 | 无 |
| `/process/:projectId` | `MainView.vue` | Step 1 图谱构建 | `projectId` |
| `/simulation/:simulationId` | `SimulationView.vue` | Step 2 环境搭建 | `simulationId` |
| `/simulation/:simulationId/start` | `SimulationRunView.vue` | Step 3 开始模拟 | `simulationId` |
| `/report/:reportId` | `ReportView.vue` | Step 4 报告生成 | `reportId` |
| `/interaction/:reportId` | `InteractionView.vue` | Step 5 深度互动 | `reportId` |

阶段名称在中文本地化中固定为“图谱构建、环境搭建、开始模拟、报告生成、深度互动”，工作台模式固定为“图谱、双栏、工作台”。[来源：`locales/zh.json:75-78`]

### 1.1 对象链

路由参数也表达了领域对象逐步成熟的链路：

```text
种子文件 + 预测需求
  -> Project（本体与图谱）
  -> Simulation（角色、平台和仿真配置）
  -> Report（生成中的分析成果）
  -> Interaction（围绕报告和模拟角色继续提问）
```

这不是同一个页面内的五个 Tab。Step 1 创建 `simulation_id` 后跳到 Simulation；Step 3 创建 `report_id` 后跳到 Report；Report 完成后再跳到 Interaction。[来源：`frontend/src/components/Step1GraphBuild.vue:213-235`；`frontend/src/components/Step3Simulation.vue:651-670`；`frontend/src/components/Step4Report.vue:409-413`]

## 2. 端到端页面工作流

### 2.1 首页：形成项目输入，而不是直接展示工作台

首页上半部是品牌 Hero，下半部才是实际入口。实际入口采用双栏：左侧解释系统状态、指标与五阶段流程；右侧是文件上传、预测需求文本框和启动按钮。用户提交后，文件与需求先写入临时 `pendingUpload`，随后立即跳到 `/process/new`，真正 API 调用在 Process 页面开始。[来源：`frontend/src/views/Home.vue:14-54`；`frontend/src/views/Home.vue:56-205`；`frontend/src/views/Home.vue:297-309`]

首页下方还有历史项目数据库。用户点击一条记录不会直接猜测要去哪个页面，而是先打开详情弹窗，再明确选择回到 Step 1 图谱、Step 2 环境或 Step 4 报告；不可达阶段会禁用。这使历史项目承担“恢复工作上下文”的作用。[来源：`frontend/src/components/HistoryDatabase.vue:20-99`；`frontend/src/components/HistoryDatabase.vue:108-185`；`frontend/src/components/HistoryDatabase.vue:402-442`]

### 2.2 Step 1：图谱构建

页面采用全屏 Header + 主双栏。左侧始终是 `GraphPanel`，右侧 `Step1GraphBuild` 展示三段子流程：

1. 生成本体，显示 API、状态、实体类型和关系类型；标签可点击打开详情浮层。
2. 构建 GraphRAG，显示节点、边和类型统计。
3. 构建完成，出现“进入环境搭建”主行动。

[来源：`frontend/src/views/MainView.vue:38-74`；`frontend/src/components/Step1GraphBuild.vue:1-170`]

对于新项目，Process 页面读取暂存文件，调用本体生成，取得真实 `project_id` 后替换 URL，再自动发起图谱构建；对于已有项目，则按后端状态恢复到本体、构建中或完成阶段，并轮询任务和图谱数据。[来源：`frontend/src/views/MainView.vue:185-231`；`frontend/src/views/MainView.vue:234-295`；`frontend/src/views/MainView.vue:306-378`]

完成后并不是只递增本地 Step，而是创建 Simulation 对象并路由跳转。因此用户在 URL 和历史记录中都获得稳定的阶段对象。[来源：`frontend/src/components/Step1GraphBuild.vue:213-235`]

### 2.3 Step 2：环境搭建

左侧继续展示同一个图谱，右侧切换为环境准备过程。内部不是单张设置表，而是按状态逐段展开：模拟实例、Agent 人设、双平台配置、事件编排、准备完成。生成的人设、行为时间轴、平台算法、事件叙事与初始帖子都在配置完成时就地预览。[来源：`frontend/src/components/Step2EnvSetup.vue:1-180`；`frontend/src/components/Step2EnvSetup.vue:182-410`]

组件监听后端 `currentStage`，将“生成人设”“生成配置”“准备脚本”映射为可见 phase，并独立轮询 profiles 与 config，使用户在耗时任务中持续看到中间产物，而不是只有百分比。[来源：`frontend/src/components/Step2EnvSetup.vue:678-692`；`frontend/src/components/Step2EnvSetup.vue:709-712`]

配置完成后，页面让用户在自动轮数与自定义轮数之间选择，显示预计耗时，并同时提供返回图谱构建和开始模拟两个明确行动。[来源：`frontend/src/components/Step2EnvSetup.vue:430-526`]

开始模拟时，父页面把可选的 `maxRounds` 写入 query 并跳到 `/simulation/:id/start`；返回则回到该 Simulation 的配置页。[来源：`frontend/src/views/SimulationView.vue:144-175`]

### 2.4 Step 3：开始模拟

左侧仍是图谱，并通过 `isSimulating` 提示图谱记忆正在实时更新。右侧顶部是双平台运行状态，显示 round、elapsed time、actions 数量；主体是合并后的事件时间线，底部是 simulation monitor。模拟完成后，“生成报告”按钮才可用。[来源：`frontend/src/views/SimulationRunView.vue:38-62`；`frontend/src/components/Step3Simulation.vue:1-120`；`frontend/src/components/Step3Simulation.vue:127-281`]

用户回退时，页面会先检查并关闭或停止正在运行的模拟环境，再回 Step 2，表明阶段导航不仅是视觉切换，还绑定资源生命周期。[来源：`frontend/src/views/SimulationRunView.vue:152-197`]

点击生成报告会请求创建 Report，拿到 `report_id` 后直接进入 Step 4。[来源：`frontend/src/components/Step3Simulation.vue:651-670`]

### 2.5 Step 4：报告生成

外层页面仍保留“图谱 / 双栏 / 工作台”模式，但默认进入 `workbench`，即隐藏外层 GraphPanel、让报告组件全宽。这样用户仍能主动切回图谱上下文，而默认空间全部用于产出阅读和过程审计。[来源：`frontend/src/views/ReportView.vue:38-61`；`frontend/src/views/ReportView.vue:86-109`]

报告组件内部再次分栏：

- 左侧 45% 是报告正文。标题、摘要和章节采用出版物式排版；章节生成后直接进入正文，可折叠。
- 右侧是 Agent 工作流。顶部显示 sections、elapsed、tools 和总状态；其下是计划步骤，再下面是逐条 Agent 日志，可展开参数、工具结果与 LLM response。
- 底部另有黑色 console，只呈现更底层的运行输出。

[来源：`frontend/src/components/Step4Report.vue:1-77`；`frontend/src/components/Step4Report.vue:79-150`；`frontend/src/components/Step4Report.vue:2323-2429`；`frontend/src/components/Step4Report.vue:2668-2739`；`frontend/src/components/Step4Report.vue:5105-5154`]

这里存在两层可见性：右侧 Workflow Timeline 是用户可理解的“Agent 做了什么”，底部 console 是底层诊断输出。Agent 日志每 2 秒轮询，console 每 1.5 秒轮询；章节完成就写入左侧，报告完成后停止轮询、更新 Header 状态并显示“进入深度互动”。[来源：`frontend/src/components/Step4Report.vue:2020-2080`；`frontend/src/components/Step4Report.vue:2132-2175`；`frontend/src/components/Step4Report.vue:130-137`]

### 2.6 Step 5：深度互动

外层同样默认 `workbench`。内部左侧完整保留报告，右侧把生成时间线替换成“Interactive Tools”。因此结果没有在进入聊天后消失，提问始终发生在可见成果旁边。[来源：`frontend/src/views/InteractionView.vue:38-60`；`frontend/src/views/InteractionView.vue:86-109`；`frontend/src/components/Step5Interaction.vue:1-80`]

右侧动作条有三类目标：

- 与 Report Agent 对话；
- 从下拉列表选择一个模拟 Agent 对话；
- 选择多个 Agent 发问卷并汇总结果。

Report Agent 模式还先展示可用工具说明；单个 Agent 模式展示其画像卡；对话区在中间滚动，输入固定在底部。切换对象时，组件按 `report_agent` / `agent_n` 分别缓存对话历史，避免上下文串线。[来源：`frontend/src/components/Step5Interaction.vue:81-217`；`frontend/src/components/Step5Interaction.vue:219-311`；`frontend/src/components/Step5Interaction.vue:314-407`；`frontend/src/components/Step5Interaction.vue:483-540`]

## 3. 全局壳层和关键构件

### 3.1 Header

每个工作阶段都复用了相同的三段式 Header：

- 左：品牌名，点击回首页；
- 中：`图谱 / 双栏 / 工作台` 三段切换；
- 右：语言、`Step n/5`、阶段名称、状态点与文字。

Header 固定 60px，品牌和 Step 数字使用等宽字体，中间切换器绝对居中；阶段和运行状态是两个不同信息，前者表示用户在流程哪一步，后者表示该步正在 Processing、Ready、Completed 或 Error。[来源：`frontend/src/views/MainView.vue:3-36`；`frontend/src/views/MainView.vue:431-532`]

### 3.2 工作台模式切换

`graph / split / workbench` 不是路由，而是当前页面内部的视图密度偏好：GraphPanel 宽度在 `100% / 50% / 0%` 间切换，右侧相反，并配合 opacity 和 translate 过渡。点击图谱的最大化按钮也复用同一个状态。[来源：`frontend/src/views/MainView.vue:94-127`；`frontend/src/views/MainView.vue:155-161`；`frontend/src/views/MainView.vue:536-552`]

这个机制使用户可以在同一阶段选择“看关系”“边看边做”“只做当前任务”，而不改变领域对象或步骤。

### 3.3 图谱、图例和详情面板

GraphPanel 是左侧稳定上下文。画布使用浅灰点阵背景；上方浮置标题、刷新和最大化；左下固定实体图例；右上有边标签开关。选择节点或边后，在画布右侧打开 320px 浮层，展示名称、UUID、属性、摘要、标签或关系事实，不离开图谱。[来源：`frontend/src/components/GraphPanel.vue:1-58`；`frontend/src/components/GraphPanel.vue:61-200`；`frontend/src/components/GraphPanel.vue:216-234`；`frontend/src/components/GraphPanel.vue:816-839`；`frontend/src/components/GraphPanel.vue:914-977`；`frontend/src/components/GraphPanel.vue:1029-1117`]

详情面板是“在上下文上检查对象”的模式，而不是打开完整详情页，适合快速核对图中对象。

### 3.4 Bottom console / logs

Step 1、2、3 以及报告阶段都把日志固定在右侧工作面板底部。黑底、等宽、80-100px 可见高度、独立滚动，正文滚动不会带走它。[来源：`frontend/src/components/Step1GraphBuild.vue:173-185`；`frontend/src/components/Step1GraphBuild.vue:647-698`；`frontend/src/components/Step3Simulation.vue:273-281`；`frontend/src/components/Step3Simulation.vue:1215-1250`；`frontend/src/components/Step4Report.vue:377-388`]

不过 Step 5 不再显示 console；当系统从“生成”转入“使用成果”时，底部空间完全交给输入框和对话。这说明 console 是执行期诊断构件，不是产品永久装饰。[来源：`frontend/src/components/Step5Interaction.vue:1-410`]

## 4. 视觉语言与 UI Tokens

### 4.1 字体

`index.html` 引入 Inter、JetBrains Mono、Noto Sans SC、Space Grotesk。全局默认是 `JetBrains Mono, Space Grotesk, Noto Sans SC`；常规工作台主体主要用 Space Grotesk + Noto Sans SC，报告和交互主体切换到 Inter，报告标题和摘要使用 Times New Roman。等宽字体用于品牌、编号、ID、时间、API、指标与日志。[来源：`frontend/index.html:5-11`；`frontend/src/App.vue:17-23`；`frontend/src/views/MainView.vue:422-429`；`frontend/src/components/Step4Report.vue:2211-2217`；`frontend/src/components/Step4Report.vue:2392-2407`]

这种字体分工形成三层语义：

1. 无衬线：操作与信息；
2. 等宽：系统状态与可追踪标识；
3. 衬线：需要沉浸阅读的最终成果。

### 4.2 颜色

主色不是一个品牌色铺满全局，而是黑白灰为底、状态色局部出现。源码中最常用的是 `#E5E7EB`、`#9CA3AF`、白、黑、`#6B7280`、`#374151`、`#F9FAFB`、`#F3F4F6`、`#1F2937`。过程阶段使用橙红 `#FF5722`，完成使用绿色 `#10B981` 或 `#1A936F`，错误使用红色。Header 状态点明确映射 processing、completed、error。[来源：`frontend/src/views/MainView.vue:523-534`；`frontend/src/components/Step1GraphBuild.vue:340-351`；`frontend/src/components/Step4Report.vue:2676-2690`]

### 4.3 边框、圆角、阴影与密度

- 主结构靠 `1px` 浅灰边框分区，Header 和左右栏都使用硬边界。[来源：`frontend/src/views/MainView.vue:432-440`；`frontend/src/views/MainView.vue:551-552`]
- 阶段卡片多为 8px 圆角、20px 内边距、20px 间距和极轻阴影；激活态用橙色边框而非大面积填色。[来源：`frontend/src/components/Step1GraphBuild.vue:285-307`]
- 常规正文多在 12-14px；状态徽标、API、ID 多在 10-11px；报告标题 36px。[来源：`frontend/src/components/Step1GraphBuild.vue:322-357`；`frontend/src/components/Step4Report.vue:2375-2407`]
- 图谱画布、工具按钮和浮层使用 6-10px 圆角，历史项目卡反而刻意使用 0 圆角，说明圆角不是全局强制 token。[来源：`frontend/src/components/GraphPanel.vue:855-869`；`frontend/src/components/GraphPanel.vue:1030-1039`；`frontend/src/components/HistoryDatabase.vue:673-683`]

### 4.4 纹理与动效

点阵和网格只出现在图谱或历史项目等“空间/数据库”语境，不是所有页面背景。动效也主要传达状态：状态点 pulse、加载 spinner、宽度切换、时间线条目进入、聊天 typing；没有用大范围装饰动画替代信息。[来源：`frontend/src/components/GraphPanel.vue:817-824`；`frontend/src/components/HistoryDatabase.vue:596-630`；`frontend/src/views/MainView.vue:530-534`；`frontend/src/views/MainView.vue:544-548`]

## 5. 响应式策略与实际限制

首页在 1024px 以下把 Hero 和 dashboard 双栏改为纵向；历史卡在 1200px 和 768px 缩宽。[来源：`frontend/src/views/Home.vue:877-899`；`frontend/src/components/HistoryDatabase.vue:1006-1020`]

但主工作台的核心策略并不是真正响应式：

- 外层固定 `height: 100vh` 和 `overflow: hidden`；[来源：`frontend/src/views/MainView.vue:422-428`]
- split 固定为 50/50；[来源：`frontend/src/views/MainView.vue:117-127`]
- Step 4/5 内部报告左栏固定 45%，最小 450px，并有 50px 横向 padding；[来源：`frontend/src/components/Step4Report.vue:2323-2333`；`frontend/src/components/Step5Interaction.vue:986-996`]
- 只有 `Home.vue`、`HistoryDatabase.vue` 和一个未被当前路由引用的旧 `Process.vue` 定义了媒体查询；Step1-5 组件均没有 `@media`。[来源：对 `frontend/src/components/*.vue` 的 `@media` 检索，仅命中 `HistoryDatabase.vue:1007,1013`]

因此截图反映的是宽屏桌面设计。择途若面向手机使用，必须另行定义：Header 压缩、分栏顺序、报告/证据/顾问的 Tab 或抽屉策略、底部操作安全区和长文本阅读宽度。

## 6. 领域特有设计与可迁移设计

### 6.1 MiroFish 领域特有，不应直接照搬

| 设计 | 原因 |
|---|---|
| 巨型关系图长期占半屏 | MiroFish 的核心对象是模拟世界和 GraphRAG；择途多数工作不需要持续看全量关系图。 |
| 双平台、轮数、Agent 行为参数 | 属于社交仿真运行模型，不是职业决策对象。 |
| ReportAgent 工具调用、LLM response 和底层 console 全量可见 | 对预测系统有审计和演示价值；对普通求职者会增加技术噪音，也可能造成“AI 在忙所以可信”的错觉。 |
| Graph / Split / Workbench 命名 | 是图谱产品的视角。择途需要按“判断 / 证据 / 顾问”或对象任务命名。 |
| 黑底 console 贯穿生成阶段 | 适用于长任务诊断；择途只应在导入、解析、联网调查等真实长任务中提供可折叠活动记录。 |
| 45% + 450px 固定报告栏 | 桌面仿真适用，但会破坏择途窄屏和中等宽度体验。 |

### 6.2 适合择途转译

| MiroFish 模式 | 择途转译 |
|---|---|
| 对象 ID 随流程从 Project 变为 Simulation、Report | 机会是主对象，调查、判断、申请包是其派生工作成果；路由和页面状态应能恢复当前对象。 |
| 顶部同时显示 Step 和运行状态 | 同时显示“当前求职工作阶段”和“资料完整度/调查状态”，不要混为一个模糊进度条。 |
| Graph / Split / Workbench | `证据关系 / 双栏研判 / 专注阅读`，或更简洁地提供可收起的上下文栏。 |
| 左侧稳定世界上下文，右侧推进工作 | 左侧稳定保存机会判断报告或职业事实源，右侧呈现证据调查、未知项和顾问行动。 |
| 报告正文与 Agent 工作流同屏 | 机会结论与证据、事实/推断、来源、更新时间同屏；用户能看到结论如何形成。 |
| 生成完成后，过程区替换为互动区，报告保留 | 机会判断完成后，正文不消失，右侧变成围绕该机会的追问、纠错和下一步准备。 |
| 过程日志与 console 分层 | 用户可见的“调查活动”与开发者诊断日志分离；默认只展示前者。 |
| 历史项目弹窗按可用阶段恢复 | 机会列表直接标示已采集、已调查、已判断、已准备，并允许回到最近有效工作点。 |
| 中间产物逐步出现 | 公司事实、岗位要求、冲突证据、未知问题应在调查中逐步可见，避免长时间只有 loading。 |

## 7. 对 D 方案下一轮的具体建议

### 7.1 建立稳定壳层，但不要永久固定业务分栏

保留三段式 Header：左侧“择途 + 当前空间/对象”，中间放视图模式，右侧放当前工作阶段和状态。页面主体根据任务切换布局：

- 机会调查/判断：左侧判断报告，右侧证据与调查活动；
- 职业画像：左侧事实档案，右侧来源、推断与更正；
- 简历材料：左侧材料正文，右侧岗位依据、校订记录与风险；
- 机会列表：不强行双栏，可用主表格 + 可展开检查器。

### 7.2 将外层工作流改成择途的对象生命周期

MiroFish 的五步是一次性任务；择途是长期系统，不宜把全站硬编码成线性 Step 1/5。更适合：顶部显示当前对象所处阶段，例如“机会 2/4 · 证据调查”，全局导航仍允许用户进入今日、机会、职业事实源和材料。局部阶段可以是：采集 -> 调查 -> 判断 -> 申请准备 -> 用户决定。

### 7.3 借鉴“成果与过程同屏”，但把过程改为证据审计

右侧首屏优先显示：最新发现、来源、冲突、未知项、需要用户确认的问题。Agent 的搜索动作或提取过程放到可展开的“调查活动”中；开发者日志不默认出现。每条 AI 结论旁应直接关联证据，而不是让用户去 console 猜测可信度。

### 7.4 报告完成后切换为顾问互动

可复用 Step 4 -> Step 5 的空间连续性：调查期间右侧是证据/活动；形成阶段性判断后，右侧默认切为“围绕此机会追问”，但仍能回看调查活动。对话目标不应是通用 Agent 列表，而应是明确工具语义，例如“质疑当前建议”“补充一条事实”“生成待问招聘方的问题”“准备申请材料”。

### 7.5 把图谱详情面板转译成证据检查器

择途不需要默认巨型图谱，但可以借鉴画布内对象检查器：点击公司、岗位要求、人物或来源时，在当前页面侧边打开紧凑详情，展示来源、摘录、抓取时间、可信度和关联结论。只有关系确实帮助判断时，再提供独立关系视图。

### 7.6 从一开始定义移动端降级规则

建议把桌面双栏视为增强模式，而不是基础布局。窄屏按“结论 -> 风险与未知 -> 证据 -> 顾问行动”纵向排列；Header 只保留对象、阶段和一个菜单；调查活动与来源检查器用全屏抽屉；底部固定当前最重要行动。这样保留 MiroFish 的信息连续性，不复制其固定宽度问题。

## 8. 关键风险

1. **过程表演替代可信度**：大量 Agent 日志很容易让用户误以为“过程复杂”就等于结论可靠。择途必须用来源和事实/推断分类建立可信度。
2. **线性步骤误导长期产品**：求职机会会并行、回退和长期积累，不能把全站强制做成单项目五步向导。
3. **双栏滥用**：成果与证据同屏只适合深度研判页；列表、今日工作台、设置不应复制同一结构。
4. **移动端不可用**：MiroFish 的核心步骤组件没有窄屏策略，不能把其尺寸直接作为择途规范。
5. **技术语言过载**：API 名、UUID、工具调用和 console 是参考项目的工程气质来源之一，但择途应替换为求职者能理解的证据、来源、更新时间、未知项和行动。

## 9. 对当前产品决定的影响

本研究支持继续以 D“职业决策研究台”为基线，但 D 的本质应被定义为：

> 在同一个职业决策对象上，让可阅读的阶段性判断、可追溯的证据过程和受约束的 AI 顾问持续共存，并随工作阶段改变右侧职责。

这比“黑白、等宽字体、底部 console、双栏”更接近 MiroFish 真正有效的设计。下一轮 Demo 应优先调整对象连续性、阶段反馈、报告与证据的关系、调查完成后的顾问切换，再处理装饰细节。
