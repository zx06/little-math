<script lang="ts">
	import type { ExerciseConfig, Problem, MakeTargetProblem } from '$lib/types';
	import { DEFAULT_CONFIG } from '$lib/config/presets';
	import { generateProblems } from '$lib/generators/arithmetic';
	import { generateMakeTargetProblems } from '$lib/generators/makeTarget';
	import ConfigPanel from '$lib/components/ConfigPanel.svelte';
	import ExerciseSheet from '$lib/components/ExerciseSheet.svelte';
	import StatisticsPanel from '$lib/components/StatisticsPanel.svelte';
	import { zh } from '$lib/i18n/zh';
	import { trackVisit } from '$lib/services/statistics';
	import { loadConfig, saveConfig } from '$lib/services/configStorage';
	import { browser } from '$app/environment';

	let config: ExerciseConfig = $state(browser ? loadConfig() : { ...DEFAULT_CONFIG });
	let problems: (Problem | MakeTargetProblem)[] = $state([]);

	$effect(() => {
		if (browser) {
			saveConfig(config);
		}
	});

	function handleGenerate() {
		if (config.problemMode === 'makeTarget') {
			problems = generateMakeTargetProblems(config.makeTargetValue, config.totalCount);
		} else {
			problems = generateProblems(config);
		}
	}

	function handlePrint() {
		if (problems.length === 0) {
			handleGenerate();
		}
		setTimeout(() => {
			window.print();
		}, 100);
	}

	trackVisit();
	handleGenerate();
</script>

<svelte:head>
	<title>{zh.appName}</title>
	<meta name="description" content={zh.appSubtitle} />
</svelte:head>

<div class="app">
	<header class="app-header no-print">
		<h1>{zh.appName}</h1>
		<p>{zh.appSubtitle}</p>
	</header>

	<main class="app-main">
		<aside class="sidebar no-print">
			<ConfigPanel bind:config onGenerate={handleGenerate} onPrint={handlePrint} />
		</aside>

		<section class="preview">
			{#if problems.length > 0}
				<ExerciseSheet
					{problems}
					countPerPage={config.countPerPage}
					showAnswers={false}
					isVertical={config.isVertical}
					columns={config.columns}
					customTitle={config.customTitle}
					studentName={config.studentName}
					showDate={config.showDate}
				/>

				{#if config.showAnswerPage}
					<ExerciseSheet
						{problems}
						countPerPage={config.countPerPage}
						showAnswers={true}
						isVertical={config.isVertical}
						columns={config.columns}
						customTitle={config.customTitle}
						studentName={config.studentName}
						showDate={config.showDate}
					/>
				{/if}
			{:else}
				<div class="empty-state">
					<p>点击「生成」按钮创建练习题</p>
				</div>
			{/if}
		</section>
	</main>

	<StatisticsPanel />
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		background: #eee;
	}

	.app {
		min-height: 100vh;
	}

	.app-header {
		background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 50%, #ffdd59 100%);
		color: white;
		padding: 1.25rem 2rem;
		text-align: center;
		font-family: 'Comic Sans MS', cursive, sans-serif;
	}

	.app-header h1 {
		margin: 0;
		font-size: 2rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.app-header h1::before {
		content: '🧮 ';
	}

	.app-header h1::after {
		content: ' ✨';
	}

	.app-header p {
		margin: 0.5rem 0 0;
		opacity: 0.95;
		font-size: 1rem;
	}

	.app-main {
		display: grid;
		grid-template-columns: 320px 1fr;
		gap: 1.5rem;
		padding: 1.5rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.sidebar {
		position: sticky;
		top: 1.5rem;
		height: fit-content;
	}

	.preview {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		color: #999;
	}

	@media print {
		:global(*) {
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		:global(body) {
			margin: 0 !important;
			padding: 0 !important;
		}

		.app {
			min-height: auto !important;
		}

		.app-header,
		.no-print {
			display: none !important;
		}

		.app-main {
			display: block !important;
			padding: 0 !important;
			margin: 0 !important;
			max-width: none !important;
		}

		.preview {
			box-shadow: none !important;
			border-radius: 0 !important;
			overflow: visible !important;
		}
	}

	@media (max-width: 768px) {
		.app-main {
			grid-template-columns: 1fr;
		}

		.sidebar {
			position: static;
		}
	}
</style>
