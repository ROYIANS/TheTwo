import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, BrainCircuit, CalendarDays, Check, CheckCircle2, ChevronRight, Circle, Clock3, Database, FileText, Play, Send, Sparkles, Target, X } from "lucide-react";
import { demoEvidence, demoFacts, opportunity } from "./demo-data";
import type { CareerFact, EvidenceItem, UserDecision } from "./model";
import "./styles.css";

type Route = "today" | "opportunity" | "interview" | "career";
type LifeStage = "discover" | "research" | "communicate" | "applied" | "interview" | "offer" | "outcome";
type Notice = { tone: "success" | "info" | "warning"; text: string } | null;
type AgentMessage = { from: "agent" | "user"; text: string; time: string };

const lifecycle: Array<{ id: LifeStage; label: string; note: string }> = [
  { id: "discover", label: "发现", note: "看见值得了解的机会" },
  { id: "research", label: "研究", note: "证据与个人匹配" },
  { id: "communicate", label: "沟通", note: "确认关键未知" },
  { id: "applied", label: "申请", note: "用户亲自投递" },
  { id: "interview", label: "面试", note: "准备、进行、复盘" },
  { id: "offer", label: "Offer", note: "比较真实条款" },
  { id: "outcome", label: "结果", note: "记录并调整策略" },
];

const analysisSteps = [
  { title: "读取职位与职业事实", detail: "检查职责、方向和硬约束是否在同一语境。" },
  { title: "核对公司与岗位证据", detail: "对照主体信息、官网招聘政策和公开访谈。" },
  { title: "寻找冲突与未知", detail: "工作方式、人员管理边界和业务结果仍需确认。" },
  { title: "形成一份可质疑的建议", detail: "建议：谨慎投入。先确认工作方式，再决定申请。" },
];

const initialAgentMessages: AgentMessage[] = [
  { from: "agent", text: "我已经把澄屿科技放进当前机会旅程。你可以问我证据、申请、面试，或者直接说你现在最担心什么。", time: "10:08" },
];

