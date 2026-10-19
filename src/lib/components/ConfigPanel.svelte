<script lang="ts">
	import type { ExerciseConfig, Operation, BlankPosition, MakeTargetValue } from '$lib/types';
	import { OP_NAMES } from '$lib/types';
	import { GRADE_PRESETS } from '$lib/config/presets';
	import { getLayout, supportsVertical } from '$lib/config/layout';
	import { usesOperations, usesRange, TOTAL_COUNT_LIMIT, type ValidationIssue, type ConfigField } from '$lib/generators/validate';
	import { RANGE_RULE_TEXT } from '$lib/generators/rules';
	import { REMAINDER_DIVISOR_MAX, REMAINDER_DIVISOR_MIN } from '$lib/generators/remainder';
	import { zh } from '$lib/i18n/zh';
	import { track } from '$lib/actions/track';
	import ThemeSelector from '$lib/components/ThemeSelector.svelte';

	const MAKE_TARGET_OPTIONS: MakeTargetValue[] = [10, 20, 100];

	interface Props {
		config: ExerciseConfig;
		issues: ValidationIssue[];
		autoTitle: string;
		layoutNote?: string | null;
		onGenerate: () => void;
		onPrint: () => void;
		onExportPdf?: () => void;
		isExportingPdf?: boolean;
		theme: string;
		onThemeChange: (theme: string) => void;
	}

	let {
		config = $bindable(),
		issues,
		autoTitle,
		layoutNote = null,
		onGenerate,
		onPrint,
		onExportPdf,
		isExportingPdf = false,
		theme,
		onThemeChange
	}: Props = $props();

	const t = zh.config;
	const layout = $derived(getLayout(config));
	const canPrint = $derived(issues.length === 0);
	const verticalSupported = $derived(supportsVertical(config.problemMode));
	const showOps = $derived(usesOperations(config.problemMode));
	const showRange = $derived(usesRange(config.problemMode));
	const hasMulDiv = $derived(config.operations.includes('mul') || config.operations.includes('div'));

	function errorsFor(...fields: ConfigField[]): string[] {
		return issues.filter((i) => fields.includes(i.field)).map((i) => i.message);
	}

	function handlePresetChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const preset = GRADE_PRESETS[target.value];
		if (preset && target.value !== 'custom') {
			config.range = { ...preset.range };
			config.operations = [...preset.operations];
		}
	}

	/** 允许取消到 0 个运算：界面和实际状态保持一致，并提示“至少选择一种运算” */
	function toggleOperation(op: Operation, checked: boolean) {
		const set = new Set(config.operations);
		if (checked) set.add(op);
		else set.delete(op);
		config.operations = (['add', 'sub', 'mul', 'div'] as Operation[]).filter((o) => set.has(o));
	}

	/** 三个滑块是独立的权重，互不影响；实际比例 = 权重 / 总和 */
	function updateBlankRatio(pos: BlankPosition, value: number) {
		config.blankRatio = { ...config.blankRatio, [pos]: value / 100 };
	}
	const ratioTotal = $derived(
		(config.blankRatio.first ?? 0) + (config.blankRatio.second ?? 0) + (config.blankRatio.result ?? 0)
	);
	function share(pos: BlankPosition): number {
		if (ratioTotal <= 0) return pos === 'result' ? 100 : 0;
		return Math.round(((config.blankRatio[pos] ?? 0) / ratioTotal) * 100);
	}

	const rangeHints = $derived.by(() => {
		if (config.problemMode === 'remainder')
			return [`被除数在范围内；除数 ${REMAINDER_DIVISOR_MIN}～${REMAINDER_DIVISOR_MAX}；余数小于除数`];
		if (config.problemMode === 'chain')
			return ['按「先乘除、后加减」计算', '每一步的中间结果和答案都在 0～最大值 之间，除法都能整除'];
		return config.operations.map((op) => RANGE_RULE_TEXT[op]);
	});
</script>

