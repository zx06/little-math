<script lang="ts">
	import type { Problem, MakeTargetProblem, ChainProblem } from '$lib/types';
	import { OP_SYMBOLS } from '$lib/types';
	import { zh } from '$lib/i18n/zh';

	type AnyProblem = Problem | MakeTargetProblem | ChainProblem;

	interface Props {
		problems: AnyProblem[];
		countPerPage: number;
		showAnswers: boolean;
		isVertical: boolean;
		columns?: 2 | 3;
		customTitle?: string;
		studentName?: string;
		showDate?: boolean;
	}

	let {
		problems,
		countPerPage,
		showAnswers,
		isVertical,
		columns = 2,
		customTitle = '',
		studentName = '',
		showDate = true
	}: Props = $props();

	function formatDate(): string {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		const day = now.getDate();
		return `${year}年${month}月${day}日`;
	}

	const t = zh.print;

	const pages = $derived(() => {
		const result: AnyProblem[][] = [];
		const perPage = countPerPage > 0 ? countPerPage : 20;
		for (let i = 0; i < problems.length; i += perPage) {
			result.push(problems.slice(i, i + perPage));
		}
		return result;
	});

	function isMakeTargetProblem(p: AnyProblem): p is MakeTargetProblem {
		return 'type' in p && p.type === 'makeTarget';
	}

	function isChainProblem(p: AnyProblem): p is ChainProblem {
		return 'type' in p && p.type === 'chain';
	}

	function getMakeTargetParts(
		p: MakeTargetProblem,
		showAnswer: boolean
	): { first: string; op: string; second: string; result: string } {
		const blank = '(\u00a0\u00a0\u00a0\u00a0)';
		const answerDisplay = showAnswer ? `(${p.answer})` : blank;

		if (p.blankFirst) {
			return { first: answerDisplay, op: '+', second: String(p.a), result: String(p.target) };
		} else {
			return { first: String(p.a), op: '+', second: answerDisplay, result: String(p.target) };
		}
	}

	function getProblemParts(
		p: Problem,
		showAnswer: boolean
	): { first: string; op: string; second: string; result: string } {
		const op = OP_SYMBOLS[p.op];
		const blank = '(\u00a0\u00a0\u00a0\u00a0)';

		switch (p.blank) {
			case 'first':
				return { first: showAnswer ? `(${p.a})` : blank, op, second: String(p.b), result: String(p.result) };
			case 'second':
				return { first: String(p.a), op, second: showAnswer ? `(${p.b})` : blank, result: String(p.result) };
			case 'result':
				return { first: String(p.a), op, second: String(p.b), result: showAnswer ? `(${p.result})` : blank };
		}
	}

	function padNumber(n: number | string, len: number): string {
		return String(n).padStart(len, ' ');
	}

	function getChainDisplay(p: ChainProblem, showAnswer: boolean): string {
		const blank = '(\u00a0\u00a0\u00a0\u00a0)';
		const parts: string[] = [];

		for (let i = 0; i < p.numbers.length; i++) {
			if (p.blank === i) {
				parts.push(showAnswer ? `(${p.numbers[i]})` : blank);
			} else {
				parts.push(String(p.numbers[i]));
			}
			if (i < p.ops.length) {
				parts.push(OP_SYMBOLS[p.ops[i]]);
			}
		}

		parts.push('=');
		if (p.blank === 'result') {
			parts.push(showAnswer ? `(${p.result})` : blank);
		} else {
			parts.push(String(p.result));
		}

		return parts.join(' ');
	}
</script>