const stageIndex = (stage: LifeStage) => lifecycle.findIndex((item) => item.id === stage);

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [route, setRoute] = useState<Route>("today");
  const [lifeStage, setLifeStage] = useState<LifeStage>("research");
  const [facts, setFacts] = useState<CareerFact[]>(demoFacts);
  const [notice, setNotice] = useState<Notice>(null);
  const [agentOpen, setAgentOpen] = useState(false);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(analysisSteps.length - 1);
  const [analysisDone, setAnalysisDone] = useState(true);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(demoEvidence[1].id);
  const [decision, setDecision] = useState<UserDecision>(null);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>(initialAgentMessages);
  const [agentDraft, setAgentDraft] = useState("");
  const [lifecycleAction, setLifecycleAction] = useState<string | null>(null);

  const confirmedFacts = facts.filter((fact) => fact.status === "confirmed");
  const inferredFacts = facts.filter((fact) => fact.status === "inferred");
  const selectedEvidence = demoEvidence.find((item) => item.id === selectedEvidenceId) ?? demoEvidence[0];
  const progress = Math.round(((stageIndex(lifeStage) + 1) / lifecycle.length) * 100);

  const flash = (next: Exclude<Notice, null>) => {
    setNotice(next);
    window.setTimeout(() => setNotice(null), 3600);
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAgentOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (!analysisRunning) return;
    const timer = window.setTimeout(() => {
      if (analysisStep >= analysisSteps.length - 1) {
        setAnalysisRunning(false);
        setAnalysisDone(true);
      } else {
        setAnalysisStep((current) => current + 1);
      }
    }, 850);
    return () => window.clearTimeout(timer);
  }, [analysisRunning, analysisStep]);

  const navigate = (nextRoute: Route) => setRoute(nextRoute);
  const agentContext = route === "opportunity" ? `${opportunity.company} · ${lifecycle[stageIndex(lifeStage)].label}` : route === "interview" ? `${opportunity.company} · 技术负责人初面` : route === "career" ? `林舟 · 当前有效职业事实` : `${opportunity.company} · 当前下一步`;

  const startAnalysis = () => {
    setAnalysisStep(0);
    setAnalysisDone(false);
    setAnalysisRunning(true);
    flash({ tone: "info", text: "AI 已开始重新检查这个机会。你可以看到每一步正在处理什么。" });
  };

  const confirmInference = (factId: string, status: "confirmed" | "rejected") => {
    setFacts((current) => current.map((fact) => (fact.id === factId ? { ...fact, status } : fact)));
    flash({ tone: "success", text: status === "confirmed" ? "已确认这条事实，后续建议会使用它。" : "已否定这条推断，它不会进入下游判断。" });
  };

  const handleDecision = (next: Exclude<UserDecision, null>) => {
    setDecision(next);
    setLifeStage(next === "apply" ? "applied" : "outcome");
    flash({ tone: next === "apply" ? "success" : "info", text: next === "apply" ? "已记录申请决定，下一步进入面试旅程。" : next === "hold" ? "已记录暂缓，关键未知和提醒会保留。" : "已记录放弃，之后可以在结果复盘中回看原因。" });
  };

  const sendAgentMessage = () => {
    const text = agentDraft.trim();
    if (!text) return;
    setAgentMessages((current) => [...current, { from: "user", text, time: "刚刚" }]);
    setAgentDraft("");
    window.setTimeout(() => {
      setAgentMessages((current) => [...current, { from: "agent", text: "我会把这个问题放进当前机会的下一步。现在最值得先确认的是：实际工作方式、岗位是否承担人员绩效管理，以及面试中如何验证这两点。", time: "刚刚" }]);
    }, 500);
  };

  if (!authenticated) return <LoginScreen onLogin={() => { setAuthenticated(true); flash({ tone: "success", text: "已进入林舟的私人职业空间。" }); }} />;

  return (
    <div className="app-shell">
      <main className="main-content" id="main-content">
        {route !== "today" && <ContextReturn onBack={() => navigate("today")} />}
        {route === "today" && <TodayView lifeStage={lifeStage} progress={progress} confirmedCount={confirmedFacts.length} analysisRunning={analysisRunning} analysisDone={analysisDone} analysisStep={analysisStep} onNavigate={navigate} onStage={(stage) => { setLifeStage(stage); navigate("opportunity"); }} onStartAnalysis={startAnalysis} />}
        {route === "opportunity" && <OpportunityView lifeStage={lifeStage} progress={progress} analysisRunning={analysisRunning} analysisDone={analysisDone} analysisStep={analysisStep} evidence={demoEvidence} selectedEvidence={selectedEvidence} confirmedFacts={confirmedFacts} decision={decision} lifecycleAction={lifecycleAction} onStage={(stage) => { setLifeStage(stage); setLifecycleAction(null); }} onSelectEvidence={setSelectedEvidenceId} onStartAnalysis={startAnalysis} onDecision={handleDecision} onOpenInterview={() => navigate("interview")} onOpenCareer={() => navigate("career")} onLifecycleAction={(text) => { setLifecycleAction(text); flash({ tone: "success", text }); }} />}
        {route === "interview" && <InterviewView onStage={(stage) => { setLifeStage(stage); navigate("opportunity"); }} />}
        {route === "career" && <CareerView facts={facts} inferredFacts={inferredFacts} confirmedFacts={confirmedFacts} onFact={(id, status) => confirmInference(id, status)} />}
        <div className="session-exit"><span>林舟的私人职业空间</span><button type="button" onClick={() => setAuthenticated(false)}>退出本次体验</button></div>
      </main>
      <button className="agent-float" type="button" aria-label="打开职业 Agent" title="打开职业 Agent" onClick={() => setAgentOpen(true)}><BrainCircuit size={19} /><span>问 AI</span></button>
      {agentOpen && <AgentDrawer context={agentContext} messages={agentMessages} draft={agentDraft} onDraft={setAgentDraft} onSend={sendAgentMessage} onClose={() => setAgentOpen(false)} />}
      {notice && <div className={`toast toast-${notice.tone}`} role="status"><span className="toast-icon">{notice.tone === "success" ? <Check size={15} /> : notice.tone === "warning" ? <Target size={15} /> : <Sparkles size={15} />}</span><span>{notice.text}</span><button type="button" aria-label="关闭提示" onClick={() => setNotice(null)}><X size={14} /></button></div>}
    </div>
  );
}

