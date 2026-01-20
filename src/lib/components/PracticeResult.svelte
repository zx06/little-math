<script lang="ts">
	interface Props {
		total: number;
		correct: number;
		timeSpent: number; // 秒
		onRestart: () => void;
		onBackHome: () => void;
	}

	let { total, correct, timeSpent, onRestart, onBackHome }: Props = $props();

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
</style>
