import type {
  ApplicationPackage,
  AsyncStatus,
  AppView,
  CareerDirection,
  CareerFact,
  DemoState,
  EvidenceItem,
  LifeStage,
  Opportunity,
  OpportunityWorkspace,
  UserDecision,
} from "../domain/model";
import {
  conversationFacts,
  demoApplication,
  demoApplicationPackage,
  demoDirection,
  demoFacts,
  demoInterview,
  demoOffer,
  demoOutcome,
} from "../data/demo-content";

export type AppAction =
  | { type: "login" }
  | { type: "logout" }
  | { type: "set-view"; view: AppView }
  | { type: "set-name"; name: string }
  | { type: "show-resume" }
  | { type: "restart-onboarding" }
  | { type: "start-conversation" }
  | { type: "set-profile-material"; source: "file" | "sample"; name: string; text: string }
  | { type: "clear-profile-material" }
  | { type: "set-profile-conversation"; text: string }
  | { type: "start-profile-analysis" }
  | { type: "advance-profile-analysis" }
  | { type: "cancel-profile-analysis" }
  | { type: "confirm-fact"; id: string }
  | { type: "reject-fact"; id: string }
  | { type: "update-fact"; id: string; detail: string }
  | { type: "open-direction" }
  | { type: "edit-direction" }
  | { type: "confirm-direction"; direction: CareerDirection }
  | { type: "load-opportunity" }
  | { type: "set-opportunity-input"; field: "text" | "source" | "capturedAt"; value: string }
  | { type: "start-opportunity-parse" }
  | { type: "advance-opportunity-parse" }
  | { type: "cancel-opportunity-parse" }
  | { type: "update-opportunity-draft"; field: keyof Opportunity; value: string }
  | { type: "confirm-opportunity" }
  | { type: "select-opportunity"; id: string; view?: AppView }
  | { type: "toggle-compare-opportunity"; id: string }
  | { type: "start-research" }
  | { type: "advance-research" }
  | { type: "set-life-stage"; stage: LifeStage }
  | { type: "set-evidence"; id: string }
  | { type: "add-opportunity-note"; text: string }
  | { type: "start-application-package" }
  | { type: "advance-application-package" }
  | { type: "cancel-application-package" }
  | { type: "create-communication" }
  | { type: "update-application-text"; field: "title" | "headline" | "summary" | "experience" | "communication"; value: string }
  | { type: "toggle-application-review"; id: string }
  | { type: "mark-application-exported" }
  | { type: "set-decision"; decision: Exclude<UserDecision, null>; reason: string }
  | { type: "record-application" }
  | { type: "create-interview" }
  | { type: "record-interview"; notes: string }
  | { type: "create-offer" }
  | { type: "create-outcome" }
  | { type: "record-strategy-update" }
  | { type: "set-lifecycle-note"; note: string }
  | { type: "add-agent-user"; contextId: string; text: string };

const asyncIdle = (): { status: AsyncStatus; step: number } => ({ status: "idle", step: 0 });

export const initialState: DemoState = {
  authenticated: false,
  view: "onboarding",
  setupStep: "welcome",
  userName: "",
  profileMaterial: { source: null, name: "", text: "" },
  facts: [],
  direction: null,
  opportunities: [],
  activeOpportunityId: null,
  compareOpportunityIds: [],
  opportunityInput: { text: "", source: "", capturedAt: "刚刚" },
  opportunityDraft: null,
  profileAnalysis: asyncIdle(),
  opportunityParse: asyncIdle(),
  agentThreads: {},
};

function createWorkspace(opportunity: Opportunity): OpportunityWorkspace {
  return {
    opportunity: { ...opportunity },
    research: { ...asyncIdle(), evidence: [] },
    lifeStage: "discover",
    decision: null,
    decisionRecord: null,
    applicationPackage: null,
    communication: null,
    application: null,
    interviewEvent: null,
    offer: null,
    outcome: null,
    strategyUpdate: null,
    selectedEvidenceId: null,
    lifecycleNote: null,
    contextNotes: [],
  };
}

function updateActiveOpportunity(state: DemoState, update: (workspace: OpportunityWorkspace) => OpportunityWorkspace): DemoState {
  if (!state.activeOpportunityId) return state;
  return { ...state, opportunities: state.opportunities.map((workspace) => workspace.opportunity.id === state.activeOpportunityId ? update(workspace) : workspace) };
}