function ContextReturn({ onBack }: { onBack: () => void }) {
  return <div className="context-return"><button type="button" onClick={onBack}><ArrowLeft size={15} />回到今天</button></div>;
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return <main className="login-screen"><div className="login-quiet-mark">择途</div><section className="login-window" aria-labelledby="login-title"><div className="window-topline"><span /><span /><span /></div><div className="login-copy"><span className="login-kicker">你的职业，不是一张表</span><h1 id="login-title">回到你的<br /><em>职业现场</em></h1><p>在一个私人空间里，把经历、机会、面试和选择放在同一条可理解的旅程上。</p></div><div className="login-form"><label>工作区名称<input value="林舟的职业空间" readOnly /></label><label>进入方式<input value="本地演示登录" readOnly /></label><button className="login-button" type="button" onClick={onLogin}>进入工作台 <ArrowRight size={17} /></button><small>模拟登录 · 不连接外部服务</small></div></section><div className="login-foot"><span>由你掌握最终解释权</span><span>AI 负责整理、追问和提醒</span></div></main>;
}

function TodayView({ lifeStage, progress, confirmedCount, analysisRunning, analysisDone, analysisStep, onNavigate, onStage, onStartAnalysis }: { lifeStage: LifeStage; progress: number; confirmedCount: number; analysisRunning: boolean; analysisDone: boolean; analysisStep: number; onNavigate: (route: Route) => void; onStage: (stage: LifeStage) => void; onStartAnalysis: () => void; }) {
  return <div className="today-view"><div className="page-intro"><div><p className="date-line">林舟 · 星期四 · 8 月 13 日</p><h1>今天，先把一个<br /><em>重要机会看清楚。</em></h1><p className="intro-copy">你已经走到研究和沟通之间。AI 在整理证据，接下来需要你决定先问什么。</p><button type="button" className="inline-object" onClick={() => onNavigate("career")}><Database size={14} /><span>这次判断使用 {confirmedCount} 条已确认职业事实</span><ArrowRight size={14} /></button></div></div><div className="today-layout"><section className="focus-column"><div className="focus-label"><span className="focus-dot" />现在最值得做</div><div className="focus-action"><div><h2>确认澄屿科技的实际工作方式</h2><p>官网写着每周可远程两天，职位文本却只写“固定工作时间”。这会直接影响你的硬约束。</p></div><button type="button" onClick={() => onStage("communicate")}>去确认 <ArrowRight size={16} /></button></div><div className="journey-section"><div className="section-line"><h2>这份机会走到哪里</h2><span>{progress}% 走到这里</span></div><LifecycleStrip current={lifeStage} onStage={onStage} /></div><div className="activity-section"><div className="section-line"><h2>最近发生了什么</h2><button type="button" className="quiet-action" onClick={() => onNavigate("opportunity")}>打开当前机会 <ArrowRight size={14} /></button></div><div className="activity-list"><ActivityItem icon={<FileText size={16} />} title="职位材料已带入" detail="澄屿科技 · 资深前端工程师" time="今天 09:36" onOpen={() => onNavigate("opportunity")} /><ActivityItem icon={<BrainCircuit size={16} />} title="AI 发现一处需要确认的冲突" detail="工作方式：官网与职位描述不一致" time="今天 09:54" onOpen={() => onStage("research")} /><ActivityItem icon={<Database size={16} />} title="一条职业边界已影响当前判断" detail="不承担人员绩效管理" time="今天 10:02" onOpen={() => onNavigate("career")} /></div></div></section><aside className="today-aside"><AnalysisPanel running={analysisRunning} done={analysisDone} step={analysisStep} onStart={onStartAnalysis} /><div className="aside-note"><Sparkles size={16} /><div><strong>AI 会把复杂事拆开</strong><p>你随时可以问它“为什么”，也可以否定它的理解。</p></div></div></aside></div></div>;
}

