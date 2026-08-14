# 原型前端规范

本目录只约束可继续演进的产品概念原型，不代表择途正式前端或生产技术选型。

## Pre-Development Checklist

* 通过 Trellis 当前任务指针定位并阅读活动任务的 `prd.md`；
* 阅读 `docs/product/mvp-experience-backbone.md` 和 `docs/product/product-capability-map.md`；
* 阅读 [`conventions.md`](conventions.md)；
* 修改构建或部署时阅读 [`deployment.md`](deployment.md)；
* 确认本次改动仍是虚构数据、内存状态和前端交互，不接入真实服务。

## Quality Check

* 使用 `corepack pnpm build` 验证 TypeScript 和 Vite 构建；
* 修改 GitHub Pages 部署时，额外验证 `corepack pnpm exec vite build --mode pages` 的资源前缀；
* 使用 Playwright 或浏览器手动验证桌面、平板和移动视口；
* 检查页面无横向溢出、核心操作可达和控制台无错误；
* 验证关键状态变更后仍能回到当前对象和当前阶段；
* 不将原型组件、状态模型或依赖直接视为生产实现。