<div class="config-panel">
	<h2>配置</h2>

	<div class="config-section">
		<ThemeSelector selectedTheme={theme} onChange={onThemeChange} />
	</div>

	<div class="config-section">
		<label>
			{t.gradePreset}
			<select bind:value={config.gradePreset} onchange={handlePresetChange} data-testid="preset">
				{#each Object.entries(GRADE_PRESETS) as [key, preset]}
					<option value={key}>{preset.label}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="config-section">
		<label>
			{t.problemMode}
			<select bind:value={config.problemMode} data-testid="mode">
				<option value="normal">{t.normalMode}</option>
				<option value="makeTarget">{t.makeTargetMode}</option>
				<option value="chain">{t.chainMode}</option>
				<option value="compare">{t.compareMode}</option>
				<option value="remainder">{t.remainderMode}</option>
			</select>
		</label>
	</div>

	{#if config.problemMode === 'remainder'}
		<div class="config-section">
			<label>
				{t.remainderBlank}
				<select bind:value={config.remainderBlank} data-testid="remainder-blank">
					<option value="quotient">{t.remainderBlankQuotient}</option>
					<option value="remainder">{t.remainderBlankRemainder}</option>
					<option value="both">{t.remainderBlankBoth}</option>
				</select>
			</label>
		</div>
	{/if}

	{#if config.problemMode === 'chain'}
		<div class="config-section">
			<label>
				{t.chainLength}
				<select bind:value={config.chainLength} data-testid="chain-length">
					<option value={3}>{t.chainLength3}</option>
					<option value={4}>{t.chainLength4}</option>
				</select>
			</label>
		</div>
	{/if}

	{#if config.problemMode === 'makeTarget'}
		<div class="config-section">
			<label>
				{t.makeTargetValue}
				<select bind:value={config.makeTargetValue} data-testid="make-target">
					{#each MAKE_TARGET_OPTIONS as value}
						<option {value}>凑 {value}</option>
					{/each}
				</select>
			</label>
		</div>
	{/if}

	<div class="config-section">
		{#if verticalSupported}
			<label>
				{t.exerciseType}
				<select bind:value={config.isVertical} data-testid="vertical">
					<option value={false}>{t.horizontal}</option>
					<option value={true}>{t.vertical}</option>
				</select>
			</label>
		{:else}
			<span class="label">{t.exerciseType}</span>
			<p class="hint">该模式只支持横式</p>
		{/if}
	</div>

	{#if !layout.vertical}
		<div class="config-section">
			<label>
				{t.columns}
				<select bind:value={config.columns} data-testid="columns">
					<option value={2}>{t.columns2}</option>
					<option value={3}>{t.columns3}</option>
				</select>
			</label>
		</div>
	{/if}

	{#if showOps}
		<div class="config-section">
			<span class="label">{t.operations}</span>
			<div class="checkbox-group" class:invalid={errorsFor('operations').length > 0}>
				{#each Object.entries(OP_NAMES) as [op, name]}
					<label class="checkbox-label">
						<input
							type="checkbox"
							data-testid="op-{op}"
							checked={config.operations.includes(op as Operation)}
							onchange={(e) => toggleOperation(op as Operation, (e.target as HTMLInputElement).checked)}
						/>
						{name}
					</label>
				{/each}
			</div>
			{#each errorsFor('operations') as msg}<p class="error" role="alert">{msg}</p>{/each}
			{#if hasMulDiv}
				<label class="checkbox-label table-opt">
					<input type="checkbox" bind:checked={config.tableMulDiv} data-testid="table-muldiv" />
					乘除只出表内（因数、除数和商不超过 9）
				</label>
			{/if}
		</div>
	{/if}

	{#if showRange}
		<div class="config-section">
			<span class="label">{config.problemMode === 'remainder' ? '被除数范围' : t.range}</span>
			<div class="range-inputs">
				<label>
					{t.rangeMin}
					<input
						type="number"
						data-testid="range-min"
						bind:value={config.range.min}
						min="0"
						max="9999"
						step="1"
						class:invalid={errorsFor('rangeMin', 'range').length > 0}
					/>
				</label>
				<label>
					{t.rangeMax}
					<input
						type="number"
						data-testid="range-max"
						bind:value={config.range.max}
						min="1"
						max="9999"
						step="1"
						class:invalid={errorsFor('rangeMax', 'range').length > 0}
					/>
				</label>
			</div>
			{#each errorsFor('rangeMin', 'rangeMax', 'range') as msg}<p class="error" role="alert">{msg}</p>{/each}
			<ul class="hint-list">
				{#each rangeHints as h}<li>{h}</li>{/each}
			</ul>
		</div>
	{/if}

	{#if config.problemMode === 'normal'}
		<div class="config-section">
			<span class="label">{t.blankPosition}</span>
			<div class="ratio-inputs">
				{#each [['first', t.blankFirst], ['second', t.blankSecond], ['result', t.blankResult]] as [pos, name]}
					<label>
						{name}
						<input
							type="range"
							min="0"
							max="100"
							value={Math.round((config.blankRatio[pos as BlankPosition] ?? 0) * 100)}
							oninput={(e) => updateBlankRatio(pos as BlankPosition, Number((e.target as HTMLInputElement).value))}
						/>
						<span>{share(pos as BlankPosition)}%</span>
					</label>
				{/each}
			</div>
			<p class="hint">三个滑块互不影响，右侧是实际占比{ratioTotal <= 0 ? '（全为 0 时只留空结果）' : ''}</p>
		</div>
	{/if}

	<div class="config-section">
		<label>
			{t.totalCount}
			<input
				type="number"
				data-testid="total-count"
				bind:value={config.totalCount}
				min="1"
				max={TOTAL_COUNT_LIMIT}
				step="1"
				class:invalid={errorsFor('totalCount').length > 0}
			/>
		</label>
		{#each errorsFor('totalCount') as msg}<p class="error" role="alert">{msg}</p>{/each}
	</div>

	<div class="config-section">
		<label>
			{t.countPerPage}
			<input
				type="number"
				data-testid="per-page"
				bind:value={config.countPerPage}
				min="1"
				max={layout.maxPerPage}
				step="1"
				class:invalid={errorsFor('countPerPage').length > 0}
			/>
		</label>
		{#each errorsFor('countPerPage') as msg}<p class="error" role="alert">{msg}</p>{/each}
		<p class="hint">当前版式一页 A4 最多 {layout.maxPerPage} 道</p>
		{#if layoutNote}<p class="note" data-testid="layout-note">{layoutNote}</p>{/if}
	</div>

	<div class="config-section">
		<label>
			{t.customTitle}
			<input type="text" bind:value={config.customTitle} placeholder={autoTitle} maxlength="30" data-testid="custom-title" />
		</label>
		<p class="hint">留空则按设置自动生成：{autoTitle}</p>
	</div>

	<div class="config-section">
		<label>
			{t.studentName}
			<input type="text" bind:value={config.studentName} placeholder="请输入姓名" data-testid="student-name" />
		</label>
	</div>

	<div class="config-section">
		<label class="checkbox-label">
			<input type="checkbox" bind:checked={config.showDate} data-testid="show-date" />
			{t.showDate}
		</label>
	</div>

	<div class="config-section">
		<label class="checkbox-label">
			<input type="checkbox" bind:checked={config.showAnswerPage} data-testid="show-answer-page" />
			{t.showAnswerPage}
		</label>
	</div>

	<div class="button-group">
		<button
			class="btn primary"
			onclick={onGenerate}
			disabled={!canPrint}
			data-testid="generate"
			use:track={{
				type: 'generation',
				data: { operations: config.operations, gradePreset: config.gradePreset }
			}}
		>
			{zh.buttons.generate}
		</button>
		<button class="btn secondary" onclick={onPrint} disabled={!canPrint} data-testid="print" use:track={{ type: 'print' }}>
			{zh.buttons.print}
		</button>
		{#if onExportPdf}
			<button
				class="btn pdf"
				onclick={onExportPdf}
				disabled={isExportingPdf || !canPrint}
				data-testid="export-pdf"
				use:track={{ type: 'pdf' }}
			>
				{isExportingPdf ? '导出中...' : zh.buttons.exportPdf}
			</button>
		{/if}
	</div>
	{#if !canPrint}<p class="error center">请先修正上面标红的设置</p>{/if}
</div>

<style>
	.config-panel {
		padding: 1.5rem;
		background: linear-gradient(180deg, #fff5f5 0%, #fff9db 100%);
		border-radius: 16px;
		height: fit-content;
		border: 2px solid #ffc078;
		font-family: 'Comic Sans MS', cursive, sans-serif;
	}

	h2 {
		margin: 0 0 1.5rem;
		font-size: 1.4rem;
		color: #ff6b6b;
		text-align: center;
	}

	h2::before {
		content: '⚙️ ';
	}

	.config-section {
		margin-bottom: 1.25rem;
	}

	.config-section > label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #555;
	}

	.label {
		font-size: 0.875rem;
		color: #555;
		display: block;
		margin-bottom: 0.5rem;
	}

	select,
	input[type='number'],
	input[type='text'] {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		width: 100%;
		box-sizing: border-box;
	}

	.checkbox-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.range-inputs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.range-inputs label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: #777;
	}

	.ratio-inputs {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.ratio-inputs label {
		display: grid;
		grid-template-columns: 80px 1fr 40px;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
	}

	.error {
		color: #e03131;
		font-size: 0.8rem;
		margin: 0.35rem 0 0;
	}
	.error.center {
		text-align: center;
	}
	.hint,
	.note {
		color: #888;
		font-size: 0.75rem;
		margin: 0.35rem 0 0;
	}
	.note {
		color: #e8590c;
	}
	.hint-list {
		margin: 0.4rem 0 0;
		padding-left: 1.1rem;
		color: #888;
		font-size: 0.75rem;
	}
	input.invalid,
	.checkbox-group.invalid {
		outline: 2px solid #ff8787;
		outline-offset: 1px;
		border-radius: 4px;
	}
	.table-opt {
		margin-top: 0.5rem;
		font-size: 0.8rem;
	}

	.ratio-inputs input[type='range'] {
		width: 100%;
	}

	.button-group {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.btn {
		flex: 1;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.btn.primary {
		background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
		color: white;
		font-weight: 600;
		box-shadow: 0 3px 8px rgba(255, 107, 107, 0.4);
	}

	.btn.primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
	}

	.btn.secondary {
		background: linear-gradient(135deg, #51cf66 0%, #20c997 100%);
		color: white;
		font-weight: 600;
		box-shadow: 0 3px 8px rgba(81, 207, 102, 0.4);
	}

	.btn.secondary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(81, 207, 102, 0.5);
	}

	.btn.pdf {
		background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
		color: white;
		font-weight: 600;
		box-shadow: 0 3px 8px rgba(231, 76, 60, 0.4);
	}

	.btn.pdf:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(231, 76, 60, 0.5);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	/* 移动端适配 */
	@media (max-width: 768px) {
		.config-panel {
			padding: 1rem;
			border-radius: 12px;
		}

		h2 {
			font-size: 1.2rem;
			margin-bottom: 1rem;
		}

		.config-section {
			margin-bottom: 1rem;
		}

		.config-section > label,
		.label {
			font-size: 0.8rem;
		}

		select,
		input[type='number'],
		input[type='text'] {
			padding: 0.6rem;
			font-size: 0.9rem;
		}

		.checkbox-group {
			gap: 0.5rem;
		}

		.checkbox-label {
			font-size: 0.8rem;
		}

		.range-inputs {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.ratio-inputs label {
			grid-template-columns: 60px 1fr 35px;
			gap: 0.4rem;
			font-size: 0.7rem;
		}

		.button-group {
			flex-direction: column;
			gap: 0.5rem;
		}

		.btn {
			padding: 0.8rem 1rem;
			font-size: 0.95rem;
			min-height: 44px;
		}
	}

	@media (max-width: 480px) {
		.config-panel {
			padding: 0.75rem;
			border-radius: 8px;
		}

		h2 {
			font-size: 1.1rem;
		}

		.ratio-inputs label {
			grid-template-columns: 50px 1fr 30px;
			font-size: 0.65rem;
		}

		.btn {
			padding: 0.75rem;
			font-size: 0.9rem;
		}
	}

	@media print {
		.config-panel {
			display: none;
		}
	}
</style>
