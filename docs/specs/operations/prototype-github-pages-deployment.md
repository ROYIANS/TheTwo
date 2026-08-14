---
title: Prototype GitHub Pages 部署契约
type: spec
status: accepted
created: 2026-08-14
updated: 2026-08-14
owners:
  - ROYIANS
related:
  - ../../../prototype/vite.config.ts
  - ../../../.github/workflows/deploy-prototype.yml
---

# Prototype GitHub Pages 部署契约

## Purpose

本规范定义 `prototype/` 作为 GitHub project site 发布时的构建入口、资源路径、CI 权限和验收方式。它用于保证线上地址 `https://royians.github.io/TheTwo/` 可加载，同时不改变本地开发和普通构建的根路径行为。

## 1. Scope / Trigger

当 `prototype/**` 或 `.github/workflows/deploy-prototype.yml` 在 `main` 分支发生变化时，GitHub Actions 必须重新检查、构建并发布 prototype。workflow 同时必须支持人工触发。

本规范不覆盖自定义域名、后端服务、运行时密钥、预览分支和 `gh-pages` 分支维护。

## 2. Signatures

本地和 CI 使用以下命令签名：

```powershell
# 类型检查
corepack pnpm check

# 普通本地构建
corepack pnpm build

# GitHub Pages 构建
corepack pnpm exec vite build --mode pages
```

三条命令都在 `prototype/` 中运行。CI 使用 Node.js 22、pnpm 9.15.0，并通过 `pnpm install --frozen-lockfile` 安装 `prototype/pnpm-lock.yaml` 描述的依赖。

## 3. Contracts

| 输入或边界 | 契约 |
|---|---|
| Vite 默认 mode | `base` 为 `/` |
| Vite `pages` mode | `base` 为 `/TheTwo/` |
| Pages artifact | `prototype/dist` |
| 自动触发分支 | `main` |
| 自动触发路径 | `prototype/**`、`.github/workflows/deploy-prototype.yml` |
| workflow 权限 | `contents: read`、`pages: write`、`id-token: write` |
| 部署实现 | GitHub 官方 Pages artifact 和 deploy actions |
| 环境变量或 secrets | 无 |

仓库重命名或部署到其他 project site 路径时，必须同步修改 Vite 的 Pages `base`，并重新验证产物中的静态资源 URL。

## 4. Validation & Error Matrix

| 条件 | 预期结果 |
|---|---|
| TypeScript 检查失败 | build job 失败，不上传或部署 artifact |
| 冻结 lockfile 安装失败 | build job 失败，不修改 lockfile |
| Pages 构建失败 | deploy job 因 `needs: build` 不运行 |
| Pages 产物仍引用 `/assets/` | 验收失败，不得视为可发布 |
| 普通构建引用 `/TheTwo/assets/` | 验收失败，本地构建行为发生回归 |
| Pages Source 未选择 GitHub Actions | workflow 配置保留；仓库所有者在 GitHub 设置中完成一次性启用 |

## 5. Good / Base / Bad Cases

* Good：推送 prototype 改动到 `main` 后，workflow 生成引用 `/TheTwo/assets/...` 的 artifact 并发布。
* Base：本地执行 `corepack pnpm build`，产物继续引用 `/assets/...`。
* Bad：执行 `pnpm build -- --mode pages`。当前脚本参数转发不会可靠激活 Vite 的 `pages` mode，可能得到根路径资源。

## 6. Tests Required

部署配置变化时必须验证：

1. `corepack pnpm check` 退出码为 0；
2. `corepack pnpm build` 退出码为 0，`dist/index.html` 包含 `/assets/` 且不包含 `/TheTwo/assets/`；
3. `corepack pnpm exec vite build --mode pages` 退出码为 0，`dist/index.html` 包含 `/TheTwo/assets/`；
4. workflow 的工作目录、缓存 lockfile、artifact 路径、权限和 job 依赖符合第 3 节；
5. `git diff --check` 退出码为 0。

## 7. Wrong vs Correct

### Wrong

```yaml
- run: pnpm build -- --mode pages
```

### Correct

```yaml
- run: pnpm check
- run: pnpm exec vite build --mode pages
```

类型检查和 Pages mode 构建必须显式分开，避免包管理器与脚本之间的参数转发改变 Vite mode。

## Open Questions

当前没有阻止发布的未决问题。
