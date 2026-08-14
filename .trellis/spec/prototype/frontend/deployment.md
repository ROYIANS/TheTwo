# Prototype 部署执行约束

权威正文：[`docs/specs/operations/prototype-github-pages-deployment.md`](../../../../docs/specs/operations/prototype-github-pages-deployment.md)。

## 1. Scope / Trigger

修改 `prototype/` 的构建方式、GitHub Pages workflow、仓库名或发布路径时适用。

## 2. Signatures

* 普通构建：`corepack pnpm build`
* Pages 构建：`corepack pnpm exec vite build --mode pages`

## 3. Contracts

* 默认 `base` 保持 `/`；只有 `pages` mode 使用 `/TheTwo/`。
* artifact 固定为 `prototype/dist`，CI 不维护 `gh-pages` 分支。
* CI 使用 Node.js 22、pnpm 9.15.0 和冻结的 `prototype/pnpm-lock.yaml`。

## 4. Validation & Error Matrix

类型检查、依赖安装或 Pages 构建任一步失败，都必须阻止 deploy job。完整矩阵见权威正文。

## 5. Good / Base / Bad Cases

Pages 产物引用 `/TheTwo/assets/...`，普通产物引用 `/assets/...`；反向或混用都不通过验收。

## 6. Tests Required

运行类型检查、普通构建、Pages 构建和 `git diff --check`，并检查两种 `dist/index.html` 的资源前缀。

## 7. Wrong vs Correct

不要使用 `pnpm build -- --mode pages`；分别运行 `pnpm check` 与 `pnpm exec vite build --mode pages`。
