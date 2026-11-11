<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';
	import type { AnyProblem, ExerciseConfig, Operation } from '#lib/types.js';
	import { DEFAULT_CONFIG } from '#lib/config/presets.js';
	import { effectivePerPage, getLayout } from '#lib/config/layout.js';
	import { generateWorksheet, autoTitle, settingsSummary } from '#lib/generators/worksheet.js';
	import { validateConfig } from '#lib/generators/validate.js';
	import ConfigPanel from '#lib/components/ConfigPanel.svelte';
	import ExerciseSheet from '#lib/components/ExerciseSheet.svelte';
	import StatisticsPanel from '#lib/components/StatisticsPanel.svelte';
	import { zh } from '#lib/i18n/zh.js';
	import { trackVisit } from '#lib/services/statistics.js';
	import { loadConfig, saveConfig } from '#lib/services/configStorage.js';
	import { browser } from '$app/env';

	const OPS: Operation[] = ['add', 'sub', 'mul', 'div'];

	/** 修正旧版本 / 损坏的本地配置 */
	function normalizeConfig(c: ExerciseConfig): ExerciseConfig {
		const n: ExerciseConfig = { ...DEFAULT_CONFIG, ...c };
		n.range = { ...DEFAULT_CONFIG.range, ...(c.range ?? {}) };
		n.operations = Array.isArray(c.operations) ? OPS.filter((o) => c.operations.includes(o)) : [...DEFAULT_CONFIG.operations];
		if (n.operations.length === 0) n.operations = [...DEFAULT_CONFIG.operations];
		n.blankRatio = { ...DEFAULT_CONFIG.blankRatio, ...(c.blankRatio ?? {}) };
		if (n.columns !== 2 && n.columns !== 3) n.columns = 2;
		n.chainLength = Number(n.chainLength) === 4 ? 4 : 3;
		n.isVertical = n.isVertical === true || (n.isVertical as unknown) === 'true';
		const cap = getLayout(n).maxPerPage;
		if (!Number.isInteger(n.countPerPage) || n.countPerPage < 1) n.countPerPage = getLayout(n).defaultPerPage;
		if (n.countPerPage > cap) n.countPerPage = cap;
		return n;
	}

	let config: ExerciseConfig = $state(browser ? normalizeConfig(loadConfig()) : { ...DEFAULT_CONFIG });
	let problems: AnyProblem[] = $state([]);
	/** 生成当前题目时的配置快照（标题、副标题按它计算，保证与题目一致） */
	let generatedConfig = $state<ExerciseConfig | null>(null);
	let generatedKey = $state('');
	let notice = $state<string | null>(null);
	let isExportingPdf = $state(false);
	let layoutNote = $state<string | null>(null);
	let mounted = $state(false);
	let previewEl: HTMLElement | undefined = $state();
	let zoom = $state(1);

	const issues = $derived(validateConfig(config));
	const layout = $derived(getLayout(config));
	const perPage = $derived(effectivePerPage(config));

	/** 影响题目内容的设置；改动后自动重新出题（版式类设置只重新排版，不换题） */
	const contentKey = $derived(
		JSON.stringify([
			config.problemMode,
			config.range?.min,
			config.range?.max,
			[...(config.operations ?? [])].sort(),
			config.blankRatio,
			config.totalCount,
			config.makeTargetValue,
			config.chainLength,
			config.remainderBlank,
			!!config.tableMulDiv
		])
	);
	const stale = $derived(generatedKey !== contentKey);

	const sheetTitle = $derived(
		generatedConfig ? generatedConfig.customTitle?.trim() || autoTitle(generatedConfig) : ''
	);
	const sheetSubtitle = $derived(generatedConfig ? settingsSummary(generatedConfig) : '');

	$effect(() => {
		if (browser) saveConfig($state.snapshot(config) as ExerciseConfig);
	});

	function regenerate() {
		const snapshot = $state.snapshot(config) as ExerciseConfig;
		const r = generateWorksheet(snapshot);
		generatedKey = contentKey;
		if (r.issues.length) {
			problems = [];
			generatedConfig = null;
			notice = null;
			return;
		}
		problems = r.problems;
		generatedConfig = snapshot;
		notice = r.notice;
	}

	function handleGenerate() {
		regenerate();
	}

	// 设置改动后自动刷新预览（250ms 防抖）
	$effect(() => {
		const key = contentKey;
		if (!mounted) return;
		if (untrack(() => generatedKey) === key) return;
		const timer = setTimeout(() => untrack(regenerate), 250);
		return () => clearTimeout(timer);
	});

	// 版式变化（横式/竖式、列数、模式）时，若每页题数超过新版式上限则自动调小并提示
	let lastLayoutKey = '';
	$effect(() => {
		const key = `${layout.vertical}-${layout.columns}`;
		const cap = layout.maxPerPage;
		untrack(() => {
			if (lastLayoutKey && key !== lastLayoutKey && Number.isInteger(config.countPerPage) && config.countPerPage > cap) {
				layoutNote = `一张纸最多放 ${cap} 道，已从 ${config.countPerPage} 道改成 ${cap} 道`;
				config.countPerPage = cap;
			} else if (key !== lastLayoutKey) {
				layoutNote = null;
			}
			lastLayoutKey = key;
		});
	});

	/** 确保打印 / 导出的是与当前设置一致的题目 */
	async function ensureFresh(): Promise<boolean> {
		if (issues.length) return false;
		if (stale || problems.length === 0) regenerate();
		await tick();
		return problems.length > 0;
	}

	async function handlePrint() {
		if (!(await ensureFresh())) return;
		await document.fonts?.ready;
		setTimeout(() => window.print(), 50);
	}

	async function handleExportPdf() {
		if (!browser || !(await ensureFresh())) return;
		const element = document.getElementById('exercise-sheet');
		if (!element) return;
		isExportingPdf = true;
		const prevZoom = zoom;
		zoom = 1;
		try {
			await tick();
			const { exportPagesToPdf } = await import('#lib/services/pdfExport.js');
			await exportPagesToPdf(element);
		} catch (error) {
			console.error('PDF导出失败:', error);
			alert('没存成功，再试一次吧');
		} finally {
			zoom = prevZoom;
			isExportingPdf = false;
		}
	}

	onMount(() => {
		trackVisit();
		regenerate();
		mounted = true;
		// 窄屏时按比例缩小 A4 预览（打印 / 导出不受影响）
		const ro = new ResizeObserver(() => {
			if (!previewEl || isExportingPdf) return;
			const w = previewEl.clientWidth - 16;
			const pageW = (210 / 25.4) * 96;
			zoom = w > 0 && w < pageW ? Math.max(0.3, w / pageW) : 1;
		});
		if (previewEl) ro.observe(previewEl);
		return () => ro.disconnect();
	});
