import type { Problem, Operation, BlankPosition, ExerciseConfig } from '$lib/types';

/**
 * 根据留空比例随机选择留空位置
 */
function pickBlankPosition(ratio: Record<BlankPosition, number>): BlankPosition {
	const rand = Math.random();
	const { first, second } = ratio;

	if (rand < first) return 'first';
	if (rand < first + second) return 'second';
	return 'result';
}

/**
 * 生成单道加法题
 */
function generateAdd(min: number, max: number): { a: number; b: number; result: number } {
	const a = Math.floor(Math.random() * (max - min + 1)) + min;
	const b = Math.floor(Math.random() * (max - min + 1)) + min;
	return { a, b, result: a + b };
}

/**
 * 生成单道减法题（结果不为负）
 */
function generateSub(min: number, max: number): { a: number; b: number; result: number } {
	let a = Math.floor(Math.random() * (max - min + 1)) + min;
	let b = Math.floor(Math.random() * (max - min + 1)) + min;
	if (a < b) [a, b] = [b, a];
	return { a, b, result: a - b };
}

/**
 * 生成单道乘法题
 */
function generateMul(min: number, max: number): { a: number; b: number; result: number } {
	const maxFactor = Math.min(max, 12);
	const a = Math.floor(Math.random() * (maxFactor - min + 1)) + min;
	const b = Math.floor(Math.random() * (maxFactor - min + 1)) + min;
	return { a, b, result: a * b };
}

/**
 * 生成单道除法题（整除）
 */
function generateDiv(min: number, max: number): { a: number; b: number; result: number } {
	const maxFactor = Math.min(max, 12);
	const b = Math.floor(Math.random() * (maxFactor - min + 1)) + min || 1;
	const result = Math.floor(Math.random() * (maxFactor - min + 1)) + min;
	const a = b * result;
	return { a, b, result };
}

/**
 * 根据运算类型生成题目
 */
function generateByOp(
	op: Operation,
	min: number,
	max: number
): { a: number; b: number; result: number } {
	switch (op) {
		case 'add':
			return generateAdd(min, max);
		case 'sub':
			return generateSub(min, max);
		case 'mul':
			return generateMul(min, max);
		case 'div':
			return generateDiv(min, max);
	}
}

/**
 * 生成题目唯一标识（用于去重）
 */
function problemKey(p: { a: number; b: number; op: Operation }): string {
	return `${p.a}-${p.op}-${p.b}`;
}

/**
 * 生成一批练习题
 */
export function generateProblems(config: ExerciseConfig): Problem[] {
	const { range, operations, blankRatio } = config;
	const totalCount = config.totalCount > 0 ? config.totalCount : 20;
	const problems: Problem[] = [];
	const seen = new Set<string>();

	let attempts = 0;
	const maxAttempts = totalCount * 10;

	while (problems.length < totalCount && attempts < maxAttempts) {
		attempts++;

		const op = operations[Math.floor(Math.random() * operations.length)];
		const { a, b, result } = generateByOp(op, range.min, range.max);

		const key = problemKey({ a, b, op });
		if (seen.has(key)) continue;
		seen.add(key);

		const blank = pickBlankPosition(blankRatio);

		problems.push({ a, b, op, result, blank });
	}

	return problems;
}
