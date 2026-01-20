import type { CompareProblem, CompareSymbol, Operation } from '$lib/types';

function generateExpression(
	min: number,
	max: number,
	operations: Operation[]
): { a: number; b: number; op: Operation; result: number } {
	const op = operations[Math.floor(Math.random() * operations.length)];
	let a: number, b: number, result: number;

	switch (op) {
		case 'add':
			a = Math.floor(Math.random() * (max - min + 1)) + min;
			b = Math.floor(Math.random() * (max - min + 1)) + min;
			result = a + b;
			break;
		case 'sub':
			a = Math.floor(Math.random() * (max - min + 1)) + min;
			b = Math.floor(Math.random() * Math.min(a, max - min + 1)) + min;
			if (b > a) [a, b] = [b, a];
			result = a - b;
			break;
		case 'mul': {
			const maxFactor = Math.min(max, 12);
			a = Math.floor(Math.random() * (maxFactor - min + 1)) + min;
			b = Math.floor(Math.random() * (maxFactor - min + 1)) + min;
			result = a * b;
			break;
		}
		case 'div': {
			const maxF = Math.min(max, 12);
			b = Math.floor(Math.random() * (maxF - min + 1)) + min || 1;
			result = Math.floor(Math.random() * (maxF - min + 1)) + min;
			a = b * result;
			break;
		}
		default:
			a = min;
			b = min;
			result = min + min;
	}

	return { a, b, op, result };
}

function getCompareSymbol(left: number, right: number): CompareSymbol {
	if (left > right) return '>';
	if (left < right) return '<';
	return '=';
}

export function generateCompareProblem(
	min: number,
	max: number,
	operations: Operation[]
): CompareProblem {
	const left = generateExpression(min, max, operations);
	const right = generateExpression(min, max, operations);
	const answer = getCompareSymbol(left.result, right.result);

	return {
		type: 'compare',
		left,
		right,
		answer
	};
}

export function generateCompareProblems(
	min: number,
	max: number,
	operations: Operation[],
	count: number
): CompareProblem[] {
	const problems: CompareProblem[] = [];
	const seen = new Set<string>();

	let attempts = 0;
	while (problems.length < count && attempts < count * 10) {
		attempts++;
		const problem = generateCompareProblem(min, max, operations);
		const key = `${problem.left.a}${problem.left.op}${problem.left.b}-${problem.right.a}${problem.right.op}${problem.right.b}`;
		if (seen.has(key)) continue;
		seen.add(key);
		problems.push(problem);
	}

	return problems;
}
