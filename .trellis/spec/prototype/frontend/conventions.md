# 原型前端约定

## 工程边界

原型使用 React + TypeScript + Vite 组织，入口位于 `prototype/`。应用只使用本地虚构数据和内存状态，不调用网络、模型、数据库或第三方平台。依赖和脚本服务于原型迭代，不构成生产选型。

参考：当前任务 PRD 与此前概念 Demo [prd.md](../../../tasks/archive/2026-08/08-12-system-concept-demo/prd.md)。

## 状态与对象连续性

* 当前对象、局部阶段、观察模式和用户决定属于同一份 React 状态；对象间跳转不应丢失当前机会和阶段。
* 原型登录态、Agent 对话和求职生命周期状态同样使用内存状态；退出登录返回登录入口，刷新恢复默认示例。
* 交互动作必须更新可见状态或给出清晰反馈，不能只做无效按钮。
* 用户实际输入必须参与后续派生状态。文件、职位和访谈输入不得在未说明时被固定案例替换；样例数据只能由“使用演示材料”一类显式动作带入。原型无法真实处理的格式应明确拒绝并给出可继续路径，不能伪装为读取成功。
* 原型采用对象驱动导航：默认从“今天”的主任务进入机会、职业事实、面试等真实对象；深层视图提供局部返回，不增加常驻空间菜单、header 或侧栏。
* 页面、当前机会或机会生命周期对象发生切换时，窗口滚动位置回到顶部；全屏工作台打开时可以临时锁定 `body` 滚动，但关闭或卸载时必须恢复原值。
* 用户确认的新事实必须进入当前有效上下文；与之冲突的 AI 推断必须退出下游判断，不能同时保持有效。
* 系统建议与用户决定分开保存和呈现；用户覆盖建议不能改写历史建议。
* 审核状态必须绑定到它审核的内容版本。修改简历字段时撤销事实与定位审核，修改沟通草稿时撤销沟通审核，同时清除旧导出标记；已记录的申请事件锁定当时的材料、审核和决定，不能继续原地改写。
* 事实、AI 推断、未知、证据和风险使用明确标签与语义色，不依赖颜色单独传达含义。

### 并行机会工作区

* 多个机会使用 `opportunities + activeOpportunityId` 表达；研究、证据、建议、用户决定、沟通、申请、面试、Offer、结果和策略回写必须属于具体机会工作区，不能回退为顶层单例状态。
* 所有机会生命周期动作先解析当前工作区，再只更新匹配 `activeOpportunityId` 的条目；切换机会不得复制或清空其他机会的局部状态。
* 机会比较只并排呈现已有快照和未知项，不生成综合分、自动排名或虚构结论；尚未完成研究的维度明确显示“待研究”或“尚未形成判断”。

```typescript
interface DemoState {
  opportunities: OpportunityWorkspace[];
  activeOpportunityId: string | null;
  compareOpportunityIds: string[];
}
```

审核失效应由 reducer 统一执行，不能只在页面局部清空视觉勾选：

```typescript
const invalidReviewIds = field === "communication"
  ? ["communication"]
  : ["facts", "positioning"];

reviewItems.map((item) =>
  invalidReviewIds.includes(item.id) ? { ...item, checked: false } : item,
);
```

## 组件和样式

* 页面级结构使用语义 HTML；交互控件优先使用 `button`、`nav`、`main`、`aside`、`section`、`fieldset` 等原生元素。
* 图标按钮必须有 `aria-label` 或可见文字；焦点状态使用 `:focus-visible`，触摸目标不小于 44px。
* 视觉隐藏的表单控件必须显式收敛尺寸。复选框若同时命中通用 `input { width: 100% }` 和 `position: absolute`，会以视口为包含块制造页面级横向溢出；隐藏时设置 `width/height: 1px` 与 clip，并在外层标签补回 `:focus-visible` 焦点样式。
* 移动端抽屉或浮层必须提供可见关闭操作，并支持 `Escape` 关闭。
* 纯 CSS 负责布局与视觉，避免把内容全部包成圆角卡片；不要使用卡片嵌套、玻璃拟态、发光和紫蓝渐变。
* 样式按 `styles.css`、`styles/product-interaction-overrides.css`、`styles/visual-redesign.css` 的顺序叠加。修改共享控件时必须同时检查基础选择器与最终覆盖层，并验证默认、悬停、焦点、禁用的 computed style；不能只看后加载文件。局部选择器可能比共享类更具体，主要操作需显式保持成对的前景色和背景色。
* 重排现有响应式网格时，除了覆盖 `grid-template-columns`，还要检查旧断点是否给子项留下显式 `grid-column` / `grid-row`。若结构语义已改变，在最终断点同时重置为 `auto`，否则正文可能继续落入旧图标列并逐字换行。
* 运营型工作台使用固定字体层级和稳定网格；移动端重排信息优先级，而不是单纯缩小桌面两栏。
* 不使用英文眉题、序号或产品内部代号作为装饰。保留的标签必须帮助用户理解当前状态、对象或下一动作。
* AI 操作必须呈现当前上下文、执行步骤、完成状态和结果。Agent 不使用全局浮动入口；只在职业事实、机会研究、申请决策包和面试事件中提供与当前动作对应的就地入口。
* Agent 对话采用全宽底部工作台，展示当前档案、工作记录、可读取对象和建议动作；不得回退为右侧聊天抽屉、连续气泡或泛化“问 AI”入口。底部工作台复用同一机会的消息上下文，支持 `Escape` 和可见关闭操作。
* AI 解释使用可验证的输入对象、证据、公开假设、中间产物和待确认项；不要在界面中展示或伪造模型私有思维链。
* 会改变职业事实、建议、用户决定或外部行动的交互必须保留可回看/可更正路径；新信息生成新建议版本，不无痕改写旧决定。
* 动画只表达进入、状态变化和反馈，并尊重 `prefers-reduced-motion`。
* 生命周期历史不得使用嵌套横向或纵向滚动容器。采用“当前对象摘要 + 历史网格”：宽桌面单行网格、中宽视口自动换行、手机单列；完整七对象链必须保持 `scrollWidth === clientWidth` 且 `scrollHeight === clientHeight`。
* 原型全局使用 `@phosphor-icons/react`，通过根级 `IconContext` 保持默认 `regular` 权重；按钮和正文图标以 `16px` 为主，重要对象图标可以使用 `20px`，只有当前或完成状态使用 `fill`/`bold`。不得混入 Lucide、Remix Icon 或其他图标依赖。

