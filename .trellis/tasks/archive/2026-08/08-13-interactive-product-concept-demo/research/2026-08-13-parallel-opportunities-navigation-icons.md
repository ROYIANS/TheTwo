# 多机会、生命周期导航与图标系统调研

## 结论摘要

当前原型的机会及其研究、决定和生命周期事件全部是 `DemoState` 上的单例字段。支持并行机会需要把这些字段收敛为以 `opportunityId` 为边界的机会工作区对象，并新增当前机会引用；只增加一个“新建机会”按钮无法解决状态串联问题。

产品文档已经确认少量机会比较的边界：按一致维度并排呈现收益、风险、机会成本、未知项和建议，不产生自动综合排名、黑盒分数或唯一最优答案。首版适合支持选择两个或三个机会比较，不适合引入求职 CRM 看板。

截图中的对象链已经证明，长生命周期不适合使用固定宽度横向节点导航。建议改为无滚动的“当前对象摘要 + 紧凑历史轨迹”：当前对象和下一动作占主要位置，已经发生的对象以等分或自动换行的紧凑按钮展示；桌面不出现内部滚动，移动端按时间顺序纵向排列。

当前原型全局使用的是 `lucide-react`，共十个直接导入点，没有混用 Remix Icon。候选包均可用于 React，但工程和视觉取向不同。

## 多机会模型建议

建议将机会的持续状态收敛为一个领域对象：

```ts
interface OpportunityWorkspace {
  opportunity: Opportunity;
  research: ResearchState;
  lifeStage: LifeStage;
  decision: UserDecision;
  decisionRecord: UserDecisionRecord | null;
  communication: CommunicationEvent | null;
  application: ApplicationEvent | null;
  interviewEvent: InterviewEvent | null;
  offer: OfferRecord | null;
  outcome: OutcomeRecord | null;
  strategyUpdate: string | null;
  selectedEvidenceId: string | null;
}
```

顶层状态保存 `opportunities` 和 `activeOpportunityId`。所有机会动作必须明确更新当前机会工作区，切换机会只改变引用，不复制或重置其他机会的数据。

原型首版建议预置两个不同阶段的虚构机会，并允许通过现有材料接入流程继续创建机会。这样可以真实验证新建、切换、独立推进和比较，而不是仅展示一个静态列表。

## 机会集合与比较建议

机会集合页采用工作台式列表，不采用看板。每个机会至少展示：

* 公司与职位；
* 当前建议或尚未研究状态；
* 当前生命周期对象；
* 一个主要风险或未知项；
* 下一动作；
* 进入机会和加入比较的操作。

比较视图最多并排三个机会，使用下列一致维度：

* 当前建议；
* 硬约束与明显冲突；
* 能力与目标匹配；
* 回报与机会成本；
* 关键支持证据；
* 风险、冲突与未知项；
* 当前进展；
* 下一动作。

比较不显示综合分数、排名或“最佳机会”标签。用户决定仍分别保存在各机会中。

## 生命周期导航建议

建议用以下组合替换横向滚动对象链：

1. 当前对象摘要：显示当前阶段名称、状态说明和已发生对象数量。
2. 紧凑历史轨迹：所有已发生对象在同一稳定容器内展示，桌面使用等分网格或自动换行，移动端使用单列时间线。
3. 当前对象采用明显但克制的选中态；历史对象可以点击回看。
4. 轨迹本身不得设置 `overflow-x: auto` 或固定高度的 `overflow-y`。
5. 未来对象不预先展示，保持现有对象驱动原则。

## 图标包比较

### Phosphor Icons

* React 包：`@phosphor-icons/react` `2.1.10`。
* 许可证：MIT。
* 支持 tree shaking、React `IconContext`、统一尺寸和全局权重。
* 提供 `thin / light / regular / bold / fill / duotone` 多种权重，抽象业务语义覆盖完整。
* 当前使用的箭头、勾选、圆点、文件、对话、上传、日历、Sparkle、Brain、发送、Briefcase、Database、Plus、Question、Clipboard、Clock、Link 和关闭均有直接对应。
* 风险：包解压体积约 33 MB；主入口包含大量模块，Vite 需要确认开发和构建性能。视觉认知度较高，不如 Iconoir 稀有。

推荐使用方式：全局 `regular` 权重，正文和按钮图标以 `16px` 为主，重要对象标记使用 `20px`；仅在明确的选中/完成状态使用 `fill` 或 `bold`，不在同一界面混用多种装饰权重。

### Iconoir

* React 包：`iconoir-react` `7.12.1`。
* 许可证：MIT。
* 约 1300 枚 24x24 图标，默认描边 `1.5`，支持 `IconoirProvider` 统一 SVG 属性。
* 包解压体积约 6.4 MB，视觉更纤细、冷静，和当前编辑化、低饱和工作台非常协调。
* 当前关键语义也有直接对应，包括 `BrainResearch`、`Sparks`、`PasteClipboard`、`ChatBubbleQuestion` 等。
* 风险：图标覆盖面小于 Phosphor，未来扩展到更多业务对象时更可能遇到近义替代；只提供 regular/solid 两类主要输出，状态层级变化能力较弱。

推荐使用方式：全局 `1.5` 描边，按钮和列表 `16px`，对象入口 `20px`；solid 只用于当前选中状态。

### Hugeicons

* React 渲染包：`@hugeicons/react` `1.1.9`；免费资产包：`@hugeicons/core-free-icons` `4.2.3`。
* 两个包均标注 MIT；免费包提供数千枚 Stroke Rounded 图标。
* React 渲染器很小，但免费图标资产包解压体积约 83 MB，并采用 `HugeiconsIcon` 加独立图标数据的双包 API。
* Pro 版本提供更多样式，但需要单独商业许可。
* 对当前原型而言，依赖结构和资产规模带来的复杂度高于实际收益，本轮不推荐。

## 推荐

如果优先考虑长期业务语义覆盖和低迁移风险，选择 Phosphor；如果优先考虑更少见、更纤细的视觉气质，选择 Iconoir。

综合当前原型已经覆盖 AI 研究、证据、职业事实、多机会比较和完整生命周期，推荐 **Phosphor Icons**。它更适合建立长期统一的语义图标系统；通过限制为 regular 权重和两级尺寸，可以保留当前界面的克制感，避免变成展示型图标界面。

## 依据

* `docs/product/product-capability-map.md` 的“少量机会并排比较”；
* `docs/product/mvp-experience-backbone.md` 的“少量机会比较”；
* `prototype/src/domain/model.ts` 与 `prototype/src/app/state.ts` 的当前单例机会状态；
* `prototype/src/components/ui.tsx` 的当前横向 `ObjectTrail`；
* npm 包元数据和各项目官方 README，核对日期为 2026-08-13。
