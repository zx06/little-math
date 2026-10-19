<script lang="ts">
	import { onMount } from 'svelte';
	import type { StatisticsData } from '$lib/types';
	import { getStats, getLast7DaysStats, resetStats, getDailyProgress } from '$lib/services/statistics';
	import { OP_NAMES } from '$lib/types';
	import ProgressChart from '$lib/components/ProgressChart.svelte';
	import { downloadStatisticsJSON, downloadStatisticsCSV } from '$lib/services/export';

	let stats: StatisticsData = $state<StatisticsData>(getStats());
	let last7Days = $state(getLast7DaysStats());
	let dailyProgress = $state(getDailyProgress());
	let showPanel = $state(false);

	onMount(() => {
		const interval = setInterval(() => {
			stats = getStats();
			last7Days = getLast7DaysStats();
			dailyProgress = getDailyProgress();
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
	<button class="stats-toggle" onclick={() => (showPanel = !showPanel)} title="查看统计" data-testid="stats-toggle">
		<span>📊</span>
	</button>

	{#if showPanel}
		<div class="stats-panel" data-testid="stats-panel">
			<div class="stats-header">
				<h3>📊 使用统计</h3>
				<button class="close-btn" onclick={() => (showPanel = false)}>×</button>
			</div>

			<div class="stats-content">
				<div class="stats-section">
					<h4>总览</h4>
					<div class="stats-grid">
						<div class="stat-card" data-testid="stat-visits">
							<div class="stat-value">{stats.totalVisits}</div>
							<div class="stat-label">访问次数</div>
						</div>
						<div class="stat-card" data-testid="stat-generations">
							<div class="stat-value">{stats.totalGenerations}</div>
							<div class="stat-label">生成次数</div>
						</div>
						<div class="stat-card" data-testid="stat-prints">
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

				<div class="stats-section">
					<ProgressChart data={dailyProgress} />
				</div>
			</div>
			
			<div class="stats-footer">
				<div class="last-visit">最后访问: {stats.lastVisitDate || '无'}</div>
				<div class="footer-buttons">
					<button class="export-btn" onclick={downloadStatisticsJSON} data-testid="stats-export-json">导出 JSON</button>
					<button class="export-btn" onclick={downloadStatisticsCSV} data-testid="stats-export-csv">导出 CSV</button>
					<button class="reset-btn" onclick={handleReset} data-testid="stats-reset">重置统计</button>
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
		display: flex;
		flex-direction: column;
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
		flex: 1;
		min-height: 0;
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
		flex-direction: column;
		gap: 12px;
		padding: 16px 20px;
		border-top: 1px solid #e9ecef;
		background: #f8f9fa;
	}

	.last-visit {
		font-size: 12px;
		color: #999;
		text-align: center;
	}

	.footer-buttons {
		display: flex;
		gap: 8px;
		justify-content: center;
	}

	.export-btn {
		flex: 1;
		padding: 10px 16px;
		background: #5c7cfa;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		text-align: center;
	}

	.export-btn:hover {
		background: #4263eb;
		transform: translateY(-1px);
	}

	.reset-btn {
		flex: 1;
		padding: 10px 16px;
		background: #ff6b6b;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		text-align: center;
	}

	.reset-btn:hover {
		background: #fa5252;
		transform: translateY(-1px);
	}

	/* 移动端适配 */
	@media (max-width: 768px) {
		.stats-container {
			bottom: 15px;
			right: 15px;
		}

		.stats-toggle {
			width: 48px;
			height: 48px;
			font-size: 22px;
		}

		.stats-panel {
			width: 340px;
			max-height: 85vh;
			bottom: 55px;
		}

		.stats-header {
			padding: 14px 16px;
		}

		.stats-header h3 {
			font-size: 16px;
		}

		.close-btn {
			width: 26px;
			height: 26px;
			font-size: 22px;
		}

		.stats-content {
			padding: 14px 16px;
			overflow-y: auto;
			max-height: calc(80vh - 55px);
		}

		.stats-section {
			margin-bottom: 16px;
		}

		.stats-section h4 {
			font-size: 13px;
		}

		.stats-grid {
			gap: 10px;
		}

		.stat-card {
			padding: 10px 6px;
		}

		.stat-value {
			font-size: 20px;
		}

		.stat-label {
			font-size: 11px;
		}

		.operation-item {
			gap: 10px;
		}

		.operation-name {
			width: 36px;
			font-size: 12px;
		}

		.operation-count {
			font-size: 11px;
			min-width: 60px;
		}

		.day-item {
			padding: 6px 10px;
		}

		.day-date {
			font-size: 12px;
		}

		.day-metrics {
			gap: 10px;
		}

		.metric {
			font-size: 11px;
		}

		.stats-footer {
			padding: 14px 16px;
		}

		.last-visit {
			font-size: 11px;
		}

		.footer-buttons {
			gap: 6px;
		}

		.export-btn {
			padding: 8px 12px;
			font-size: 12px;
		}

		.reset-btn {
			padding: 8px 12px;
			font-size: 12px;
		}
	}

	@media (max-width: 480px) {
		.stats-container {
			bottom: 10px;
			right: 10px;
		}

		.stats-toggle {
			width: 44px;
			height: 44px;
			font-size: 20px;
		}

		.stats-panel {
			width: calc(100vw - 20px);
			max-width: 320px;
			max-height: 85vh;
			bottom: 50px;
			right: -10px;
		}

		.stats-header {
			padding: 12px 14px;
		}

		.stats-header h3 {
			font-size: 15px;
		}

		.stats-content {
			padding: 12px 14px;
			overflow-y: auto;
			max-height: calc(80vh - 50px);
		}

		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
		}

		.stat-card {
			padding: 8px 4px;
		}

		.stat-value {
			font-size: 18px;
		}

		.stat-label {
			font-size: 10px;
		}

		.operation-item {
			gap: 8px;
		}

		.operation-name {
			width: 32px;
			font-size: 11px;
		}

		.operation-count {
			font-size: 10px;
			min-width: 55px;
		}

		.day-item {
			padding: 6px 8px;
		}

		.day-date {
			font-size: 11px;
		}

		.day-metrics {
			gap: 8px;
		}

		.metric {
			font-size: 10px;
		}

		.stats-footer {
			padding: 12px 14px;
		}

		.last-visit {
			font-size: 10px;
		}

		.footer-buttons {
			gap: 6px;
		}

		.export-btn {
			padding: 8px 10px;
			font-size: 12px;
		}

		.reset-btn {
			padding: 8px 10px;
			font-size: 12px;
		}
	}

	@media print {
		.stats-container {
			display: none !important;
		}
	}
</style>