function updateOpportunityById(state: DemoState, id: string, update: (workspace: OpportunityWorkspace) => OpportunityWorkspace): DemoState {
  return { ...state, opportunities: state.opportunities.map((workspace) => workspace.opportunity.id === id ? update(workspace) : workspace) };
}

function opportunityDraftFromInput(state: DemoState): Opportunity {
  const text = state.opportunityInput.text.trim();
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const unlabeledLines = lines.filter((line) => !/^(公司(?:名称)?|职位|岗位|薪资|薪酬|地点|工作地点|办公地点)\s*[：:]/.test(line));
  const company = labeledValue(text, ["公司名称", "公司"]) || unlabeledLines[0] || "待确认公司";
  const role = labeledValue(text, ["职位", "岗位"]) || unlabeledLines[1] || "待确认职位";
  const salary = labeledValue(text, ["薪资", "薪酬"]) || text.match(/\d{1,3}\s*[-~至]\s*\d{1,3}\s*[kK千]/)?.[0] || "待确认";
  const location = labeledValue(text, ["工作地点", "办公地点", "地点"]) || text.match(/上海|北京|深圳|广州|杭州|苏州|成都|南京|武汉|西安|重庆|远程|混合办公/)?.[0] || "待确认";
  const descriptionLines = unlabeledLines.filter((line) => line !== company && line !== role);
  return {
    id: "opportunity",
    company,
    role,
    salary,
    location,
    direction: state.direction?.title ?? "待绑定当前方向",
    source: state.opportunityInput.source.trim() || "用户手动带入",
    capturedAt: state.opportunityInput.capturedAt.trim() || "刚刚",
    description: descriptionLines.join(" ") || text,
  };
}

function applicationPackageFor(state: DemoState, workspace: OpportunityWorkspace): ApplicationPackage {
  const confirmed = state.facts.filter((fact) => fact.status === "confirmed");
  const direction = state.direction;
  const candidate = state.userName || "候选人";
  const resumeFacts = confirmed.slice(0, 4);
  const factSummary = resumeFacts.slice(0, 2).map((fact) => fact.detail).join("；") || "当前已确认职业事实仍需继续补充";
  const questions = [
    `职位标注的薪资“${workspace.opportunity.salary}”中，固定、浮动与试用期口径分别是什么？`,
    `实际办公地点和每周到岗安排是否与“${workspace.opportunity.location}”一致？`,
    `入职后 3 个月，${workspace.opportunity.role}最需要解决的问题是什么？`,
  ];
  return {
    ...demoApplicationPackage,
    status: "running",
    step: 0,
    resume: {
      title: `${candidate}｜${workspace.opportunity.role}｜${workspace.opportunity.company}定制版`,
      headline: `${direction?.title ?? workspace.opportunity.direction}｜面向 ${workspace.opportunity.role}`,
      summary: `${direction?.summary ?? "围绕当前方向整理已确认经历。"} 针对 ${workspace.opportunity.company} 的 ${workspace.opportunity.role}，本版重点呈现：${factSummary}。`,
      experience: resumeFacts.length ? resumeFacts.map((fact) => `${fact.label}\n- ${fact.detail}\n- 事实来源：${fact.source}`).join("\n\n") : "尚无足够的已确认事实，请先回到职业事实源补充。",
    },
    communicationDraft: `你好，我是${candidate}，正在了解贵司的${workspace.opportunity.role}。我当前关注的方向是“${direction?.title ?? workspace.opportunity.direction}”，与岗位最相关的已确认经历包括：${resumeFacts.slice(0, 2).map((fact) => fact.label).join("、") || "待进一步说明的职业经历"}。在继续沟通前，想先确认实际工作方式、薪资口径和入职后的首要目标。`,
    emphasis: resumeFacts.slice(0, 3).map((fact) => `${fact.label}：${fact.detail}`),
    boundaries: [
      `只使用当前 ${confirmed.length} 条已确认职业事实，不把待确认推断写入对外材料`,
      "不把协作或技术带队自动表述为正式人员管理经验",
      "薪资、工作方式和岗位职责仍以招聘方真实回复为准",
    ],
    risks: [
      ...(direction?.hardConstraints.slice(0, 2).map((item) => `硬约束“${item}”仍需用招聘方真实信息核验`) ?? []),
      "当前研究包含模拟公开证据，正式行动前仍需核验来源和时效",
    ],
    questions,
    reviewItems: demoApplicationPackage.reviewItems.map((item) => ({ ...item })),
    exportedAt: null,
  };
}

