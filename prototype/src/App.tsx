import { useEffect, useMemo, useReducer, useState, type Dispatch } from "react";
import { BrainCircuit, Check, Sparkles, X } from "lucide-react";
import { AgentDrawer } from "./features/agent/AgentDrawer";
import { LoginScreen } from "./features/auth/LoginScreen";
import { InterviewView } from "./features/interview/InterviewView";
import { OnboardingView } from "./features/onboarding/OnboardingView";
import { OpportunityIntakeView } from "./features/opportunity/OpportunityIntakeView";
import { OpportunityView } from "./features/opportunity/OpportunityView";
import { TodayView } from "./features/today/TodayView";
import { appReducer, confirmedFacts, initialState, pendingFacts, type AppAction } from "./app/state";
import { agentReplies } from "./data/demo-content";
import "./styles.css";

type Notice = { tone: "success" | "info" | "warning"; text: string } | null;

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentDraft, setAgentDraft] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const confirmed = confirmedFacts(state.facts);
  const pending = pendingFacts(state.facts);
  const context = useMemo(() => {
    if (state.view === "onboarding") return "建立你的职业上下文";
    if (state.view === "profile") return "林舟 · 当前有效职业事实";
    if (state.view === "opportunity-intake") return "第一份机会 · 材料接入";
    if (state.view === "interview") return `${state.opportunity?.company ?? "当前机会"} · 面试事件`;
    if (state.opportunity) return `${state.opportunity.company} · ${state.lifeStage === "research" ? "研究" : state.lifeStage}`;
    return "你的职业现场";
  }, [state.view, state.opportunity, state.lifeStage]);

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
    if (state.research.status !== "running") return;
    const timer = window.setTimeout(() => dispatch({ type: "advance-research" }), 760);
    return () => window.clearTimeout(timer);
  }, [state.research.status, state.research.step]);

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
    dispatch({ type: "add-agent-user", text });
    setAgentDraft("");
    window.setTimeout(() => flash({ tone: "info", text: "Agent 已把这个问题留在当前对象上。" }), 550);
  };

  if (!state.authenticated) return <LoginScreen onLogin={login} />;

  let view = <OnboardingView state={state} dispatch={dispatch} />;
  if (state.setupStep === "ready" && state.view === "today") view = <TodayView state={state} dispatch={dispatch} />;
  if (state.view === "profile") view = <ProfileView state={state} dispatch={dispatch} />;
  if (state.view === "opportunity-intake") view = <OpportunityIntakeView state={state} dispatch={dispatch} />;
  if (state.view === "opportunity" && state.opportunity) view = <OpportunityView state={state} dispatch={dispatch} />;
  if (state.view === "interview" && state.opportunity) view = <InterviewView state={state} dispatch={dispatch} />;

  return <div className="app-shell"><main className="main-content" id="main-content">{view}<footer className="session-exit"><span>{state.userName || "你的"}的私人职业空间 · {confirmed.length} 条已确认事实{pending.length ? ` · ${pending.length} 条待确认` : ""}</span><button type="button" onClick={() => dispatch({ type: "logout" })}>退出本次体验</button></footer></main><button className="agent-float" type="button" aria-label="打开职业 Agent" title="打开职业 Agent" onClick={() => setAgentOpen(true)}><BrainCircuit size={19} /><span>问 AI</span></button>{agentOpen && <AgentDrawer context={context} messages={state.agentMessages.length ? state.agentMessages : [{ from: "agent", text: state.view === "onboarding" ? agentReplies.onboarding : state.research.status === "done" ? agentReplies.research : agentReplies.default, time: "刚刚" }]} draft={agentDraft} onDraft={setAgentDraft} onSend={sendAgent} onClose={() => setAgentOpen(false)} />}{notice && <div className={`toast toast-${notice.tone}`} role="status"><span className="toast-icon">{notice.tone === "success" ? <Check size={15} /> : <Sparkles size={15} />}</span><span>{notice.text}</span><button type="button" aria-label="关闭提示" onClick={() => setNotice(null)}><X size={14} /></button></div>}</div>;
}

function ProfileView({ state, dispatch }: { state: ReturnType<typeof appReducer>; dispatch: Dispatch<AppAction> }) {
  const facts = state.facts;
  return <div className="feature-view"><div className="return-today"><button type="button" onClick={() => dispatch({ type: "set-view", view: "today" })}>← 回到今天</button></div><div className="profile-view-head"><div><p className="eyebrow">当前有效 · {facts.length} 条事实</p><h1>记住你<br /><em>真正做过什么。</em></h1><p className="object-description">这里不是一份静态简历。每条内容都有来源、状态和会影响什么，之后会随着机会和结果继续修正。</p></div><div className="profile-count"><strong>{facts.filter((fact) => fact.status === "confirmed").length}</strong><span>已确认</span><strong>{facts.filter((fact) => fact.status === "inferred").length}</strong><span>待你确认</span></div></div><div className="profile-facts">{facts.map((fact) => <article key={fact.id} className={`fact-review ${fact.status}`}><div className="fact-review-top"><span className={`status-pill status-${fact.status === "confirmed" ? "positive" : fact.status === "inferred" ? "warning" : "info"}`}><span />{fact.status === "confirmed" ? "已确认" : fact.status === "inferred" ? "待你确认" : "未知项"}</span><small>{fact.source}</small></div><h2>{fact.label}</h2><p>{fact.detail}</p><div className="fact-consequence"><span>会影响</span>{fact.consequence}</div>{fact.status === "inferred" && <div className="fact-actions"><button type="button" onClick={() => dispatch({ type: "reject-fact", id: fact.id })}>不是这样</button><button type="button" className="button-primary" onClick={() => dispatch({ type: "confirm-fact", id: fact.id })}>确认这条事实 <span>→</span></button></div>}</article>)}</div></div>;
}

export default App;
