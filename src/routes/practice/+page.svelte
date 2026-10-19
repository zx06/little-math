<script lang="ts">
	import { untrack } from 'svelte';
	import type { ExerciseConfig, RemainderProblem, AnyProblem, CompareSymbol } from '$lib/types';
	import { DEFAULT_CONFIG } from '$lib/config/presets';
	import { generateWorksheet } from '$lib/generators/worksheet';
	import { validateConfig } from '$lib/generators/validate';
	import { correctAnswerOf, formatProblemText, isCompare, isRemainder } from '$lib/format';
	import Timer from '$lib/components/Timer.svelte';
	import AnswerInput from '$lib/components/AnswerInput.svelte';
	import CompareInput from '$lib/components/CompareInput.svelte';
	import RemainderInput from '$lib/components/RemainderInput.svelte';
	import ProblemDisplay from '$lib/components/ProblemDisplay.svelte';
	import PracticeResult from '$lib/components/PracticeResult.svelte';
	import PracticeConfig from '$lib/components/PracticeConfig.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { addWrongRecord, generateWrongReview } from '$lib/services/wrongBook';
	import { generateFavoriteReview } from '$lib/services/favorites';
	import { checkAchievements, type Achievement } from '$lib/services/achievements';
	import { speakProblem, isSpeechSupported } from '$lib/services/speech';
	import { savePracticeProgress, trackAnswer, getStats } from '$lib/services/statistics';
	import AchievementToast from '$lib/components/AchievementToast.svelte';

	interface AnswerRecord {
		problem: AnyProblem;
		userAnswer: number | CompareSymbol | string;
		correctAnswer: number | CompareSymbol | string;
		isCorrect: boolean;
	}

	interface Feedback {
		isCorrect: boolean;
		correctText: string;
	}

	let config: ExerciseConfig = $state({ ...DEFAULT_CONFIG, totalCount: 10 });
	let problems: AnyProblem[] = $state([]);
	let currentIndex = $state(0);
	let correctCount = $state(0);
	let phase: 'config' | 'practice' | 'result' = $state('config');
	let timerRunning = $state(false);
	let finalTime = $state(0);
	let answerRecords: AnswerRecord[] = $state([]);
	let feedback = $state<Feedback | null>(null);
	let startError = $state<string | null>(null);
	let reviewMessage = $state<string | null>(null);

	let timerRef: { reset: () => void; getSeconds: () => number } | undefined = $state();
	let answerInputRef: { focus: () => void; clear: () => void } | undefined = $state();
	let remainderInputRef: { focus: () => void; clear: () => void } | undefined = $state();
	let nextBtn: HTMLButtonElement | undefined = $state();
	let unlockedAchievements = $state<Achievement[]>([]);
	let showSpeechButton = $state(isSpeechSupported());
	let advanceTimer: ReturnType<typeof setTimeout> | undefined;

	/** 在线练习不分页，校验时忽略「每页题数」 */
	const practiceIssues = $derived(validateConfig({ ...config, countPerPage: 1 }));

	function startWith(list: AnyProblem[]) {
		if (list.length === 0) return false;
		problems = list;
		currentIndex = 0;
		correctCount = 0;
		answerRecords = [];
		feedback = null;
		phase = 'practice';
		timerRunning = true;
		timerRef?.reset();
		return true;
	}

	function handleStart() {
		startError = null;
		const r = generateWorksheet({ ...$state.snapshot(config), countPerPage: 1 } as ExerciseConfig);
		if (r.issues.length || r.problems.length === 0) {
			startError = r.issues[0]?.message ?? '当前设置下生成不了题目，请调整设置';
			return;
		}
		startWith(r.problems);
	}

	$effect(() => {
		if (!browser) return;
		const mode = page.url.searchParams.get('mode');
		untrack(() => {
			if (mode === 'wrong-review' || mode === 'favorite-review') {
				const list = mode === 'wrong-review' ? generateWrongReview(10) : generateFavoriteReview(10);
				if (!startWith(list)) {
					reviewMessage = mode === 'wrong-review' ? '错题本是空的，先做几道题吧！' : '还没有收藏的题目';
				}
			}
		});
	});

	$effect(() => {
		if (phase === 'practice' && problems.length > 0 && !feedback) {
			const currentProblem = problems[currentIndex];
			setTimeout(() => {
				if (isRemainder(currentProblem)) remainderInputRef?.focus();
				else if (!isCompare(currentProblem)) answerInputRef?.focus();
			}, 0);
		}
	});

	function answerText(p: AnyProblem): string {
		if (isRemainder(p)) return `商 ${p.quotient}，余数 ${p.remainder}`;
		return String(correctAnswerOf(p));
	}

	/** 记录一道题的作答并显示即时反馈 */
	function record(userAnswer: AnswerRecord['userAnswer'], correctAnswer: AnswerRecord['correctAnswer'], isCorrect: boolean) {
		const problem = problems[currentIndex];
		answerRecords.push({ problem, userAnswer, correctAnswer, isCorrect });
		if (isCorrect) correctCount++;
		else addWrongRecord($state.snapshot(problem) as AnyProblem, userAnswer, correctAnswer);
		const stats = trackAnswer(problem, isCorrect);
		const fresh = checkAchievements(stats);
		if (fresh.length) unlockedAchievements = [...unlockedAchievements, ...fresh];

		feedback = { isCorrect, correctText: answerText(problem) };
		clearTimeout(advanceTimer);
		if (isCorrect) {
			advanceTimer = setTimeout(moveToNext, 900);
		} else {
			setTimeout(() => nextBtn?.focus(), 0);
		}
	}

	function handleAnswer(answer: number) {
		if (feedback) return;
		const correct = correctAnswerOf(problems[currentIndex]) as number;
		record(answer, correct, answer === correct);
	}

	function handleRemainderAnswer(answer: { quotient: number; remainder: number }) {
		if (feedback) return;
		const problem = problems[currentIndex] as RemainderProblem;
		let isCorrect = true;
		if ((problem.blank === 'quotient' || problem.blank === 'both') && answer.quotient !== problem.quotient) isCorrect = false;
		if ((problem.blank === 'remainder' || problem.blank === 'both') && answer.remainder !== problem.remainder) isCorrect = false;
		const userAnswerStr =
			problem.blank === 'both'
				? `商: ${answer.quotient}, 余数: ${answer.remainder}`
				: problem.blank === 'quotient'
					? `商: ${answer.quotient}`
					: `余数: ${answer.remainder}`;
		record(userAnswerStr, `商: ${problem.quotient}, 余数: ${problem.remainder}`, isCorrect);
	}

	function handleCompareAnswer(answer: CompareSymbol) {
		if (feedback) return;
		const problem = problems[currentIndex];
		if (!isCompare(problem)) return;
		record(answer, problem.answer, answer === problem.answer);
	}

	function moveToNext() {
		clearTimeout(advanceTimer);
		feedback = null;
		if (currentIndex < problems.length - 1) {
			currentIndex++;
			answerInputRef?.clear();
			remainderInputRef?.clear();
		} else {
			timerRunning = false;
			finalTime = timerRef?.getSeconds() ?? 0;
			savePracticeProgress({ totalProblems: problems.length, correctProblems: correctCount, timeSpent: finalTime });
			const fresh = checkAchievements(getStats());
			if (fresh.length) unlockedAchievements = [...unlockedAchievements, ...fresh];
			phase = 'result';
		}
	}

	function handleRestart() {
		phase = 'config';
		reviewMessage = null;
		if (page.url.searchParams.get('mode')) goto('/practice', { replaceState: true });
	}

	function handleBackHome() {
		goto('/');
	}
