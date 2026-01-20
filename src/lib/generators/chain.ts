import type { ChainProblem, Operation } from '$lib/types';

export function generateChainProblem(
	min: number,
	max: number,
	operations: Operation[],
	length: 3 | 4
): ChainProblem | null {
	const numbers: number[] = [];
	const ops: Operation[] = [];

	for (let i = 0; i < length; i++) {
		numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
	}

	for (let i = 0; i < length - 1; i++) {
		ops.push(operations[Math.floor(Math.random() * operations.length)]);
	}

	let temp = numbers[0];
	for (let i = 0; i < ops.length; i++) {
		if (ops[i] === 'sub' && temp < numbers[i + 1]) return null;
		if (ops[i] === 'div' && (numbers[i + 1] === 0 || temp % numbers[i + 1] !== 0)) return null;
		switch (ops[i]) {
			case 'add':
				temp += numbers[i + 1];
				break;
			case 'sub':
				temp -= numbers[i + 1];
				break;
			case 'mul':
				temp *= numbers[i + 1];
				break;
			case 'div':
				temp = temp / numbers[i + 1];
				break;
		}
		if (temp < 0) return null;
	}

	const result = temp;
	const blank: 'result' | number = Math.random() < 0.8 ? 'result' : Math.floor(Math.random() * length);

	return { type: 'chain', numbers, ops, result, blank };
}

export function generateChainProblems(
	min: number,
	max: number,
	operations: Operation[],
	length: 3 | 4,
	count: number
): ChainProblem[] {
	const problems: ChainProblem[] = [];
	const seen = new Set<string>();

	let attempts = 0;
	while (problems.length < count && attempts < count * 20) {
		attempts++;
		const problem = generateChainProblem(min, max, operations, length);
		if (!problem) continue;

		const key = problem.numbers.join('-') + '-' + problem.ops.join('-');
		if (seen.has(key)) continue;
		seen.add(key);
		problems.push(problem);
	}

	return problems;
}
