<script lang="ts">
	// 环境变量：用于判断当前是否为开发环境
	import { dev } from "$app/environment";
	// 网站图标
	import favicon from "$lib/assets/favicon.svg";
	// Vercel Analytics：用于收集页面浏览量、访问者数量等数据
	import { injectAnalytics } from "@vercel/analytics/sveltekit";
	// Vercel Speed Insights：用于收集性能数据（Core Web Vitals、页面加载时间等）
	import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

	// 子页面插槽
	let { children } = $props();

	// 初始化 Vercel Analytics，根据环境设置模式
	injectAnalytics({ mode: dev ? "development" : "production" });
	// 初始化 Vercel Speed Insights，自动检测环境
	injectSpeedInsights();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