function evidenceFor(state: DemoState, workspace: OpportunityWorkspace): EvidenceItem[] {
  const opportunity = workspace.opportunity;
  const confirmed = state.facts.filter((fact) => fact.status === "confirmed");
  const constraint = state.direction?.hardConstraints[0] ?? "当前工作条件";
  const matchingFact = confirmed[0]?.detail ?? "职业事实仍需继续确认";
  return [
    { id: `${opportunity.id}-evidence-registry`, source: "模拟企业登记快照", strength: "primary", tone: "neutral", title: `${opportunity.company} 的主体信息形成待核验快照`, summary: "当前原型保留一条模拟主体核验结果，用于体验证据分层和回看。", excerpt: `本次模拟调查将“${opportunity.company}”识别为当前机会主体；正式产品需要连接真实登记来源。`, impact: "支持继续调查该机会，但不能替代真实主体核验。" },
    { id: `${opportunity.id}-evidence-workstyle`, source: "职位材料 · 用户输入", strength: "primary", tone: "conflict", title: "工作地点与方式仍需确认", summary: `当前材料记录为“${opportunity.location}”，但没有足够信息说明实际到岗安排。`, excerpt: `职位材料中的地点 / 工作方式：${opportunity.location}。`, impact: `直接连接你的硬约束“${constraint}”，需要向招聘方确认。` },
    { id: `${opportunity.id}-evidence-match`, source: "职位描述 · 用户材料", strength: "secondary", tone: "support", title: "岗位要求与已确认经历存在可讨论的连接", summary: `当前方向为“${opportunity.direction}”，系统找到至少一条已确认职业事实参与匹配。`, excerpt: opportunity.description, impact: `当前最相关的事实线索是：${matchingFact}` },
    { id: `${opportunity.id}-evidence-signal`, source: "模拟公开评价信号", strength: "weak", tone: "risk", title: "团队节奏与管理边界仍是弱信号", summary: "模拟公开信息不足以形成公司事实，只能转成后续待问问题。", excerpt: "当前没有经过真实来源核验的团队节奏与管理边界信息。", impact: "不能据此下结论，应保留为面试和沟通中的验证问题。" },
  ];
}

function labeledValue(text: string, labels: string[]) {
  return text.match(new RegExp(`(?:${labels.join("|")})\\s*[：:]\\s*([^\\n]+)`, "i"))?.[1]?.trim() ?? "";
}

function beginApplicationPackage(state: DemoState, active: OpportunityWorkspace | null): DemoState {
  if (!active || active.research.status !== "done") return state;
  return {
    ...updateActiveOpportunity(state, (workspace) => ({
      ...workspace,
      applicationPackage: workspace.applicationPackage?.status === "done" ? workspace.applicationPackage : applicationPackageFor(state, workspace),
    })),
    view: "application",
  };
}

