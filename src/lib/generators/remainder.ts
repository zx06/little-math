import type { RemainderProblem } from '$lib/types';

/**
 * 生成一道有余数除法题目
 * @param min 被除数最小值
 * @param max 被除数最大值
 * @returns RemainderProblem
 */
export function generateRemainderProblem(min: number, max: number): RemainderProblem {
	// 确保除数在 2-9 之间，适合小学练习
	const divisor = Math.floor(Math.random() * 8) + 2;

	// 生成被除数，确保有合适的余数
	// 余数应该在 1 到 divisor-1 之间
	const remainder = Math.floor(Math.random() * (divisor - 1)) + 1;
	const quotient = Math.floor(Math.random() * 9) + 1; // 商在 1-9 之间
	const dividend = divisor * quotient + remainder;

	// 随机选择留空位置
	const blankOptions: Array<'quotient' | 'remainder' | 'both'> = ['quotient', 'remainder', 'both'];
	const blank = blankOptions[Math.floor(Math.random() * blankOptions.length)];

	return {
		type: 'remainder',
		dividend,
		divisor,
		quotient,
		remainder,
		blank
	};
}

/**
 * 生成多道有余数除法题目
 * @param min 被除数最小值
 * @param max 被除数最大值
 * @param count 题目数量
 * @returns RemainderProblem[]
 */
export function generateRemainderProblems(min: number, max: number, count: number): RemainderProblem[] {
	const problems: RemainderProblem[] = [];
	const seen = new Set<string>();

	let attempts = 0;
	const maxAttempts = count * 10; // 防止无限循环

	while (problems.length < count && attempts < maxAttempts) {
		const problem = generateRemainderProblem(min, max);
		const key = `${problem.dividend}÷${problem.divisor}`;

		// 避免重复题目
		if (!seen.has(key)) {
			seen.add(key);
			problems.push(problem);
		}

		attempts++;
	}

	return problems;
}