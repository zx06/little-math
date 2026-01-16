<script lang="ts">
	import { onMount } from 'svelte';
	import type { StatisticsData } from '$lib/types';
	import { getStats, getLast7DaysStats, resetStats } from '$lib/services/statistics';
	import { OP_NAMES } from '$lib/types';

	let stats: StatisticsData = $state<StatisticsData>(getStats());
	let last7Days = $state(getLast7DaysStats());
	let showPanel = $state(false);

	onMount(() => {
		const interval = setInterval(() => {
			stats = getStats();
			last7Days = getLast7DaysStats();
		}, 1000);

		return () => clearInterval(interval);
	});

	function handleReset() {
		if (confirm('确定要重置所有统计数据吗？')) {
			resetStats();
			stats = getStats();
			last7Days = getLast7DaysStats();
		}
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
		return `${month}/${day} 周${weekdays[date.getDay()]}`;
	}

	function getPercent(value: number, total: number): string {
		if (total === 0) return '0%';
		return ((value / total) * 100).toFixed(1) + '%';
	}
</script>

<div class="stats-container">
	<button class="stats-toggle" onclick={() => (showPanel = !showPanel)} title="查看统计">
		<span>📊</span>
	</button>

	{#if showPanel}
		<div class="stats-panel">
			<div class="stats-header">
				<h3>📊 使用统计</h3>
				<button class="close-btn" onclick={() => (showPanel = false)}>×</button>
			</div>

			<div class="stats-content">
				<div class="stats-section">
					<h4>总览</h4>
					<div class="stats-grid">
						<div class="stat-card">
							<div class="stat-value">{stats.totalVisits}</div>
							<div class="stat-label">访问次数</div>
						</div>
						<div class="stat-card">
							<div class="stat-value">{stats.totalGenerations}</div>
							<div class="stat-label">生成次数</div>
						</div>
						<div class="stat-card">
							<div class="stat-value">{stats.totalPrints}</div>
							<div class="stat-label">打印次数</div>
						</div>
					</div>
				</div>

				{#if stats.totalGenerations > 0}
					<div class="stats-section">
						<h4>运算类型使用</h4>
						<div class="operation-stats">
							{#each Object.entries(stats.operationsCount) as [op, count]}
								{#if count > 0}
									<div class="operation-item">
										<div class="operation-name">{OP_NAMES[op as keyof typeof OP_NAMES]}</div>
										<div class="operation-bar">
											<div class="operation-fill" style="width: {getPercent(count, stats.totalGenerations)}"></div>
										</div>
										<div class="operation-count">{count} 次 ({getPercent(count, stats.totalGenerations)})</div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				<div class="stats-section">
					<h4>最近7天</h4>
					<div class="daily-stats">
						{#each last7Days as day}
							<div class="day-item">
								<div class="day-date">{formatDate(day.date)}</div>
								<div class="day-metrics">
									<span class="metric">👁 {day.visits}</span>
									<span class="metric">📝 {day.generations}</span>
									<span class="metric">🖨 {day.prints}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="stats-footer">
					<div class="last-visit">最后访问: {stats.lastVisitDate || '无'}</div>
					<button class="reset-btn" onclick={handleReset}>重置统计</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.stats-container {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 1000;
	}

	.stats-toggle {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		color: white;
		font-size: 24px;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stats-toggle:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
	}

	.stats-panel {
		position: absolute;
		bottom: 60px;
		right: 0;
		width: 380px;
		max-height: 80vh;
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.stats-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.stats-header h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		color: white;
		font-size: 24px;
		cursor: pointer;
		padding: 0;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.stats-content {
		padding: 16px 20px;
		overflow-y: auto;
		max-height: calc(80vh - 60px);
	}

	.stats-section {
		margin-bottom: 20px;
	}

	.stats-section h4 {
		margin: 0 0 12px;
		font-size: 14px;
		font-weight: 600;
		color: #333;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.stat-card {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 12px 8px;
		text-align: center;
	}

	.stat-value {
		font-size: 24px;
		font-weight: 700;
		color: #667eea;
		margin-bottom: 4px;
	}

	.stat-label {
		font-size: 12px;
		color: #666;
	}

	.operation-stats {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.operation-item {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.operation-name {
		width: 40px;
		font-size: 13px;
		color: #666;
	}

	.operation-bar {
		flex: 1;
		height: 8px;
		background: #e9ecef;
		border-radius: 4px;
		overflow: hidden;
	}

	.operation-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.operation-count {
		font-size: 12px;
		color: #666;
		min-width: 70px;
		text-align: right;
	}

	.daily-stats {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.day-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: #f8f9fa;
		border-radius: 6px;
	}

	.day-date {
		font-size: 13px;
		color: #666;
	}

	.day-metrics {
		display: flex;
		gap: 12px;
	}

	.metric {
		font-size: 12px;
		color: #666;
	}

	.stats-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 16px;
		border-top: 1px solid #e9ecef;
	}

	.last-visit {
		font-size: 12px;
		color: #999;
	}

	.reset-btn {
		padding: 6px 12px;
		background: #ff6b6b;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 12px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.reset-btn:hover {
		background: #fa5252;
	}

	@media print {
		.stats-container {
			display: none !important;
		}
	}
</style>