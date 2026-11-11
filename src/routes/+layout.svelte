<script lang="ts">
	import { browser, dev } from '$app/env';
	import favicon from '#lib/assets/favicon.svg';
	import '#lib/styles/ui-themes.css';
	import '#lib/styles/mobile-nav.css';
	import AppHeader from '#lib/components/AppHeader.svelte';
	import MobileAppHeader from '#lib/components/MobileAppHeader.svelte';
	import AppFooter from '#lib/components/AppFooter.svelte';
	import { page } from '$app/state';
	import { initVercelObservability, trackRoute } from '#lib/services/vercelObservability.js';
	import { isHubHomePath, isMobileFeaturePath, HUB_PATH } from '#lib/config/navigation.js';
	import { mobileNavMq } from '#lib/services/mobileNav.js';

	let { children } = $props();

	let mobileNav = $state(false);

	const path = $derived(page.url?.pathname ?? '/');
	const showMobileHeader = $derived(
		mobileNav && (isHubHomePath(path) || isMobileFeaturePath(path))
	);

	if (browser) initVercelObservability({ dev, routeId: page.route.id });

	$effect(() => {
		trackRoute(page.route.id, page.url.pathname);
	});

	$effect(() => {
		if (!browser) return;
		const mq = window.matchMedia(mobileNavMq());
		const apply = () => {
			mobileNav = mq.matches;
			const root = document.documentElement;
			if (!mq.matches) {
				root.removeAttribute('data-mobile-hub');
				root.removeAttribute('data-mobile-feature');
				return;
			}
			if (isHubHomePath(path)) {
				root.setAttribute('data-mobile-hub', '1');
				root.removeAttribute('data-mobile-feature');
			} else if (isMobileFeaturePath(path)) {
				root.setAttribute('data-mobile-feature', '1');
				root.removeAttribute('data-mobile-hub');
			} else {
				root.removeAttribute('data-mobile-hub');
				root.removeAttribute('data-mobile-feature');
			}
		};
		apply();
		mq.addEventListener('change', apply);
		return () => mq.removeEventListener('change', apply);
	});

	// 依赖 path 时同步 html 标记
	$effect(() => {
		if (!browser || !mobileNav) return;
		const root = document.documentElement;
		if (isHubHomePath(path)) {
			root.setAttribute('data-mobile-hub', '1');
			root.removeAttribute('data-mobile-feature');
		} else if (isMobileFeaturePath(path)) {
			root.setAttribute('data-mobile-feature', '1');
			root.removeAttribute('data-mobile-hub');
		}
	});

	$effect(() => {
		if (!browser || !mobileNav || path !== '/') return;
		void import('$app/navigation').then(({ goto }) => goto(HUB_PATH, { replaceState: true }));
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AppHeader />
{#if showMobileHeader}
	<MobileAppHeader />
{/if}

{@render children()}

<AppFooter />
