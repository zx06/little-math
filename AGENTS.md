# Little Math 开发指南

小小数学家 - 幼儿园/小学数学练习生成打印工具

## 命令

```bash
pnpm install    # 安装依赖
pnpm dev        # 启动开发服务器
pnpm build      # 构建生产版本
pnpm check      # 类型检查
pnpm preview    # 预览构建结果
```

## 项目结构

```
src/
├── lib/
│   ├── generators/       # 题目生成逻辑（纯函数）
│   │   ├── arithmetic.ts # 加减乘除生成器
│   │   └── vertical.ts   # 竖式生成器
│   ├── config/
│   │   └── presets.ts    # 年级预设配置
│   ├── components/       # UI 组件
│   │   ├── ConfigPanel.svelte  # 左侧配置面板
│   │   └── ExerciseSheet.svelte # 练习题显示/打印
│   ├── i18n/             # 国际化预留
│   │   └── zh.ts         # 中文文本
│   └── types.ts          # 类型定义
├── routes/
│   └── +page.svelte      # 主页面（单页应用）
```

## 架构原则

- **生成逻辑与 UI 分离**：generators/ 下的函数为纯函数，不依赖 Svelte
- **类型优先**：修改功能前先阅读 types.ts
- **Svelte 5 语法**：使用 runes（$state, $derived, $effect）

## 核心类型

```typescript
type Operation = 'add' | 'sub' | 'mul' | 'div';
type BlankPosition = 'first' | 'second' | 'result';

interface Problem {
  a: number;
  b: number;
  op: Operation;
  result: number;
  blank: BlankPosition;
}

interface ExerciseConfig {
  gradePreset: string;
  range: { min: number; max: number };
  operations: Operation[];
  blankRatio: Record<BlankPosition, number>;
  isVertical: boolean;
  columns: 2 | 3;
  countPerPage: number;
  totalCount: number;
  showAnswerPage: boolean;
}
```

## 题目生成约束

- 减法结果 ≥ 0（不产生负数）
- 除法必须整除（无余数）
- 同一批次避免重复题目
- 填空位置按配置比例随机分配
- totalCount 和 countPerPage 为 0 时使用默认值 20

## UI 设计规范

- **字体**：Comic Sans MS（儿童友好）
- **配色**：
  - 标题：#ff6b6b（珊瑚红）
  - 数字：#5c7cfa（蓝色）
  - 运算符：#ff922b（橙色）
  - 结果：#51cf66（绿色）
- **装饰**：使用 emoji（🌟 🧮 ✨）增加趣味性
- **填空括号**：使用 `\u00a0`（不换行空格）保持宽度

## 打印相关

- 使用 `@media print` 控制打印样式
- 使用 `print-color-adjust: exact` 保留彩色
- 使用 `@page { margin: 0 }` 让背景覆盖整页
- 打印时隐藏配置面板，只显示练习题
- 答案页通过 `page-break-before: always` 分页

## 国际化预留

- UI 文本集中在 i18n/zh.ts
- 当前仅支持中文，保留扩展结构

## 部署

- 目标平台：Vercel
- 使用 @sveltejs/adapter-auto（Vercel 自动识别）
