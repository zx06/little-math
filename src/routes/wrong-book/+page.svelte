<script lang="ts">
	import type { WrongRecord, AnyProblem, Problem, MakeTargetProblem, ChainProblem } from '$lib/types';
	import { OP_SYMBOLS } from '$lib/types';
	import {
		getWrongRecords,
		clearWrongRecords,
		removeWrongRecord
	} from '$lib/services/wrongBook';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let records: WrongRecord[] = $state([]);

	$effect(() => {
		if (browser) {
			records = getWrongRecords();
		}
	});

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
		}
		const p = problem as Problem;
		return `${p.a} ${OP_SYMBOLS[p.op]} ${p.b} = ___`;
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('zh-CN');
	}

	function handleClear() {
		if (confirm('确定要清空所有错题吗？')) {
			clearWrongRecords();
			records = [];
		}
	}

	function handleRemove(timestamp: number) {
		removeWrongRecord(timestamp);
		records = getWrongRecords();
	}

	function handleReview() {
		goto('/practice?mode=wrong-review');
	}
</script>

<svelte:head>
	<title>错题本 - 小小数学家</title>
</svelte:head>

<div class="wrong-book-page">
	<header>
		<a href="/" class="back-link">← 返回首页</a>
		<h1>📕 错题本</h1>
	</header>

	<main>
		{#if records.length === 0}
			<div class="empty">
				<div class="emoji">🎉</div>
				<p>太棒了！没有错题记录</p>
				<a href="/practice" class="start-link">去练习</a>
			</div>
		{:else}
			<div class="actions">
				<button class="review-btn" onclick={handleReview}>
					📝 错题复习 ({records.length}题)
				</button>
				<button class="clear-btn" onclick={handleClear}>🗑️ 清空</button>
			</div>

			<div class="records-list">
				{#each records.slice().reverse() as record}
					<div class="record-card">
						<div class="problem">{formatProblem(record.problem)}</div>
						<div class="answers">
							<span class="wrong">你的答案: {record.wrongAnswer}</span>
							<span class="correct">正确答案: {record.correctAnswer}</span>
						</div>
						<div class="meta">
							<span class="date">{formatDate(record.timestamp)}</span>
							<span class="review-count">复习次数: {record.reviewCount}</span>
							<button class="remove-btn" onclick={() => handleRemove(record.timestamp)}>删除</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

<style>
	.wrong-book-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #fff5f5, #ffe8cc);
		font-family: 'Comic Sans MS', cursive;
	}
	header {
		background: linear-gradient(135deg, #ff6b6b, #ff8e53);
		color: white;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		gap: 2rem;
	}
	.back-link {
		color: white;
		text-decoration: none;
	}
	h1 {
		margin: 0;
		font-size: 1.5rem;
	}
	main {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}
	.empty {
		text-align: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 20px;
	}
	.empty .emoji {
		font-size: 4rem;
	}
	.empty p {
		color: #666;
		font-size: 1.25rem;
	}
	.start-link {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.75rem 2rem;
		background: linear-gradient(135deg, #51cf66, #20c997);
		color: white;
		text-decoration: none;
		border-radius: 12px;
	}
	.actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.review-btn {
		flex: 1;
		padding: 1rem;
		font-size: 1.25rem;
		background: linear-gradient(135deg, #5c7cfa, #845ef7);
		color: white;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-family: inherit;
	}
	.clear-btn {
		padding: 1rem 1.5rem;
		font-size: 1rem;
		background: #f1f3f4;
		color: #666;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-family: inherit;
	}
	.records-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.record-card {
		background: white;
		border-radius: 12px;
		padding: 1rem 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}
	.problem {
		font-size: 1.5rem;
		color: #333;
		margin-bottom: 0.5rem;
	}
	.answers {
		display: flex;
		gap: 2rem;
		font-size: 0.9rem;
	}
	.wrong {
		color: #ff6b6b;
	}
	.correct {
		color: #51cf66;
	}
	.meta {
		display: flex;
		gap: 1rem;
		margin-top: 0.75rem;
		font-size: 0.8rem;
		color: #999;
		align-items: center;
	}
	.remove-btn {
		margin-left: auto;
		padding: 0.25rem 0.75rem;
		background: #fee;
		color: #ff6b6b;
		border: 1px solid #fcc;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.8rem;
	}
</style>
