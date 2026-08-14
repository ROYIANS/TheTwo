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
  return <div className="onboarding-view"><ObjectHeader eyebrow="第一次进来" title={<>先放点什么<br /><em>在这里。</em></>} description="没有预设档案。从你觉得最顺手的地方开始，每一条事实都等你来说行还是不行。" /><div className="start-grid"><button type="button" className="start-choice start-choice-main" onClick={onResume}><span className="choice-icon"><UploadSimpleIcon size={18} /></span><span><strong>带入一份简历或经历</strong><small>选本地文件，或者用演示简历先试试。</small></span><ArrowRightIcon size={16} /></button><button type="button" className="start-choice" onClick={onInterview}><span className="choice-icon"><ChatCircleIcon size={18} /></span><span><strong>先聊聊你在找什么</strong><small>你说的话会直接进入分析，不是占位示例。</small></span><ArrowRightIcon size={16} /></button></div><div className="onboarding-note"><FileTextIcon size={16} /><p>不用一次说完。先建立够支撑一次判断的东西，其余的在真实机会里再补。</p></div></div>;
}

function ConversationView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const answer = state.profileMaterial.text;
  return <div className="onboarding-view"><ObjectHeader eyebrow="先聊聊" title={<>你在意的事，<br /><em>先说出来。</em></>} description="不是问卷。你的回答直接成为分析输入，AI 只提出候选理解，你来决定哪些算数。" /><section className="conversation-surface"><div className="conversation-prompt"><span className="agent-icon"><ChatCircleIcon size={16} /></span><div><strong>如果下一份工作只能先满足三件事，你最不愿意牺牲什么？</strong><p>可以说薪资、工作方式、技术方向、团队状态，或者你还说不清楚的感觉。</p></div></div><textarea aria-label="职业访谈回答" value={answer} placeholder="写下你的真实想法……" onChange={(event) => dispatch({ type: "set-profile-conversation", text: event.target.value })} /><div className="input-helper"><span>{answer.trim().length} 字 · 只保存在当前浏览器内存</span><button type="button" onClick={() => dispatch({ type: "set-profile-conversation", text: "我想继续做复杂前端和工程化，但不想用长期加班换成长。地点希望在上海，最好能有混合办公。" })}>填入示例回答</button></div><div className="conversation-actions"><button type="button" className="button-primary" disabled={answer.trim().length < 12} onClick={() => dispatch({ type: "start-profile-analysis" })}>整理我的回答 <ArrowRightIcon size={15} /></button><QuietButton onClick={() => dispatch({ type: "show-resume" })}>改用简历开始</QuietButton></div></section></div>;
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
      setError("这个演示只真实读取 TXT、Markdown 和 RTF。PDF / Word 不会被替换成演示内容，请先另存为文本。");
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
      setError("这份材料没能读取到，重新选择一次，或者用演示简历试试。");
    }
  };

  const cancelReading = () => {
    readVersionRef.current += 1;
    if (readTimerRef.current !== null) window.clearTimeout(readTimerRef.current);
    readTimerRef.current = null;
    setReading(false);
    setReadingFileName("");
    setError("");
    setFeedback("已取消，可以重新选择。");
    if (inputRef.current) inputRef.current.value = "";
  };

  return <div className="onboarding-view"><ObjectHeader eyebrow="放入材料" title={<>先有个真实的<br /><em>起点。</em></>} description="选本地文件、拖进来，或者用演示简历先跑一遍。材料只有在你确认开始分析后，才会产生候选事实。" status={reading ? <StatusPill tone="warning">正在读取文件</StatusPill> : material.text ? <StatusPill tone="positive">材料已就绪</StatusPill> : undefined} />
    {!material.text ? <section className={`upload-surface ${reading ? "is-reading" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void selectFile(event.dataTransfer.files[0]); }}>
      <input ref={inputRef} className="visually-hidden" type="file" accept=".txt,.md,.markdown,.rtf,text/plain,text/markdown,application/rtf" onChange={(event) => void selectFile(event.target.files?.[0])} />
      <span className="upload-icon">{reading ? <span className="spinner" /> : <FileArrowUpIcon size={24} />}</span>
      <h2>{reading ? `正在读取 ${readingFileName}` : "选择或拖入你的简历"}</h2>
      <p>{reading ? "读完先看原文，你决定要不要开始分析。" : "真实读取 TXT、Markdown 和 RTF；PDF / Word 不会被替换成演示内容。材料只在浏览器内存里。"}</p>
      <div className="upload-actions"><button type="button" className="button-primary" disabled={reading} onClick={() => inputRef.current?.click()}>选择本地文件</button>{reading ? <button type="button" onClick={cancelReading}><XIcon size={14} />取消读取</button> : <button type="button" onClick={() => dispatch({ type: "set-profile-material", source: "sample", name: "演示简历｜林舟.txt", text: demoResumeText })}>使用演示简历</button>}</div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {feedback && <p className="form-feedback" role="status">{feedback}</p>}
    </section> : <section className="material-sheet"><div className="material-sheet-head"><span>{material.name}</span><button type="button" aria-label="移除当前材料" onClick={() => dispatch({ type: "clear-profile-material" })}><XIcon size={14} />重新选择</button></div><pre>{material.text}</pre><div className="material-actions"><button type="button" className="button-primary" onClick={() => dispatch({ type: "start-profile-analysis" })}>开始分析这份材料 <ArrowRightIcon size={15} /></button><QuietButton onClick={() => dispatch({ type: "restart-onboarding" })}>回到起点</QuietButton></div></section>}
  </div>;
}

function ProfileAnalysis({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  return <div className="onboarding-view"><ObjectHeader eyebrow="分析中" title={<>看看它<br /><em>怎么理解你。</em></>} description={`正在读取：${state.profileMaterial.name || "职业材料"}。每一步都可以被检查。这里还没有任何事实进来。`} status={<span className="analysis-badge">处理中</span>} /><section className="analysis-surface"><TraceList steps={profileTrace} current={state.profileAnalysis.step} status={state.profileAnalysis.status} /><div className="analysis-boundary"><span>接下来它会给出候选理解。你来决定哪些是真的。</span><button type="button" onClick={() => dispatch({ type: "cancel-profile-analysis" })}><XIcon size={13} />取消分析</button></div></section></div>;
}

function FactReview({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const pending = state.facts.filter((fact) => fact.status === "inferred");
  const confirmed = state.facts.filter((fact) => fact.status === "confirmed");
  return <div className="onboarding-view"><ObjectHeader eyebrow="候选事实" title={<>哪些是真的，<br /><em>你来说。</em></>} description={`从"${state.profileMaterial.name}"里提出了 ${state.facts.length} 条。确认、否定，或改完再确认都行。`} status={<span className="analysis-badge">{pending.length ? `${pending.length} 条还没确认` : "可以继续"}</span>} /><div className="fact-review-list">{state.facts.map((fact) => <FactCard key={fact.id} fact={fact} dispatch={dispatch} />)}</div><div className="review-footer"><span>{confirmed.length} 条已确认 · {pending.length} 条仍待判断</span><PrimaryButton disabled={confirmed.length < 3} onClick={() => dispatch({ type: "open-direction" })}>进入方向确认</PrimaryButton></div></div>;
}

function DirectionView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const initial = state.direction ?? demoDirection;
  const [title, setTitle] = useState(initial.title);
  const [summary, setSummary] = useState(initial.summary);
  const [hardConstraints, setHardConstraints] = useState(initial.hardConstraints.join("\n"));
  const [preferences, setPreferences] = useState(initial.preferences.join("\n"));
  const direction: CareerDirection = { title: title.trim(), summary: summary.trim(), hardConstraints: toLines(hardConstraints), preferences: toLines(preferences) };
  const ready = Boolean(direction.title && direction.summary && direction.hardConstraints.length > 0);

  return <div className="onboarding-view"><ObjectHeader eyebrow="职业方向" title={<>把不能让步的<br /><em>说出来。</em></>} description="不只是写个标签。把底线说清楚，顺便想想哪些地方可以权衡。保存后的内容会参与机会判断。" /><section className="direction-surface direction-editor"><label><span>当前主方向</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label><span>方向说明</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} /></label><div className="direction-columns"><label><span>不可突破 · 每行一项</span><textarea value={hardConstraints} onChange={(event) => setHardConstraints(event.target.value)} /></label><label><span>可以权衡 · 每行一项</span><textarea value={preferences} onChange={(event) => setPreferences(event.target.value)} /></label></div><div className="direction-actions"><button type="button" className="button-primary" disabled={!ready} onClick={() => dispatch({ type: "confirm-direction", direction })}>保存当前方向 <ArrowRightIcon size={15} /></button><QuietButton onClick={() => dispatch({ type: "set-view", view: "profile" })}>回去修改事实</QuietButton></div></section></div>;
}

function toLines(value: string) { return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean); }
