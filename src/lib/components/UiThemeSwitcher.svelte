<script lang="ts">
	import { onMount } from 'svelte';
	import { UI_THEMES, DEFAULT_UI_THEME, currentUiTheme, setUiTheme, type UiThemeId } from '#lib/config/uiThemes.js';
	import UiThemeSheet from '#lib/components/UiThemeSheet.svelte';
	import { desktopThemeCompactMq } from '#lib/services/mobileNav.js';

	interface Props {
		/** desktop：顶栏内联或中等宽度收成按钮；mobile 仅按钮（由 MobileAppHeader 处理，此处保留兼容） */
		layout?: 'desktop' | 'inline';
	}
	let { layout = 'inline' }: Props = $props();

	let selected = $state<UiThemeId>(DEFAULT_UI_THEME);
	let compact = $state(false);
	let sheetOpen = $state(false);

	onMount(() => {
		selected = currentUiTheme();
		if (layout !== 'desktop') return;
		const mq = window.matchMedia(desktopThemeCompactMq());
		const sync = () => {
			compact = mq.matches;
		};
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	function pick(id: UiThemeId) {
		selected = id;
		setUiTheme(id);
	}
</script>

{#if layout === 'desktop' && compact}
	<button
		type="button"
		class="uts-compact-btn"
		aria-label="换颜色"
		data-testid="ui-theme-compact"
		onclick={() => (sheetOpen = true)}
	>
		🎨
	</button>
	<UiThemeSheet bind:open={sheetOpen} />
{:else}
	<div class="ui-theme-switcher no-print" role="radiogroup" aria-label="换颜色" data-testid="ui-theme-switcher">
		<span class="uts-label" aria-hidden="true">🎨</span>
		{#each UI_THEMES as t}
			<button
				type="button"
				role="radio"
				aria-checked={selected === t.id}
				aria-label={t.name}
				class="uts-opt"
				class:selected={selected === t.id}
				title={t.desc}
				data-testid={`ui-theme-${t.id}`}
				onclick={() => pick(t.id)}
			>
				<span class="uts-icon" aria-hidden="true">{t.icon}</span>
				<span aria-hidden="true">{t.name}</span>
			</button>
		{/each}
	</div>
{/if}

<style>
	.ui-theme-switcher {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem;
		border-radius: var(--h-switch-radius, 999px);
		background: var(--h-switch-bg);
		border: var(--h-switch-border, none);
		font-size: 0.95rem;
		flex-shrink: 0;
	}
	.uts-label {
		padding: 0 0.3rem 0 0.45rem;
		font-size: 1.1rem;
	}
	.uts-opt {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 44px;
		padding: 0 0.85rem;
		border: none;
		border-radius: var(--h-switch-radius, 999px);
		background: transparent;
		color: var(--h-switch-fg);
		font: inherit;
		cursor: pointer;
		transition: background 0.15s;
		white-space: nowrap;
	}
	.uts-opt:hover {
		background: var(--h-switch-hover);
	}
	.uts-opt.selected {
		background: var(--h-switch-on-bg);
		color: var(--h-switch-on-fg);
		font-weight: 700;
		box-shadow: var(--h-switch-on-shadow);
	}
	.uts-opt:focus-visible {
		outline: 3px solid var(--c-focus);
		outline-offset: 2px;
	}
	.uts-compact-btn {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 48px;
		min-height: 48px;
		border: var(--h-switch-border, none);
		border-radius: var(--h-switch-radius, 999px);
		background: var(--h-switch-bg);
		font-size: 1.2rem;
		cursor: pointer;
	}
	.uts-compact-btn:focus-visible {
		outline: 3px solid var(--c-focus);
		outline-offset: 2px;
	}
	@media print {
		.ui-theme-switcher,
		.uts-compact-btn {
			display: none !important;
		}
	}
</style>