</script>

<svelte:head>
	<title>{zh.appName}</title>
	<meta name="description" content={zh.appSubtitle} />
</svelte:head>

<div class="app">
	<main class="app-main">
		<aside class="sidebar no-print">
			<ConfigPanel
				bind:config
				{issues}
				autoTitle={autoTitle(config)}
				{layoutNote}
				onGenerate={handleGenerate}
				onPrint={handlePrint}
				onExportPdf={handleExportPdf}
				{isExportingPdf}
			/>
		</aside>

		<section class="preview" bind:this={previewEl}>
			{#if issues.length > 0}
				<div class="empty-state error-state no-print" data-testid="config-error">
					<p>🤔 有个地方要改一下：</p>
					<ul>
						{#each issues as issue}<li>{issue.message}</li>{/each}
					</ul>
				</div>
			{:else if problems.length > 0 && generatedConfig}
				{#if stale}
					<div class="banner no-print" data-testid="stale-banner">✨ 正在换新题…</div>
				{/if}
				{#if notice}
					<div class="banner warn no-print" data-testid="fill-notice">ℹ️ {notice}</div>
				{/if}
				<div id="exercise-sheet" style="--sheet-zoom: {zoom}">
					<ExerciseSheet
						{problems}
						{perPage}
						showAnswers={false}
						vertical={layout.vertical}
						columns={layout.columns}
						title={sheetTitle}
						subtitle={sheetSubtitle}
						studentName={config.studentName}
						showDate={config.showDate}
					/>
					{#if config.showAnswerPage}
						<ExerciseSheet
							{problems}
							{perPage}
							showAnswers={true}
							vertical={layout.vertical}
							columns={layout.columns}
							title={sheetTitle}
							subtitle={sheetSubtitle}
							studentName={config.studentName}
							showDate={config.showDate}
						/>
					{/if}
				</div>
			{:else}
				<div class="empty-state">
					<p>✏️ 题目马上就好…</p>
				</div>
			{/if}
		</section>
	</main>

	<div class="no-print"><StatisticsPanel /></div>
</div>

<style>
	.app {
		min-height: calc(100vh - 80px);
	}

	.app-main {
		display: grid;
		grid-template-columns: var(--ui-sidebar-w) 1fr;
		gap: var(--ui-gap);
		padding: var(--ui-gap);
		max-width: 1400px;
		margin: 0 auto;
	}

	.sidebar {
		position: sticky;
		top: var(--ui-gap);
		height: fit-content;
	}

	.preview {
		background: var(--pv-bg);
		border-radius: var(--pv-radius);
		box-shadow: var(--pv-shadow);
		border: var(--pv-border, none);
		overflow: auto;
		padding: var(--pv-pad);
		min-width: 0;
	}

	.banner {
		max-width: 210mm;
		margin: 0 auto 10px;
		padding: 10px 14px;
		border-radius: var(--ui-radius-sm);
		background: var(--bn-bg);
		color: var(--bn-fg);
		font-size: var(--bn-size);
	}
	.banner.warn {
		background: var(--bn-warn-bg);
		color: var(--bn-warn-fg);
	}
	.empty-state.error-state {
		flex-direction: column;
		color: var(--c-danger);
		padding: 1rem 2rem;
		font-size: 1.1rem;
	}
	.error-state ul {
		margin: 0.5rem 0 0;
	}

	#exercise-sheet {
		overflow: visible;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		color: var(--ui-muted);
		font-size: 1.15rem;
	}

	@media print {
		.app {
			min-height: auto !important;
		}

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
			display: block !important;
			box-shadow: none !important;
			border: none !important;
			border-radius: 0 !important;
			overflow: visible !important;
			padding: 0 !important;
			background: none !important;
		}
	}

	@media (max-width: 768px) {
		.app-main {
			grid-template-columns: 1fr;
			padding: 0.75rem 1rem 1rem;
			gap: 0.75rem;
		}

		.sidebar {
			position: static;
		}

		/* 手机先露出出题区；卷面仍在 DOM 里供打印 / 导出 */
		.preview {
			display: none;
		}

		.empty-state {
			min-height: 300px;
		}

		.app {
			min-height: auto;
		}
	}

	@media (max-width: 480px) {
		.app-main {
			padding: 0.75rem;
			gap: 0.75rem;
		}

		.empty-state {
			min-height: 250px;
		}
	}
</style>
