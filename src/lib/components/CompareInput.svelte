<script lang="ts">
	import type { CompareSymbol } from '$lib/types';

	interface Props {
		onSubmit: (answer: CompareSymbol) => void;
	}

	let { onSubmit }: Props = $props();

	function handleSelect(symbol: CompareSymbol) {
		onSubmit(symbol);
	}
</script>

<div class="compare-input">
	<button class="symbol-btn" onclick={() => handleSelect('<')}>&lt;</button>
	<button class="symbol-btn" onclick={() => handleSelect('=')}>=</button>
	<button class="symbol-btn" onclick={() => handleSelect('>')}>&gt;</button>
</div>

<style>
	.compare-input {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
	}
	.symbol-btn {
		width: 80px;
		height: 80px;
		font-size: 3rem;
		font-weight: bold;
		background: linear-gradient(135deg, #5c7cfa, #845ef7);
		color: white;
		border: none;
		border-radius: 16px;
		cursor: pointer;
		font-family: 'Comic Sans MS', cursive;
		transition: transform 0.1s;
	}
	.symbol-btn:hover {
		transform: scale(1.1);
	}
	.symbol-btn:active {
		transform: scale(0.95);
	}

	/* 移动端适配 */
	@media (max-width: 768px) {
		.compare-input {
			gap: 1rem;
		}

		.symbol-btn {
			width: 65px;
			height: 65px;
			font-size: 2.5rem;
		}
	}

	@media (max-width: 480px) {
		.compare-input {
			gap: 0.75rem;
		}

		.symbol-btn {
			width: 55px;
			height: 55px;
			font-size: 2rem;
			border-radius: 12px;
		}
	}
</style>
