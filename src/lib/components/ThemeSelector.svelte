<script lang="ts">
	import type { PrintTheme } from '$lib/config/themes';
	import { THEMES } from '$lib/config/themes';

	interface Props {
		selectedTheme: string;
		onChange: (themeId: string) => void;
	}

	let { selectedTheme, onChange }: Props = $props();

	function handleSelect(themeId: string) {
		onChange(themeId);
	}
</script>

<div class="theme-selector">
	<span class="label">打印主题</span>
	<div class="theme-options">
		{#each THEMES as theme}
			<button
				class="theme-option"
				class:selected={selectedTheme === theme.id}
				onclick={() => handleSelect(theme.id)}
				title={theme.name}
			>
				<span class="theme-icon">{theme.icon}</span>
				<span class="theme-name">{theme.name}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.theme-selector {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label {
		font-size: 0.875rem;
		color: #555;
	}

	.theme-options {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.theme-option {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem 0.75rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
		font-family: 'Comic Sans MS', cursive, sans-serif;
	}

	.theme-option:hover {
		border-color: #ff922b;
		transform: translateY(-1px);
	}

	.theme-option.selected {
		border-color: #ff6b6b;
		background: #fff5f5;
		box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
	}

	.theme-icon {
		font-size: 1.25rem;
	}

	.theme-name {
		font-size: 0.875rem;
		color: #333;
	}

	@media (max-width: 768px) {
		.theme-options {
			gap: 0.4rem;
		}

		.theme-option {
			padding: 0.4rem 0.6rem;
		}

		.theme-name {
			font-size: 0.8rem;
		}
	}
</style>