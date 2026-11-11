<script lang="ts">
	import PrintWorksheetView from '#lib/components/PrintWorksheetView.svelte';
	import { zh } from '#lib/i18n/zh.js';
</script>

<svelte:head>
	<title>{zh.appName}</title>
	<meta name="description" content={zh.appSubtitle} />
</svelte:head>

<PrintWorksheetView />
