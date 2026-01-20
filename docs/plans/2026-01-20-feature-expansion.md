# 小小数学家功能扩展实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为小小数学家添加新题型、学习辅助、打印增强和数据功能

**Architecture:** 
- 新题型通过扩展 generators/ 和 types.ts 实现
- 在线练习模式作为新路由 `/practice`
- 主题/模板通过 CSS 变量和配置实现
- 数据持久化使用 localStorage（未来可扩展云同步）

**Tech Stack:** SvelteKit 2, Svelte 5 (runes), TypeScript, CSS Variables

---

## Phase 1: 新题型扩展

### Task 1.1: 连续运算题型

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/generators/chain.ts`
- Modify: `src/lib/components/ExerciseSheet.svelte`
- Modify: `src/lib/components/ConfigPanel.svelte`
- Modify: `src/lib/config/presets.ts`

**Step 1: 扩展类型定义**

在 `types.ts` 添加：
```typescript
/** 题目类型 */
export type ProblemType = 'simple' | 'chain' | 'compare' | 'makeTarget' | 'remainder';

/** 连续运算题目 */
export interface ChainProblem {
  type: 'chain';
  numbers: number[];        // 例如 [3, 4, 2]
  ops: Operation[];         // 例如 ['add', 'sub']
  result: number;
  blank: 'result' | number; // number 表示第几个数留空
}

/** 统一题目类型 */
export type AnyProblem = Problem | ChainProblem | CompareProblem | MakeTargetProblem | RemainderProblem;
```

**Step 2: 创建连续运算生成器**

创建 `src/lib/generators/chain.ts`：
```typescript
import type { ChainProblem, Operation } from '$lib/types';

export function generateChainProblem(
  min: number, 
  max: number, 
  operations: Operation[],
  length: 3 | 4 = 3
): ChainProblem {
  // 生成 length 个数字
  // 随机选择 length-1 个运算符
  // 计算结果（需确保中间结果不为负）
  // 随机选择留空位置
}
```

**Step 3: 更新配置面板添加题型选择**

**Step 4: 更新练习题显示组件支持连续运算渲染**

**Step 5: 运行 `pnpm check` 验证**

**Step 6: 提交**
```bash
git add -A && git commit -m "feat: 添加连续运算题型"
```

---

### Task 1.2: 比较大小题型

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/generators/compare.ts`
- Modify: `src/lib/components/ExerciseSheet.svelte`

**Step 1: 添加比较题目类型**

```typescript
export interface CompareProblem {
  type: 'compare';
  left: { a: number; b: number; op: Operation; result: number };
  right: { a: number; b: number; op: Operation; result: number };
  answer: '>' | '<' | '=';
}
```

**Step 2: 创建比较题生成器**

生成两个算式，让用户比较大小，渲染为：
```
5 + 3 ○ 10 - 1
```

**Step 3: 更新显示组件**

**Step 4: 验证并提交**

---

### Task 1.3: 凑数练习题型

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/generators/makeTarget.ts`

**Step 1: 添加凑数题目类型**

```typescript
export interface MakeTargetProblem {
  type: 'makeTarget';
  a: number;
  target: number;    // 目标数（如 10, 20, 100）
  answer: number;
  op: 'add' | 'sub';
}
```

渲染为：`7 + (  ) = 10` 或 `(  ) + 3 = 10`

**Step 2: 创建生成器并实现**

**Step 3: 验证并提交**

---

### Task 1.4: 有余数除法题型

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/generators/remainder.ts`

**Step 1: 添加有余数除法类型**

```typescript
export interface RemainderProblem {
  type: 'remainder';
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  blank: 'quotient' | 'remainder' | 'both';
}
```

渲染为：`17 ÷ 5 = (  ) ... (  )`

**Step 2: 创建生成器**

**Step 3: 验证并提交**

---

## Phase 2: 学习辅助功能

### Task 2.1: 在线限时练习模式

**Files:**
- Create: `src/routes/practice/+page.svelte`
- Create: `src/lib/components/PracticeMode.svelte`
- Create: `src/lib/components/Timer.svelte`
- Create: `src/lib/components/AnswerInput.svelte`
- Modify: `src/lib/services/statistics.ts`

**Step 1: 创建练习路由页面**

新页面 `/practice`，包含：
- 题目配置（复用现有 ConfigPanel）
- 开始按钮
- 计时器显示
- 逐题作答界面
- 结果统计

**Step 2: 创建计时器组件**

```svelte
<script lang="ts">
  let seconds = $state(0);
  let running = $state(false);
  
  $effect(() => {
    if (running) {
      const interval = setInterval(() => seconds++, 1000);
      return () => clearInterval(interval);
    }
  });
</script>
```

**Step 3: 创建答题输入组件**

支持键盘输入、自动跳转下一题

**Step 4: 集成结果统计**

**Step 5: 验证并提交**

---

### Task 2.2: 错题本功能

**Files:**
- Create: `src/lib/services/wrongBook.ts`
- Create: `src/lib/components/WrongBookPanel.svelte`
- Create: `src/routes/wrong-book/+page.svelte`

**Step 1: 创建错题存储服务**

```typescript
interface WrongRecord {
  problem: AnyProblem;
  wrongAnswer: number;
  correctAnswer: number;
  timestamp: number;
  reviewCount: number;
}

export function addWrongRecord(record: WrongRecord): void;
export function getWrongRecords(): WrongRecord[];
export function generateWrongReview(count: number): AnyProblem[];
```

**Step 2: 创建错题本页面**

显示历史错题、支持重新练习

**Step 3: 验证并提交**

---

### Task 2.3: 游戏化元素

**Files:**
- Create: `src/lib/services/achievements.ts`
- Create: `src/lib/components/AchievementToast.svelte`
- Create: `src/lib/components/ProgressBar.svelte`

