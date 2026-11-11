<script lang="ts">
	import { NAV_ITEMS } from '#lib/config/navigation.js';
	import StatisticsPanel from '#lib/components/StatisticsPanel.svelte';
</script>

<div class="hub-page ui-page" data-testid="mobile-hub">
	<p class="hub-hello">今天想做什么？</p>
	<div class="hub-grid">
		{#each NAV_ITEMS as item}
			<a
				href={item.mobileHref ?? item.href}
				class="hub-card"
				data-testid={item.testid === 'nav-home' ? 'hub-card-print' : `hub-card-${item.testid.replace('nav-', '')}`}
			>
				<span class="hub-ico" aria-hidden="true">{item.icon}</span>
				<span class="hub-name">{item.label}</span>
				<span class="hub-desc">{item.desc}</span>
			</a>
		{/each}
	</div>
</div>

<div class="no-print"><StatisticsPanel /></div>

<style>
	.hub-page {
		max-width: 520px;
		margin: 0 auto;
		padding: 0.75rem 1rem 1.5rem;
	}
	.hub-hello {
		margin: 0.25rem 0 1rem;
		text-align: center;
		font-size: 1.35rem;
		font-weight: 800;
		color: var(--cp-h2-fg);
	}
	.hub-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.hub-card {
		min-height: 168px;
		border-radius: 22px;
		background: var(--c-surface);
		box-shadow: var(--cp-shadow);
		border: var(--c-card-border, 1.5px solid var(--c-border));
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 1rem 0.5rem;
		text-decoration: none;
		color: inherit;
		transition: transform 0.15s ease;
	}
	.hub-card:active {
		transform: scale(0.98);
	}
	.hub-card:focus-visible {
		outline: 3px solid var(--c-focus);
		outline-offset: 2px;
	}
	.hub-ico {
		font-size: 2.6rem;
		line-height: 1;
	}
	.hub-name {
		font-weight: 800;
		font-size: 1.15rem;
		color: var(--c-title);
	}
	.hub-desc {
		font-size: 0.78rem;
		color: var(--c-muted);
		text-align: center;
		line-height: 1.35;
		padding: 0 0.25rem;
	}
</style>
