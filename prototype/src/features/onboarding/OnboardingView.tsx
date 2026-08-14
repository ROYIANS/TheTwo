import { ArrowRightIcon, ChatCircleIcon, FileArrowUpIcon, FileTextIcon, UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type Dispatch } from "react";
import { demoDirection, demoResumeText, profileTrace } from "../../data/demo-content";
import { type AppAction } from "../../app/state";
import type { CareerDirection, DemoState } from "../../domain/model";
import { ObjectHeader, PrimaryButton, QuietButton, StatusPill, TraceList } from "../../components/ui";
import { FactCard } from "../profile/FactCard";

export function OnboardingView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  if (state.setupStep === "welcome") return <Welcome onResume={() => dispatch({ type: "show-resume" })} onInterview={() => dispatch({ type: "start-conversation" })} />;
  if (state.setupStep === "import") return <ImportView state={state} dispatch={dispatch} />;
  if (state.setupStep === "interview") return <ConversationView state={state} dispatch={dispatch} />;
  if (state.setupStep === "profile-analysis") return <ProfileAnalysis state={state} dispatch={dispatch} />;
  if (state.setupStep === "facts") return <FactReview state={state} dispatch={dispatch} />;
  return <DirectionView state={state} dispatch={dispatch} />;
}

function Welcome({ onResume, onInterview }: { onResume: () => void; onInterview: () => void }) {
  return <div className="onboarding-view"><ObjectHeader eyebrow="第一次使用" title={<>先让系统<br /><em>认识你。</em></>} description="这里不会预先放入一份职业档案。你可以从最轻的一步开始，之后每一条事实都由你确认。" /><div className="start-grid"><button type="button" className="start-choice start-choice-main" onClick={onResume}><span className="choice-icon"><UploadSimpleIcon size={18} /></span><span><strong>带入一份简历或经历</strong><small>选择本地材料或明确使用演示简历，再开始读取。</small></span><ArrowRightIcon size={16} /></button><button type="button" className="start-choice" onClick={onInterview}><span className="choice-icon"><ChatCircleIcon size={18} /></span><span><strong>直接聊聊我在找什么</strong><small>你的实际回答会成为分析输入，不会被固定示例替换。</small></span><ArrowRightIcon size={16} /></button></div><div className="onboarding-note"><FileTextIcon size={16} /><p>第一次进入不代表要填写完整档案。先建立足够支持一次判断的可信上下文，剩下的在真实机会里继续补。</p></div></div>;
}

function ConversationView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const answer = state.profileMaterial.text;
  return <div className="onboarding-view"><ObjectHeader eyebrow="职业访谈 · 第一个问题" title={<>先从你在意的<br /><em>事情开始。</em></>} description="这里不是问卷。你的回答会成为本次分析的原始输入，AI 只会提出候选理解，再由你确认。" /><section className="conversation-surface"><div className="conversation-prompt"><span className="agent-icon"><ChatCircleIcon size={16} /></span><div><strong>如果下一份工作只能先满足三件事，你最不愿意牺牲什么？</strong><p>可以说薪资、工作方式、技术方向、团队状态，或者你还说不清楚的感觉。</p></div></div><textarea aria-label="职业访谈回答" value={answer} placeholder="写下你的真实想法……" onChange={(event) => dispatch({ type: "set-profile-conversation", text: event.target.value })} /><div className="input-helper"><span>{answer.trim().length} 字 · 只保存在当前浏览器内存</span><button type="button" onClick={() => dispatch({ type: "set-profile-conversation", text: "我想继续做复杂前端和工程化，但不想用长期加班换成长。地点希望在上海，最好能有混合办公。" })}>填入示例回答</button></div><div className="conversation-actions"><button type="button" className="button-primary" disabled={answer.trim().length < 12} onClick={() => dispatch({ type: "start-profile-analysis" })}>让 AI 整理我的回答 <ArrowRightIcon size={15} /></button><QuietButton onClick={() => dispatch({ type: "show-resume" })}>改用简历开始</QuietButton></div></section></div>;
}

