<script lang="ts">
	import { dev } from "$app/environment";
	import favicon from "$lib/assets/favicon.svg";
	import { injectAnalytics } from "@vercel/analytics/sveltekit";

	let { children } = $props();

	injectAnalytics({ mode: dev ? "development" : "production" });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
