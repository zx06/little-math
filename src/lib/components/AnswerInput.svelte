<script lang="ts">
	interface Props {
		onSubmit: (answer: number) => void;
		autoFocus?: boolean;
	}

	let { onSubmit, autoFocus = true }: Props = $props();
	let value = $state('');
	let inputEl: HTMLInputElement;

	function handleSubmit() {
		const num = parseInt(value, 10);
		if (!isNaN(num)) {
			onSubmit(num);
			value = '';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSubmit();
		}
	}

	$effect(() => {
		if (autoFocus && inputEl) {
			inputEl.focus();
		}
	});

	export function focus() {
		inputEl?.focus();
	}

	export function clear() {
		value = '';
	}
</script>

<div class="answer-input">
	<input
		bind:this={inputEl}
		bind:value
		type="number"
		placeholder="输入答案"
		onkeydown={handleKeydown}
	/>
	<button onclick={handleSubmit}>确定</button>
</div>

<style>
	.answer-input {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	input {
		font-size: 2rem;
		width: 150px;
		padding: 0.75rem 1rem;
		border: 3px solid #5c7cfa;
		border-radius: 12px;
		text-align: center;
		font-family: 'Comic Sans MS', cursive;
	}
	input:focus {
		outline: none;
		border-color: #ff6b6b;
		box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
	}
	button {
		font-size: 1.25rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #51cf66, #20c997);
		color: white;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-family: 'Comic Sans MS', cursive;
	}
	button:hover {
		transform: translateY(-2px);
	}
</style>