function LifecycleStrip({ current, onStage }: { current: LifeStage; onStage: (stage: LifeStage) => void }) {
  const currentIndex = stageIndex(current);
  return <div className="lifecycle-strip">{lifecycle.map((item, index) => <button key={item.id} className={`life-step ${index < currentIndex ? "done" : ""} ${item.id === current ? "current" : ""}`} type="button" onClick={() => onStage(item.id)}><span className="life-marker">{index < currentIndex ? <Check size={12} /> : <Circle size={8} />}</span><strong>{item.label}</strong><small>{item.note}</small></button>)}</div>;
}

function ActivityItem({ icon, title, detail, time, onOpen }: { icon: ReactNode; title: string; detail: string; time: string; onOpen: () => void }) {
  return <button type="button" className="activity-item" onClick={onOpen}><span className="activity-icon">{icon}</span><span className="activity-copy"><strong>{title}</strong><span>{detail}</span></span><time>{time}</time><ChevronRight size={14} /></button>;
}

function AnalysisPanel({ running, done, step, onStart }: { running: boolean; done: boolean; step: number; onStart: () => void }) {
  return <section className="analysis-panel"><div className="analysis-head"><div><span className="analysis-icon"><BrainCircuit size={17} /></span><h2>AI 正在帮你研究</h2></div><span className={`analysis-state ${running ? "running" : done ? "done" : "idle"}`}>{running ? "处理中" : done ? "已完成" : "待开始"}</span></div><p className="analysis-summary">{running ? "我会把职位、公司证据和你的职业约束放在一起看。" : done ? "4 个步骤已完成，结论仍然可以被你质疑。" : "启动一次研究，看看建议是怎样形成的。"}</p><div className="analysis-steps">{analysisSteps.map((item, index) => <div key={item.title} className={`analysis-step ${index < step || done ? "complete" : ""} ${index === step && running ? "active" : ""}`}><span>{index < step || done ? <Check size={12} /> : index === step && running ? <span className="step-spinner" /> : index + 1}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div></div>)}</div><button className="analysis-button" type="button" onClick={onStart}>{running ? "分析进行中…" : done ? "重新分析" : "开始分析"}<Play size={14} /></button></section>;
}

