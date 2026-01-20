<script lang="ts">
	import type { ExerciseConfig, Problem, MakeTargetProblem, ChainProblem, CompareProblem, RemainderProblem, AnyProblem, CompareSymbol } from '$lib/types';
	import { DEFAULT_CONFIG } from '$lib/config/presets';
	import { generateProblems } from '$lib/generators/arithmetic';
	import { generateMakeTargetProblems } from '$lib/generators/makeTarget';
	import { generateChainProblems } from '$lib/generators/chain';
	import { generateCompareProblems } from '$lib/generators/compare';
	import { generateRemainderProblems } from '$lib/generators/remainder';
	import Timer from '$lib/components/Timer.svelte';
	import AnswerInput from '$lib/components/AnswerInput.svelte';
	import CompareInput from '$lib/components/CompareInput.svelte';
	import RemainderInput from '$lib/components/RemainderInput.svelte';
	import ProblemDisplay from '$lib/components/ProblemDisplay.svelte';
	import PracticeResult from '$lib/components/PracticeResult.svelte';
	import PracticeConfig from '$lib/components/PracticeConfig.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { addWrongRecord, generateWrongReview } from '$lib/services/wrongBook';
	import { checkAchievements, type Achievement } from '$lib/services/achievements';
	import { speakProblem, stopSpeaking, isSpeechSupported } from '$lib/services/speech';
	import { trackGeneration } from '$lib/services/statistics';
	import AchievementToast from '$lib/components/AchievementToast.svelte';

	interface AnswerRecord {
		problem: AnyProblem;
		userAnswer: number | CompareSymbol;
		correctAnswer: number | CompareSymbol;
		isCorrect: boolean;
	}

	let config: ExerciseConfig = $state({ ...DEFAULT_CONFIG, totalCount: 10 });
	let problems: AnyProblem[] = $state([]);
	let currentIndex = $state(0);
	let correctCount = $state(0);
	let phase: 'config' | 'practice' | 'result' = $state('config');
	let timerRunning = $state(false);
	let finalTime = $state(0);
	let answerRecords: AnswerRecord[] = $state([]);

	let timerRef: { reset: () => void; getSeconds: () => number } | undefined = $state();
	let answerInputRef: { focus: () => void; clear: () => void } | undefined = $state();
	let remainderInputRef: { focus: () => void; clear: () => void } | undefined = $state();
	let unlockedAchievements = $state<Achievement[]>([]);
	let showSpeechButton = $state(isSpeechSupported());

	function generateAllProblems(): AnyProblem[] {
		if (config.problemMode === 'makeTarget') {
			return generateMakeTargetProblems(config.makeTargetValue, config.totalCount);
		}
		if (config.problemMode === 'chain') {
			return generateChainProblems(
				config.range.min,
				config.range.max,
				config.operations,
				config.chainLength,
				config.totalCount
			);
		}
		if (config.problemMode === 'compare') {
			return generateCompareProblems(
				config.range.min,
				config.range.max,
				config.operations,
				config.totalCount
			);
		}
		if (config.problemMode === 'remainder') {
			return generateRemainderProblems(
				config.range.min,
				config.range.max,
				config.totalCount,
				config.remainderBlank
			);
		}
		return generateProblems(config);
	}

	function isCompareProblem(p: AnyProblem): p is CompareProblem {
		return 'type' in p && p.type === 'compare';
	}

	function isRemainderProblem(p: AnyProblem): p is RemainderProblem {
		return 'type' in p && p.type === 'remainder';
	}

	function handleStart() {
		problems = generateAllProblems();
		currentIndex = 0;
		correctCount = 0;
		answerRecords = [];
		phase = 'practice';
		timerRunning = true;
		timerRef?.reset();

		// 检查成就
		const stats = { totalGenerations: 0, totalVisits: 0, totalPrints: 0, operationsCount: { add: 0, sub: 0, mul: 0, div: 0 }, gradePresetCount: {}, lastVisitDate: '', dailyStats: {} };
		const newAchievements = checkAchievements(stats);
		if (newAchievements.length > 0) {
			unlockedAchievements = [...unlockedAchievements, ...newAchievements];
		}
	}

	function getCorrectAnswer(problem: AnyProblem): number {
		if ('type' in problem) {
			if (problem.type === 'makeTarget') {
				return (problem as MakeTargetProblem).answer;
			}
			if (problem.type === 'chain') {
				const p = problem as ChainProblem;
				return p.blank === 'result' ? p.result : p.numbers[p.blank as number];
			}
			if (problem.type === 'remainder') {
				const p = problem as RemainderProblem;
				return p.blank === 'quotient' ? p.quotient : p.remainder;
			}
		}
		const p = problem as Problem;
		switch (p.blank) {
			case 'first':
				return p.a;
			case 'second':
				return p.b;
			case 'result':
				return p.result;
		}
	}

	$effect(() => {
		if (browser && $page.url.searchParams.get('mode') === 'wrong-review') {
			const wrongProblems = generateWrongReview(10);
			if (wrongProblems.length > 0) {
				problems = wrongProblems;
				config.totalCount = wrongProblems.length;
				phase = 'practice';
				timerRunning = true;
			}
		}
	});

	$effect(() => {
		if (phase === 'practice' && problems.length > 0) {
			const currentProblem = problems[currentIndex];

			// 使用 setTimeout 确保组件已渲染
			setTimeout(() => {
				if (isRemainderProblem(currentProblem)) {
					remainderInputRef?.focus();
				} else if (!isCompareProblem(currentProblem)) {
					answerInputRef?.focus();
				}
			}, 0);
		}
	});

	function handleAnswer(answer: number) {
		const correct = getCorrectAnswer(problems[currentIndex]);
		const isCorrect = answer === correct;

		answerRecords.push({
			problem: problems[currentIndex],
			userAnswer: answer,
			correctAnswer: correct,
			isCorrect
		});

		if (isCorrect) {
			correctCount++;
		} else {
			addWrongRecord(problems[currentIndex], answer, correct);
		}

		moveToNext();
	}

	function handleRemainderAnswer(answer: { quotient: number; remainder: number }) {
		const problem = problems[currentIndex] as RemainderProblem;
		let isCorrect = true;

		// 根据留空位置检查答案
		if (problem.blank === 'quotient' || problem.blank === 'both') {
			if (answer.quotient !== problem.quotient) {
				isCorrect = false;
			}
		}
		if (problem.blank === 'remainder' || problem.blank === 'both') {
			if (answer.remainder !== problem.remainder) {
				isCorrect = false;
			}
		}

		// 构造用户答案字符串用于记录
		const userAnswerStr =
			problem.blank === 'both'
				? `商: ${answer.quotient}, 余数: ${answer.remainder}`
				: problem.blank === 'quotient'
					? `商: ${answer.quotient} (余数: ${problem.remainder})`
					: `商: ${problem.quotient}, 余数: ${answer.remainder}`;

		// 构造正确答案字符串
		const correctAnswerStr = `商: ${problem.quotient}, 余数: ${problem.remainder}`;

		answerRecords.push({
			problem: problems[currentIndex],
			userAnswer: userAnswerStr as any,
			correctAnswer: correctAnswerStr as any,
			isCorrect
		});

		if (isCorrect) {
			correctCount++;
		} else {
			addWrongRecord(problems[currentIndex], userAnswerStr as any, correctAnswerStr as any);
		}

		moveToNext();
	}

	function handleCompareAnswer(answer: CompareSymbol) {
		const problem = problems[currentIndex] as CompareProblem;
		const isCorrect = answer === problem.answer;

		answerRecords.push({
			problem: problems[currentIndex],
			userAnswer: answer,
			correctAnswer: problem.answer,
			isCorrect
		});

		if (isCorrect) {
			correctCount++;
		}

		moveToNext();
	}

	function moveToNext() {
		if (currentIndex < problems.length - 1) {
			currentIndex++;
			const nextProblem = problems[currentIndex];

			if (isRemainderProblem(nextProblem)) {
				remainderInputRef?.clear();
				remainderInputRef?.focus();
			} else if (isCompareProblem(nextProblem)) {
				// CompareInput 不需要 focus
			} else {
				answerInputRef?.clear();
				answerInputRef?.focus();
			}
		} else {
			timerRunning = false;
			finalTime = timerRef?.getSeconds() ?? 0;
			phase = 'result';
		}
	}

	function handleRestart() {
		phase = 'config';
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
			<PracticeConfig bind:config onStart={handleStart} />
		{:else if phase === 'practice'}
			<div class="practice-area">
				<div class="top-bar">
					<div class="progress">第 {currentIndex + 1} / {problems.length} 题</div>
					<div class="top-bar-right">
						{#if showSpeechButton}
							<button class="speech-btn" onclick={() => speakProblem(problems[currentIndex])} title="读题">
								🔊
							</button>
						{/if}
						<Timer bind:this={timerRef} running={timerRunning} />
					</div>
				</div>
				<ProblemDisplay problem={problems[currentIndex]} />
				{#if isCompareProblem(problems[currentIndex])}
					<CompareInput onSubmit={handleCompareAnswer} />
				{:else if isRemainderProblem(problems[currentIndex])}
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
	{#each unlockedAchievements as achievement}
		<AchievementToast achievement={achievement} onClose={() => {
			unlockedAchievements = unlockedAchievements.filter((a) => a.id !== achievement.id);
		}} />
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
