import { ArrowRightIcon, ClipboardTextIcon, ClockIcon, FileTextIcon, LinkIcon, SparkleIcon, XIcon } from "@phosphor-icons/react";
import type { Dispatch } from "react";
import type { AppAction } from "../../app/state";
import type { DemoState, Opportunity } from "../../domain/model";
import { demoOpportunity, demoOpportunityAlternative, opportunityTrace } from "../../data/demo-content";
import { ObjectHeader, PrimaryButton, QuietButton, StatusPill, TraceList } from "../../components/ui";

export function OpportunityIntakeView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const parsed = state.opportunityParse.status === "done";
  const parsing = state.opportunityParse.status === "running";
  const input = state.opportunityInput;
  const draft = state.opportunityDraft;
  const example = state.opportunities.length % 2 === 0 ? demoOpportunity : demoOpportunityAlternative;

  const useExample = () => {
    dispatch({ type: "set-opportunity-input", field: "text", value: `${example.company}\n${example.role}\n\n${example.description}\n\n薪资：${example.salary}\n地点：${example.location}` });
    dispatch({ type: "set-opportunity-input", field: "source", value: example.source });
    dispatch({ type: "set-opportunity-input", field: "capturedAt", value: "刚刚" });
  };

  return <div className="feature-view opportunity-intake-view">
    <ObjectHeader eyebrow="带入一个机会" title={<>把你看到的机会<br /><em>带回你的语境。</em></>} description="先录入你实际看到的正文、来源和时间。解析不会覆盖原始材料，机会草稿也要由你检查后才会进入职业现场。" status={<StatusPill tone={parsed ? "positive" : parsing ? "warning" : "neutral"}>{parsed ? "草稿待确认" : parsing ? "解析中" : "等待材料"}</StatusPill>} />
    <div className="intake-layout">
      <section className="intake-form" aria-labelledby="intake-material-title">
        <div className="intake-section-head"><div><span className="intake-kicker"><FileTextIcon size={14} />原始机会材料</span><h2 id="intake-material-title">保留你实际看到的内容</h2></div><button type="button" className="intake-example" disabled={parsing} onClick={useExample}>使用演示职位</button></div>
        <label className="intake-primary-field"><span><ClipboardTextIcon size={15} />职位正文</span><textarea value={input.text} disabled={parsing} placeholder="粘贴公司名称、职位名称、职责和要求……" onChange={(event) => dispatch({ type: "set-opportunity-input", field: "text", value: event.target.value })} /><small>链接只作为来源记录，不会被自动访问。当前输入 {input.text.trim().length} 字。</small></label>
        <div className="intake-meta" aria-label="材料来源信息"><label><span><LinkIcon size={14} />来源</span><input value={input.source} disabled={parsing} placeholder="例如：招聘平台、朋友推荐、公司官网" onChange={(event) => dispatch({ type: "set-opportunity-input", field: "source", value: event.target.value })} /></label><label><span><ClockIcon size={14} />采集时间</span><input value={input.capturedAt} disabled={parsing} onChange={(event) => dispatch({ type: "set-opportunity-input", field: "capturedAt", value: event.target.value })} /></label></div>
        <div className="intake-actions"><PrimaryButton onClick={() => dispatch({ type: "start-opportunity-parse" })} disabled={parsing || input.text.trim().length < 20}>{parsing ? "解析进行中" : parsed ? "重新解析" : "开始解析材料"}</PrimaryButton>{parsing ? <button type="button" className="button-quiet" onClick={() => dispatch({ type: "cancel-opportunity-parse" })}><XIcon size={14} />取消解析</button> : <QuietButton onClick={() => dispatch({ type: "set-view", view: "today" })}>先回到今天</QuietButton>}</div>
      </section>
      <aside className={`intake-trace ${parsed ? "is-complete" : parsing ? "is-running" : "is-idle"}`} aria-labelledby="intake-trace-title">
        <div className="trace-heading"><span id="intake-trace-title"><SparkleIcon size={16} />AI 整理过程</span><StatusPill tone={parsed ? "positive" : parsing ? "warning" : "neutral"}>{parsed ? "已完成" : parsing ? "处理中" : "待开始"}</StatusPill></div>
        <p className="intake-trace-intro">整理原始材料，再把识别结果和未知项交给你确认。</p>
        <TraceList steps={opportunityTrace} current={state.opportunityParse.step} status={state.opportunityParse.status} />
        {draft && <OpportunityDraftEditor draft={draft} dispatch={dispatch} />}
      </aside>
    </div>
  </div>;
}

function OpportunityDraftEditor({ draft, dispatch }: { draft: Opportunity; dispatch: Dispatch<AppAction> }) {
  const update = (field: keyof Opportunity, value: string) => dispatch({ type: "update-opportunity-draft", field, value });
  return <div className="draft-object draft-editor"><span className="eyebrow">待你确认的机会草稿</span><div className="draft-fields"><label><span>公司</span><input value={draft.company} onChange={(event) => update("company", event.target.value)} /></label><label><span>职位</span><input value={draft.role} onChange={(event) => update("role", event.target.value)} /></label><label><span>薪资</span><input value={draft.salary} onChange={(event) => update("salary", event.target.value)} /></label><label><span>地点 / 工作方式</span><input value={draft.location} onChange={(event) => update("location", event.target.value)} /></label><label className="draft-field-wide"><span>绑定方向</span><input value={draft.direction} onChange={(event) => update("direction", event.target.value)} /></label><label className="draft-field-wide"><span>职位摘要</span><textarea value={draft.description} onChange={(event) => update("description", event.target.value)} /></label></div><p>确认后才会创建机会对象；原始输入继续保留在本次体验中。</p><button type="button" className="button-primary" disabled={!draft.company.trim() || !draft.role.trim()} onClick={() => dispatch({ type: "confirm-opportunity" })}>确认创建机会对象 <ArrowRightIcon size={15} /></button></div>;
}