function OpportunityView({ lifeStage, progress, analysisRunning, analysisDone, analysisStep, evidence, selectedEvidence, confirmedFacts, decision, lifecycleAction, onStage, onSelectEvidence, onStartAnalysis, onDecision, onOpenInterview, onOpenCareer, onLifecycleAction }: { lifeStage: LifeStage; progress: number; analysisRunning: boolean; analysisDone: boolean; analysisStep: number; evidence: EvidenceItem[]; selectedEvidence: EvidenceItem; confirmedFacts: CareerFact[]; decision: UserDecision; lifecycleAction: string | null; onStage: (stage: LifeStage) => void; onSelectEvidence: (id: string) => void; onStartAnalysis: () => void; onDecision: (decision: Exclude<UserDecision, null>) => void; onOpenInterview: () => void; onOpenCareer: () => void; onLifecycleAction: (text: string) => void; }) {
  const currentIndex = stageIndex(lifeStage);
  return <div className="opportunity-view"><div className="opportunity-heading"><div><p className="date-line">当前机会 · {lifecycle[currentIndex].label}</p><h1>{opportunity.company}<br /><em>{opportunity.role}</em></h1><p className="opportunity-meta">{opportunity.salary} · {opportunity.location} · {opportunity.direction}</p></div><StatusChip tone={decision ? "positive" : "warning"}>{decision ? decisionLabel(decision) : "谨慎投入"}</StatusChip></div><LifecycleStrip current={lifeStage} onStage={onStage} /><div className="opportunity-grid"><section className="opportunity-main"><div className="research-intro"><div><span className="focus-label"><span className="focus-dot" />{lifeStage === "research" ? "研究记录" : "旅程记录"}</span><h2>{lifeStage === "research" ? "能力匹配，但现实条件仍需确认" : stageTitle(lifeStage)}</h2><p>{lifeStage === "research" ? "岗位方向与你的复杂前端和工程化经历一致。AI 建议先确认实际工作方式，再决定是否投入完整申请。" : stageDescription(lifeStage)}</p></div><div className="progress-number"><strong>{progress}</strong><span>旅程进度</span></div></div>{lifeStage === "research" && <AnalysisPanel running={analysisRunning} done={analysisDone} step={analysisStep} onStart={onStartAnalysis} />}{lifeStage === "research" ? <EvidenceSection evidence={evidence} selectedEvidence={selectedEvidence} onSelectEvidence={onSelectEvidence} /> : <LifecycleWorkspace stage={lifeStage} action={lifecycleAction} onOpenInterview={onOpenInterview} onAction={onLifecycleAction} />}<DecisionBlock decision={decision} onDecision={onDecision} confirmedFacts={confirmedFacts} /></section><aside className="opportunity-aside"><div className="next-action"><span className="focus-label"><span className="focus-dot" />下一步行动</span><h3>{stageAction(lifeStage)}</h3><p>{stageActionDescription(lifeStage)}</p><button type="button" onClick={() => lifeStage === "interview" ? onOpenInterview() : onStage(nextLifeStage(lifeStage))}>{stageActionButton(lifeStage)} <ArrowRight size={15} /></button></div><div className="fact-snapshot"><div className="section-line"><h2>参与这次判断的事实</h2><button type="button" className="quiet-action" onClick={onOpenCareer}>检查 {confirmedFacts.length} 条 <ArrowRight size={13} /></button></div>{confirmedFacts.slice(0, 3).map((fact) => <div key={fact.id} className="snapshot-fact"><CheckCircle2 size={14} /><span>{fact.label}</span></div>)}</div></aside></div></div>;
}

function EvidenceSection({ evidence, selectedEvidence, onSelectEvidence }: { evidence: EvidenceItem[]; selectedEvidence: EvidenceItem; onSelectEvidence: (id: string) => void }) {
  return <div className="evidence-section"><div className="section-line"><h2>证据与未知</h2><span>{evidence.length} 条来源</span></div><div className="evidence-layout"><div className="evidence-list">{evidence.map((item) => <button key={item.id} className={`evidence-row ${item.id === selectedEvidence.id ? "selected" : ""}`} type="button" onClick={() => onSelectEvidence(item.id)}><span className={`evidence-tone tone-${item.tone}`} /><div><small>{item.source} · {strengthLabel(item.strength)}</small><strong>{item.title}</strong><p>{item.summary}</p></div><ChevronRight size={15} /></button>)}</div><div className="evidence-detail"><StatusChip tone={selectedEvidence.tone === "support" ? "positive" : selectedEvidence.tone === "neutral" ? "neutral" : "warning"}>{toneLabel(selectedEvidence.tone)}</StatusChip><h3>{selectedEvidence.title}</h3><p>{selectedEvidence.excerpt}</p><div className="impact-line"><span>影响</span>{selectedEvidence.impact}</div></div></div></div>;
}

