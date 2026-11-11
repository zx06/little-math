<script lang="ts">
	import { page } from '$app/state';
	import { zh } from '#lib/i18n/zh.js';
	import { NAV_ITEMS, pathIsActive } from '#lib/config/navigation.js';
	import UiThemeSwitcher from '#lib/components/UiThemeSwitcher.svelte';

	const path = $derived(page.url?.pathname ?? '/');
</script>

<header class="app-header no-print" data-testid="app-header">
	<div class="ah-inner">
		<a href="/" class="ah-brand" aria-label={zh.appName}>
			<span class="ah-logo" aria-hidden="true">🧮</span>
			<span class="ah-name">{zh.appName}</span>
		</a>
		<nav class="ah-nav" aria-label="主导航">
			{#each NAV_ITEMS as item}
				<a
					href={item.href}
					class="ah-link"
					class:on={pathIsActive(path, item.href)}
					aria-current={pathIsActive(path, item.href) ? 'page' : undefined}
					data-testid={item.testid}
				>
					<span class="ah-icon" aria-hidden="true">{item.icon}</span>{item.label}
				</a>
			{/each}
		</nav>
		<UiThemeSwitcher layout="desktop" />
	</div>
</header>

<style>
	.app-header {
		background: var(--h-bg);
		color: var(--h-fg);
		border-bottom: var(--h-border, none);
		box-shadow: var(--h-shadow, none);
		font-family: var(--h-font);
	}
	.ah-inner {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0.75rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: nowrap;
		gap: 0.75rem 1rem;
	}
	.ah-brand {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 48px;
		color: var(--h-title-fg);
		text-decoration: none;
		font-size: var(--h-title-size, 1.7rem);
		font-weight: var(--h-title-weight, 800);
		letter-spacing: var(--h-title-ls);
		text-shadow: var(--h-title-shadow);
		white-space: nowrap;
		flex-shrink: 0;
	}
	.ah-brand::after {
		content: var(--h-title-after);
	}
	.ah-nav {
		display: flex;
		flex-wrap: nowrap;
		gap: 0.5rem;
		flex: 1 1 auto;
		justify-content: center;
		min-width: 0;
	}
	.ah-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 48px;
		box-sizing: border-box;
		padding: 0 1.1rem;
		border-radius: var(--h-link-radius);
		border: var(--h-link-border, 1px solid transparent);
		background: var(--h-link-bg);
		color: var(--h-link-fg);
		text-decoration: none;
		font-size: 1.05rem;
		font-weight: 600;
		white-space: nowrap;
		transition: background 0.15s;
	}
	.ah-link:hover {
		background: var(--h-link-hover);
	}
	.ah-link.on {
		background: var(--h-switch-on-bg);
		color: var(--h-switch-on-fg);
		border-color: transparent;
		box-shadow: var(--h-switch-on-shadow);
	}
	.ah-link:focus-visible,
	.ah-brand:focus-visible {
		outline: 3px solid var(--c-focus);
		outline-offset: 2px;
	}

	@media (max-width: 768px) {
		.app-header {
			display: none !important;
		}
	}

	@media (min-width: 769px) and (max-width: 1100px) {
		.ah-inner {
			padding-left: 1rem;
			padding-right: 1rem;
			gap: 0.5rem;
		}
		.ah-brand {
			font-size: 1.45rem;
		}
		.ah-link {
			padding: 0 0.75rem;
			font-size: 0.98rem;
		}
	}

	@media print {
		.app-header {
			display: none !important;
		}
	}
</style>
