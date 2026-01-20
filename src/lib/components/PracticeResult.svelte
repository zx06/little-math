<script lang="ts">
	import type { AnyProblem, Problem, MakeTargetProblem, ChainProblem, CompareProblem } from '$lib/types';
	import { OP_SYMBOLS } from '$lib/types';

	interface AnswerRecord {
		problem: AnyProblem;
		userAnswer: number;
		correctAnswer: number;
		isCorrect: boolean;
	}

	interface Props {
		total: number;
		correct: number;
		timeSpent: number; // 秒
		records: AnswerRecord[];
		onRestart: () => void;
		onBackHome: () => void;
	}

	let { total, correct, timeSpent, records, onRestart, onBackHome }: Props = $props();

	let accuracy = $derived(total > 0 ? Math.round((correct / total) * 100) : 0);

	function formatTime(s: number): string {
		const mins = Math.floor(s / 60);
		const secs = s % 60;
		return `${mins}分${secs}秒`;
	}

	function getEmoji(): string {
		if (accuracy >= 90) return '🏆';
		if (accuracy >= 70) return '⭐';
		if (accuracy >= 50) return '👍';
		return '💪';
	}

	function formatExpression(a: number, b: number, op: string): string {
		return `${a} ${op} ${b}`;
	}

	function formatProblem(problem: AnyProblem): string {
		if ('type' in problem) {
			if (problem.type === 'makeTarget') {
				const p = problem as MakeTargetProblem;
				return p.blankFirst ? `___ + ${p.a} = ${p.target}` : `${p.a} + ___ = ${p.target}`;
			}
			if (problem.type === 'chain') {
				const p = problem as ChainProblem;
				let str = '';
				for (let i = 0; i < p.numbers.length; i++) {
					str += p.numbers[i];
					if (i < p.ops.length) {
						str += ` ${OP_SYMBOLS[p.ops[i]]} `;
					}
				}
				return str + ' = ___';
			}
			if (problem.type === 'compare') {
				const p = problem as CompareProblem;
				const left = formatExpression(p.left.a, p.left.b, OP_SYMBOLS[p.left.op]);
				const right = formatExpression(p.right.a, p.right.b, OP_SYMBOLS[p.right.op]);
				return `${left} ___ ${right}`;
			}
		}
		const p = problem as Problem;
		const first = p.blank === 'first' ? '___' : p.a;
		const second = p.blank === 'second' ? '___' : p.b;
		const result = p.blank === 'result' ? '___' : p.result;
		return `${first} ${OP_SYMBOLS[p.op]} ${second} = ${result}`;
	}
</script>

<div class="result">
	<div class="emoji">{getEmoji()}</div>
	<h2>练习完成！</h2>
	<div class="stats">
		<div class="stat">
			<span class="label">正确率</span>
			<span class="value">{accuracy}%</span>
		</div>
		<div class="stat">
			<span class="label">正确/总题</span>
			<span class="value">{correct}/{total}</span>
		</div>
		<div class="stat">
			<span class="label">用时</span>
			<span class="value">{formatTime(timeSpent)}</span>
		</div>
	</div>
	<div class="details">
		<h3>答题详情</h3>
		<div class="records-list">
			{#each records as record, idx}
				<div class="record-item" class:correct={record.isCorrect} class:wrong={!record.isCorrect}>
					<span class="index">{idx + 1}.</span>
					<span class="problem">{formatProblem(record.problem)}</span>
					<span class="status">{record.isCorrect ? '✓' : '✗'}</span>
					{#if !record.isCorrect}
						<span class="your-answer">你的答案: {record.userAnswer}</span>
						<span class="correct-answer">正确: {record.correctAnswer}</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="actions">
		<button class="primary" onclick={onRestart}>再来一次</button>
		<button class="secondary" onclick={onBackHome}>返回首页</button>
	</div>
</div>

<style>
	.result {
		text-align: center;
		padding: 2rem;
		font-family: 'Comic Sans MS', cursive;
	}
	.emoji {
		font-size: 5rem;
		margin-bottom: 1rem;
	}
	h2 {
		color: #ff6b6b;
		margin-bottom: 2rem;
	}
	.stats {
		display: flex;
		justify-content: center;
		gap: 3rem;
		margin-bottom: 2rem;
	}
	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.label {
		color: #666;
		font-size: 1rem;
	}
	.value {
		color: #5c7cfa;
		font-size: 2rem;
		font-weight: bold;
	}
	.actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
	button {
		padding: 0.75rem 2rem;
		font-size: 1.25rem;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-family: inherit;
	}
	.primary {
		background: linear-gradient(135deg, #ff6b6b, #ff8e53);
		color: white;
	}
	.secondary {
		background: linear-gradient(135deg, #51cf66, #20c997);
		color: white;
	}
	.details {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 2px dashed #eee;
	}
	.details h3 {
		text-align: center;
		color: #666;
		margin-bottom: 1rem;
	}
	.records-list {
		max-height: 300px;
		overflow-y: auto;
	}
	.record-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		margin-bottom: 0.5rem;
		font-size: 1rem;
	}
	.record-item.correct {
		background: #e8f5e9;
	}
	.record-item.wrong {
		background: #ffebee;
	}
	.index {
		color: #999;
		width: 2rem;
	}
	.problem {
		flex: 1;
		color: #333;
	}
	.status {
		font-size: 1.25rem;
	}
	.record-item.correct .status {
		color: #51cf66;
	}
	.record-item.wrong .status {
		color: #ff6b6b;
	}
	.your-answer {
		color: #ff6b6b;
		font-size: 0.875rem;
	}
	.correct-answer {
		color: #51cf66;
		font-size: 0.875rem;
	}
</style>
