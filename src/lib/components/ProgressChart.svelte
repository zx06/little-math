<script lang="ts">
	interface Props {
		data: Array<{
		date: string;
		totalProblems: number;
		correctProblems: number;
		correctRate: number;
		timeSpent: number;
		avgTimePerProblem: number;
	}>;
	}

	let { data }: Props = $props();

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return `${month}/${day}`;
	}

	function getBarHeight(value: number, maxValue: number): number {
		if (maxValue === 0) return 0;
		return (value / maxValue) * 100;
	}

	const maxValue = $derived(Math.max(...data.map((d) => d.totalProblems), 1));
</script>

<div class="progress-chart">
	<h4>📊 学习进度（近7天）</h4>
	<div class="chart-container">
		<svg viewBox="0 0 600 200" class="chart-svg">
			<!-- Y轴网格线 -->
			{#each [0, 25, 50, 75, 100] as percent}
				{@const y = 180 - (percent / 100) * 160}
				<line x1="40" y1={y} x2="580" y2={y} stroke="#e0e0e0" stroke-dasharray="4" />
				<text x="35" y={y + 4} text-anchor="end" font-size="10" fill="#999">{percent}%</text>
			{/each}

			<!-- X轴 -->
			<line x1="40" y1="180" x2="580" y2="180" stroke="#ccc" stroke-width="2" />

			<!-- 柱状图 -->
			{#each data as item, idx}
				{@const x = 60 + idx * 75}
				{@const barWidth = 50}
				{@const correctHeight = getBarHeight(item.correctProblems, maxValue)}
				{@const totalHeight = getBarHeight(item.totalProblems, maxValue)}

				<!-- 总题数柱子（浅色背景） -->
				<rect
					x={x}
					y={180 - totalHeight * 1.6}
					width={barWidth}
					height={totalHeight * 1.6}
					fill="#e8f5e9"
					rx="4"
				/>

				<!-- 正确题数柱子（深色） -->
				<rect
					x={x}
					y={180 - correctHeight * 1.6}
					width={barWidth}
					height={correctHeight * 1.6}
					fill="#51cf66"
					rx="4"
				/>

				<!-- 日期标签 -->
				<text x={x + barWidth / 2} y="195" text-anchor="middle" font-size="11" fill="#666">
					{formatDate(item.date)}
				</text>

				<!-- 题数标签 -->
				<text
					x={x + barWidth / 2}
					y={180 - totalHeight * 1.6 - 5}
					text-anchor="middle"
					font-size="10"
					fill="#666"
				>
					{item.totalProblems}
				</text>

				<!-- 正确率标签 -->
				<text
					x={x + barWidth / 2}
					y={180 - correctHeight * 1.6 - 18}
					text-anchor="middle"
					font-size="9"
					fill="#51cf66"
					font-weight="bold"
				>
					{item.correctRate}%
				</text>
			{/each}
		</svg>

		<!-- 图例 -->
		<div class="legend">
			<div class="legend-item">
				<div class="legend-color correct"></div>
				<span>正确题数</span>
			</div>
			<div class="legend-item">
				<div class="legend-color total"></div>
				<span>总题数</span>
			</div>
		</div>
	</div>

	<!-- 详细数据 -->
	<div class="progress-details">
		{#each data as item}
			<div class="detail-item">
				<span class="detail-date">{formatDate(item.date)}</span>
				<span class="detail-stat">{item.totalProblems} 题</span>
				<span class="detail-stat correct">{item.correctProblems} 正确</span>
				<span class="detail-stat rate">{item.correctRate}%</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.progress-chart {
		margin-top: 1.5rem;
	}

	h4 {
		margin: 0 0 1rem;
		font-size: 14px;
		font-weight: 600;
		color: #333;
	}

	.chart-container {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 1rem;
	}

	.chart-svg {
		width: 100%;
		height: auto;
	}

	.legend {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 12px;
		color: #666;
	}

	.legend-color {
		width: 16px;
		height: 16px;
		border-radius: 4px;
	}

	.legend-color.correct {
		background: #51cf66;
	}

	.legend-color.total {
		background: #e8f5e9;
		border: 1px solid #51cf66;
	}

	.progress-details {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem;
		background: #f8f9fa;
		border-radius: 6px;
		font-size: 11px;
	}

	.detail-date {
		color: #999;
		margin-bottom: 0.25rem;
	}

	.detail-stat {
		color: #666;
		margin-bottom: 0.125rem;
	}

	.detail-stat.correct {
		color: #51cf66;
		font-weight: 600;
	}

	.detail-stat.rate {
		color: #5c7cfa;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.progress-details {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (max-width: 480px) {
		.progress-details {
			grid-template-columns: repeat(2, 1fr);
		}

		.legend {
			gap: 1rem;
		}

		.detail-item {
			font-size: 10px;
		}
	}
</style>