**Step 1: 创建成就系统**

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: StatisticsData) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-10', name: '初露锋芒', description: '完成10道题', icon: '⭐' },
  { id: 'first-100', name: '小小数学家', description: '完成100道题', icon: '🏆' },
  // ...
];
```

**Step 2: 创建成就提示组件**

**Step 3: 验证并提交**

---

### Task 2.4: 语音读题

**Files:**
- Create: `src/lib/services/speech.ts`
- Modify: `src/lib/components/PracticeMode.svelte`

**Step 1: 创建语音服务**

使用 Web Speech API：
```typescript
export function speakProblem(problem: AnyProblem): void {
  const text = problemToText(problem);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  speechSynthesis.speak(utterance);
}
```

**Step 2: 在练习模式中集成**

**Step 3: 验证并提交**

---

## Phase 3: 打印增强

### Task 3.1: 主题模板系统

**Files:**
- Create: `src/lib/config/themes.ts`
- Create: `src/lib/components/ThemeSelector.svelte`
- Modify: `src/lib/components/ExerciseSheet.svelte`
- Modify: `src/routes/+page.svelte`

**Step 1: 定义主题配置**

```typescript
export interface PrintTheme {
  id: string;
  name: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    border: string;
  };
  decorations?: {
    headerImage?: string;
    borderStyle?: string;
    cornerEmoji?: string;
  };
}

export const THEMES: PrintTheme[] = [
  { id: 'default', name: '经典', icon: '📝', ... },
  { id: 'cartoon', name: '卡通', icon: '🎨', ... },
  { id: 'spring', name: '春节', icon: '🧧', ... },
  { id: 'stars', name: '星空', icon: '⭐', ... },
];
```

**Step 2: 创建主题选择器**

**Step 3: 应用主题到练习页**

使用 CSS 变量：
```svelte
<div class="exercise-sheet" style="--primary: {theme.colors.primary}; ...">
```

**Step 4: 验证并提交**

---

### Task 3.2: 自定义标题

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/components/ConfigPanel.svelte`
- Modify: `src/lib/components/ExerciseSheet.svelte`

**Step 1: 扩展配置**

```typescript
interface ExerciseConfig {
  // 新增
  customTitle?: string;
  studentName?: string;
  showDate?: boolean;
}
```

**Step 2: 添加配置输入**

**Step 3: 在练习页头部显示**

**Step 4: 验证并提交**

---

### Task 3.3: 田字格/米字格

**Files:**
- Create: `src/lib/components/GridPaper.svelte`
- Modify: `src/lib/config/presets.ts`

**Step 1: 创建格子纸组件**

用于写汉字数字（一、二、三...）

**Step 2: 添加配置选项**

**Step 3: 验证并提交**

---

## Phase 4: 数据功能

### Task 4.1: 进度追踪面板

**Files:**
- Modify: `src/lib/services/statistics.ts`
- Create: `src/lib/components/ProgressChart.svelte`
- Modify: `src/lib/components/StatisticsPanel.svelte`

**Step 1: 扩展统计数据**

```typescript
interface DailyProgress {
  date: string;
  problemsCompleted: number;
  correctRate: number;
  timeSpent: number; // 秒
}
```

**Step 2: 创建进度图表组件**

使用 SVG 绘制简单的柱状图/折线图

**Step 3: 集成到统计面板**

**Step 4: 验证并提交**

---

### Task 4.2: 配置保存与恢复

**Files:**
- Create: `src/lib/services/configStorage.ts`
- Modify: `src/lib/components/ConfigPanel.svelte`

**Step 1: 创建配置存储服务**

```typescript
export function saveConfig(config: ExerciseConfig): void;
export function loadConfig(): ExerciseConfig | null;
export function savePreset(name: string, config: ExerciseConfig): void;
export function getPresets(): Record<string, ExerciseConfig>;
```

**Step 2: 页面加载时恢复配置**

**Step 3: 添加"保存为预设"功能**

**Step 4: 验证并提交**

---

### Task 4.3: 数据导出

**Files:**
- Create: `src/lib/services/export.ts`
- Modify: `src/lib/components/StatisticsPanel.svelte`

**Step 1: 创建导出服务**

```typescript
export function exportStatistics(): string; // JSON
export function exportToCSV(): string;
export function downloadFile(content: string, filename: string): void;
```

**Step 2: 添加导出按钮**

**Step 3: 验证并提交**

---

## 实现优先级建议

| 阶段 | 功能 | 复杂度 | 用户价值 | 建议优先级 |
|------|------|--------|----------|------------|
| 1.1 | 连续运算 | 中 | 高 | P1 |
| 1.2 | 比较大小 | 低 | 中 | P2 |
| 1.3 | 凑数练习 | 低 | 高 | P1 |
| 1.4 | 有余数除法 | 低 | 中 | P2 |
| 2.1 | 在线练习 | 高 | 高 | P1 |
| 2.2 | 错题本 | 中 | 高 | P1 |
| 2.3 | 游戏化 | 中 | 中 | P3 |
| 2.4 | 语音读题 | 低 | 中 | P3 |
| 3.1 | 主题模板 | 中 | 中 | P2 |
| 3.2 | 自定义标题 | 低 | 高 | P1 |
| 3.3 | 田字格 | 低 | 低 | P3 |
| 4.1 | 进度追踪 | 中 | 中 | P2 |
| 4.2 | 配置保存 | 低 | 高 | P1 |
| 4.3 | 数据导出 | 低 | 低 | P3 |

---

## 验证命令

每个任务完成后运行：
```bash
pnpm check
pnpm build
```

## 测试建议

- 各生成器应有单元测试（可后续添加 vitest）
- 打印功能需手动验证
- 在线练习需在浏览器中测试
