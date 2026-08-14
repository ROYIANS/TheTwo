import { useEffect, useMemo, useReducer, useState } from "react";
import { BrainIcon, CheckIcon, IconContext, SparkleIcon, XIcon } from "@phosphor-icons/react";
import { AgentDrawer } from "./features/agent/AgentDrawer";
import { ApplicationPackageView } from "./features/application/ApplicationPackageView";
import { LoginScreen } from "./features/auth/LoginScreen";
import { InterviewView } from "./features/interview/InterviewView";
import { OnboardingView } from "./features/onboarding/OnboardingView";
import { OpportunityIntakeView } from "./features/opportunity/OpportunityIntakeView";
import { OpportunitiesView, OpportunityCompareView } from "./features/opportunity/OpportunitiesView";
import { OpportunityView } from "./features/opportunity/OpportunityView";
import { ProfileView } from "./features/profile/ProfileView";
import { TodayView } from "./features/today/TodayView";
import { appReducer, confirmedFacts, currentOpportunityWorkspace, initialState, pendingFacts } from "./app/state";
import { agentReplies } from "./data/demo-content";
import "./styles.css";
import "./styles/product-interaction-overrides.css";

type Notice = { tone: "success" | "info" | "warning"; text: string } | null;

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentDraft, setAgentDraft] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const confirmed = confirmedFacts(state.facts);
  const pending = pendingFacts(state.facts);
  const active = currentOpportunityWorkspace(state);
  const contextId = state.view === "profile" ? "profile" : state.view === "onboarding" ? "onboarding" : state.view === "opportunity-intake" ? "opportunity-intake" : active ? `opportunity:${active.opportunity.id}` : "workspace";
  const context = useMemo(() => {
    if (state.view === "onboarding") return "建立你的职业上下文";
    if (state.view === "profile") return "林舟 · 当前有效职业事实";
    if (state.view === "opportunity-intake") return "新机会 · 材料接入";
    if (state.view === "opportunities") return "工作机会集合";
    if (state.view === "opportunity-compare") return "机会比较";
    if (state.view === "application") return `${active?.opportunity.company ?? "当前机会"} · 申请决策包`;
    if (state.view === "interview") return `${active?.opportunity.company ?? "当前机会"} · 面试事件`;
    if (active) return `${active.opportunity.company} · ${active.lifeStage === "research" ? "研究" : active.lifeStage}`;
    return "你的职业现场";
  }, [state.view, active]);

  useEffect(() => {
    if (state.profileAnalysis.status !== "running") return;
    const timer = window.setTimeout(() => dispatch({ type: "advance-profile-analysis" }), 680);
    return () => window.clearTimeout(timer);
  }, [state.profileAnalysis.status, state.profileAnalysis.step]);

  useEffect(() => {
    if (state.opportunityParse.status !== "running") return;
    const timer = window.setTimeout(() => dispatch({ type: "advance-opportunity-parse" }), 680);
    return () => window.clearTimeout(timer);
  }, [state.opportunityParse.status, state.opportunityParse.step]);

  useEffect(() => {
    if (active?.research.status !== "running") return;
    const timer = window.setTimeout(() => dispatch({ type: "advance-research" }), 760);
    return () => window.clearTimeout(timer);
  }, [active?.opportunity.id, active?.research.status, active?.research.step]);

  useEffect(() => {
    if (active?.applicationPackage?.status !== "running") return;
    const timer = window.setTimeout(() => dispatch({ type: "advance-application-package" }), 760);
    return () => window.clearTimeout(timer);
  }, [active?.opportunity.id, active?.applicationPackage?.status, active?.applicationPackage?.step]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setAgentOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const flash = (next: Exclude<Notice, null>) => {
    setNotice(next);
    window.setTimeout(() => setNotice(null), 3400);
  };

  const login = () => { dispatch({ type: "login" }); flash({ tone: "success", text: "已进入一个全新的私人职业空间。" }); };
  const sendAgent = () => {
    const text = agentDraft.trim();
    if (!text) return;
    dispatch({ type: "add-agent-user", contextId, text });
    setAgentDraft("");
    window.setTimeout(() => flash({ tone: "info", text: "Agent 已把这个问题留在当前对象上。" }), 550);
  };

  if (!state.authenticated) return <LoginScreen onLogin={login} />;

  let view = <OnboardingView state={state} dispatch={dispatch} />;
  if (state.setupStep === "ready" && state.view === "today") view = <TodayView state={state} active={active} dispatch={dispatch} />;
  if (state.view === "profile") view = <ProfileView state={state} dispatch={dispatch} />;
  if (state.view === "opportunity-intake") view = <OpportunityIntakeView state={state} dispatch={dispatch} />;
  if (state.view === "opportunities") view = <OpportunitiesView state={state} dispatch={dispatch} />;
  if (state.view === "opportunity-compare") view = <OpportunityCompareView state={state} dispatch={dispatch} />;
  if (state.view === "opportunity" && active) view = <OpportunityView workspace={active} dispatch={dispatch} />;
  if (state.view === "application" && active) view = <ApplicationPackageView workspace={active} dispatch={dispatch} />;
  if (state.view === "interview" && active) view = <InterviewView workspace={active} dispatch={dispatch} />;

  const spaceOwner = state.userName ? `${state.userName}的` : "你的";
  const agentMessages = state.agentThreads[contextId];
  return <IconContext.Provider value={{ weight: "regular" }}><div className="app-shell"><main className="main-content" id="main-content">{view}<footer className="session-exit"><span>{spaceOwner}私人职业空间 · {confirmed.length} 条已确认事实{pending.length ? ` · ${pending.length} 条待确认` : ""}</span><button type="button" onClick={() => dispatch({ type: "logout" })}>退出本次体验</button></footer></main><button className="agent-float" type="button" aria-label="打开职业 Agent" title="打开职业 Agent" onClick={() => setAgentOpen(true)}><BrainIcon size={19} /><span>问 AI</span></button>{agentOpen && <AgentDrawer context={context} messages={agentMessages?.length ? agentMessages : [{ from: "agent", text: state.view === "onboarding" ? agentReplies.onboarding : active?.research.status === "done" ? agentReplies.research : agentReplies.default, time: "刚刚" }]} draft={agentDraft} onDraft={setAgentDraft} onSend={sendAgent} onClose={() => setAgentOpen(false)} />}{notice && <div className={`toast toast-${notice.tone}`} role="status"><span className="toast-icon">{notice.tone === "success" ? <CheckIcon size={15} /> : <SparkleIcon size={15} />}</span><span>{notice.text}</span><button type="button" aria-label="关闭提示" onClick={() => setNotice(null)}><XIcon size={14} /></button></div>}</div></IconContext.Provider>;
}

export default App;