export function appReducer(state: DemoState, action: AppAction): DemoState {
  const active = currentOpportunityWorkspace(state);
  switch (action.type) {
    case "login": return { ...state, authenticated: true, view: "onboarding", setupStep: "welcome", agentThreads: {} };
    case "logout": return { ...initialState };
    case "set-view": return { ...state, view: action.view };
    case "set-name": return { ...state, userName: action.name };
    case "show-resume": return { ...state, profileMaterial: { source: null, name: "", text: "" }, profileAnalysis: asyncIdle(), setupStep: "import", view: "onboarding" };
    case "restart-onboarding": return { ...state, setupStep: "welcome", view: "onboarding", profileMaterial: { source: null, name: "", text: "" }, profileAnalysis: asyncIdle() };
    case "start-conversation": return { ...state, profileMaterial: { source: "conversation", name: "职业访谈", text: "" }, profileAnalysis: asyncIdle(), setupStep: "interview", view: "onboarding" };
    case "set-profile-material": return { ...state, userName: state.userName || candidateName(action.text), profileMaterial: { source: action.source, name: action.name, text: action.text } };
    case "clear-profile-material": return { ...state, profileMaterial: { source: null, name: "", text: "" }, profileAnalysis: asyncIdle() };
    case "set-profile-conversation": return { ...state, profileMaterial: { source: "conversation", name: "职业访谈", text: action.text } };
    case "start-profile-analysis": return state.profileMaterial.text.trim() ? { ...state, setupStep: "profile-analysis", profileAnalysis: { status: "running", step: 0 } } : state;
    case "advance-profile-analysis": {
      const next = state.profileAnalysis.step + 1;
      if (next >= 4) {
        const sourceFacts = factsFromProfileMaterial(state);
        const facts = sourceFacts.map((fact) => ({ ...fact, source: state.profileMaterial.name ? `${state.profileMaterial.name} · ${fact.source}` : fact.source }));
        return { ...state, setupStep: "facts", profileAnalysis: { status: "done", step: 3 }, facts };
      }
      return { ...state, profileAnalysis: { status: "running", step: next } };
    }
    case "cancel-profile-analysis": return { ...state, setupStep: state.profileMaterial.source === "conversation" ? "interview" : "import", profileAnalysis: asyncIdle() };
    case "confirm-fact": return { ...state, facts: state.facts.map((fact) => fact.id === action.id ? { ...fact, status: "confirmed" } : fact) };
    case "reject-fact": return { ...state, facts: state.facts.map((fact) => fact.id === action.id ? { ...fact, status: "rejected" } : fact) };
    case "update-fact": return { ...state, facts: state.facts.map((fact) => fact.id === action.id ? { ...fact, detail: action.detail, status: "confirmed", source: `${fact.source} · 用户修正` } : fact) };
    case "open-direction": return { ...state, setupStep: "direction" };
    case "edit-direction": return { ...state, view: "onboarding", setupStep: "direction" };
    case "confirm-direction": return { ...state, direction: { ...action.direction, hardConstraints: [...action.direction.hardConstraints], preferences: [...action.direction.preferences] }, setupStep: "ready", view: "today" };
    case "load-opportunity": return { ...state, opportunityInput: { text: "", source: "", capturedAt: "刚刚" }, opportunityDraft: null, opportunityParse: asyncIdle(), view: "opportunity-intake" };
    case "set-opportunity-input": return { ...state, opportunityInput: { ...state.opportunityInput, [action.field]: action.value }, opportunityDraft: null, opportunityParse: asyncIdle() };
    case "start-opportunity-parse": return state.opportunityInput.text.trim() ? { ...state, opportunityDraft: null, opportunityParse: { status: "running", step: 0 } } : state;
    case "advance-opportunity-parse": {
      const next = state.opportunityParse.step + 1;
      if (next >= 3) return { ...state, opportunityParse: { status: "done", step: 2 }, opportunityDraft: opportunityDraftFromInput(state) };
      return { ...state, opportunityParse: { status: "running", step: next } };
    }
    case "cancel-opportunity-parse": return { ...state, opportunityParse: asyncIdle(), opportunityDraft: null };
    case "update-opportunity-draft": return state.opportunityDraft ? { ...state, opportunityDraft: { ...state.opportunityDraft, [action.field]: action.value } } : state;
    case "confirm-opportunity": {
      if (!state.opportunityDraft) return state;
      const suffix = state.opportunities.length ? `-${state.opportunities.length + 1}` : "";
      const workspace = createWorkspace({ ...state.opportunityDraft, id: `${state.opportunityDraft.id}${suffix}` });
      return { ...state, opportunities: [...state.opportunities, workspace], activeOpportunityId: workspace.opportunity.id, opportunityDraft: null, opportunityParse: asyncIdle(), view: "today" };
    }
    case "select-opportunity": return state.opportunities.some((workspace) => workspace.opportunity.id === action.id) ? { ...state, activeOpportunityId: action.id, view: action.view ?? "opportunity" } : state;
    case "toggle-compare-opportunity": {
      const selected = state.compareOpportunityIds.includes(action.id);
      if (selected) return { ...state, compareOpportunityIds: state.compareOpportunityIds.filter((id) => id !== action.id) };
      if (state.compareOpportunityIds.length >= 3) return state;
      return { ...state, compareOpportunityIds: [...state.compareOpportunityIds, action.id] };
    }
    case "start-research": return active ? { ...updateActiveOpportunity(state, (workspace) => ({ ...workspace, lifeStage: "research", research: { ...workspace.research, status: "running", step: 0 } })), view: "opportunity" } : state;
    case "advance-research": {
      if (!active) return state;
      const next = active.research.step + 1;
      return updateActiveOpportunity(state, (workspace) => next >= 4
        ? { ...workspace, research: { status: "done", step: 3, evidence: evidenceFor(state, workspace) } }
        : { ...workspace, research: { ...workspace.research, status: "running", step: next } });
    }
    case "set-life-stage": {
      if (!active || !availableLifeStages(active).includes(action.stage)) return state;
      return { ...updateActiveOpportunity(state, (workspace) => ({ ...workspace, lifeStage: action.stage })), view: action.stage === "interview" ? "interview" : "opportunity" };
    }
    case "set-evidence": return updateActiveOpportunity(state, (workspace) => ({ ...workspace, selectedEvidenceId: action.id }));
    case "add-opportunity-note": return action.text.trim() ? updateActiveOpportunity(state, (workspace) => ({ ...workspace, contextNotes: [...workspace.contextNotes, action.text.trim()] })) : state;
    case "start-application-package": return beginApplicationPackage(state, active);
    case "create-communication": return beginApplicationPackage(state, active);
    case "advance-application-package": {
      if (!active?.applicationPackage || active.applicationPackage.status !== "running") return state;
      const next = active.applicationPackage.step + 1;
      return updateActiveOpportunity(state, (workspace) => {
        if (!workspace.applicationPackage) return workspace;
        if (next >= 4) return {
          ...workspace,
          lifeStage: "communicate",
          applicationPackage: { ...workspace.applicationPackage, status: "done", step: 3 },
          communication: {
            id: `communication-${workspace.opportunity.id}`,
            channel: "招聘平台私信",
            status: "draft",
            summary: workspace.applicationPackage.communicationDraft,
            questions: [...workspace.applicationPackage.questions],
            createdAt: "刚刚",
          },
          lifecycleNote: "申请决策包已生成，仍需你逐项审核、编辑和亲自使用。",
        };
        return { ...workspace, applicationPackage: { ...workspace.applicationPackage, status: "running", step: next } };
      });
    }
    case "cancel-application-package": return active?.applicationPackage?.status === "running" ? { ...updateActiveOpportunity(state, (workspace) => ({ ...workspace, applicationPackage: null })), view: "opportunity" } : { ...state, view: "opportunity" };
    case "update-application-text": return updateActiveOpportunity(state, (workspace) => {
      if (!workspace.applicationPackage || workspace.application) return workspace;
      const invalidReviewIds = action.field === "communication" ? ["communication"] : ["facts", "positioning"];
      const applicationPackage = {
        ...workspace.applicationPackage,
        exportedAt: null,
        reviewItems: workspace.applicationPackage.reviewItems.map((item) => invalidReviewIds.includes(item.id) ? { ...item, checked: false } : item),
      };
      if (action.field === "communication") return {
        ...workspace,
        applicationPackage: { ...applicationPackage, communicationDraft: action.value },
        communication: workspace.communication ? { ...workspace.communication, summary: action.value } : null,
      };
      return { ...workspace, applicationPackage: { ...applicationPackage, resume: { ...workspace.applicationPackage.resume, [action.field]: action.value } } };
    });
    case "toggle-application-review": return updateActiveOpportunity(state, (workspace) => workspace.applicationPackage && !workspace.application ? {
      ...workspace,
      applicationPackage: { ...workspace.applicationPackage, reviewItems: workspace.applicationPackage.reviewItems.map((item) => item.id === action.id ? { ...item, checked: !item.checked } : item) },
    } : workspace);
    case "mark-application-exported": return updateActiveOpportunity(state, (workspace) => workspace.applicationPackage ? { ...workspace, applicationPackage: { ...workspace.applicationPackage, exportedAt: "刚刚" } } : workspace);
    case "set-decision": return action.reason.trim() && !active?.application ? {
      ...updateActiveOpportunity(state, (workspace) => ({
        ...workspace,
        decision: action.decision,
        decisionRecord: { choice: action.decision, reason: action.reason.trim(), advisory: "谨慎投入", createdAt: "刚刚" },
      })),
      view: state.view,
    } : state;
    case "record-application": return active?.decision === "apply" && !active.application && active.applicationPackage?.reviewItems.every((item) => item.checked) ? {
      ...updateActiveOpportunity(state, (workspace) => ({
        ...workspace,
        application: {
          id: `application-${workspace.opportunity.id}`,
          status: "recorded",
          channel: workspace.communication?.channel ?? "招聘平台",
          materials: [workspace.applicationPackage?.resume.title ?? demoApplication.materials[0], "岗位定制简历", "已审核沟通草稿"],
          createdAt: "刚刚",
          followUp: demoApplication.followUp,
        },
        lifeStage: "applied",
        lifecycleNote: "申请事件已记录，材料、风险和当时决定仍可回看。",
      })),
      view: "opportunity",
    } : state;
    case "create-interview": return active?.application ? { ...updateActiveOpportunity(state, (workspace) => ({ ...workspace, interviewEvent: { id: `interview-${workspace.opportunity.id}`, status: "planned", title: demoInterview.title, scheduledAt: demoInterview.scheduledAt, purpose: demoInterview.purpose, prompts: [...demoInterview.prompts], notes: null }, lifeStage: "interview", lifecycleNote: "面试事件已产生，先准备要验证的问题。" })), view: "interview" } : state;
    case "record-interview": return active?.interviewEvent && action.notes.trim() ? updateActiveOpportunity(state, (workspace) => ({ ...workspace, interviewEvent: workspace.interviewEvent ? { ...workspace.interviewEvent, status: "recorded", notes: action.notes.trim() } : null, contextNotes: [...workspace.contextNotes, `面试现场：${action.notes.trim()}`], lifecycleNote: "面试记录已保存，真实回应已经进入当前机会的上下文。" })) : state;
    case "create-offer": return active?.interviewEvent?.status === "recorded" ? { ...updateActiveOpportunity(state, (workspace) => ({ ...workspace, offer: { id: `offer-${workspace.opportunity.id}`, status: "recorded", summary: demoOffer.summary, terms: [...demoOffer.terms], createdAt: "刚刚" }, lifeStage: "offer", lifecycleNote: "Offer 对象已产生，可以与原来的约束和决定比较。" })), view: "opportunity" } : state;
    case "create-outcome": return active?.offer || active?.interviewEvent ? { ...updateActiveOpportunity(state, (workspace) => ({ ...workspace, outcome: { id: `outcome-${workspace.opportunity.id}`, status: "draft", title: demoOutcome.title, detail: demoOutcome.detail, learning: demoOutcome.learning, createdAt: "刚刚" }, lifeStage: "outcome", lifecycleNote: "结果复盘草稿已产生，等待你的确认。" })), view: "opportunity" } : state;
    case "record-strategy-update": return active?.outcome ? updateActiveOpportunity(state, (workspace) => ({ ...workspace, outcome: workspace.outcome ? { ...workspace.outcome, status: "recorded" } : null, strategyUpdate: demoOutcome.learning, lifecycleNote: "复盘已确认，策略建议作为新版本保留，不覆盖过去的决定。" })) : state;
    case "set-lifecycle-note": return updateActiveOpportunity(state, (workspace) => ({ ...workspace, lifecycleNote: action.note }));
    case "add-agent-user": {
      const thread = state.agentThreads[action.contextId] ?? [];
      let nextState: DemoState = {
        ...state,
        agentThreads: {
          ...state.agentThreads,
          [action.contextId]: [...thread, { from: "user", text: action.text, time: "刚刚" }, { from: "agent", text: agentReplyFor(state, action.text, action.contextId), time: "刚刚" }],
        },
      };
      if (action.contextId.startsWith("opportunity:")) {
        const id = action.contextId.slice("opportunity:".length);
        nextState = updateOpportunityById(nextState, id, (workspace) => ({ ...workspace, contextNotes: [...workspace.contextNotes, `Agent 对话：${action.text}`] }));
      }
      return nextState;
    }
    default: return state;
  }
}

