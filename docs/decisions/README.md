# Decision Records

`decisions/` 保存重要产品和技术选择的上下文、候选方案、最终决定与后果。决策记录解释“为什么这样做”，而 spec 描述“现在必须怎样工作”。

## 命名

文件使用四位递增编号：

```text
0001-docs-information-architecture.md
0002-example-decision.md
```

编号一旦分配不重复使用。产品和技术决策数量增长后，再按领域建立子目录；在此之前保持扁平。

## 状态

* `proposed`：等待确认；
* `accepted`：已接受；
* `rejected`：已明确不采用；
* `superseded`：已由后续决策替代。

## 维护规则

* 一个文件记录一个可以独立描述的重要决策。
* 已接受的历史内容不重写；需要改变方向时创建新的决策记录。
* 新记录通过 `related` 和正文指向被替代的记录。
* 可以修正错别字或失效链接，但不能偷偷改变原决策含义。

新建决策时使用 [`../templates/decision.md`](../templates/decision.md)。
