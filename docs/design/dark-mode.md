# 深色模式：设计访谈记录

状态：用户已确认整体理解并完成 Schedule Builder 左侧已选课程列表及工作界面对比度修复。

## 已确认

- 深色模式应覆盖 CUNYfirst 和 Brightspace 页面，而不只覆盖扩展弹窗及当前已支持的 Schedule Builder、CUNY 登录页。
- 点击扩展中的开关后，已打开的适用页面应立即更新；之后打开的适用页面沿用同一设置。
- Brightspace 自身若有主题设置，CUNY Plus 深色模式开启时以扩展主题为准；关闭时恢复网站自身设置。
- 保留有含义的课程块、状态颜色和学校标识；普通背景、卡片、文字和表单改为深色并保持可读。
- 用户尚无可指定的单一故障页面。实现时需要分别用目标页面验证实际效果。
- CUNYfirst 覆盖登录页、首页、Student Center、Schedule Builder，以及从这些页面打开的其他 CUNYfirst 功能页；不自动覆盖无关的 `cuny.edu` 网站。
- Brightspace 覆盖导航、课程列表、作业、测验等平台界面；教师提供的课程文件和第三方嵌入工具保留原样。
- 关闭扩展深色模式时，页面恢复网站当时自己的主题，包括用户在扩展深色模式开启期间修改的网站主题。
- 首次安装默认关闭；只有用户点击开关才开启。选择保存在当前浏览器，浏览器重启后保持，不要求跨设备同步，也不自动跟随操作系统主题。
- 已开启时尽量在适用页面开始加载时应用深色背景，避免明显的浅色闪烁。
- 无法可靠识别的图表、课程日历色块、带背景的图片等保留原色；实际页面需检查其中文字的对比度。
- Schedule Builder 左侧已选课程列表（Selected-course list，位于 `#page_criteria`）的所有中性容器、已选课程卡片（`.cbox`、`.rbox-has-reqid`）、展开的班级/教学方式/校区筛选列表及标签均改为深色背景（`#20242c` / `#2c3442`）配浅色文字（`#f1f5f9` / `#dbe4f0`）；左侧与右侧的课程颜色标识块（`.bc0`–`.bc12`、`.bl0`–`.bl12` 等）保留原有浅色背景，并统一其内部标题、标签和说明文字为深色（`#1a1a2e`）以保证对比度。
- 本次修复范围同时涵盖 Schedule Builder 工作界面中已记录的其余深色模式对比度回归问题：绿色课程色块上的浅色课程标题、Advanced Search 按钮上的深色文字、Advanced Search 面板（及弹窗容器 `.popup-body`）中的深灰字段标签、Filters 等弹窗中的暗淡副标题（`.popup-subtitle`），以及结果区残留的浅色渐变背景。

## 当前代码与差距

- `src/contents/content-theme.ts` 目前只匹配 `sb.cunyfirst.cuny.edu` 和 `ssologin.cuny.edu`；它不会在 Brightspace、CUNYfirst 首页或 Student Center 自动运行。
- `src/features/theme/host-page.ts` 主要覆盖 Schedule Builder 和登录页的样式，但遗漏了 Schedule Builder 左侧已选课程卡片（`css/cbox.css` 中的 `.cbox` 等）、弹窗主体与副标题（`css/weekslider.css` 中的 `.popup-body`、`.popup-subtitle`）、高级搜索表格标签及课程色块内的标题/标签选择器。其他页面也需要按实际结构补充规则并验证。

## 验收场景

1. 在 Brightspace 课程列表页开启深色模式：页面立即变为可读的深色；新开的作业或测验页也使用深色。
2. 在 CUNYfirst 首页开启深色模式：已打开的 Student Center、Schedule Builder 和登录页立即更新；之后打开的同类页面沿用设置。
3. 保留课程日历色块、状态颜色、学校标识、课程文件和第三方嵌入内容；普通卡片、文字和表单具有足够对比度。
4. 在 Schedule Builder 工作界面开启深色模式：左侧已选课程列表（Selected-course list）的卡片、展开筛选区、Advanced Search 按钮与面板、Filters 弹窗均使用深色表面与清晰可读的浅色文字；课程颜色块（如 `.bc1`）保留原色且内部课程代码/标题使用深色文字。
5. 关闭扩展深色模式：页面恢复网站当前自身主题，不覆盖用户在网站中作出的主题修改。
6. 重新启动浏览器：扩展开关状态仍与上次选择一致；首次安装默认为关闭。
