<script lang="ts">
	interface Props {
		blank: 'quotient' | 'remainder' | 'both';
		onSubmit: (answer: { quotient: number; remainder: number }) => void;
	}

	let { blank, onSubmit }: Props = $props();

	let quotient = $state('');
	let remainder = $state('');
	let quotientInput = $state<HTMLInputElement>();
	let remainderInput = $state<HTMLInputElement>();

	function handleSubmit() {
		if (blank === 'quotient' || blank === 'both') {
			if (!quotient) return;
		}
		if (blank === 'remainder' || blank === 'both') {
			if (!remainder) return;
		}

		onSubmit({
			quotient: blank === 'quotient' || blank === 'both' ? parseInt(quotient) : -1,
			remainder: blank === 'remainder' || blank === 'both' ? parseInt(remainder) : -1
		});
	}

	function handleKeyDown(e: KeyboardEvent, inputType: 'quotient' | 'remainder') {
		if (e.key === 'Enter') {
			if (inputType === 'quotient' && blank === 'both') {
				remainderInput?.focus();
			} else {
				handleSubmit();
			}
		}
	}

	function focus() {
		quotientInput?.focus();
	}

	function clear() {
		quotient = '';
		remainder = '';
	}

	export { focus, clear };
</script>

<div class="remainder-input">
	{#if blank === 'quotient' || blank === 'both'}
		<div class="input-group">
			<span class="label">商:</span>
			<input
				bind:this={quotientInput}
				type="number"
				bind:value={quotient}
				onkeydown={(e) => handleKeyDown(e, 'quotient')}
				placeholder="?"
			/>
		</div>
	{/if}

	{#if blank === 'remainder' || blank === 'both'}
		<div class="input-group">
			<span class="label">余数:</span>
			<input
				bind:this={remainderInput}
				type="number"
				bind:value={remainder}
				onkeydown={(e) => handleKeyDown(e, 'remainder')}
				placeholder="?"
			/>
		</div>
	{/if}

	<button class="submit-btn" onclick={handleSubmit}>确定</button>
</div>

<style>
	.remainder-input {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.label {
		font-size: 1.25rem;
		color: #666;
		font-weight: 600;
	}

	input {
		width: 100px;
		padding: 0.75rem 1rem;
		font-size: 2rem;
		border: 3px solid #5c7cfa;
		border-radius: 12px;
		text-align: center;
		font-family: 'Comic Sans MS', cursive;
	}

	input:focus {
		outline: none;
		border-color: #4263eb;
		box-shadow: 0 0 0 3px rgba(92, 124, 250, 0.2);
	}

	.submit-btn {
		padding: 0.75rem 2rem;
		font-size: 1.25rem;
		background: linear-gradient(135deg, #51cf66, #20c997);
		color: white;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-family: 'Comic Sans MS', cursive;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(81, 207, 102, 0.4);
		transition: all 0.2s;
	}

	.submit-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(81, 207, 102, 0.5);
	}

	.submit-btn:active {
		transform: translateY(0);
	}

	/* 移动端适配 */
	@media (max-width: 768px) {
		.remainder-input {
			gap: 0.875rem;
			padding: 0.875rem;
		}

		.label {
			font-size: 1.1rem;
		}

		input {
			width: 80px;
			padding: 0.6rem 0.75rem;
			font-size: 1.5rem;
		}

		.submit-btn {
			padding: 0.625rem 1.5rem;
			font-size: 1.1rem;
			min-height: 48px;
		}
	}

	@media (max-width: 480px) {
		.label {
			font-size: 1rem;
		}

		input {
			width: 70px;
			padding: 0.5rem 0.625rem;
			font-size: 1.25rem;
		}

		.submit-btn {
			padding: 0.5rem 1.25rem;
			font-size: 1rem;
		}
	}
</style>