### 共享按钮

`prototype/src/components/Button.tsx` 是原型内原生按钮的唯一出口。业务组件不得直接声明 `<button>`；必须按动作语义选择 `primary`、`ghost`、`danger`、`quiet`、`icon` 或 `plain`。`plain` 只用于对象节点、分段控件、遮罩等由局部结构完整负责外观的交互表面，不能用来绕过统一按钮状态。

```tsx
type ButtonTone = "primary" | "ghost" | "danger" | "quiet" | "icon" | "plain";
type ButtonSize = "small" | "medium" | "large" | "icon";

<Button tone="primary" size="large">进入本地演示</Button>
<Button tone="danger">退出本次体验</Button>
<Button tone="icon" aria-label="关闭提示"><XIcon size={14} /></Button>
```

非 `plain` 按钮的触摸高度不得低于 `44px`，`large` 保持至少 `48px`。共享按钮样式最后加载，并用足够明确的选择器守住尺寸、焦点、禁用和按压状态，因为旧页面中的 `.object-links button`、`.fact-actions .button-primary` 等局部规则可能具有更高 specificity。验证时必须遍历可见按钮，检查 `data-button-tone`、computed height、横向溢出和控制台错误；只搜索组件调用或只看共享 CSS 不算完成。

```css
button.app-button:not(.app-button-plain) { min-height: 44px; }
button.app-button.app-button-large:not(.app-button-plain) { min-height: 48px; }
```

### 未认证融合首页

未认证状态同时承担产品方向说明和唯一所有者入口，不再维护与产品视觉割裂的通用登录卡片或独立营销页。

* `App.tsx` 的 `state.authenticated` 仍是原型登录态唯一真相；融合首页只接收 `onLogin`，不能另建局部认证状态、假密码表单或注册流程。
* 页面明确表达“独立部署、一个实例、一个所有者”，不得出现公开注册、邀请成员、账号切换、团队空间或多人隔离暗示。
* 原型没有真实认证、持久化和外部服务时，入口附近必须直接说明本地演示边界；产品方向可以描述正式目标，但不能把目标写成已实现能力。
* 首屏同时放置品牌、产品定义、主要入口和实际工作流预览；移动端在首屏底部露出后续预览内容，不把所有信息压缩成一张卡片。
* 落地叙事与登录后的职业档案工作台共用色彩 token、衬线标题、线性分隔和物理按钮语汇，不复制参考项目的品牌资产或组件体系。
* 落地页使用 `var(--font-serif)` 时，必须在根 token 层提供完整中文衬线字体栈。未定义的自定义属性会让命中的 `font-family` 在 computed-value 阶段失效，并直接继承全局 sans-serif，而不会回退到同一元素更早的 serif 声明；验收必须读取 computed `font-family`，不能只检查 CSS 源码。
* 工程纸影响只保留为结构方法：Hero 可以使用低对比线性边轨，研究预览可以使用一层局部网格。同一区域最多一种主导纹样，不得满屏铺纹理或添加伪坐标、伪读数、内部代号。
* 未认证首页不使用菱形节点、条码刻线、斜线舱壁或独立点阵，以免复制参考项目的品牌符号并造成装饰堆叠。
* SVG pattern id 必须由 `useId()` 派生；所有纯装饰图案使用 `aria-hidden`、`pointer-events: none` 和现有颜色 token。复杂 rails 只在宽桌面显示，中小屏收敛为普通边线和局部网格。
* 未认证首页的 Header 继承冷苔绿画布、纸面和墨色 token，不单独引入偏粉或暖红底色。
* 首页叙事保持有限：首屏之后只保留工作方式、合并后的产品边界和简短收尾。相同承诺和主要入口不得在多个同权重区块中重复。

