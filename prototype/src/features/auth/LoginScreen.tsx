import { useId } from "react";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  CompassIcon,
  FileTextIcon,
  QuestionIcon,
  ShieldWarningIcon,
} from "@phosphor-icons/react";
import { Button } from "../../components/Button";

function ResearchGrid() {
  const id = useId().replace(/:/g, "");

  return (
    <svg aria-hidden className="landing-pattern landing-window-grid">
      <defs>
        <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse" x="-1" y="-1">
          <path d="M.5 12V.5H12" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

const workflow = [
  {
    icon: FileTextIcon,
    title: "建立职业事实",
    detail: "把简历、项目和你的补充整理成可更正的事实。推断与未知会被单独标记。",
  },
  {
    icon: BriefcaseIcon,
    title: "研究具体机会",
    detail: "保留职位原文和来源，核对公司、岗位、现实限制与仍需向招聘方确认的问题。",
  },
  {
    icon: CompassIcon,
    title: "形成行动判断",
    detail: "把证据、建议和申请材料放回同一个决定里。是否投入，最终仍由你选择。",
  },
];

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="landing-home" id="top">
      <header className="landing-nav">
        <a className="landing-brand" href="#top" aria-label="择途首页">
          <span className="landing-brand-cn">择途</span>
          <span className="landing-brand-en">THE TWO</span>
        </a>
        <nav className="landing-nav-links" aria-label="首页导航">
          <a href="#workflow">工作方式</a>
          <a href="#boundary">产品边界</a>
        </nav>
        <Button tone="primary" type="button" className="landing-nav-enter" onClick={onLogin}>
          进入我的空间
          <ArrowRightIcon size={15} />
        </Button>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <span aria-hidden className="landing-hero-rail is-left" />
        <span aria-hidden className="landing-hero-rail is-right" />

        <div className="landing-hero-copy">
          <p className="landing-kicker">一个部署，只服务一个人</p>
          <h1 id="landing-title">
            <span className="landing-hero-brand">择途</span>
            <span>把职业选择，<br />留在自己手里。</span>
          </h1>
          <p className="landing-hero-lead">
            在自己掌控的系统里，保存真实经历，研究具体机会，留下每次决定的依据。AI 负责调查和追问，你保留最后的解释权。
          </p>
          <div className="landing-hero-actions">
            <Button tone="primary" size="large" type="button" className="landing-primary-action" onClick={onLogin}>
              进入本地演示
              <ArrowRightIcon size={17} />
            </Button>
            <a className="landing-text-action" href="#workflow">了解工作方式</a>
          </div>
          <p className="landing-demo-note">概念原型只保留本次体验。刷新后恢复示例内容，不会替你发送、沟通或投递。</p>
          <dl className="landing-hero-facts">
            <div>
              <dt>部署</dt>
              <dd>独立部署</dd>
            </div>
            <div>
              <dt>账户</dt>
              <dd>唯一所有者</dd>
            </div>
            <div>
              <dt>角色</dt>
              <dd>职业研究与决策</dd>
            </div>
          </dl>
        </div>

        <div className="landing-product-window" aria-label="择途机会研究台预览">
          <div className="landing-window-bar">
            <span>机会研究台</span>
            <span>本地演示</span>
          </div>
          <div className="landing-window-body">
            <ResearchGrid />
            <div className="landing-window-heading">
              <div>
                <span>当前机会</span>
                <strong>高级前端工程师</strong>
              </div>
              <span className="landing-advice">谨慎投入</span>
            </div>
            <p className="landing-window-question">这个机会值得投入时间吗？</p>
            <div className="landing-evidence-grid">
              <div className="is-supporting">
                <CheckCircleIcon size={17} />
                <span><strong>2 条</strong>支持证据</span>
              </div>
              <div className="is-conflict">
                <ShieldWarningIcon size={17} />
                <span><strong>1 条</strong>现实冲突</span>
              </div>
              <div className="is-unknown">
                <QuestionIcon size={17} />
                <span><strong>3 项</strong>仍需确认</span>
              </div>
            </div>
            <div className="landing-reasoning">
              <span>建议依据</span>
              <p>技术方向匹配，但工作方式仍触碰你的硬约束。先确认团队节奏，再决定是否申请。</p>
            </div>
            <ol className="landing-progress" aria-label="机会研究进度">
              <li className="is-done"><span>1</span>职业事实</li>
              <li className="is-done"><span>2</span>证据研究</li>
              <li className="is-current"><span>3</span>形成判断</li>
              <li><span>4</span>准备申请</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="landing-section landing-workflow" id="workflow" aria-labelledby="workflow-title">
        <div className="landing-section-heading">
          <p>从事实走向决定</p>
          <h2 id="workflow-title">一条连续的研究路径</h2>
          <span>不做职位 CRM，也不替你自动投递。每一步只为下一次判断留下可信的上下文。</span>
        </div>
        <div className="landing-workflow-list">
          {workflow.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title}>
                <span className="landing-workflow-index">0{index + 1}</span>
                <Icon className="landing-workflow-icon" size={20} />
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-boundary" id="boundary" aria-labelledby="boundary-title">
        <div className="landing-boundary-intro">
          <p>产品边界</p>
          <h2 id="boundary-title">这是你的空间，<br />也是你的决定。</h2>
        </div>
        <div className="landing-boundary-columns">
          <article>
            <span>关于所有权</span>
            <h3>一个实例，一个所有者</h3>
            <p>不提供公开注册、成员邀请或账号切换。职业信息保存在你控制的部署环境中。</p>
          </article>
          <article>
            <span>关于 AI</span>
            <h3>顾问可以质疑，不能裁决</h3>
            <p>建议说明依据、不利证据和未知项。职业事实由你确认，对外表达由你审核。</p>
          </article>
        </div>
      </section>

      <div className="landing-close">
        <p>不是把你变成一份更漂亮的简历。</p>
        <strong>是让每次选择，都有来处。</strong>
      </div>

      <footer className="landing-footer">
        <div>
          <span className="landing-brand-cn">择途</span>
          <span>THE TWO</span>
        </div>
        <p>开源 · 独立部署 · 个人专属</p>
      </footer>
    </main>
  );
}