function LifecycleWorkspace({ stage, action, onOpenInterview, onAction }: { stage: LifeStage; action: string | null; onOpenInterview: () => void; onAction: (text: string) => void }) {
  const content: Record<Exclude<LifeStage, "research" | "discover">, { title: string; body: string; items: string[]; button: string }> = {
    communicate: { title: "把关键问题问得自然", body: "这条消息只会留在草稿里。你可以修改后，亲自在招聘平台发送。", items: ["团队实际每周到岗与远程规则", "岗位是否承担人员绩效管理", "当前最重要的技术目标与授权范围"], button: "生成沟通草稿" },
    applied: { title: "申请已经进入你的记录", body: "保存投递渠道、时间和当时使用的材料，之后才知道哪些判断得到了现实回应。", items: ["申请渠道：招聘平台", "申请材料：岗位定制版简历", "待跟进：3 个工作日后回看"], button: "记录一次跟进" },
    interview: { title: "面试准备与现场复盘", body: "围绕这个岗位的真实上下文准备，不把通用题库当成你的经历。", items: ["准备 3 个架构经历切入点", "记录对方提到的团队与授权", "面试后补充真实反馈"], button: "打开面试准备" },
    offer: { title: "把 Offer 放回你的生活里比较", body: "薪资只是一个字段。把职级、工作方式、成长空间和机会成本放在同一张判断里。", items: ["35-45K · 14 薪", "每周远程两天（待确认）", "平台能力建设方向"], button: "添加 Offer 条款" },
    outcome: { title: "结果不是终点，是新的证据", body: "记录发生了什么，哪些地方和你的判断不同，再决定是否调整方向或表达。", items: ["当前状态：等待真实结果", "复盘问题：哪条证据最有价值？", "策略回写：等待你的确认"], button: "开始一次复盘" },
  };
  const current = content[stage as Exclude<LifeStage, "research" | "discover">] ?? content.communicate;
  return <div className="lifecycle-workspace"><span className="focus-label"><span className="focus-dot" />{lifecycle[stageIndex(stage)].label}</span><h2>{current.title}</h2><p>{current.body}</p><div className="workspace-items">{current.items.map((item) => <div key={item}><CheckCircle2 size={14} /><span>{item}</span></div>)}</div><button type="button" onClick={() => stage === "interview" ? onOpenInterview() : onAction(`${current.button}已加入当前旅程，等待你的审核。`)}>{stage === "interview" ? current.button : action ?? current.button} <ArrowRight size={15} /></button></div>;
}

function DecisionBlock({ decision, onDecision, confirmedFacts }: { decision: UserDecision; onDecision: (decision: Exclude<UserDecision, null>) => void; confirmedFacts: CareerFact[] }) {
  return <div className="decision-block"><div><span className="focus-label"><span className="focus-dot" />用户决定</span><h2>{decision ? `已选择${decisionLabel(decision)}` : "这份机会值得投入多少？"}</h2><p>{decision ? "决定已和系统建议分开保存。你之后可以在面试与结果复盘中继续更新它。" : `系统已经结合 ${confirmedFacts.length} 条已确认事实形成建议，但最终选择仍然属于你。`}</p></div><div className="decision-buttons"><button type="button" onClick={() => onDecision("apply")}><strong>申请</strong><small>继续进入沟通与面试</small></button><button type="button" onClick={() => onDecision("hold")}><strong>暂缓</strong><small>先获得关键确认</small></button><button type="button" onClick={() => onDecision("decline")}><strong>放弃</strong><small>保留判断，停止投入</small></button></div></div>;
}

function stageTitle(stage: LifeStage) {
  return stage === "communicate" ? "先把问题问清楚，再决定投入" : stage === "applied" ? "申请已经进入你的现实旅程" : stage === "interview" ? "面试是一次双向判断" : stage === "offer" ? "把 Offer 放回你的生活里看" : "用真实结果校准下一步";
}

function stageDescription(stage: LifeStage) {
  return stage === "communicate" ? "沟通草稿可以由 AI 起草，但发送、语气和时机仍由你控制。" : stage === "applied" ? "从这里开始记录每一次外部行动，后续的面试和结果会回到同一个机会。" : stage === "interview" ? "准备和复盘都绑定当前岗位，不用把通用题库当成你的经历。" : stage === "offer" ? "薪资、职级、工作方式、成长空间和机会成本需要一起比较。" : "结果不会改写过去的判断，但会成为下一次策略的证据。";
}

function stageAction(stage: LifeStage) {
  return stage === "communicate" ? "准备一次沟通" : stage === "applied" ? "记录下一次跟进" : stage === "interview" ? "准备明天的面试" : stage === "offer" ? "比较这份 Offer" : stage === "outcome" ? "复盘这次经历" : "问清实际工作方式";
}