<div class="sheet-container">
	{#each pages() as page, pageIndex}
		<div class="page" class:answer-page={showAnswers}>
			<div class="page-header">
				<h1>{customTitle || t.exerciseTitle}{showAnswers ? ` - ${t.answerTitle}` : ''}</h1>
				{#if !showAnswers}
					<div class="info-row">
						<div class="info-item">
							<span class="info-label">{t.name}</span>
							{#if studentName}
								<span class="info-value">{studentName}</span>
							{:else}
								<span class="info-line"></span>
							{/if}
						</div>
						{#if showDate}
							<div class="info-item">
								<span class="info-label">{t.date}</span>
								<span class="info-value">{formatDate()}</span>
							</div>
						{/if}
						<div class="info-item">
							<span class="info-label">{t.score}</span>
							<span class="info-line short"></span>
						</div>
					</div>
				{/if}
			</div>

			{#if isVertical}
				<div class="vertical-grid">
					{#each page as problem, idx}
						{#if !isMakeTargetProblem(problem) && !isChainProblem(problem)}
							{@const maxLen = Math.max(
								String(problem.a).length,
								String(problem.b).length,
								String(problem.result).length
							)}
							<div class="vertical-problem">
								<div class="problem-number">{pageIndex * countPerPage + idx + 1}.</div>
								<div class="vertical-calc">
									<div class="v-row top">
										{#if problem.blank !== 'first'}
											{padNumber(problem.a, maxLen)}
										{:else if showAnswers}
											<span class="v-answer">({padNumber(problem.a, maxLen)})</span>
										{:else}
											<span class="v-blank">{' '.repeat(maxLen)}</span>
										{/if}
									</div>
									<div class="v-row middle">
										<span class="v-op">{OP_SYMBOLS[problem.op]}</span>
										{#if problem.blank !== 'second'}
											{padNumber(problem.b, maxLen)}
										{:else if showAnswers}
											<span class="v-answer">({padNumber(problem.b, maxLen)})</span>
										{:else}
											<span class="v-blank">{' '.repeat(maxLen)}</span>
										{/if}
									</div>
									<div class="v-line"></div>
									<div class="v-row bottom">
										{#if problem.blank !== 'result'}
											{padNumber(problem.result, maxLen)}
										{:else if showAnswers}
											<span class="v-answer">({padNumber(problem.result, maxLen)})</span>
										{:else}
											<span class="v-blank">{' '.repeat(maxLen)}</span>
										{/if}
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="horizontal-grid" class:cols-2={columns === 2} class:cols-3={columns === 3}>
					{#each page as problem, idx}
						{#if isChainProblem(problem)}
							<div class="problem chain-problem" class:problem-large={columns === 2}>
								<span class="problem-number">{String(pageIndex * countPerPage + idx + 1).padStart(2, ' ')}.</span>
								<span class="chain-expr">{getChainDisplay(problem, showAnswers)}</span>
							</div>
						{:else}
							{@const parts = isMakeTargetProblem(problem)
								? getMakeTargetParts(problem, showAnswers)
								: getProblemParts(problem, showAnswers)}
							<div class="problem" class:problem-large={columns === 2}>
								<span class="problem-number">{String(pageIndex * countPerPage + idx + 1).padStart(2, ' ')}.</span>
								<span class="part first">{parts.first}</span>
								<span class="part op">{parts.op}</span>
								<span class="part second">{parts.second}</span>
								<span class="part eq">=</span>
								<span class="part result">{parts.result}</span>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.sheet-container {
		background: white;
		font-family: 'Comic Sans MS', 'PingFang SC', 'Microsoft YaHei', cursive, sans-serif;
	}

	.page {
		padding: 2rem 2.5rem;
		min-height: 100vh;
		box-sizing: border-box;
		background: linear-gradient(180deg, #fff9e6 0%, #ffffff 100%);
	}

	.page-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.page-header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 1rem;
		color: #ff6b6b;
		text-shadow: 2px 2px 0 #ffe066;
		letter-spacing: 0.15em;
	}

	.page-header h1::before {
		content: '🌟 ';
	}

	.page-header h1::after {
		content: ' 🌟';
	}

	.info-row {
		display: flex;
		justify-content: center;
		gap: 2.5rem;
		font-size: 1.1rem;
		color: #5a4a3a;
	}

	.info-item {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.info-label {
		color: #ff9f43;
		font-weight: 600;
	}

	.info-line {
		display: inline-block;
		width: 5rem;
		border-bottom: 2px dashed #ffc078;
	}

	.info-line.short {
		width: 3rem;
	}

	.info-value {
		color: #5c7cfa;
		font-weight: 600;
	}

	/* 横式网格 */
	.horizontal-grid {
		display: grid;
	}

	.horizontal-grid.cols-2 {
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem 4rem;
	}

	.horizontal-grid.cols-3 {
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem 2rem;
	}

	.problem {
		display: flex;
		align-items: baseline;
		font-size: 1.3rem;
		font-family: 'Comic Sans MS', 'PingFang SC', cursive, sans-serif;
		line-height: 1.8;
		white-space: nowrap;
		color: #4a4a4a;
		padding: 0.3rem 0.5rem;
		border-radius: 8px;
		transition: background 0.2s;
	}

	.problem:hover {
		background: #fff3cd;
	}

	.problem.problem-large {
		font-size: 1.6rem;
		line-height: 2.2;
	}

	.problem-number {
		color: #ff6b6b;
		min-width: 2em;
		text-align: right;
		margin-right: 0.5em;
		font-weight: 700;
		font-size: 1em;
	}

	.part {
		text-align: center;
	}

	.part.first,
	.part.second {
		min-width: 2em;
		text-align: right;
		color: #5c7cfa;
		font-weight: 600;
	}

	.part.result {
		min-width: 2.5em;
		text-align: center;
		color: #51cf66;
		font-weight: 600;
	}

	.problem-large .part.first,
	.problem-large .part.second {
		min-width: 2.5em;
	}

	.problem-large .part.result {
		min-width: 3em;
	}

	.part.op {
		min-width: 1.5em;
		text-align: center;
		color: #ff922b;
		font-weight: 700;
	}

	.part.eq {
		min-width: 1.5em;
		text-align: center;
		color: #ff922b;
		font-weight: 700;
	}

	.chain-problem .chain-expr {
		color: #5c7cfa;
		font-weight: 600;
	}

	/* 竖式网格 */
	.vertical-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
	}

	.vertical-problem {
		display: flex;
		gap: 0.5rem;
		font-family: 'Courier New', monospace;
		font-size: 1.25rem;
	}

	.vertical-calc {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.v-row {
		white-space: pre;
		min-width: 3rem;
		text-align: right;
	}

	.v-row.middle {
		display: flex;
		gap: 0.5rem;
	}

	.v-op {
		margin-right: auto;
	}

	.v-line {
		width: 100%;
		height: 2px;
		background: #333;
		margin: 0.25rem 0;
	}

	.v-blank {
		display: inline-block;
		border-bottom: 2px solid #333;
		min-width: 2rem;
	}

	/* 打印样式 */
	@page {
		margin: 0;
		size: A4;
	}

	@media print {
		.sheet-container {
			background: transparent;
		}

		.page {
			page-break-after: always;
			padding: 1.5cm;
			min-height: 100vh;
			width: 100vw;
			box-sizing: border-box;
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		.page:last-child {
			page-break-after: avoid;
		}

		.answer-page {
			page-break-before: always;
		}

		.problem:hover {
			background: transparent !important;
		}
	}
</style>
