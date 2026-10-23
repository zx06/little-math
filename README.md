# 🧮 Little Math 小小数学家

给幼儿园和小学低年级小朋友的数学练习小助手：点一下就出一套口算卷，能打印、存 PDF，也能在线做题。

👉 **在线体验：<https://little-math.xuzhuo.xyz/>**（免费、免注册，手机电脑都能用）

## 📝 一键出题，所见即所得

选年级、玩什么（算一算 / 凑一凑 / 连着算 / 比大小 / 分一分）、横式还是竖式，右边马上出一张 A4 卷子；不满意就点「换一套」。

![首页：出题面板 + 两列卷子预览（🍬糖果）](docs/screenshots/home-candy.png)

## 🎨 三套主题，小朋友自己挑

🍬糖果、🌳森林、🌊海洋，右上角一键切换，所有页面一起变色；数字用圆润好认的字体，1 和 7、4 和 9、0 和 6 一眼分清。

![森林和海洋主题](docs/screenshots/themes-forest-ocean.png)

## 🎯 在线做题，答对就有鼓励

一题一题做，答对自动下一题，还能计时和语音读题；做完能看正确率、用时，逐题回顾，点 ☆ 收藏喜欢的题。

![在线做题（🌊海洋）](docs/screenshots/practice.png)

![做完看结果（🌊海洋）](docs/screenshots/practice-result.png)

## 📕 错题本，再练一遍就会啦

做错的题自动收进错题本，一键「再练一遍」，会了就点「学会了」；右下角 📊 还能看最近的练习记录。

![错题本（🌳森林）](docs/screenshots/wrong-book.png)

## 🖨️ 打印 / 存 PDF 也跟着主题走

白底、题目纯黑、字大清楚，只留跟随主题的浅色点缀（标题色、浅色表头、细线和小图标），家用打印机省墨，也不挡小朋友写字。一页卷子正好一张 A4。

![三个主题的打印效果：糖果 / 森林 / 海洋](docs/screenshots/print-themes.png)

## 📱 手机上也好用

出题、预览卷子、在线做题，手机上都能顺手操作。也可「添加到主屏幕」当小 App 用（PWA）。

![手机界面（🍬糖果）](docs/screenshots/mobile.png)

### 📲 添加到主屏幕（PWA）

站点支持安装为 Progressive Web App：有 Web App Manifest、生产环境 Service Worker，以及 iOS 所需的 apple-touch-icon / meta。离线时壳页和已缓存的静态资源仍可打开；出题逻辑本身不依赖网络，但不必指望「完全离线出题」的完整体验。

- **Android / Chrome**：打开 https://little-math.xuzhuo.xyz/ → 浏览器菜单「安装应用」或地址栏安装图标；或「添加到主屏幕」。
- **iPhone / iPad（Safari）**：打开站点 → 底部分享按钮 → 「添加到主屏幕」→ 添加。主屏幕图标为计算器小图标，标题「小小数学」。
- **桌面 Chrome / Edge**：地址栏右侧安装图标，或菜单「安装小小数学家…」。


---

## ✨ 功能一览

### 📝 练习题生成

- **年级预设**：幼儿园、一年级、二年级、三年级，一键选择适合的难度
- **自定义范围**：支持自定义数字范围（如 1-10、1-100）
- **四则运算**：加法、减法、乘法、除法，支持混合运算
- **多种题型**：
  - 横式计算（支持 2 列 / 3 列布局）
  - 竖式计算
- **多种练习模式**：
  - 普通计算
  - 凑数练习（凑 10 / 凑 20 / 凑 100）
  - 连续运算（3-4 个数）
  - 比较大小
  - 有余数除法
- **填空位置**：支持配置留空位置比例
- **答案页**：可选生成答案页，方便批改

### 🎯 在线练习

- 即时答题反馈（答对自动下一题，答错显示正确答案）
- 计时功能
- 正确率统计、逐题回顾
- 语音读题（支持的浏览器）
- 成就系统（得到新奖章）

### 📕 错题本

- 自动记录错题
- 错题复习功能
- 复习次数追踪，「学会了」移出错题本

### ⭐ 收藏

- 练习结果里点 ☆ 收藏喜欢的题，在「收藏」页集中查看

### 📊 使用统计

- 访问、生成、打印次数统计
- 运算类型使用分布
- 最近 7 天数据图表
- 练习进度追踪
- 数据导出（JSON / CSV 表格）

### 🎨 其他特性

