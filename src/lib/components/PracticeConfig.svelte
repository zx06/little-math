<script lang="ts">
	import type { ExerciseConfig, Operation } from '$lib/types';
	import { OP_NAMES } from '$lib/types';
	import { GRADE_PRESETS } from '$lib/config/presets';

	interface Props {
		config: ExerciseConfig;
		onStart: () => void;
	}

	let { config = $bindable(), onStart }: Props = $props();

	function handlePresetChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const preset = GRADE_PRESETS[target.value];
		if (preset && target.value !== 'custom') {
			config.range = { ...preset.range };
			config.operations = [...preset.operations];
		}
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
</script>

<div class="practice-config">
	<h2>🎯 开始练习</h2>

	<div class="config-row">
		<label
			>年级
			<select bind:value={config.gradePreset} onchange={handlePresetChange}>
				{#each Object.entries(GRADE_PRESETS) as [key, preset]}
					<option value={key}>{preset.label}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="config-row">
		<label
			>模式
			<select bind:value={config.problemMode}>
				<option value="normal">普通计算</option>
				<option value="makeTarget">凑数练习</option>
				<option value="chain">连续运算</option>
			</select>
		</label>
	</div>

	{#if config.problemMode === 'makeTarget'}
		<div class="config-row">
			<label
				>目标
				<select bind:value={config.makeTargetValue}>
					<option value={10}>凑 10</option>
					<option value={20}>凑 20</option>
					<option value={100}>凑 100</option>
				</select>
			</label>
		</div>
	{/if}

	{#if config.problemMode !== 'makeTarget'}
		<div class="config-row">
			<span>运算</span>
			<div class="checkbox-group">
				{#each Object.entries(OP_NAMES) as [op, name]}
					<label>
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
	{/if}

	<div class="config-row">
		<label
			>题数
			<input type="number" bind:value={config.totalCount} min="5" max="50" />
		</label>
	</div>

	<button class="start-btn" onclick={onStart}>开始答题 🚀</button>
</div>

<style>
	.practice-config {
		max-width: 400px;
		margin: 2rem auto;
		padding: 2rem;
		background: linear-gradient(180deg, #fff5f5, #fff9db);
		border-radius: 20px;
		border: 3px solid #ffc078;
		font-family: 'Comic Sans MS', cursive;
	}
	h2 {
		text-align: center;
		color: #ff6b6b;
		margin-bottom: 1.5rem;
	}
	.config-row {
		margin-bottom: 1rem;
	}
	.config-row > label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 1rem;
		color: #555;
	}
	select,
	input[type='number'] {
		padding: 0.5rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
	}
	.checkbox-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		cursor: pointer;
	}
	.start-btn {
		width: 100%;
		margin-top: 1.5rem;
		padding: 1rem;
		font-size: 1.5rem;
		background: linear-gradient(135deg, #ff6b6b, #ffa502);
		color: white;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-family: inherit;
	}
	.start-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
	}
</style>
