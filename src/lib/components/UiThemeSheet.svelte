<script lang="ts">
	import { UI_THEMES, currentUiTheme, setUiTheme, type UiThemeId } from '#lib/config/uiThemes.js';

	interface Props {
		open?: boolean;
	}
	let { open = $bindable(false) }: Props = $props();

	let selected = $state<UiThemeId>(currentUiTheme());

	$effect(() => {
		if (open) selected = currentUiTheme();
	});

	function pick(id: UiThemeId) {
		selected = id;
		setUiTheme(id);
		open = false;
	}

	function close() {
		open = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="theme-sheet-mask no-print"
		data-testid="ui-theme-sheet"
		role="presentation"
		onclick={close}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="theme-sheet" role="dialog" aria-label="换个颜色" tabindex="-1" onclick={(e) => e.stopPropagation()}>
			<div class="theme-sheet-handle" aria-hidden="true"></div>
			<h3 class="theme-sheet-title">换个颜色</h3>
			<div class="theme-sheet-cards" role="radiogroup" aria-label="换颜色">
				{#each UI_THEMES as t}
					<button
						type="button"
						role="radio"
						aria-checked={selected === t.id}
						class="theme-sheet-card"
						class:selected={selected === t.id}
						data-testid={`ui-theme-sheet-${t.id}`}
						onclick={() => pick(t.id)}
					>
						<span class="theme-sheet-em" aria-hidden="true">{t.icon}</span>
						<span class="theme-sheet-meta">
							<span class="theme-sheet-name">{t.name}</span>
							<span class="theme-sheet-desc">{t.desc}</span>
						</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.theme-sheet-mask {
		position: fixed;
		inset: 0;
		z-index: 1200;
		background: rgba(30, 20, 30, 0.35);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: 0;
		animation: fadeIn 0.2s ease;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.theme-sheet {
		width: 100%;
		max-width: 480px;
		background: var(--c-surface);
		border-radius: 22px 22px 0 0;
		padding: 0.75rem 1rem calc(1.25rem + env(safe-area-inset-bottom));
		box-shadow: 0 -8px 32px rgba(40, 20, 30, 0.12);
		animation: slideUp 0.25s ease;
	}
	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
	.theme-sheet-handle {
		width: 40px;
		height: 4px;
		border-radius: 99px;
		background: var(--c-border);
		margin: 0 auto 0.65rem;
	}
	.theme-sheet-title {
		margin: 0 0 0.85rem;
		text-align: center;
		font-size: 1.2rem;
		font-weight: 800;
		color: var(--c-title);
	}
	.theme-sheet-cards {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.theme-sheet-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 56px;
		width: 100%;
		border: 1.5px solid var(--c-border);
		border-radius: 16px;
		background: var(--c-surface);
		padding: 0.65rem 0.85rem;
		font: inherit;
		text-align: left;
		cursor: pointer;
		color: var(--c-text);
		transition: border-color 0.15s, background 0.15s;
	}
	.theme-sheet-card.selected {
		border-color: var(--c-primary);
		background: var(--c-primary-soft);
	}
	.theme-sheet-card:focus-visible {
		outline: 3px solid var(--c-focus);
		outline-offset: 2px;
	}
	.theme-sheet-em {
		font-size: 1.6rem;
		line-height: 1;
	}
	.theme-sheet-meta {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.theme-sheet-name {
		font-weight: 800;
		font-size: 1.05rem;
	}
	.theme-sheet-desc {
		font-size: 0.85rem;
		color: var(--c-muted);
	}
	@media print {
		.theme-sheet-mask {
			display: none !important;
		}
	}
</style>