function agentReplyFor(state: DemoState, text: string, contextId: string) {
  const opportunityId = contextId.startsWith("opportunity:") ? contextId.slice("opportunity:".length) : null;
  const active = opportunityId ? state.opportunities.find((workspace) => workspace.opportunity.id === opportunityId) ?? null : currentOpportunityWorkspace(state);
  if (text.includes("面试")) return "我已把这条输入留在当前机会。它会和研究未知项一起进入面试准备，但不会自动成为已确认事实。";
  if (text.includes("证据") || text.includes("建议")) return active?.research.status === "done" ? "当前建议由职业事实、支持信息、冲突信息和弱信号共同形成。你刚补充的内容已作为用户输入保留，下一次建议更新需要明确标出它造成的变化。" : "这份机会还没有完成研究。我只能说明当前输入和待研究范围，不会提前编造证据。";
  return "这条内容已经绑定到当前上下文。我会把它当作新的用户输入，而不是无痕改写已经保存的事实或决定。";
}

function factsFromProfileMaterial(state: DemoState): CareerFact[] {
  const material = state.profileMaterial;
  if (material.source === "sample") return demoFacts;
  if (material.source === "conversation") {
    return conversationFacts.map((fact, index) => index === 0 ? { ...fact, detail: `你在访谈中写道：“${material.text.trim()}” 当前先把它整理为一个待确认方向。` } : fact);
  }

  const lines = material.text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 5 && !line.startsWith("文件：") && !line.startsWith("本次概念"));
  const roleLine = lines.find((line) => /工程师|设计师|产品|开发|架构|测试|运营|经理|负责人/.test(line)) ?? lines[0] ?? "材料中包含一段职业经历";
  const impactLine = lines.find((line) => /\d|%|提升|下降|增长|缩短|完成/.test(line)) ?? "材料中尚未出现容易核验的结果数字";
  const collaborationLine = lines.find((line) => /带领|负责|协作|推动|主导|参与/.test(line)) ?? "协作与责任边界仍需要访谈确认";
  const capabilityLine = lines.find((line) => /前端|后端|全栈|Java|Python|设计|产品|数据|测试|架构/.test(line)) ?? roleLine;
  return [
    { id: "material-role", label: "材料呈现出一个主要职业定位", detail: roleLine, source: material.name, status: "inferred", consequence: "影响当前求职方向和职位绑定语境。" },
    { id: "material-capability", label: "存在可以继续核验的能力线索", detail: capabilityLine, source: material.name, status: "inferred", consequence: "影响能力匹配和定制简历重点。" },
    { id: "material-impact", label: "材料中出现结果或成果线索", detail: impactLine, source: material.name, status: "inferred", consequence: "影响申请材料能否使用可验证结果。" },
    { id: "material-collaboration", label: "责任与协作边界需要确认", detail: collaborationLine, source: material.name, status: "inferred", consequence: "影响岗位级别、管理责任和面试问题。" },
    { id: "material-unknown", label: "当前现实限制仍是未知项", detail: "材料没有充分说明薪资底线、工作方式、地点和不可接受条件，需要在方向确认中补充。", source: "材料缺失项", status: "inferred", consequence: "影响硬约束判断和机会筛选。" },
  ];
}

