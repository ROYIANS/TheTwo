import { ArrowRight, FileText, MessageCircle, Upload } from "lucide-react";
import { demoResumeText, profileTrace, demoDirection } from "../../data/demo-content";
import type { DemoState } from "../../domain/model";
import { FactStatus, ObjectHeader, PrimaryButton, QuietButton, TraceList } from "../../components/ui";

export function OnboardingView({ state, dispatch }: { state: DemoState; dispatch: (action: any) => void }) {
  if (state.setupStep === "welcome") return <Welcome onResume={() => dispatch({ type: "show-resume" })} onInterview={() => dispatch({ type: "show-resume" })} />;
  if (state.setupStep === "import") return <ImportView state={state} dispatch={dispatch} />;
  if (state.setupStep === "profile-analysis") return <ProfileAnalysis state={state} />;
  if (state.setupStep === "facts") return <FactReview state={state} dispatch={dispatch} />;
  return <DirectionView state={state} dispatch={dispatch} />;
}

function Welcome({ onResume, onInterview }: { onResume: () => void; onInterview: () => void }) {
  return <div className="onboarding-view"><ObjectHeader eyebrow="第一次使用" title={<>先让系统<br /><em>认识你。</em></>} description="这里不会预先放入一份职业档案。你可以从最轻的一步开始，之后每一条事实都由你确认。" /><div className="start-grid"><button type="button" className="start-choice start-choice-main" onClick={onResume}><span className="choice-icon"><Upload size={18} /></span><span><strong>带入一份简历或经历</strong><small>AI 先读取材料，再把候选事实和未知项交给你判断。</small></span><ArrowRight size={16} /></button><button type="button" className="start-choice" onClick={onInterview}><span className="choice-icon"><MessageCircle size={18} /></span><span><strong>直接聊聊我在找什么</strong><small>从一次短访谈开始，逐步建立当前方向和决策标准。</small></span><ArrowRight size={16} /></button></div><div className="onboarding-note"><FileText size={16} /><p>第一次进入不代表要填写完整档案。先建立足够支持一次判断的可信上下文，剩下的在真实机会里继续补。</p></div></div>;
}

function ImportView({ state, dispatch }: { state: DemoState; dispatch: (action: any) => void }) {
  return <div className="onboarding-view"><ObjectHeader eyebrow="建立职业上下文" title={<>先放入一段<br /><em>真实材料。</em></>} description="下面是一份虚构演示简历。真实产品中这里可以来自上传、粘贴或访谈；现在先用它体验 AI 如何把材料变成可确认的事实。" /><section className="material-sheet"><div className="material-sheet-head"><span>演示材料 · 尚未进入职业事实</span><span>仅存在于当前浏览器</span></div><pre>{demoResumeText}</pre><div className="material-actions"><button type="button" className="button-primary" onClick={() => dispatch({ type: "start-profile-analysis" })}>开始读取这段材料 <ArrowRight size={15} /></button><QuietButton onClick={() => dispatch({ type: "set-view", view: "today" })}>稍后再来</QuietButton></div></section></div>;
}

function ProfileAnalysis({ state }: { state: DemoState }) {
  return <div className="onboarding-view"><ObjectHeader eyebrow="AI 正在读取" title={<>先看见它<br /><em>如何理解你。</em></>} description="过程中的每一步都可以被你检查。此刻只是整理候选事实，还没有任何内容进入当前职业上下文。" status={<span className="analysis-badge">处理中</span>} /><section className="analysis-surface"><TraceList steps={profileTrace} current={state.profileAnalysis.step} status={state.profileAnalysis.status} /><p className="analysis-boundary">AI 只会提出候选理解；下一步需要你确认哪些内容是真的。</p></section></div>;
}

function FactReview({ state, dispatch }: { state: DemoState; dispatch: (action: any) => void }) {
  const pending = state.facts.filter((fact) => fact.status === "inferred");
  const confirmed = state.facts.filter((fact) => fact.status === "confirmed");
  return <div className="onboarding-view"><ObjectHeader eyebrow="你的职业事实" title={<>你来决定<br /><em>哪些理解有效。</em></>} description={`AI 从材料里提取了 ${state.facts.length} 条候选事实。确认 ${confirmed.length} 条，否定或保留未知都可以；系统不会把推断悄悄带到下一步。`} status={<span className="analysis-badge">{pending.length ? `${pending.length} 条待确认` : "可以继续"}</span>} /><div className="fact-review-list">{state.facts.map((fact) => <article key={fact.id} className={`fact-review ${fact.status}`}><div className="fact-review-top"><FactStatus status={fact.status} /><small>{fact.source}</small></div><h2>{fact.label}</h2><p>{fact.detail}</p><div className="fact-consequence"><span>会影响</span>{fact.consequence}</div>{fact.status === "inferred" && <div className="fact-actions"><button type="button" onClick={() => dispatch({ type: "reject-fact", id: fact.id })}>不是这样</button><button type="button" className="button-primary" onClick={() => dispatch({ type: "confirm-fact", id: fact.id })}>确认这条事实 <ArrowRight size={14} /></button></div>}</article>)}</div><div className="review-footer"><span>{confirmed.length} 条已确认 · {pending.length} 条仍待判断</span><PrimaryButton disabled={confirmed.length < 3} onClick={() => dispatch({ type: "open-direction" })}>进入方向确认</PrimaryButton></div></div>;
}

function DirectionView({ state, dispatch }: { state: DemoState; dispatch: (action: any) => void }) {
  return <div className="onboarding-view"><ObjectHeader eyebrow="职业方向" title={<>把下一步<br /><em>说得能判断。</em></>} description="方向不是一个标签，而是一组会影响机会取舍的目标、限制和偏好。先确认一个当前主方向，之后可以继续调整。" /><section className="direction-surface"><div><p className="eyebrow">AI 根据已确认事实整理出的草案</p><h2>{demoDirection.title}</h2><p>{demoDirection.summary}</p></div><div className="direction-columns"><div><span>不可突破</span>{demoDirection.hardConstraints.map((item) => <strong key={item}>· {item}</strong>)}</div><div><span>可以权衡</span>{demoDirection.preferences.map((item) => <strong key={item}>· {item}</strong>)}</div></div><div className="direction-actions"><button type="button" className="button-primary" onClick={() => dispatch({ type: "confirm-direction" })}>确认这条方向 <ArrowRight size={15} /></button><QuietButton onClick={() => dispatch({ type: "set-view", view: "profile" })}>回去修改事实</QuietButton></div></section></div>;
}

