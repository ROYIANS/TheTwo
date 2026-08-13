import type { DemoState, AppView, CareerFact, Opportunity, UserDecision, AsyncStatus } from "../domain/model";
import { conversationFacts, demoApplication, demoCommunication, demoDirection, demoEvidence, demoFacts, demoInterview, demoOffer, demoOpportunity, demoOutcome } from "../data/demo-content";

export type AppAction =
  | { type: "login" }
  | { type: "logout" }
  | { type: "set-view"; view: AppView }
  | { type: "set-name"; name: string }
  | { type: "show-resume" }
  | { type: "start-conversation" }
  | { type: "start-profile-analysis" }
  | { type: "advance-profile-analysis" }
  | { type: "confirm-fact"; id: string }
  | { type: "reject-fact"; id: string }
  | { type: "open-direction" }
  | { type: "confirm-direction" }
  | { type: "load-opportunity" }
  | { type: "start-opportunity-parse" }
  | { type: "advance-opportunity-parse" }
  | { type: "confirm-opportunity" }
  | { type: "start-research" }
  | { type: "advance-research" }
  | { type: "set-life-stage"; stage: DemoState["lifeStage"] }
  | { type: "set-evidence"; id: string }
  | { type: "set-decision"; decision: Exclude<UserDecision, null> }
  | { type: "create-communication" }
  | { type: "record-application" }
  | { type: "create-interview" }
  | { type: "record-interview"; notes: string }
  | { type: "create-offer" }
  | { type: "create-outcome" }
  | { type: "record-strategy-update" }
  | { type: "set-lifecycle-note"; note: string }
  | { type: "add-agent-user"; text: string };

const asyncIdle = (): { status: AsyncStatus; step: number } => ({ status: "idle", step: 0 });

export const initialState: DemoState = {
  authenticated: false,
  view: "onboarding",
  setupStep: "welcome",
  userName: "",
  resumeVisible: false,
  profileSource: null,
  intakeText: "",
  facts: [],
  direction: null,
  opportunity: null,
  opportunityDraftVisible: false,
  profileAnalysis: asyncIdle(),
  opportunityParse: asyncIdle(),
  research: { ...asyncIdle(), evidence: [] },
  lifeStage: "discover",
  decision: null,
  decisionRecord: null,
  communication: null,
  application: null,
  interviewEvent: null,
  offer: null,
  outcome: null,
  strategyUpdate: null,
  selectedEvidenceId: null,
  lifecycleNote: null,
  agentMessages: [],
};