function stageActionDescription(stage: LifeStage) {
  return stage === "communicate" ? "只生成草稿，不会替你发送。" : stage === "applied" ? "保留时间、渠道和使用的材料。" : stage === "interview" ? "把岗位上下文带进准备和现场记录。" : stage === "offer" ? "不要只看数字，也看生活和长期方向。" : stage === "outcome" ? "把结果带回职业底座，而不是只记一个状态。" : "这不是自动发送的消息，你可以让 AI 帮你准备。";
}

function stageActionButton(stage: LifeStage) {
  return stage === "communicate" ? "准备草稿" : stage === "applied" ? "记录跟进" : stage === "interview" ? "进入准备" : stage === "offer" ? "查看比较" : stage === "outcome" ? "开始复盘" : "准备沟通";
}

function nextLifeStage(stage: LifeStage): LifeStage {
  return lifecycle[Math.min(stageIndex(stage) + 1, lifecycle.length - 1)].id;
}

function InterviewView({ onStage }: { onStage: (stage: LifeStage) => void }) {
  return <div className="interview-view"><div className="page-intro compact"><div><p className="date-line">下一场 · 周五 14:00</p><h1>把一次面试，<br /><em>变成下一次的底气。</em></h1><p className="intro-copy">准备、进行、记录反馈，再把真实结果带回你的职业事实。</p></div></div><div className="interview-grid"><section className="interview-main"><div className="interview-card upcoming"><div className="interview-card-head"><span className="calendar-mark"><CalendarDays size={18} /></span><div><span className="date-line">即将到来 · 周五 14:00</span><h2>澄屿科技 · 技术负责人初面</h2></div><StatusChip tone="info">待准备</StatusChip></div><div className="interview-body"><div><span>这次面试要验证</span><strong>岗位是否真的有架构决策空间</strong></div><div><span>AI 已准备</span><strong>3 个经历切入点 · 5 个反问</strong></div></div><div className="interview-actions"><button type="button" onClick={() => onStage("interview")}>回到这份机会 <ArrowRight size={15} /></button></div></div><div className="interview-timeline"><div className="section-line"><h2>这次面试的进程</h2><span>1 次即将到来</span></div><TimelineRow status="done" title="预约确认" detail="确认面试时间与参与人" time="今天 11:20" /><TimelineRow status="current" title="准备面试" detail="把已确认事实转成可讲述的经历" time="现在" /><TimelineRow status="next" title="进行面试" detail="记录现场问题和你的判断" time="周五 14:00" /><TimelineRow status="next" title="面试复盘" detail="把反馈带回职业事实" time="待面试后" /></div></section><aside className="interview-aside"><div className="prep-note"><Sparkles size={17} /><h3>面试之后也要回来</h3><p>系统不会替你判断面试成败。它会帮你保留当时的问题、你的回答、对方反馈和下一步假设。</p></div><div className="result-log"><span className="date-line">最近一次复盘</span><h3>还没有真实面试记录</h3><p>完成一次面试后，这里会出现可复用的学习。</p></div></aside></div></div>;
}

function TimelineRow({ status, title, detail, time }: { status: "done" | "current" | "next"; title: string; detail: string; time: string }) {
  return <div className={`timeline-row ${status}`}><span className="timeline-marker">{status === "done" ? <Check size={12} /> : status === "current" ? <Clock3 size={12} /> : <Circle size={8} />}</span><div><strong>{title}</strong><p>{detail}</p></div><time>{time}</time></div>;
}

function CareerView({ facts, inferredFacts, confirmedFacts, onFact }: { facts: CareerFact[]; inferredFacts: CareerFact[]; confirmedFacts: CareerFact[]; onFact: (id: string, status: "confirmed" | "rejected") => void }) {
  return <div className="career-view"><div className="page-intro compact"><div><p className="date-line">当前有效 · 8 年经历</p><h1>先记住你<br /><em>真正做过什么。</em></h1><p className="intro-copy">这不是一份静态简历。它会随着机会、面试和结果持续修正。</p></div></div><div className="career-grid"><section className="career-main"><div className="fact-overview"><div><span>已确认</span><strong>{confirmedFacts.length}</strong></div><div><span>待你判断</span><strong>{inferredFacts.length}</strong></div><div><span>当前方向</span><strong>资深前端</strong></div></div><div className="section-line"><h2>当前有效事实</h2></div><div className="fact-list">{facts.filter((fact) => fact.status !== "rejected").map((fact) => <FactCard key={fact.id} fact={fact} onFact={onFact} />)}</div></section><aside className="career-aside"><div className="career-principle"><Database size={18} /><h3>用户拥有最终解释权</h3><p>AI 可以推断，但只有你确认过的内容才会进入申请、面试和结果分析。</p></div><div className="career-history"><span className="date-line">最近更正</span><strong>不承担人员绩效管理</strong><p>这条边界已经影响当前机会的判断和沟通准备。</p></div></aside></div></div>;
}

