<script lang="ts">
	import type { Achievement } from '$lib/services/achievements';

	interface Props {
		achievement: Achievement;
		onClose: () => void;
	}

	let { achievement, onClose }: Props = $props();

	let visible = $state(true);

	// 5秒后自动关闭
	$effect(() => {
		const timer = setTimeout(() => {
			visible = false;
			setTimeout(onClose, 300); // 等待动画完成
		}, 5000);

		return () => clearTimeout(timer);
	});
</script>

{#if visible}
	<div class="achievement-toast">
		<div class="toast-content">
			<div class="icon">{achievement.icon}</div>
			<div class="text">
				<div class="title">成就解锁！</div>
				<div class="name">{achievement.name}</div>
				<div class="description">{achievement.description}</div>
			</div>
			<button class="close-btn" onclick={onClose}>×</button>
		</div>
	</div>
{/if}

<style>
	.achievement-toast {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 9999;
		animation: slideIn 0.5s ease;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.toast-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
		padding: 1rem 1.5rem;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
		border: 2px solid #ffcc00;
		min-width: 320px;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
		}
		50% {
			box-shadow: 0 4px 30px rgba(255, 215, 0, 0.6);
		}
	}

	.icon {
		font-size: 3rem;
		animation: bounce 1s ease;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.2);
		}
	}

	.text {
		flex: 1;
	}

	.title {
		font-size: 0.875rem;
		color: #8b6914;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.name {
		font-size: 1.25rem;
		color: #333;
		font-weight: 700;
		margin-bottom: 0.25rem;
	}

	.description {
		font-size: 0.875rem;
		color: #666;
	}

	.close-btn {
		background: rgba(0, 0, 0, 0.1);
		border: none;
		color: #333;
		font-size: 1.5rem;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}

	.close-btn:hover {
		background: rgba(0, 0, 0, 0.2);
	}

	/* 移动端适配 */
	@media (max-width: 768px) {
		.achievement-toast {
			top: 10px;
			right: 10px;
			left: 10px;
		}

		.toast-content {
			min-width: auto;
			padding: 0.875rem 1rem;
		}

		.icon {
			font-size: 2.5rem;
		}

		.title {
			font-size: 0.75rem;
		}

		.name {
			font-size: 1.1rem;
		}

		.description {
			font-size: 0.75rem;
		}

		.close-btn {
			width: 28px;
			height: 28px;
			font-size: 1.25rem;
		}
	}

	@media (max-width: 480px) {
		.toast-content {
			padding: 0.75rem 0.875rem;
		}

		.icon {
			font-size: 2rem;
		}

		.title {
			font-size: 0.7rem;
		}

		.name {
			font-size: 1rem;
		}

		.description {
			font-size: 0.7rem;
		}
	}
</style>