<script lang="ts">
	interface Props {
		type?: 'tian' | 'mi';
		size?: number;
	}

	let { type = 'tian', size = 100 }: Props = $props();

	const gridStyle = $derived(`--grid-size: ${size}px`);
</script>

<div class="grid-paper" class:tian={type === 'tian'} class:mi={type === 'mi'} style={gridStyle}>
	{#if type === 'tian'}
		<!-- 田字格 -->
		<div class="outer-border">
			<div class="inner-border">
				<div class="horizontal-line"></div>
				<div class="vertical-line"></div>
			</div>
		</div>
	{:else}
		<!-- 米字格 -->
		<div class="outer-border">
			<div class="inner-border">
				<div class="horizontal-line"></div>
				<div class="vertical-line"></div>
				<div class="diagonal-line-1"></div>
				<div class="diagonal-line-2"></div>
			</div>
		</div>
	{/if}
</div>

<style>
	.grid-paper {
		display: inline-block;
		width: var(--grid-size, 100px);
		height: var(--grid-size, 100px);
	}

	.outer-border {
		width: 100%;
		height: 100%;
		border: 3px solid #333;
		box-sizing: border-box;
		position: relative;
	}

	.inner-border {
		width: 100%;
		height: 100%;
		border: 1px dashed #999;
		box-sizing: border-box;
		position: relative;
	}

	.horizontal-line {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background-color: #999;
	}

	.vertical-line {
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 1px;
		background-color: #999;
	}

	.diagonal-line-1 {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg, transparent 49.5%, #999 49.5%, #999 50.5%, transparent 50.5%);
	}

	.diagonal-line-2 {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(-45deg, transparent 49.5%, #999 49.5%, #999 50.5%, transparent 50.5%);
	}
</style>