export function appReducer(state: DemoState, action: AppAction): DemoState {
  switch (action.type) {
    case "login": return { ...state, authenticated: true, view: "onboarding", setupStep: "welcome", agentMessages: [] };
    case "logout": return { ...initialState };
    case "set-view": return { ...state, view: action.view };
    case "set-name": return { ...state, userName: action.name };
    case "show-resume": return { ...state, userName: "林舟", resumeVisible: true, profileSource: "resume", setupStep: "import", intakeText: "resume" };
    case "start-conversation": return { ...state, userName: "林舟", profileSource: "conversation", setupStep: "interview", intakeText: "conversation" };
    case "start-profile-analysis": return { ...state, setupStep: "profile-analysis", profileAnalysis: { status: "running", step: 0 } };
    case "advance-profile-analysis": {
      const next = state.profileAnalysis.step + 1;
      if (next >= 4) return { ...state, setupStep: "facts", profileAnalysis: { status: "done", step: 3 }, facts: (state.profileSource === "conversation" ? conversationFacts : demoFacts).map((fact) => ({ ...fact })) };
      return { ...state, profileAnalysis: { status: "running", step: next } };
    }
    case "confirm-fact": return { ...state, facts: state.facts.map((fact) => fact.id === action.id ? { ...fact, status: "confirmed" } : fact) };
    case "reject-fact": return { ...state, facts: state.facts.map((fact) => fact.id === action.id ? { ...fact, status: "rejected" } : fact) };
    case "open-direction": return { ...state, setupStep: "direction" };
    case "confirm-direction": return { ...state, direction: { ...demoDirection }, setupStep: "ready", view: "today" };
    case "load-opportunity": return { ...state, opportunityDraftVisible: true, view: "opportunity-intake" };
    case "start-opportunity-parse": return { ...state, opportunityParse: { status: "running", step: 0 } };
    case "advance-opportunity-parse": {
      const next = state.opportunityParse.step + 1;
      if (next >= 3) return { ...state, opportunityParse: { status: "done", step: 2 }, opportunityDraftVisible: true };
      return { ...state, opportunityParse: { status: "running", step: next } };
    }
    case "confirm-opportunity": return { ...state, opportunity: { ...demoOpportunity }, opportunityDraftVisible: false, view: "today", lifeStage: "discover" };
    case "start-research": return { ...state, lifeStage: "research", view: "opportunity", research: { ...state.research, status: "running", step: 0 } };
    case "advance-research": {
      const next = state.research.step + 1;
      if (next >= 4) return { ...state, research: { status: "done", step: 3, evidence: demoEvidence.map((item) => ({ ...item })) } };
      return { ...state, research: { ...state.research, status: "running", step: next } };
    }
    case "set-life-stage": {
      const ready = action.stage === "discover" || (action.stage === "research" && Boolean(state.opportunity)) || (action.stage === "communicate" && Boolean(state.communication)) || (action.stage === "applied" && Boolean(state.application)) || (action.stage === "interview" && Boolean(state.interviewEvent)) || (action.stage === "offer" && Boolean(state.offer)) || (action.stage === "outcome" && Boolean(state.outcome));
      return ready ? { ...state, lifeStage: action.stage, view: action.stage === "interview" ? "interview" : "opportunity" } : state;
    }
    case "set-evidence": return { ...state, selectedEvidenceId: action.id };
    case "set-decision": return { ...state, decision: action.decision, decisionRecord: { choice: action.decision, reason: action.decision === "apply" ? "值得先投入一次可控的沟通与申请。" : action.decision === "hold" ? "保留机会，先不消耗完整申请成本。" : "当前信息下不值得继续投入。", advisory: "谨慎投入", createdAt: "刚刚" }, view: "opportunity" };
    case "create-communication": return state.opportunity && state.research.status === "done" ? { ...state, communication: { id: "communication-cy-1", channel: "招聘平台私信", status: "draft", summary: demoCommunication.summary, questions: [...demoCommunication.questions], createdAt: "刚刚" }, lifeStage: "communicate", view: "opportunity", lifecycleNote: "沟通草稿已生成，仍需你审核和亲自发送。" } : state;
    case "record-application": return state.opportunity && state.decision === "apply" ? { ...state, application: { id: "application-cy-1", status: "recorded", channel: "招聘平台", materials: [...demoApplication.materials], createdAt: "刚刚", followUp: demoApplication.followUp }, lifeStage: "applied", view: "opportunity", lifecycleNote: "申请事件已记录，材料和当时决定仍可回看。" } : state;
    case "create-interview": return state.application ? { ...state, interviewEvent: { id: "interview-cy-1", status: "planned", title: demoInterview.title, scheduledAt: demoInterview.scheduledAt, purpose: demoInterview.purpose, prompts: [...demoInterview.prompts], notes: null }, lifeStage: "interview", view: "interview", lifecycleNote: "面试事件已产生，先准备要验证的问题。" } : state;
    case "record-interview": return state.interviewEvent ? { ...state, interviewEvent: { ...state.interviewEvent, status: "recorded", notes: action.notes }, lifecycleNote: "面试记录已保存，接下来可以把真实回应放回判断。" } : state;
    case "create-offer": return state.interviewEvent?.status === "recorded" ? { ...state, offer: { id: "offer-cy-1", status: "recorded", summary: demoOffer.summary, terms: [...demoOffer.terms], createdAt: "刚刚" }, lifeStage: "offer", view: "opportunity", lifecycleNote: "Offer 对象已产生，可以与原来的约束和决定比较。" } : state;
    case "create-outcome": return state.offer || state.interviewEvent ? { ...state, outcome: { id: "outcome-cy-1", status: "draft", title: demoOutcome.title, detail: demoOutcome.detail, learning: demoOutcome.learning, createdAt: "刚刚" }, lifeStage: "outcome", view: "opportunity", lifecycleNote: "结果复盘草稿已产生，等待你的确认。" } : state;
    case "record-strategy-update": return state.outcome ? { ...state, outcome: { ...state.outcome, status: "recorded" }, strategyUpdate: demoOutcome.learning, lifecycleNote: "复盘已确认，策略建议作为新版本保留，不覆盖过去的决定。" } : state;
    case "set-lifecycle-note": return { ...state, lifecycleNote: action.note };
    case "add-agent-user": return { ...state, agentMessages: [...state.agentMessages, { from: "user", text: action.text, time: "刚刚" }, { from: "agent", text: agentReplyFor(state, action.text), time: "刚刚" }] };
    default: return state;
  }
}

function agentReplyFor(state: DemoState, text: string) {
  if (text.includes("面试")) return "我会把当前机会的未知项转成面试验证问题，并保留在面试事件里。你可以删掉不想问的内容。";
  if (text.includes("证据") || text.includes("建议")) return state.research.status === "done" ? "当前建议由已确认职业事实、2 条支持信息、1 条冲突信息和 1 个弱信号共同形成。最可能改变结论的是团队实际工作方式。" : "这份机会还没有完成研究。我现在只能说明待研究的输入，不会提前编造证据。";
  return "我会把你的问题绑定在当前对象上。它会成为新的用户输入，不会无痕改写已经保存的事实或决定。";
}

export function confirmedFacts(facts: CareerFact[]) { return facts.filter((fact) => fact.status === "confirmed"); }
export function pendingFacts(facts: CareerFact[]) { return facts.filter((fact) => fact.status === "inferred"); }
export function currentOpportunity(state: DemoState): Opportunity | null { return state.opportunity; }
export function availableLifeStages(state: DemoState): DemoState["lifeStage"][] {
  const stages: DemoState["lifeStage"][] = ["discover"];
  if (state.research.status !== "idle") stages.push("research");
  if (state.communication) stages.push("communicate");
  if (state.application) stages.push("applied");
  if (state.interviewEvent) stages.push("interview");
  if (state.offer) stages.push("offer");
  if (state.outcome) stages.push("outcome");
  return stages;
}
