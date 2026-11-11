<script lang="ts">
	import { page } from '$app/state';
	import { zh } from '#lib/i18n/zh.js';
	import { HUB_PATH, isHubHomePath, navItemForPath } from '#lib/config/navigation.js';
	import UiThemeSheet from '#lib/components/UiThemeSheet.svelte';
	import { currentUiTheme } from '#lib/config/uiThemes.js';

	// deco helper - need to add to navigation or read from CSS
	function themeDeco(): string {
		const t = currentUiTheme();
		return t === 'b' ? '🌳' : t === 'c' ? '🌊' : '🌈';
	}

	const path = $derived(page.url?.pathname ?? '/');
	const hubHome = $derived(isHubHomePath(path));
	const feature = $derived(navItemForPath(path));

	let sheetOpen = $state(false);
</script>

<header class="mobile-header no-print" data-testid="mobile-app-header">
	<div class="mh-row">
		{#if hubHome}
			<div class="mh-title mh-title-brand">
				<span class="mh-logo" aria-hidden="true">🧮</span>
				<span class="mh-name">{zh.appName}</span>
				<span class="mh-deco" aria-hidden="true">{themeDeco()}</span>
			</div>
		{:else if feature}
			<a href={HUB_PATH} class="mh-back" aria-label="返回" data-testid="mobile-nav-back">←</a>
			<div class="mh-title">
				<span aria-hidden="true">{feature.icon}</span>
				<span>{feature.label}</span>
				<span class="mh-deco" aria-hidden="true">{themeDeco()}</span>
			</div>
		{/if}
		<button
			type="button"
			class="mh-theme-btn"
			aria-label="换颜色"
			data-testid="mobile-theme-open"
			onclick={() => (sheetOpen = true)}
		>
			🎨
		</button>
	</div>
</header>

<UiThemeSheet bind:open={sheetOpen} />

<style>
	.mobile-header {
		display: none;
		background: var(--h-bg);
		color: var(--h-fg);
		border-bottom: var(--h-border, none);
		box-shadow: var(--h-shadow, none);
		font-family: var(--h-font);
		padding: calc(0.5rem + env(safe-area-inset-top)) 0.75rem 0.5rem;
	}
	.mh-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 48px;
		max-width: 1400px;
		margin: 0 auto;
	}
	.mh-title {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 44px;
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--h-title-fg);
		letter-spacing: 0.02em;
		padding-left: 0.15rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.mh-title-brand .mh-name {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.mh-deco {
		font-size: 1.05rem;
		flex-shrink: 0;
	}
	.mh-back {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 14px;
		background: var(--h-link-bg);
		color: var(--h-link-fg);
		text-decoration: none;
		font-size: 1.25rem;
		box-shadow: var(--h-switch-on-shadow, 0 1px 4px rgba(0, 0, 0, 0.06));
	}
	.mh-back:focus-visible,
	.mh-theme-btn:focus-visible {
		outline: 3px solid var(--c-focus);
		outline-offset: 2px;
	}
	.mh-theme-btn {
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		border: none;
		border-radius: 14px;
		background: var(--h-link-bg);
		font-size: 1.25rem;
		cursor: pointer;
		box-shadow: var(--h-switch-on-shadow, 0 1px 4px rgba(0, 0, 0, 0.06));
	}
	@media (max-width: 768px) {
		.mobile-header {
			display: block;
		}
	}
	@media print {
		.mobile-header {
			display: none !important;
		}
	}
</style>
