import type { DemoState, AppView, CareerFact, CareerDirection, Opportunity, UserDecision, AsyncStatus } from "../domain/model";
import { demoFacts, demoDirection, demoEvidence, demoOpportunity } from "../data/demo-content";

export type AppAction =
  | { type: "login" }
  | { type: "logout" }
  | { type: "set-view"; view: AppView }
  | { type: "set-name"; name: string }
  | { type: "show-resume" }
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
  | { type: "set-lifecycle-note"; note: string }
  | { type: "add-agent-user"; text: string };

const asyncIdle = (): { status: AsyncStatus; step: number } => ({ status: "idle", step: 0 });

export const initialState: DemoState = {
  authenticated: false,
  view: "onboarding",
  setupStep: "welcome",
  userName: "",
  resumeVisible: false,
  facts: [],
  direction: null,
  opportunity: null,
  opportunityDraftVisible: false,
  profileAnalysis: asyncIdle(),
  opportunityParse: asyncIdle(),
  research: { ...asyncIdle(), evidence: [] },
  lifeStage: "discover",
  decision: null,
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
    case "show-resume": return { ...state, userName: "林舟", resumeVisible: true, setupStep: "import" };
    case "start-profile-analysis": return { ...state, setupStep: "profile-analysis", profileAnalysis: { status: "running", step: 0 } };
    case "advance-profile-analysis": {
      const next = state.profileAnalysis.step + 1;
      if (next >= 4) return { ...state, setupStep: "facts", profileAnalysis: { status: "done", step: 3 }, facts: demoFacts.map((fact) => ({ ...fact })) };
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
    case "set-life-stage": return { ...state, lifeStage: action.stage, view: action.stage === "interview" ? "interview" : "opportunity" };
    case "set-evidence": return { ...state, selectedEvidenceId: action.id };
    case "set-decision": return { ...state, decision: action.decision, lifeStage: action.decision === "apply" ? "applied" : "outcome", view: "opportunity" };
    case "set-lifecycle-note": return { ...state, lifecycleNote: action.note };
    case "add-agent-user": return { ...state, agentMessages: [...state.agentMessages, { from: "user", text: action.text, time: "刚刚" }] };
    default: return state;
  }
}

export function confirmedFacts(facts: CareerFact[]) { return facts.filter((fact) => fact.status === "confirmed"); }
export function pendingFacts(facts: CareerFact[]) { return facts.filter((fact) => fact.status === "inferred"); }
export function currentOpportunity(state: DemoState): Opportunity | null { return state.opportunity; }
