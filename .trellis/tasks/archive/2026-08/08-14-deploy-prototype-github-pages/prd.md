# 自动部署 prototype 到 GitHub Pages

## Goal

让 `main` 分支中的 `prototype` 在相关文件变化时由 GitHub Actions 自动构建并发布到 `https://royians.github.io/TheTwo/`，同时保持本地开发地址和资源路径不受影响。

## Requirements

* 使用 GitHub Pages 官方 artifact / deploy actions，不维护 `gh-pages` 分支。
* workflow 仅在 `main` 的 `prototype/**` 或自身配置变化时自动触发，并支持手动触发。
* CI 使用项目声明的 pnpm `9.15.0`、Node.js 22 和 `prototype/pnpm-lock.yaml`。
* 安装使用冻结 lockfile，构建产物为 `prototype/dist`。
* Pages 构建使用 `/TheTwo/` 作为 Vite base；普通本地开发与普通构建继续使用 `/`。
* workflow 只申请读取仓库、写 Pages 和 OIDC 所需的最小权限。

## Acceptance Criteria

* [x] `corepack pnpm check` 通过。
* [x] 普通 `corepack pnpm build` 仍生成根路径资源引用。
* [x] Pages mode 构建成功，产物资源引用以 `/TheTwo/` 开头。
* [x] GitHub Actions workflow 的工作目录、缓存 lockfile 和 artifact 路径正确。
* [x] `git diff --check` 通过。

## Definition of Done

* 部署配置和任务记录已提交。
* 不安装或升级本地依赖，不修改 lockfile。
* 用户只需在 GitHub Pages 设置中选择 `GitHub Actions` 作为 Source。

## Technical Approach

* 将 `prototype/vite.config.ts` 改为回调式 `defineConfig`，仅当 `mode === "pages"` 时设置 `base: "/TheTwo/"`。
* 新增 `.github/workflows/deploy-prototype.yml`，分为 build 和 deploy 两个 job。
* CI 先运行 `pnpm check`，再使用本地 `pnpm exec vite build --mode pages` 生成 Pages 产物，避免 pnpm script 参数转发把 `--` 作为位置参数传给 Vite。

## Decision (ADR-lite)

**Context**: 仓库是 GitHub project site，而不是根域用户站点；静态资源必须包含仓库子路径。固定全局 base 会影响本地普通构建。

**Decision**: 使用专用 `pages` mode 注入 `/TheTwo/` base，并通过官方 Pages actions 发布 artifact。

**Consequences**: 本地日常构建保持原行为；Pages workflow 必须分别运行类型检查和带 `--mode pages` 的 Vite 构建。仓库重命名时需要同步修改 base。

## Out of Scope

* 不配置自定义域名。
* 不增加后端、持久化或运行时环境变量。
* 不自动修改 GitHub 仓库的 Pages Source 设置。

## Technical Notes

* Remote: `https://github.com/ROYIANS/TheTwo`。
* Prototype package: `prototype/package.json`，package manager 为 `pnpm@9.15.0`。
* 已验证 `pnpm build -- --mode pages` 在当前 pnpm 下不会正确激活 mode，因此不使用该写法。

## Execution Status

* 已完成 Vite `pages` mode 和 GitHub Pages workflow 实现。
* 已将部署契约晋升到 `docs/specs/operations/prototype-github-pages-deployment.md`，并增加 Trellis 执行摘要。
* 类型检查、普通构建、Pages 构建、路径断言、workflow 契约和 diff 检查均已通过。
* 下一动作：提交任务范围内改动，随后归档任务并记录会话日志。
