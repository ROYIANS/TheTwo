import type { CareerDirection, CareerFact, EvidenceItem, Opportunity, TraceStep } from "../domain/model";

export const demoResumeText = `林舟
前端工程师 / 前端架构方向

8 年前端与偏全栈经历。负责过 B 端工作台、设计系统和跨团队工程化建设。
曾带领 5 人小组完成前端基础设施重构，推动构建耗时下降 42%。
希望寻找资深前端或前端架构机会，优先上海或混合办公。`;

export const demoFacts: CareerFact[] = [
  { id: "fact-architecture", label: "擅长复杂前端系统与工程化建设", detail: "做过 B 端工作台、设计系统和前端基础设施重构，能处理长期演进而非只交付页面。", source: "简历 · 项目经历", status: "inferred", consequence: "支持资深前端与前端架构方向的匹配判断。" },
  { id: "fact-leadership", label: "带过 5 人小组，但不承担人员绩效管理", detail: "负责拆解技术目标、辅导协作和交付质量；人员绩效与晋升决策由直属主管负责。", source: "简历 + 职业访谈", status: "inferred", consequence: "影响岗位是否需要承担正式人员管理的判断。" },
  { id: "fact-impact", label: "推动构建耗时下降 42%", detail: "通过缓存策略、构建链路拆分和依赖治理，把主仓库平均构建耗时从 7 分钟降到 4 分钟。", source: "项目复盘记录", status: "inferred", consequence: "可作为申请材料中的结果证据。" },
  { id: "fact-constraint", label: "拒绝长期 996，期望薪资不低于 30K", detail: "这是当前不可突破的现实限制，不是 AI 根据职位推断出的偏好。", source: "用户确认", status: "inferred", consequence: "会优先影响机会判断与沟通问题。" },
  { id: "fact-location", label: "优先上海或可接受混合办公", detail: "可以接受每周固定到岗，但需要提前知道实际工作方式和到岗边界。", source: "职业访谈", status: "inferred", consequence: "会影响地点、远程政策和面试反问。" },
];

export const demoDirection: CareerDirection = {
  title: "资深前端 / 前端架构",
  summary: "寻找能参与复杂产品和工程基础设施决策的机会，不把管理人数作为唯一晋升信号。",
  hardConstraints: ["期望薪资不低于 30K", "拒绝长期 996"],
  preferences: ["上海优先", "可接受混合办公", "有架构决策空间"],
};

export const demoOpportunity: Opportunity = {
  id: "opportunity-cy", company: "澄屿科技", role: "资深前端工程师 / 前端负责人", salary: "35-45K · 14 薪", location: "上海 · 资深前端 / 前端架构", direction: "资深前端 / 前端架构", source: "用户粘贴的职位材料", capturedAt: "刚刚带入", description: "负责业务工作台和前端基础设施建设，推动设计系统、性能和跨团队工程协作。",
};

export const demoOpportunityAlternative: Opportunity = {
  id: "opportunity-lh-1",
  company: "临海智造",
  role: "前端架构师",
  salary: "38-48K · 13 薪",
  location: "上海 · 混合办公",
  direction: "前端架构 / 工程平台",
  source: "用户粘贴 · 朋友推荐",
  capturedAt: "今天 11:20",
  description: "负责内部研发平台、前端架构治理和设计系统演进，强调跨团队技术影响力。",
};

export const profileTrace: TraceStep[] = [
  { title: "读取你带入的材料", detail: "保留原文，不把推断写回事实。", input: "简历文本与项目经历", output: "6 段可引用内容" },
  { title: "提取可能的职业事实", detail: "识别职责、行动、结果和边界。", input: "项目经历与访谈回答", output: "5 条候选事实" },
  { title: "标出缺失与冲突", detail: "把不确定的地方留在台面上。", input: "事实之间的关系", output: "2 个待确认项" },
  { title: "等待你的确认", detail: "只有你确认过的事实才会参与后续判断。", input: "候选事实与来源", output: "当前职业上下文" },
];

export const opportunityTrace: TraceStep[] = [
  { title: "读取职位原文", detail: "保留职位语境和来源，不自动访问链接。", input: "公司名、职位描述、来源", output: "原始机会材料" },
  { title: "识别岗位对象", detail: "整理职责、薪资、地点和方向。", input: "职位原文", output: "机会草稿" },
  { title: "标出需要调查的未知", detail: "缺失信息变成下一步问题。", input: "职位字段与职业约束", output: "3 个调查目标" },
];

export const researchTrace: TraceStep[] = [
  { title: "读取职位与职业事实", detail: "检查职责、方向和硬约束是否在同一语境。", input: "机会 + 当前职业上下文", output: "匹配线索" },
  { title: "核对公司与岗位证据", detail: "对照主体信息、官网招聘政策和公开访谈。", input: "公开来源与职位材料", output: "4 条证据" },
  { title: "寻找冲突与未知", detail: "工作方式、人员管理边界和业务结果仍需确认。", input: "证据之间的关系", output: "2 个关键未知" },
  { title: "形成可质疑的建议", detail: "建议只代表当前快照，不替你作决定。", input: "证据 + 事实 + 约束", output: "谨慎投入" },
];

