<script lang="ts">
	import PrintWorksheetView from '#lib/components/PrintWorksheetView.svelte';
	import { zh } from '#lib/i18n/zh.js';
</script>

<svelte:head>
	<title>{zh.appName} · 打印题</title>
	<meta name="description" content={zh.appSubtitle} />
</svelte:head>

<PrintWorksheetView />
