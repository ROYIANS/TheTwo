import type { CareerFact, EvidenceItem, MaterialItem, Opportunity } from "./model";

export const demoFacts: CareerFact[] = [
  {
    id: "fact-architecture",
    label: "复杂前端架构与工程化",
    detail: "主导微前端迁移、构建链路治理和跨业务线公共能力落地。",
    status: "confirmed",
    source: "现有简历 + 用户访谈",
  },
  {
    id: "fact-collaboration",
    label: "跨团队技术推进",
    detail: "协调三个业务线分阶段接入，但不承担人员绩效管理。",
    status: "confirmed",
    source: "用户确认",
  },
  {
    id: "fact-management",
    label: "适合正式人员管理岗位",
    detail: "AI 根据“前端负责人”经历推断，和用户确认的职责边界存在冲突。",
    status: "inferred",
    source: "AI 推断，等待处理",
  },
  {
    id: "fact-impact",
    label: "工程化升级的业务结果",
    detail: "已有技术过程，但缺少可以公开核验的效率或业务结果证据。",
    status: "unknown",
    source: "材料缺口",
  },
];

export const opportunity: Opportunity = {
  id: "opp-chengyu-01",
  company: "澄屿科技",
  role: "资深前端工程师 / 前端负责人",
  salary: "35-45K · 14 薪",
  location: "上海",
  source: "招聘平台职位截图",
  sourceUrl: "https://example.invalid/jobs/chengyu-frontend",
  capturedAt: "2026-08-13 09:36",
  direction: "资深前端 / 前端架构",
  rawText:
    "负责核心业务前端架构和工程体系建设，推进跨团队公共能力落地；参与团队建设与技术评审。要求 7 年以上前端经验，熟悉大型工程治理和复杂业务系统。固定工作时间，具体工作方式面议。",
};

export const demoEvidence: EvidenceItem[] = [
  {
    id: "evidence-registry",
    source: "企业登记信息",
    title: "公司主体与经营时间可核验",
    summary: "主体成立 6 年，登记状态正常；公开登记信息与官网主体一致。",
    capturedAt: "2026-08-13 09:48",
    strength: "primary",
    tone: "neutral",
    impact: "降低主体真实性风险，但不能证明团队质量或岗位稳定性。",
    excerpt: "登记主体、注册地址和官网公示主体一致。经营范围覆盖企业软件与数据服务。",
  },
  {
    id: "evidence-site",
    source: "公司官网招聘页",
    title: "官网写明每周可远程两天",
    summary: "官网招聘政策与职位页“固定工作时间”的表述不完全一致。",
    capturedAt: "2026-08-13 09:54",
    strength: "primary",
    tone: "conflict",
    impact: "直接影响用户的工作方式硬约束，需要向招聘方确认实际团队规则。",
    excerpt: "正式员工在试用期后可申请每周不超过两天的远程办公，具体由团队负责人安排。",
  },
  {
    id: "evidence-interview",
    source: "创始人公开访谈",
    title: "当前重点是平台能力与交付效率",
    summary: "岗位强调的工程化方向和公司公开战略一致，但访谈发布时间距今 10 个月。",
    capturedAt: "2026-08-13 10:02",
    strength: "secondary",
    tone: "support",
    impact: "支持岗位并非纯维护岗，但仍需确认团队资源和实际授权。",
    excerpt: "下一阶段将统一多个产品线的研发基础设施，减少重复建设和交付摩擦。",
  },
  {
    id: "evidence-review",
    source: "匿名社区评价",
    title: "出现长期招聘与节奏偏快信号",
    summary: "三条匿名信息提到版本节奏紧，但身份和时间无法完整核验。",
    capturedAt: "2026-08-13 10:08",
    strength: "signal",
    tone: "risk",
    impact: "只能形成待确认问题，不能直接认定存在高强度加班。",
    excerpt: "匿名样本数量有限，描述集中在交付周期和组织变化，未形成可验证事实。",
  },
];

export const materials: MaterialItem[] = [
  {
    id: "material-chengyu",
    kind: "职位截图",
    title: "澄屿科技 · 资深前端工程师",
    source: "招聘平台",
    status: "needs-review",
    time: "今天 09:36",
  },
  {
    id: "material-shoreline",
    kind: "朋友转发",
    title: "岸线云 · 前端平台工程师",
    source: "微信转发",
    status: "parsed",
    time: "昨天",
  },
  {
    id: "material-prism",
    kind: "职位文本",
    title: "折光智能 · 全栈工程师",
    source: "技术社区",
    status: "draft",
    time: "2 天前",
  },
];

export const initialGreeting =
  "您好，我有 8 年复杂前端与偏全栈项目经验，近期主要负责微前端迁移、工程体系治理和跨业务线公共能力落地。贵司岗位强调前端架构与平台能力建设，与我的经历方向比较一致。想进一步了解团队当前的技术目标、实际工作方式，以及该岗位在人员管理上的职责边界。";
