<script lang="ts">
	import type { ExerciseConfig, Operation, BlankPosition } from '$lib/types';
	import { OP_NAMES } from '$lib/types';
	import {
		GRADE_PRESETS,
		OP_COMBOS,
		HORIZONTAL_COUNT_PER_PAGE,
		VERTICAL_COUNT_PER_PAGE
	} from '$lib/config/presets';
	import { zh } from '$lib/i18n/zh';
	import { track } from '$lib/actions/track';

	interface Props {
		config: ExerciseConfig;
		onGenerate: () => void;
		onPrint: () => void;
	}

	let { config = $bindable(), onGenerate, onPrint }: Props = $props();

	const t = zh.config;

	function handlePresetChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const preset = GRADE_PRESETS[target.value];
		if (preset && target.value !== 'custom') {
			config.range = { ...preset.range };
			config.operations = [...preset.operations];
		}
	}

	function handleVerticalChange() {
		config.countPerPage = config.isVertical ? VERTICAL_COUNT_PER_PAGE : HORIZONTAL_COUNT_PER_PAGE;
		config.totalCount = config.countPerPage;
	}

	function toggleOperation(op: Operation) {
		if (config.operations.includes(op)) {
			if (config.operations.length > 1) {
				config.operations = config.operations.filter((o) => o !== op);
			}
		} else {
			config.operations = [...config.operations, op];
		}
	}

	function updateBlankRatio(pos: BlankPosition, value: number) {
		const newRatio = { ...config.blankRatio };
		newRatio[pos] = value / 100;

		const total = Object.values(newRatio).reduce((a, b) => a + b, 0);
		if (total > 0) {
			Object.keys(newRatio).forEach((key) => {
				newRatio[key as BlankPosition] = newRatio[key as BlankPosition] / total;
			});
		}
		config.blankRatio = newRatio;
	}
</script>

<div class="config-panel">
	<h2>配置</h2>

	<div class="config-section">
		<label>
			{t.gradePreset}
			<select bind:value={config.gradePreset} onchange={handlePresetChange}>
				{#each Object.entries(GRADE_PRESETS) as [key, preset]}
					<option value={key}>{preset.label}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="config-section">
		<label>
			{t.exerciseType}
			<select bind:value={config.isVertical} onchange={handleVerticalChange}>
				<option value={false}>{t.horizontal}</option>
				<option value={true}>{t.vertical}</option>
			</select>
		</label>
	</div>

	{#if !config.isVertical}
		<div class="config-section">
			<label>
				{t.columns}
				<select bind:value={config.columns}>
					<option value={2}>{t.columns2}</option>
					<option value={3}>{t.columns3}</option>
				</select>
			</label>
		</div>
	{/if}

	<div class="config-section">
		<span class="label">{t.operations}</span>
		<div class="checkbox-group">
			{#each Object.entries(OP_NAMES) as [op, name]}
				<label class="checkbox-label">
					<input
						type="checkbox"
						checked={config.operations.includes(op as Operation)}
						onchange={() => toggleOperation(op as Operation)}
					/>
					{name}
				</label>
			{/each}
		</div>
	</div>

	<div class="config-section">
		<span class="label">{t.range}</span>
		<div class="range-inputs">
			<label>
				{t.rangeMin}
				<input type="number" bind:value={config.range.min} min="0" max="999" />
			</label>
			<label>
				{t.rangeMax}
				<input type="number" bind:value={config.range.max} min="1" max="9999" />
			</label>
		</div>
	</div>

	<div class="config-section">
		<span class="label">{t.blankPosition}</span>
		<div class="ratio-inputs">
			<label>
				{t.blankFirst}
				<input
					type="range"
					min="0"
					max="100"
					value={Math.round(config.blankRatio.first * 100)}
					oninput={(e) => updateBlankRatio('first', Number((e.target as HTMLInputElement).value))}
				/>
				<span>{Math.round(config.blankRatio.first * 100)}%</span>
			</label>
			<label>
				{t.blankSecond}
				<input
					type="range"
					min="0"
					max="100"
					value={Math.round(config.blankRatio.second * 100)}
					oninput={(e) => updateBlankRatio('second', Number((e.target as HTMLInputElement).value))}
				/>
				<span>{Math.round(config.blankRatio.second * 100)}%</span>
			</label>
			<label>
				{t.blankResult}
				<input
					type="range"
					min="0"
					max="100"
					value={Math.round(config.blankRatio.result * 100)}
					oninput={(e) => updateBlankRatio('result', Number((e.target as HTMLInputElement).value))}
				/>
				<span>{Math.round(config.blankRatio.result * 100)}%</span>
			</label>
		</div>
	</div>

	<div class="config-section">
		<label>
			{t.totalCount}
			<input type="number" bind:value={config.totalCount} min="1" max="200" />
		</label>
	</div>

	<div class="config-section">
		<label>
			{t.countPerPage}
			<input type="number" bind:value={config.countPerPage} min="1" max="100" />
		</label>
	</div>

	<div class="config-section">
		<label>
			{t.customTitle}
			<input type="text" bind:value={config.customTitle} placeholder="数学练习" />
		</label>
	</div>

	<div class="config-section">
		<label>
			{t.studentName}
			<input type="text" bind:value={config.studentName} placeholder="请输入姓名" />
		</label>
	</div>

	<div class="config-section">
		<label class="checkbox-label">
			<input type="checkbox" bind:checked={config.showDate} />
			{t.showDate}
		</label>
	</div>

	<div class="config-section">
		<label class="checkbox-label">
			<input type="checkbox" bind:checked={config.showAnswerPage} />
			{t.showAnswerPage}
		</label>
	</div>

	<div class="button-group">
		<button
			class="btn primary"
			onclick={onGenerate}
			use:track={{
				type: 'generation',
				data: { operations: config.operations, gradePreset: config.gradePreset }
			}}
		>
			{zh.buttons.generate}
		</button>
		<button class="btn secondary" onclick={onPrint} use:track={{ type: 'print' }}>
			{zh.buttons.print}
		</button>
	</div>
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

	@media print {
		.config-panel {
			display: none;
		}
	}
</style>
