<script lang="ts">
	interface Props {
		running: boolean;
	}

	let { running }: Props = $props();
	let seconds = $state(0);

	$effect(() => {
		if (running) {
			const interval = setInterval(() => seconds++, 1000);
			return () => clearInterval(interval);
		}
	});

	function formatTime(s: number): string {
		const mins = Math.floor(s / 60);
		const secs = s % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	export function reset() {
		seconds = 0;
	}

	export function getSeconds() {
		return seconds;
	}
</script>

<div class="timer">
	<span class="icon">⏱️</span>
	<span class="time">{formatTime(seconds)}</span>
</div>

<style>
	.timer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.5rem;
		font-family: 'Comic Sans MS', cursive;
		color: #5c7cfa;
	}
	.icon {
		font-size: 1.25rem;
	}
</style>