export const demoEvidence: EvidenceItem[] = [
  { id: "evidence-registry", source: "企业登记 · 2024-06", strength: "primary", tone: "neutral", title: "公司主体与经营时间可核验", summary: "主体成立 6 年，登记状态正常，公开登记信息与官网主体一致。", excerpt: "登记主体为澄屿科技（上海）有限公司，成立时间 2018 年。", impact: "支持机会对象是真实主体，但不说明团队工作方式。" },
  { id: "evidence-remote", source: "公司官网 · 一手来源", strength: "primary", tone: "conflict", title: "官网写明每周可远程两天", summary: "官网招聘政策与职位描述中的“固定工作时间”存在语境差异。", excerpt: "正式员工在试用期后可申请每周不超过两天的远程办公，具体由团队负责人安排。", impact: "直接影响你的工作方式硬约束，需要向招聘方确认团队实际规则。" },
  { id: "evidence-stack", source: "职位描述 · 用户材料", strength: "secondary", tone: "support", title: "岗位职责与你的复杂前端经历匹配", summary: "需要设计系统、性能治理和跨团队工程协作。", excerpt: "负责业务工作台与前端基础设施建设，推动设计系统和性能优化。", impact: "支持你在技术深度和工程化方向上的匹配。" },
  { id: "evidence-signal", source: "匿名评价 · 待核实", strength: "weak", tone: "risk", title: "出现长期项目节奏偏快的弱信号", summary: "三条匿名信息提到版本节奏快，但没有足够上下文验证。", excerpt: "“发布节奏比较紧，具体取决于项目阶段。”", impact: "只能转成面试中的工作方式问题，不能升级为公司事实。" },
];

export const agentReplies = {
  default: "我会先把你当前看到的对象和依据分开。现在最值得推进的是：确认实际工作方式，它直接连接你的硬约束和这份机会的下一步。",
  onboarding: "你可以把我当成一个会解释自己判断的协作者。我会先读取你带入的材料，再把候选事实、来源和未知项摆出来，最后由你确认什么能进入职业上下文。",
  research: "当前建议来自 2 条支持信息、1 条冲突信息和 1 个弱信号。它不是结论终点；如果团队实际远程规则不同，建议就应该重新计算。",
};

export const conversationStarter = `我正在考虑下一份工作，但还没有把方向说清楚。\n我更在意什么？哪些限制不能被忽略？`;

export const conversationFacts: CareerFact[] = [
  { id: "conversation-strength", label: "你希望继续做复杂前端与工程化工作", detail: "这是一次访谈中的暂定理解，来自你对下一份工作的描述。", source: "职业访谈 · 待确认", status: "inferred", consequence: "会影响之后带入机会时的方向匹配。" },
  { id: "conversation-constraint", label: "你不想用长期加班换取名义上的成长", detail: "这条限制需要你确认它是不可突破的边界，还是当前更看重的偏好。", source: "职业访谈 · 待确认", status: "inferred", consequence: "会影响机会判断中的工作方式与机会成本。" },
  { id: "conversation-location", label: "你愿意优先考虑上海或混合办公", detail: "具体到岗频率和城市边界还没有被确认。", source: "职业访谈 · 待确认", status: "inferred", consequence: "会影响职位地点、远程规则和沟通问题。" },
];

export const demoCommunication = {
  summary: "你好，我正在了解这个岗位的实际工作方式。想先确认团队每周到岗安排、岗位是否承担正式人员管理，以及当前最重要的技术目标。",
  questions: ["团队每周实际到岗几天？试用期前后是否不同？", "这个岗位是否承担正式绩效与晋升管理？", "入职后 3 个月最希望解决的技术问题是什么？"],
};

export const demoApplication = {
  materials: ["资深前端 / 前端架构定位版", "构建耗时下降 42% 的项目证据", "首轮沟通草稿"],
  followUp: "3 个工作日后回看是否收到真实回应",
};

export const demoInterview = {
  title: "技术负责人初面",
  scheduledAt: "周五 14:00",
  purpose: "验证岗位是否真的有架构决策空间，以及团队实际工作方式。",
  prompts: ["讲清一次基础设施重构中的取舍", "追问技术目标与授权边界", "确认远程规则和绩效责任"],
};

export const demoOffer = {
  summary: "资深前端负责人 · 35-45K · 14 薪",
  terms: ["上海 · 每周远程两天（待确认）", "负责设计系统与前端基础设施", "正式管理职责仍需确认"],
};

export const demoOutcome = {
  title: "这次机会没有继续",
  detail: "面试后对方确认岗位需要长期高强度到岗，与你当前硬约束冲突。",
  learning: "工作方式是高价值的早期筛选问题，应该在下一份机会研究中提前确认。",
};