</script>

<svelte:head>
	<title>在线练习 - 小小数学家</title>
</svelte:head>

<div class="practice-page">
	<header>
		<a href="/" class="back-link">← 返回首页</a>
		<h1>🧮 在线练习</h1>
	</header>

	<main>
		{#if phase === 'config'}
			{#if reviewMessage}<p class="review-msg">{reviewMessage}</p>{/if}
			<PracticeConfig bind:config issues={practiceIssues} error={startError} onStart={handleStart} />
		{:else if phase === 'practice' && problems.length > 0}
			<div class="practice-area" data-testid="practice-area">
				<div class="top-bar">
					<div class="progress" data-testid="practice-progress">第 {currentIndex + 1} / {problems.length} 题</div>
					<div class="top-bar-right">
						{#if showSpeechButton}
							<button class="speech-btn" onclick={() => speakProblem(problems[currentIndex])} title="读题" data-testid="speech-btn">
								🔊
							</button>
						{/if}
						<Timer bind:this={timerRef} running={timerRunning} />
					</div>
				</div>
				<ProblemDisplay problem={problems[currentIndex]} />
				{#if feedback}
					<div class="feedback" class:ok={feedback.isCorrect} class:bad={!feedback.isCorrect} data-testid="feedback" role="status">
						{#if feedback.isCorrect}
							✅ 答对了！
						{:else}
							❌ 答错了，正确答案：<strong>{feedback.correctText}</strong>
							<div class="full">{formatProblemText(problems[currentIndex], true)}</div>
							<button class="next-btn" bind:this={nextBtn} onclick={moveToNext}>
								{currentIndex < problems.length - 1 ? '下一题 →' : '查看结果'}
							</button>
						{/if}
					</div>
				{:else if isCompare(problems[currentIndex])}
					<CompareInput onSubmit={handleCompareAnswer} />
				{:else if isRemainder(problems[currentIndex])}
					<RemainderInput
						bind:this={remainderInputRef}
						blank={(problems[currentIndex] as RemainderProblem).blank}
						onSubmit={handleRemainderAnswer}
					/>
				{:else}
					<AnswerInput bind:this={answerInputRef} onSubmit={handleAnswer} />
				{/if}
			</div>
		{:else if phase === 'result'}
			<PracticeResult
				total={problems.length}
				correct={correctCount}
				timeSpent={finalTime}
				records={answerRecords}
				onRestart={handleRestart}
				onBackHome={handleBackHome}
			/>
		{/if}
	</main>

	<!-- 成就提示 -->
	{#each unlockedAchievements as achievement (achievement.id)}
		<AchievementToast
			{achievement}
			onClose={() => {
				unlockedAchievements = unlockedAchievements.filter((a) => a.id !== achievement.id);
			}}
		/>
	{/each}
</div>

<style>
	.practice-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #e8f5e9, #fff9c4);
		font-family: 'Comic Sans MS', cursive;
	}
	header {
		background: linear-gradient(135deg, #ff6b6b, #ffa502, #ffdd59);
		color: white;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		gap: 2rem;
	}
	.back-link {
		color: white;
		text-decoration: none;
		font-size: 1rem;
	}
	.back-link:hover {
		text-decoration: underline;
	}
	h1 {
		margin: 0;
		font-size: 1.5rem;
	}
	main {
		padding: 2rem;
	}
	.practice-area {
		max-width: 600px;
		margin: 0 auto;
		background: white;
		border-radius: 20px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}
	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px dashed #eee;
	}
	.progress {
		font-size: 1.25rem;
		color: #666;
	}
	.top-bar-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.feedback {
		margin-top: 1rem;
		padding: 1rem 1.25rem;
		border-radius: 14px;
		text-align: center;
		font-size: 1.4rem;
	}
	.feedback.ok {
		background: #ebfbee;
		color: #2b8a3e;
	}
	.feedback.bad {
		background: #fff5f5;
		color: #c92a2a;
	}
	.feedback .full {
		margin-top: 0.5rem;
		font-size: 1.1rem;
		color: #555;
	}
	.next-btn {
		margin-top: 0.75rem;
		padding: 0.6rem 1.5rem;
		font-size: 1.1rem;
		border: none;
		border-radius: 10px;
		background: linear-gradient(135deg, #5c7cfa, #845ef7);
		color: white;
		cursor: pointer;
		font-family: inherit;
	}
	.review-msg {
		text-align: center;
		color: #e8590c;
	}
	.speech-btn {
		padding: 0.5rem 1rem;
		font-size: 1.5rem;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.speech-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
	}
	.speech-btn:active {
		transform: scale(0.95);
	}

	/* 移动端适配 */
	@media (max-width: 768px) {
		header {
			padding: 0.875rem 1.5rem;
			gap: 1.5rem;
		}

		.back-link {
			font-size: 0.9rem;
		}

		h1 {
			font-size: 1.25rem;
		}

		main {
			padding: 1.5rem;
		}

		.practice-area {
			max-width: 100%;
			padding: 1.5rem;
			border-radius: 16px;
		}

		.top-bar {
			margin-bottom: 1.5rem;
			padding-bottom: 0.875rem;
		}

		.progress {
			font-size: 1.1rem;
		}
	}

	@media (max-width: 480px) {
		header {
			padding: 0.75rem 1rem;
			gap: 1rem;
		}

		.back-link {
			font-size: 0.85rem;
		}

		h1 {
			font-size: 1.1rem;
		}

		main {
			padding: 1rem;
		}

		.practice-area {
			padding: 1.25rem;
			border-radius: 12px;
		}

		.top-bar {
			margin-bottom: 1.25rem;
			padding-bottom: 0.75rem;
			flex-direction: column;
			gap: 0.5rem;
			align-items: flex-start;
		}

		.progress {
			font-size: 1rem;
		}
	}
</style>
