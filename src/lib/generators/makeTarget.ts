import type { MakeTargetProblem, MakeTargetValue } from '$lib/types';

export function generateMakeTargetProblem(target: MakeTargetValue): MakeTargetProblem {
	const a = Math.floor(Math.random() * (target - 1)) + 1;
	const answer = target - a;
	const blankFirst = Math.random() < 0.5;

	return {
		type: 'makeTarget',
		a,
		target,
		answer,
		blankFirst
	};
}

export function generateMakeTargetProblems(
	target: MakeTargetValue,
	count: number
): MakeTargetProblem[] {
	const problems: MakeTargetProblem[] = [];
	const seen = new Set<string>();

	let attempts = 0;
	while (problems.length < count && attempts < count * 10) {
		attempts++;
		const problem = generateMakeTargetProblem(target);
		const key = `${problem.a}-${problem.blankFirst}`;
		if (seen.has(key)) continue;
		seen.add(key);
		problems.push(problem);
	}

	return problems;
}
