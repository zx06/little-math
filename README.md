# 🧮 Little Math 小小数学家

幼儿园/小学数学练习生成打印工具，帮助家长和老师快速生成适合低年级学生的数学练习题。

## ✨ 功能特点

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

- 即时答题反馈
- 计时功能
- 正确率统计
- 语音读题（支持的浏览器）
- 成就系统

### 📕 错题本

- 自动记录错题
- 错题复习功能
- 复习次数追踪

### 📊 使用统计

- 访问、生成、打印次数统计
- 运算类型使用分布
- 最近 7 天数据图表
- 练习进度追踪
- 数据导出（JSON/CSV）

### 🎨 其他特性

- **主题切换**：经典、卡通、春节、星空、自然等主题
- **配置持久化**：自动保存上次配置
- **儿童化设计**：彩色界面、可爱字体、趣味装饰
- **打印友好**：保留彩色样式，背景覆盖整页
- **移动端适配**：响应式设计，手机也能用

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm check
```

## 📦 部署到 Vercel

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入仓库
3. 自动检测 SvelteKit，点击部署即可

## 🎨 界面预览

- 左侧配置面板：选择年级、运算类型、题数等
- 右侧预览区域：实时显示生成的练习题
- 点击「生成」刷新题目，点击「打印」调用浏览器打印
- 右下角统计面板：查看使用数据

## 🔧 技术栈

- [SvelteKit](https://kit.svelte.dev/) - 全栈 Web 框架
- [Svelte 5](https://svelte.dev/) - 使用 runes 语法（$state, $derived, $effect）
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 构建工具

## 🔒 安全

- **依赖安全**：使用 pnpm.overrides 强制升级 `cookie` 包到安全版本
  - 修复 CVE-2024-47764 漏洞
  - 原因：`@sveltejs/kit` 2.x 系列依赖的 `cookie ^0.6.0` 存在 XSS 漏洞
  - 解决方案：通过 overrides 强制使用 `cookie ^0.7.0`（当前版本 0.7.2）
  - 参考：https://github.com/advisories/GHSA-pxg6-pf52-xh8x

## 📁 项目结构

```
src/
├── lib/
│   ├── generators/       # 题目生成逻辑（纯函数）
│   │   ├── arithmetic.ts # 加减乘除生成器
│   │   ├── chain.ts      # 连续运算生成器
│   │   ├── compare.ts    # 比较大小生成器
│   │   ├── makeTarget.ts # 凑数练习生成器
│   │   └── remainder.ts  # 有余数除法生成器
│   ├── config/
│   │   ├── presets.ts    # 年级预设配置
│   │   └── themes.ts     # 主题配置
│   ├── components/       # UI 组件
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
│   │   ├── ThemeSelector.svelte    # 主题选择器
│   │   └── AchievementToast.svelte # 成就提示
│   ├── actions/          # Svelte actions
│   │   └── track.ts      # 统计埋点 action
│   ├── services/         # 业务服务
│   │   ├── statistics.ts    # 统计服务
│   │   ├── configStorage.ts # 配置持久化
│   │   ├── wrongBook.ts     # 错题本服务
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
│   └── wrong-book/
│       └── +page.svelte  # 错题本页面
```

## 📝 License

MIT
