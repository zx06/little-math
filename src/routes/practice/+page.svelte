<script lang="ts">
	import type { ExerciseConfig, Problem, MakeTargetProblem, ChainProblem, CompareProblem, AnyProblem, CompareSymbol } from '$lib/types';
	import { DEFAULT_CONFIG } from '$lib/config/presets';
	import { generateProblems } from '$lib/generators/arithmetic';
	import { generateMakeTargetProblems } from '$lib/generators/makeTarget';
	import { generateChainProblems } from '$lib/generators/chain';
	import { generateCompareProblems } from '$lib/generators/compare';
	import Timer from '$lib/components/Timer.svelte';
	import AnswerInput from '$lib/components/AnswerInput.svelte';
	import CompareInput from '$lib/components/CompareInput.svelte';
	import ProblemDisplay from '$lib/components/ProblemDisplay.svelte';
	import PracticeResult from '$lib/components/PracticeResult.svelte';
	import PracticeConfig from '$lib/components/PracticeConfig.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { addWrongRecord, generateWrongReview } from '$lib/services/wrongBook';

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

	let timerRef: { reset: () => void; getSeconds: () => number } | undefined;
	let answerInputRef: { focus: () => void; clear: () => void } | undefined;

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
		return generateProblems(config);
	}

	function isCompareProblem(p: AnyProblem): p is CompareProblem {
		return 'type' in p && p.type === 'compare';
	}

	function handleStart() {
		problems = generateAllProblems();
		currentIndex = 0;
		correctCount = 0;
		answerRecords = [];
		phase = 'practice';
		timerRunning = true;
		timerRef?.reset();
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
			answerInputRef?.clear();
			answerInputRef?.focus();
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
					<Timer bind:this={timerRef} running={timerRunning} />
				</div>
				<ProblemDisplay problem={problems[currentIndex]} />
				{#if isCompareProblem(problems[currentIndex])}
					<CompareInput onSubmit={handleCompareAnswer} />
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
</style>
