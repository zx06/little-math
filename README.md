# 🧮 Little Math 小小数学家

幼儿园/小学数学练习生成打印工具，帮助家长和老师快速生成适合低年级学生的数学练习题。

## ✨ 功能特点

- **年级预设**：幼儿园、一年级、二年级、三年级，一键选择适合的难度
- **自定义范围**：支持自定义数字范围（如 1-10、1-100）
- **四则运算**：加法、减法、乘法、除法，支持混合运算
- **多种题型**：
  - 横式计算（支持 2 列 / 3 列布局）
  - 竖式计算
- **填空位置**：支持配置留空位置比例
  - `( ) + 5 = 8`（第一个数留空）
  - `3 + ( ) = 8`（第二个数留空）
  - `3 + 5 = ( )`（结果留空）
- **答案页**：可选生成答案页，方便批改
- **儿童化设计**：彩色界面、可爱字体、趣味装饰
- **打印友好**：保留彩色样式，背景覆盖整页

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

## 🔧 技术栈

- [SvelteKit](https://kit.svelte.dev/) - 全栈 Web 框架
- [Svelte 5](https://svelte.dev/) - 使用 runes 语法（$state, $derived）
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 构建工具

## 📁 项目结构

```
src/
├── lib/
│   ├── generators/       # 题目生成逻辑（纯函数）
│   │   ├── arithmetic.ts # 加减乘除生成器
│   │   └── vertical.ts   # 竖式布局
│   ├── config/
│   │   └── presets.ts    # 年级预设配置
│   ├── components/       # UI 组件
│   │   ├── ConfigPanel.svelte
│   │   └── ExerciseSheet.svelte
│   ├── i18n/             # 国际化（预留）
│   └── types.ts          # 类型定义
├── routes/
│   └── +page.svelte      # 主页面
```

## 📝 License

MIT