function FactCard({ fact, onFact }: { fact: CareerFact; onFact: (id: string, status: "confirmed" | "rejected") => void }) {
  const isInference = fact.status === "inferred";
  return <div className={`fact-card ${isInference ? "inference" : ""}`}><div className="fact-card-status"><StatusChip tone={isInference ? "warning" : fact.status === "unknown" ? "neutral" : "positive"}>{isInference ? "AI 推断" : fact.status === "unknown" ? "未知项" : "已确认"}</StatusChip><span>{fact.source}</span></div><h3>{fact.label}</h3><p>{fact.detail}</p>{isInference && <div className="fact-card-actions"><button type="button" onClick={() => onFact(fact.id, "rejected")}>不是这样</button><button type="button" onClick={() => onFact(fact.id, "confirmed")}>确认事实</button></div>}</div>;
}

function AgentDrawer({ context, messages, draft, onDraft, onSend, onClose }: { context: string; messages: AgentMessage[]; draft: string; onDraft: (value: string) => void; onSend: () => void; onClose: () => void }) {
  return <div className="agent-layer"><button className="agent-scrim" type="button" aria-label="关闭 AI 对话" onClick={onClose} /><aside className="agent-drawer" aria-label="AI 对话"><div className="agent-drawer-head"><div><span className="agent-orbit"><BrainCircuit size={16} /></span><div><strong>你的职业 Agent</strong><small>当前上下文：{context}</small></div></div><button className="icon-button" type="button" aria-label="关闭 AI 对话" title="关闭 AI 对话" onClick={onClose}><X size={18} /></button></div><div className="agent-context"><span>它能看见</span><strong>职业事实 · 机会证据 · 面试记录</strong></div><div className="agent-messages">{messages.map((message, index) => <div key={`${message.time}-${index}`} className={`agent-message ${message.from}`}><span>{message.from === "agent" ? <Sparkles size={13} /> : "你"}</span><p>{message.text}</p><small>{message.time}</small></div>)}</div><div className="agent-suggestions"><button type="button" onClick={() => onDraft("为什么建议谨慎投入？")}>为什么是谨慎投入？</button><button type="button" onClick={() => onDraft("帮我准备明天的面试")}>帮我准备面试</button><button type="button" onClick={() => onDraft("这条证据可靠吗？")}>这条证据可靠吗？</button></div><div className="agent-composer"><textarea aria-label="和职业 Agent 对话" placeholder="问问当前这件事……" value={draft} onChange={(event) => onDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} /><button type="button" aria-label="发送消息" title="发送消息" onClick={onSend}><Send size={16} /></button></div></aside></div>;
}

function StatusChip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "positive" | "warning" | "info" }) {
  return <span className={`status-chip chip-${tone}`}><span />{children}</span>;
}

function decisionLabel(decision: Exclude<UserDecision, null>) {
  return decision === "apply" ? "申请" : decision === "hold" ? "暂缓" : "放弃";
}

function strengthLabel(strength: EvidenceItem["strength"]) {
  return strength === "primary" ? "一手来源" : strength === "secondary" ? "二手来源" : "弱信号";
}

function toneLabel(tone: EvidenceItem["tone"]) {
  return tone === "support" ? "支持判断" : tone === "risk" ? "风险信号" : tone === "conflict" ? "来源冲突" : "背景事实";
}

export default App;