- **三种颜色**：🍬糖果（默认）/ 🌳森林 / 🌊海洋，右上角一键切换，覆盖所有页面；也可以用网址参数 `?theme=candy|forest|ocean`
- **配置持久化**：自动保存上次配置和所选颜色
- **儿童化设计**：给 5 岁左右小朋友看的文案（「打印题」「做题」「换一套」「存成 PDF」），圆润字体，趣味小图标
- **好认的字体**：数字用 Nunito（圆体、等宽数字，1/7、4/9、0/6 区分清楚），标题和按钮用站酷快乐体；字体自托管在 `static/fonts/`（均为 SIL OFL 1.1），中文按站内用到的字做了子集（约 72 KB），加载失败时自动回退系统字体
- **打印友好**：白底、题目和数字纯黑，只保留跟随主题的浅色点缀（标题色、浅色表头、细线、小图标），不铺大面积底色，省墨也不影响写字
- **移动端适配**：响应式设计，手机也能用
- **可安装 PWA**：添加到主屏幕；生产环境 Service Worker 预缓存静态资源，离线可打开壳页

## 📐 出题规则

「数字范围」= 最小值～最大值，所有模式统一按下面的规则出题：

| 运算 | 规则 |
| --- | --- |
| 加法 a + b = c | a、b、c 都在范围内（和不超过最大值，例如「20 以内」和 ≤ 20） |
| 减法 a - b = c | a、b、c 都在范围内（不出负数；最小值 ≥ 1 时差不为 0） |
| 乘法 a × b = c | 积 c 在范围内；因数从 2 起，若 最小值² ≤ 最大值 则因数也 ≥ 最小值 |
| 除法 a ÷ b = c | 被除数 a 在范围内且整除；除数、商的规则同乘法因数 |
| 表内乘除（可选） | 因数 / 除数 / 商不超过 9 |
| 连续运算 | 按「先乘除、后加减」计算；每一步中间结果和答案都是 0～最大值 的整数；乘除因数从 2 起 |
| 比较大小 | 两边算式遵守上面的规则；「<」「>」「=」各约占 1/3 |
| 有余数除法 | 被除数在范围内，除数 2～9，余数 1～除数-1 |

- 0、1 这类「送分题」（+0、-0、×1、÷1、商为 1、结果为 0）只在范围包含它们时偶尔出现（约 8%）。
- 范围内的不同题目不够时，会先用完所有不同的题，再重复补足到总题数，并在预览上方提示。
- 设置有误（最小值 ≥ 最大值、留空、小数、题数越界、没选运算、范围内出不了题）时，输入框下方给出原因，且不能打印 / 导出。
- 卷面标题默认按实际设置自动生成（如「20以内加减法练习」），卷头还会写明范围与运算。

## 🖨️ 打印与导出

- 网页上的每一页就是一张 A4（210mm × 297mm），浏览器打印和「导出PDF」都是「一页卷子 = 一页 A4」。
- 每页最多题数：2 列 24 道、3 列 51 道、竖式 20 道；切换版式时超过上限会自动调小并提示。
- 竖式只用于普通计算和凑数练习，其它模式自动使用横式。
- 打印和「存成 PDF」都跟随当前颜色主题的浅色点缀，并设置了 `print-color-adjust: exact`，浏览器打印也能印出浅色；题目文字始终纯黑。
- 导出 PDF 的文件名日期按浏览器本地时间、在导出时计算。

## 🛠️ 开发

### 🚀 快速开始

需要 **Node.js 22**（≥ 22.17，SvelteKit 3 的最低要求）和 **pnpm 11**（`corepack enable` 后自动使用 package.json 里指定的版本）。

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm check

# 单元测试（出题规则、校验、统计等）
pnpm test

