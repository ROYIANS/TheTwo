# prototype 统一按钮与参考实现

## 范围

* `prototype/src` 当前共有 41 处原生 `<button>` 声明，分布在 13 个 TSX 文件；部分声明通过 `map` 产生多个实际按钮。
* 已有 `PrimaryButton` 与 `QuietButton` 只覆盖少量调用，其他功能页面仍直接声明按钮并依赖局部 CSS。
* 按钮既包含普通命令，也包含对象卡入口、分段选择、全屏遮罩和纯图标关闭操作，因此共享组件不能把所有按钮强制渲染成主行动。

## `vidorra-life` 参考事实

来源：

* `D:/Code/Study/vidorra-life/apps/web/src/components/HeroControls.tsx`
* `D:/Code/Study/vidorra-life/apps/web/src/index.css` 第 696 至 787 行

参考项目的 `HeroButton` 提供 `primary / ghost / danger / quiet / icon / plain` 六种 tone，并统一 disabled 映射。视觉契约为：

* 默认 `letter-spacing: 0`，状态过渡覆盖阴影、背景、边框、文字与 transform；
* 主按钮使用实色表面、`inset 0 -2px` 底边和一层轻投影；
* ghost 使用纸面混色、细边框和较轻的 inset 底边；
* hover 移除阴影，让凸起表面摊平；
* active 使用 `translateY(1px) scale(.99)`；
* disabled 降低透明度、禁止指针反馈并清除 transform 与阴影；
* quiet / icon 只在 hover 出现轻背景；plain 不提供按钮 chrome，用于遮罩或已有复杂结构的交互面。

## 择途实现映射

* 新增一个原生 React `Button` 组件，透传标准 `ButtonHTMLAttributes`，默认 `type="button"`。
* tone 与参考项目一一对应；颜色只使用择途 `--primary`、`--primary-dark`、`--paper`、`--ink`、`--risk` 等 token。
* 主命令显式使用 `primary`；次命令使用 `ghost` 或 `quiet`；图标按钮使用 `icon`；复杂对象入口、分段选择与遮罩使用 `plain`。
* 保留现有功能类名作为局部布局钩子，但外观状态由共享组件的 tone 负责。
* 全部非 plain 按钮保留至少 44px 触摸高度和 `:focus-visible` 焦点环。

## 验证

* 搜索 `prototype/src/**/*.tsx`，除 `components/Button.tsx` 外不得再出现 `<button`。
* 覆盖首页进入、onboarding、机会、申请包、面试、Agent、退出和 toast 关闭等关键交互。
* 在桌面与移动端检查主/次/图标/plain 按钮没有被旧局部选择器覆盖成错误前景色或背景色。
