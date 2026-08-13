import { ArrowRightIcon, ClipboardTextIcon, ClockIcon, FileTextIcon, LinkIcon, SparkleIcon } from "@phosphor-icons/react";
import type { Dispatch } from "react";
import type { AppAction } from "../../app/state";
import type { DemoState } from "../../domain/model";
import { demoOpportunity, demoOpportunityAlternative, opportunityTrace } from "../../data/demo-content";
import { ObjectHeader, PrimaryButton, QuietButton, StatusPill, TraceList } from "../../components/ui";

export function OpportunityIntakeView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const parsed = state.opportunityParse.status === "done";
  const parsing = state.opportunityParse.status === "running";
  const draft = state.opportunities.length % 2 === 0 ? demoOpportunity : demoOpportunityAlternative;

  return <div className="feature-view opportunity-intake-view">
    <ObjectHeader eyebrow="带入一个机会" title={<>把你看到的机会<br /><em>带回你的语境。</em></>} description="机会从原始材料开始，不从平台列表开始。先保留你看到的正文、来源和时间，再决定是否创建研究对象。" />
    <div className="intake-layout">
      <section className="intake-form" aria-labelledby="intake-material-title">
        <div className="intake-section-head">
          <div>
            <span className="intake-kicker"><FileTextIcon size={14} />原始机会材料</span>
            <h2 id="intake-material-title">保留你实际看到的内容</h2>
          </div>
          <span className="intake-local-note">仅保存在本次体验中</span>
        </div>
        <label className="intake-primary-field">
          <span><ClipboardTextIcon size={15} />职位正文</span>
          <textarea readOnly value={`${draft.company}\n${draft.role}\n\n${draft.description}`} />
          <small>原文会与解析结果一起保留；链接只作为来源记录，不会被自动访问。</small>
        </label>
        <div className="intake-meta" aria-label="材料来源信息">
          <label>
            <span><LinkIcon size={14} />来源</span>
            <input readOnly value="用户粘贴 · 招聘平台" />
          </label>
          <label>
            <span><ClockIcon size={14} />采集时间</span>
            <input readOnly value="刚刚" />
          </label>
        </div>
        <div className="intake-actions">
          <PrimaryButton onClick={() => dispatch({ type: "start-opportunity-parse" })} disabled={parsing}>{parsing ? "解析进行中" : parsed ? "重新解析" : "开始解析材料"}</PrimaryButton>
          <QuietButton onClick={() => dispatch({ type: "set-view", view: "today" })}>先回到今天</QuietButton>
        </div>
      </section>
      <aside className={`intake-trace ${parsed ? "is-complete" : parsing ? "is-running" : "is-idle"}`} aria-labelledby="intake-trace-title">
        <div className="trace-heading">
          <span id="intake-trace-title"><SparkleIcon size={16} />AI 整理过程</span>
          <StatusPill tone={parsed ? "positive" : parsing ? "warning" : "neutral"}>{parsed ? "已完成" : parsing ? "处理中" : "待开始"}</StatusPill>
        </div>
        <p className="intake-trace-intro">先整理材料，再把识别结果和未知项交给你确认。</p>
        <TraceList steps={opportunityTrace} current={state.opportunityParse.step} status={state.opportunityParse.status} />
        {parsed && <div className="draft-object">
          <span className="eyebrow">待你确认的机会草稿</span>
          <strong>{draft.company}<br />{draft.role}</strong>
          <p>这还不是一个已确认机会。确认后，它才会进入你的职业现场并产生研究任务。</p>
          <button type="button" className="button-primary" onClick={() => dispatch({ type: "confirm-opportunity" })}>确认创建机会对象 <ArrowRightIcon size={15} /></button>
        </div>}
      </aside>
    </div>
  </div>;
}
