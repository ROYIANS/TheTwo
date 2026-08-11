# Specs

`specs/` 保存已经确认、用于驱动产品设计和实现的当前契约。Spec 回答“现在必须满足什么”，不负责保存讨论过程，也不替代解释选择原因的决策记录。

## 与其他文档的区别

* 尚未确认的探索放在 `work/`。
* 原始输入和截图放在 `evidence/`。
* 重要选择及其原因放在 `decisions/`。
* 当前必须成立的行为、接口、数据或质量要求放在 `specs/`。

## 当前规范

| Spec | 状态 | 说明 |
|---|---|---|
| [`development-process.md`](development-process.md) | accepted | Trellis 主导的开发过程、知识持久化和技能协作规则 |

## 未来领域

领域目录只在出现第一份 spec 时创建。预计可能包括：

```text
specs/
├── product/              # 系统需求、功能边界、验收标准
├── experience/           # 信息架构、用户流程、交互与可访问性
├── ai/                   # AI 行为、事实约束、评估与安全边界
├── engineering/
│   ├── architecture/
│   ├── frontend/
│   ├── backend/
│   ├── data/
│   ├── security/
│   └── integrations/
└── operations/           # 部署、可观测性、备份与恢复
```

这只是导航模型，不要求提前创建空目录。

## 状态

* `draft`：正在编写；
* `proposed`：等待确认；
* `accepted`：当前有效并驱动实现；
* `superseded`：已被其他 spec 替代；
* `archived`：不再适用，仅作历史保留。

## 变更规则

* Spec 使用稳定语义文件名，不在文件名中加入日期或版本号。
* 行为发生变化时更新当前 spec，并关联解释该变化的决策记录。
* 被替代时标记 `superseded`，通过 `related` 或正文指向替代文档。
* `.trellis/spec/` 可以提炼 AI 执行规则并链接到这里，但不复制完整正文。

新建规范时使用 [`../templates/spec.md`](../templates/spec.md)。
