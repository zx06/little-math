<script lang="ts">
	import type { AnyProblem, CompareSymbol } from '$lib/types';
	import { addFavorite, getFavorites, removeFavorite } from '$lib/services/favorites';
	import { formatProblemText, problemId } from '$lib/format';

	interface AnswerRecord {
		problem: AnyProblem;
		userAnswer: number | CompareSymbol | string;
		correctAnswer: number | CompareSymbol | string;
		isCorrect: boolean;
	}

	interface Props {
		total: number;
		correct: number;
		timeSpent: number;
		records: AnswerRecord[];
		onRestart: () => void;
		onBackHome: () => void;
	}

	let { total, correct, timeSpent, records, onRestart, onBackHome }: Props = $props();

	let accuracy = $derived(total > 0 ? Math.round((correct / total) * 100) : 0);
	let avgTime = $derived(total > 0 ? Math.round(timeSpent / total) : 0);

	function formatTime(s: number): string {
		const mins = Math.floor(s / 60);
		const secs = s % 60;
		if (mins === 0) return `${secs}秒`;
		return `${mins}分${secs}秒`;
	}

	function getEmoji(): string {
		if (accuracy >= 90) return '🏆';
		if (accuracy >= 70) return '⭐';
		if (accuracy >= 50) return '👍';
		return '💪';
	}

	function formatProblem(problem: AnyProblem): string {
		return formatProblemText(problem);
	}

	function formatAnswer(answer: number | CompareSymbol | string, problem: AnyProblem): string {
		if (typeof answer === 'string') {
			return answer;
		}

		if ('type' in problem && problem.type === 'remainder') {
			const p = problem as any;
			if (p.blank === 'quotient') {
				return `商: ${answer}`;
			} else if (p.blank === 'remainder') {
				return `余数: ${answer}`;
			} else {
				return `${answer} (商或余数)`;
			}
		}

		return String(answer);
	}

	/** 已收藏题目的 id 集合（响应式，点击后星标立即点亮） */
	let favoriteIds = $state(new Set(getFavorites().map((f) => problemId(f.problem))));

	function handleFavorite(problem: AnyProblem, e: Event) {
		e.stopPropagation();
		const id = problemId($state.snapshot(problem) as AnyProblem);
		if (favoriteIds.has(id)) {
			const fav = getFavorites().find((f) => problemId(f.problem) === id);
			if (fav) removeFavorite(fav.timestamp);
		} else {
			addFavorite($state.snapshot(problem) as AnyProblem);
		}
		favoriteIds = new Set(getFavorites().map((f) => problemId(f.problem)));
	}
</script>