# 端到端测试（Playwright：打印 / 导出 PDF 页数、版式不溢出等）
pnpm exec playwright install chromium   # 首次运行
pnpm test:e2e
```

### 📦 部署到 Vercel

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入仓库
3. 自动检测 SvelteKit，点击部署即可

### 🔧 技术栈

- [SvelteKit 3](https://svelte.dev/docs/kit) - 全栈 Web 框架（配置写在 `vite.config.ts` 的 `sveltekit({...})` 里，没有 `svelte.config.js`；`#lib` 子路径导入代替 `$lib`）
- [Svelte 5](https://svelte.dev/) - 使用 runes 语法（$state, $derived, $effect）
- [TypeScript 6](https://www.typescriptlang.org/) - 类型安全
- [Vite 8](https://vite.dev/) - 构建工具（Rolldown）

### 🔒 安全

- **不再需要 overrides**：项目已升级到 SvelteKit 3（自带 `cookie@2`），`pnpm-workspace.yaml` / `package.json` 里不再有任何 `overrides` 钉版本
  - CVE-2024-47764 / [GHSA-pxg6-pf52-xh8x](https://github.com/advisories/GHSA-pxg6-pf52-xh8x)（cookie < 0.7.0 的 XSS）：SvelteKit 2.x 依赖 `cookie ^0.6.0`，以前只能靠 overrides 强制升级；SvelteKit 3 直接依赖 `cookie ^2.0.1`，自然修复
  - `tar`：只经由 `@sveltejs/adapter-vercel` → `@vercel/nft` → `@mapbox/node-pre-gyp`（`tar ^7.4.0`）引入，锁文件重新解析后是已修复的 `tar@7.5.22`
- **验证**：`pnpm why cookie` 只有 `cookie@2.x`，`pnpm why tar` 只有 `tar@7.5.22` 以上，`pnpm audit` 显示 `No known vulnerabilities found`
- 以后再出现传递依赖漏洞，优先升级直接依赖或重新解析锁文件（`pnpm update --depth Infinity <包名>`），实在不行再在 `pnpm-workspace.yaml` 加 `overrides`（pnpm 10 起只认这里，不读 `package.json` 的 `"pnpm"` 字段）

### 📁 项目结构

```
src/
├── lib/
│   ├── generators/       # 题目生成逻辑（纯函数，可注入随机数便于测试）
│   │   ├── rules.ts      # 各运算的范围规则
│   │   ├── validate.ts   # 配置校验
│   │   ├── worksheet.ts  # 统一出题入口、自动标题
│   │   ├── fill.ts       # 去重与补足
│   │   ├── arithmetic.ts # 加减乘除生成器
│   │   ├── chain.ts      # 连续运算生成器
│   │   ├── compare.ts    # 比较大小生成器
│   │   ├── makeTarget.ts # 凑数练习生成器
│   │   └── remainder.ts  # 有余数除法生成器
│   ├── config/
│   │   ├── presets.ts    # 年级预设配置
│   │   ├── layout.ts     # 每页题数、版式上限
│   │   └── uiThemes.ts   # 三个界面主题（糖果/森林/海洋）
│   ├── styles/
│   │   └── ui-themes.css # 主题样式、字体、打印 / PDF 点缀
│   ├── components/       # UI 组件
│   │   ├── AppHeader.svelte        # 顶部导航
│   │   ├── AppFooter.svelte        # 底部小页脚（GitHub 源码链接，打印 / PDF 不显示）
│   │   ├── ConfigPanel.svelte      # 左侧配置面板
│   │   ├── ExerciseSheet.svelte    # 练习题显示/打印
│   │   ├── StatisticsPanel.svelte  # 统计面板
│   │   ├── PracticeConfig.svelte   # 练习配置
│   │   ├── PracticeResult.svelte   # 练习结果
│   │   ├── ProblemDisplay.svelte   # 题目显示
│   │   ├── AnswerInput.svelte      # 答案输入
│   │   ├── CompareInput.svelte     # 比较符号输入
│   │   ├── RemainderInput.svelte   # 余数答案输入
│   │   ├── Timer.svelte            # 计时器
│   │   ├── ProgressChart.svelte    # 进度图表
│   │   ├── UiThemeSwitcher.svelte  # 换颜色（主题切换）
│   │   └── AchievementToast.svelte # 成就提示
│   ├── actions/          # Svelte actions
│   │   ├── fitText.ts    # 卷面文字自动缩放，防止溢出
│   │   └── track.ts      # 统计埋点 action
│   ├── services/         # 业务服务
│   │   ├── statistics.ts    # 统计服务
│   │   ├── configStorage.ts # 配置持久化
│   │   ├── wrongBook.ts     # 错题本服务
│   │   ├── favorites.ts     # 收藏服务
│   │   ├── pdfExport.ts     # 导出 PDF（一页卷子 = 一页 A4）
│   │   ├── achievements.ts  # 成就系统
│   │   ├── speech.ts        # 语音服务
│   │   └── export.ts        # 数据导出
│   ├── i18n/             # 国际化（预留）
│   │   └── zh.ts         # 中文文本
│   └── types.ts          # 类型定义
├── routes/
│   ├── +page.svelte      # 主页面
│   ├── +layout.svelte    # 布局组件
│   ├── practice/
│   │   └── +page.svelte  # 在线练习页面
│   ├── wrong-book/
│   │   └── +page.svelte  # 错题本页面
│   └── favorites/
│       └── +page.svelte  # 收藏页面
static/fonts/             # 自托管字体子集 + OFL 许可
scripts/subset-fonts.py   # 重新生成字体子集
docs/screenshots/         # README 截图
```

## 📝 License

MIT
