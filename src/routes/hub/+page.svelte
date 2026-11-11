<script lang="ts">
	import HubHome from '#lib/components/HubHome.svelte';
	import { zh } from '#lib/i18n/zh.js';
	import { trackVisit } from '#lib/services/statistics.js';
	import { onMount } from 'svelte';

	onMount(() => {
		trackVisit();
	});
</script>

<svelte:head>
	<title>{zh.appName}</title>
	<meta name="description" content="今天想做什么？出题、练习、复习错题、看收藏。" />
</svelte:head>

<HubHome />