<div class="result" data-testid="practice-result">
	<div class="emoji">{getEmoji()}</div>
	<h2>练习完成！</h2>
	<div class="stats">
		<div class="stat">
			<span class="label">正确率</span>
			<span class="value" data-testid="result-accuracy">{accuracy}%</span>
		</div>
		<div class="stat">
			<span class="label">正确/总题</span>
			<span class="value">{correct}/{total}</span>
		</div>
		<div class="stat">
			<span class="label">总用时</span>
			<span class="value">{formatTime(timeSpent)}</span>
		</div>
		<div class="stat">
			<span class="label">平均用时</span>
			<span class="value">{formatTime(avgTime)}/题</span>
		</div>
	</div>
	<div class="details">
		<h3>答题详情</h3>
		<div class="records-list">
			{#each records as record, idx}
				<div class="record-card" class:correct={record.isCorrect} class:wrong={!record.isCorrect}>
					<div class="record-header">
						<span class="index">{idx + 1}.</span>
						<span class="problem">{formatProblem(record.problem)}</span>
						<span class="status">{record.isCorrect ? '✓' : '✗'}</span>
						<button
							class="favorite-btn"
							class:on={favoriteIds.has(problemId($state.snapshot(record.problem) as AnyProblem))}
							onclick={(e) => handleFavorite(record.problem, e)}
							title={favoriteIds.has(problemId($state.snapshot(record.problem) as AnyProblem)) ? '取消收藏' : '收藏此题'}
							data-testid="favorite-btn"
						>
							{favoriteIds.has(problemId($state.snapshot(record.problem) as AnyProblem)) ? '⭐' : '☆'}
						</button>
					</div>
					{#if !record.isCorrect}
						<div class="answers">
							<span class="wrong">你的答案: {formatAnswer(record.userAnswer, record.problem)}</span>
							<span class="correct">正确答案: {formatAnswer(record.correctAnswer, record.problem)}</span>
						</div>
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
		max-height: 400px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.record-card {
		background: white;
		border-radius: 12px;
		padding: 1rem 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		border-left: 4px solid #ddd;
	}
	.record-card.correct {
		border-left-color: #51cf66;
	}
	.record-card.wrong {
		border-left-color: #ff6b6b;
	}
	.record-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}
	.index {
		color: #999;
		font-weight: 600;
		min-width: 2rem;
	}
	.problem {
		flex: 1;
		color: #333;
		font-size: 1.1rem;
		font-weight: 500;
	}
	.status {
		font-size: 1.5rem;
		font-weight: bold;
	}
	.favorite-btn {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
		transition: transform 0.2s;
	}
	.favorite-btn:hover {
		transform: scale(1.2);
	}
	.record-card.correct .status {
		color: #51cf66;
	}
	.record-card.wrong .status {
		color: #ff6b6b;
	}
	.answers {
		display: flex;
		gap: 2rem;
		font-size: 0.9rem;
		padding-top: 0.5rem;
		border-top: 1px solid #f0f0f0;
	}
	.wrong {
		color: #ff6b6b;
		font-weight: 500;
	}
	.correct {
		color: #51cf66;
		font-weight: 500;
	}

	/* 移动端适配 */
	@media (max-width: 768px) {
		.result {
			padding: 1.5rem;
		}

		.emoji {
			font-size: 4rem;
			margin-bottom: 0.875rem;
		}

		h2 {
			font-size: 1.5rem;
			margin-bottom: 1.5rem;
		}

		.stats {
			gap: 1.5rem;
			margin-bottom: 1.5rem;
			flex-wrap: wrap;
		}

		.stat {
			flex: 1 1 40%;
		}

		.label {
			font-size: 0.9rem;
		}

		.value {
			font-size: 1.75rem;
		}

		.actions {
			gap: 0.75rem;
			flex-wrap: wrap;
		}

		button {
			flex: 1 1 40%;
			padding: 0.625rem 1.5rem;
			font-size: 1.1rem;
		}

		.details {
			margin-top: 1.5rem;
			padding-top: 1.25rem;
		}

		.details h3 {
			font-size: 1.1rem;
		}

		.records-list {
			max-height: 350px;
			gap: 0.75rem;
		}

		.record-card {
			padding: 0.875rem 1.25rem;
		}

		.problem {
			font-size: 1rem;
		}

		.answers {
			gap: 1rem;
			font-size: 0.85rem;
			flex-direction: column;
		}
	}

	@media (max-width: 480px) {
		.result {
			padding: 1rem;
		}

		.emoji {
			font-size: 3rem;
			margin-bottom: 0.75rem;
		}

		h2 {
			font-size: 1.35rem;
			margin-bottom: 1.25rem;
		}

		.stats {
			gap: 1rem;
			margin-bottom: 1.25rem;
			flex-direction: column;
		}

		.stat {
			flex: 1 1 100%;
		}

		.label {
			font-size: 0.85rem;
		}

		.value {
			font-size: 1.5rem;
		}

		.actions {
			flex-direction: column;
			gap: 0.5rem;
		}

		button {
			width: 100%;
			padding: 0.75rem;
			font-size: 1rem;
		}

		.details {
			margin-top: 1.25rem;
			padding-top: 1rem;
		}

		.details h3 {
			font-size: 1rem;
		}

		.records-list {
			max-height: 300px;
			gap: 0.5rem;
		}

		.record-card {
			padding: 0.75rem 1rem;
		}

		.record-header {
			gap: 0.5rem;
		}

		.index {
			min-width: 1.5rem;
			font-size: 0.9rem;
		}

		.problem {
			font-size: 0.95rem;
		}

		.status {
			font-size: 1.25rem;
		}

		.answers {
			gap: 0.75rem;
			font-size: 0.8rem;
			flex-direction: column;
		}
	}
</style>