function candidateName(text: string) {
  const first = text.split(/\r?\n/).map((line) => line.trim()).find((line) => line && !line.startsWith("文件：") && !line.startsWith("本次概念"));
  return first && first.length <= 12 && !/[：:，,。；;]/.test(first) ? first : "";
}

export function confirmedFacts(facts: CareerFact[]) { return facts.filter((fact) => fact.status === "confirmed"); }
export function pendingFacts(facts: CareerFact[]) { return facts.filter((fact) => fact.status === "inferred"); }
export function currentOpportunityWorkspace(state: DemoState): OpportunityWorkspace | null { return state.opportunities.find((workspace) => workspace.opportunity.id === state.activeOpportunityId) ?? null; }
export function currentOpportunity(state: DemoState): Opportunity | null { return currentOpportunityWorkspace(state)?.opportunity ?? null; }
export function availableLifeStages(workspace: OpportunityWorkspace): LifeStage[] {
  const stages: LifeStage[] = ["discover"];
  if (workspace.research.status !== "idle") stages.push("research");
  if (workspace.communication) stages.push("communicate");
  if (workspace.application) stages.push("applied");
  if (workspace.interviewEvent) stages.push("interview");
  if (workspace.offer) stages.push("offer");
  if (workspace.outcome) stages.push("outcome");
  return stages;
}
