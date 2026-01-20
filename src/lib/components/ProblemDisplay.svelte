<script lang="ts">
	import type { Problem, MakeTargetProblem, ChainProblem } from '$lib/types';
	import { OP_SYMBOLS } from '$lib/types';

	interface Props {
		problem: Problem | MakeTargetProblem | ChainProblem;
	}

	let { problem }: Props = $props();

	function formatProblem(): string {
		if ('type' in problem) {
			if (problem.type === 'makeTarget') {
				const p = problem as MakeTargetProblem;
				const blank = '___';
				return p.blankFirst ? `${blank} + ${p.a} = ${p.target}` : `${p.a} + ${blank} = ${p.target}`;
			}
			if (problem.type === 'chain') {
				const p = problem as ChainProblem;
				let str = '';
				for (let i = 0; i < p.numbers.length; i++) {
					if (p.blank === i) {
						str += '___';
					} else {
						str += p.numbers[i];
					}
					if (i < p.ops.length) {
						str += ` ${OP_SYMBOLS[p.ops[i]]} `;
					}
				}
				str += ' = ';
				str += p.blank === 'result' ? '___' : p.result;
				return str;
			}
		}
		// 普通题目
		const p = problem as Problem;
		const blank = '___';
		const first = p.blank === 'first' ? blank : p.a;
		const second = p.blank === 'second' ? blank : p.b;
		const result = p.blank === 'result' ? blank : p.result;
		return `${first} ${OP_SYMBOLS[p.op]} ${second} = ${result}`;
	}

	function getCorrectAnswer(): number {
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

	export { getCorrectAnswer };
</script>

<div class="problem-display">
	{formatProblem()}
</div>

<style>
	.problem-display {
		font-size: 4rem;
		font-family: 'Comic Sans MS', cursive;
		color: #333;
		text-align: center;
		padding: 2rem;
	}
</style>