```tsx
// Good: 状态仍由根 reducer 管理，首页只负责表达与触发进入。
if (!state.authenticated) return <LoginScreen onLogin={login} />;

// Bad: 首页虚构第二套账号能力或多人入口。
<LoginScreen onRegister={register} onInviteMember={inviteMember} />
```

```tsx
// 图案 id 在同页多实例下仍保持唯一，装饰不进入可访问性树。
const id = useId().replace(/:/g, "");
return <svg aria-hidden className="landing-pattern"><pattern id={id} /></svg>;
```

验证至少覆盖 `1440px` 桌面、约 `820px` 平板和 `390px` 移动视口：`scrollWidth === clientWidth`、主入口触摸高度不小于 `44px`、控制台无错误，并完成“首页 -> onboarding -> 退出回首页”闭环。桌面截图必须确认 Header 与主色一致、Hero 层级清楚且没有菱形装饰；平板与移动截图必须确认复杂 rails 已隐藏且局部网格没有遮挡正文。

## 视觉语言

* 原型采用“职业档案工作台”而非“AI 助手”视觉：冷苔绿色画布、冷白纸面、墨色正文和编辑式宋体标题构成基础，蓝色用于档案注脚与信息关系。
* `--primary` / `--primary-dark` / `--primary-soft` 负责主要行动、当前对象和完成路径；coral / risk 色只用于风险、冲突、待确认后果和退出等语义，不再贯穿标题、CTA、焦点与 Agent。
* 警告、风险等大面积状态表面从 `--canvas` / `--paper` 混入少量语义色，主要语义信号放在顶线、圆点、标签和文字，不直接铺高饱和色。正文和控件文字仍需达到适用的对比度要求。
* 通过顶部分隔线、页边线、纸面密度和非对称留白区分主档案、侧注、证据和决定。阴影只保留给少数真实纸张或导入表面，不给每个 section 相同的卡片和阴影。
* 标题字号使用稳定的断点值，不用 `vw` 随视口连续缩放；紧凑状态可以使用 pill，命令按钮保持方正、清晰，不把所有操作做成圆角胶囊。
* 全局滚动条继承档案工作台配色：轨道使用 canvas/line，滑块使用 muted，悬停切换 primary；同时提供标准 `scrollbar-color` / `scrollbar-width` 和 WebKit 伪元素实现，不使用圆润胶囊滑块。
* 上下文 Agent 入口使用统一 `AgentContextEntry`，但标题和说明必须对应当前动作，例如“核对事实”“追问研究”“检查申请材料”“准备面试”。

```tsx
<AgentContextEntry
  label="追问这份研究"
  detail="让证据、冲突和未知留在同一个判断现场。"
  context={`${opportunity.company} · 机会研究`}
  onOpen={onOpenAgent}
/>
```

```css
/* 状态表面保留语义，但服从冷灰纸面基底。 */
--yellow-soft: color-mix(in oklch, var(--canvas) 97%, var(--yellow));
--risk-soft: color-mix(in oklch, var(--paper) 98%, var(--risk));

.fact-edit .button-primary {
  background: var(--primary);
  color: #f5f7f3;
}

.button-primary:not(:disabled):hover {
  background: var(--primary-dark);
  color: #f5f7f3;
}
```

```css
/* 改写旧响应式网格时，同时清除上一版的显式放置坐标。 */
.workflow-detail,
.workflow-icon {
  grid-column: auto;
  grid-row: auto;
}
```

## 文案风格约定

### 基调

原型界面的所有静态文本（标题、描述、说明文字、按钮文字、Agent 回复）遵循 A 型冷静叙事基调：

* **短句为主**，节奏有呼吸感，长短句交织。不堆叠四字短语。
* **克制**，不命名情绪，不说教。删掉"只有……才能……""系统会……"式的告诫语气。
* **具体不抽象**：用"3 条事实"，不用"职业上下文"；用"这份机会"，不用"当前对象"。
* **留白**：不过度解释，信任用户能理解。

### 禁止模式

| 模式 | 原因 |
|------|------|
| "只有你确认的事实才会参与后续判断" | 告诫语气，有 AI 腔 |
| "AI 会为你……""系统会……" | 过度解释自身，AI 腔 |
| 四字短语连排（"信息架构输出"类） | 生硬，无人情味 |
| 连续祈使句开头（"请先……""请确认……"） | 像表单，不像对话 |

### 按钮文字

按钮保持功能清晰。标题和描述文学感优先，按钮不必追求文学性，但不要用"确认提交""点击完成"这类冗余词。

### Agent 回复

对话体、口语、有停顿感。像真人在说话，不像输出报告。可以用"嗯""好"开头，允许短句停顿。

## 验证

验证必须覆盖：登录/退出、首屏、空间切换、生命周期切换、AI 分析过程、Agent 对话、阶段推进、证据选择、材料审核、用户决定、刷新默认状态、键盘焦点和移动端布局。模拟边界通过登录说明或具体操作反馈表达，不使用固定警示横幅。