function ImportView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const readTimerRef = useRef<number | null>(null);
  const readVersionRef = useRef(0);
  const [reading, setReading] = useState(false);
  const [readingFileName, setReadingFileName] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const material = state.profileMaterial;

  useEffect(() => () => {
    readVersionRef.current += 1;
    if (readTimerRef.current !== null) window.clearTimeout(readTimerRef.current);
  }, []);

  const selectFile = async (file?: File) => {
    if (!file) return;
    if (!/\.(txt|md|markdown|rtf)$/i.test(file.name)) {
      setError("当前概念 Demo 只会真实读取 TXT、Markdown 和 RTF。PDF / Word 不会被演示内容替换，请先另存为文本。");
      setFeedback("");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const readVersion = ++readVersionRef.current;
    setReading(true);
    setReadingFileName(file.name);
    setError("");
    setFeedback("");
    try {
      const content = await file.text();
      if (readVersion !== readVersionRef.current) return;
      readTimerRef.current = window.setTimeout(() => {
        if (readVersion !== readVersionRef.current) return;
        dispatch({ type: "set-profile-material", source: "file", name: file.name, text: content });
        setReading(false);
        setReadingFileName("");
        readTimerRef.current = null;
      }, 650);
    } catch {
      if (readVersion !== readVersionRef.current) return;
      setReading(false);
      setReadingFileName("");
      setError("没有读取到这份材料，请重新选择或使用演示简历。");
    }
  };

  const cancelReading = () => {
    readVersionRef.current += 1;
    if (readTimerRef.current !== null) window.clearTimeout(readTimerRef.current);
    readTimerRef.current = null;
    setReading(false);
    setReadingFileName("");
    setError("");
    setFeedback("已取消读取，你可以重新选择材料。");
    if (inputRef.current) inputRef.current.value = "";
  };

  return <div className="onboarding-view"><ObjectHeader eyebrow="建立职业上下文" title={<>先放入一段<br /><em>真实材料。</em></>} description="选择本地简历、拖入材料，或明确使用演示简历。材料只有在你确认开始分析后才会产生候选事实。" status={reading ? <StatusPill tone="warning">正在读取文件</StatusPill> : material.text ? <StatusPill tone="positive">材料已就绪</StatusPill> : undefined} />
    {!material.text ? <section className={`upload-surface ${reading ? "is-reading" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void selectFile(event.dataTransfer.files[0]); }}>
      <input ref={inputRef} className="visually-hidden" type="file" accept=".txt,.md,.markdown,.rtf,text/plain,text/markdown,application/rtf" onChange={(event) => void selectFile(event.target.files?.[0])} />
      <span className="upload-icon">{reading ? <span className="spinner" /> : <FileArrowUpIcon size={24} />}</span>
      <h2>{reading ? `正在读取 ${readingFileName}` : "选择或拖入你的简历"}</h2>
      <p>{reading ? "读取完成后先检查原文，再决定是否开始 AI 分析。" : "当前原型真实读取 TXT、Markdown 和 RTF；PDF / Word 不会被悄悄替换成演示内容。材料只保存在浏览器内存。"}</p>
      <div className="upload-actions"><button type="button" className="button-primary" disabled={reading} onClick={() => inputRef.current?.click()}>选择本地文件</button>{reading ? <button type="button" onClick={cancelReading}><XIcon size={14} />取消读取</button> : <button type="button" onClick={() => dispatch({ type: "set-profile-material", source: "sample", name: "演示简历｜林舟.txt", text: demoResumeText })}>使用演示简历</button>}</div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {feedback && <p className="form-feedback" role="status">{feedback}</p>}
    </section> : <section className="material-sheet"><div className="material-sheet-head"><span>{material.name}</span><button type="button" aria-label="移除当前材料" onClick={() => dispatch({ type: "clear-profile-material" })}><XIcon size={14} />重新选择</button></div><pre>{material.text}</pre><div className="material-actions"><button type="button" className="button-primary" onClick={() => dispatch({ type: "start-profile-analysis" })}>开始读取这份材料 <ArrowRightIcon size={15} /></button><QuietButton onClick={() => dispatch({ type: "restart-onboarding" })}>回到起点</QuietButton></div></section>}
  </div>;
}

function ProfileAnalysis({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  return <div className="onboarding-view"><ObjectHeader eyebrow="AI 正在读取" title={<>先看见它<br /><em>如何理解你。</em></>} description={`当前输入：${state.profileMaterial.name || "职业材料"}。过程中的每一步都可以被检查，此刻还没有任何候选内容进入职业事实。`} status={<span className="analysis-badge">处理中</span>} /><section className="analysis-surface"><TraceList steps={profileTrace} current={state.profileAnalysis.step} status={state.profileAnalysis.status} /><div className="analysis-boundary"><span>AI 只会提出候选理解；下一步需要你确认、修改或否定每条内容。</span><button type="button" onClick={() => dispatch({ type: "cancel-profile-analysis" })}><XIcon size={13} />取消分析</button></div></section></div>;
}

function FactReview({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const pending = state.facts.filter((fact) => fact.status === "inferred");
  const confirmed = state.facts.filter((fact) => fact.status === "confirmed");
  return <div className="onboarding-view"><ObjectHeader eyebrow="你的职业事实" title={<>你来决定<br /><em>哪些理解有效。</em></>} description={`AI 从“${state.profileMaterial.name}”中提取了 ${state.facts.length} 条候选事实。你可以确认、否定或先修改再确认。`} status={<span className="analysis-badge">{pending.length ? `${pending.length} 条待确认` : "可以继续"}</span>} /><div className="fact-review-list">{state.facts.map((fact) => <FactCard key={fact.id} fact={fact} dispatch={dispatch} />)}</div><div className="review-footer"><span>{confirmed.length} 条已确认 · {pending.length} 条仍待判断</span><PrimaryButton disabled={confirmed.length < 3} onClick={() => dispatch({ type: "open-direction" })}>进入方向确认</PrimaryButton></div></div>;
}

function DirectionView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const initial = state.direction ?? demoDirection;
  const [title, setTitle] = useState(initial.title);
  const [summary, setSummary] = useState(initial.summary);
  const [hardConstraints, setHardConstraints] = useState(initial.hardConstraints.join("\n"));
  const [preferences, setPreferences] = useState(initial.preferences.join("\n"));
  const direction: CareerDirection = { title: title.trim(), summary: summary.trim(), hardConstraints: toLines(hardConstraints), preferences: toLines(preferences) };
  const ready = Boolean(direction.title && direction.summary && direction.hardConstraints.length > 0);

  return <div className="onboarding-view"><ObjectHeader eyebrow="职业方向" title={<>把下一步<br /><em>说得能判断。</em></>} description="方向不是一个标签。请检查标题、目标、不可突破条件和可权衡偏好，保存后的内容会参与机会判断。" /><section className="direction-surface direction-editor"><label><span>当前主方向</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label><span>方向说明</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} /></label><div className="direction-columns"><label><span>不可突破 · 每行一项</span><textarea value={hardConstraints} onChange={(event) => setHardConstraints(event.target.value)} /></label><label><span>可以权衡 · 每行一项</span><textarea value={preferences} onChange={(event) => setPreferences(event.target.value)} /></label></div><div className="direction-actions"><button type="button" className="button-primary" disabled={!ready} onClick={() => dispatch({ type: "confirm-direction", direction })}>保存当前方向 <ArrowRightIcon size={15} /></button><QuietButton onClick={() => dispatch({ type: "set-view", view: "profile" })}>回去修改事实</QuietButton></div></section></div>;
}

function toLines(value: string) { return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean); }
