import type { Problem } from '$lib/types';

/**
 * 竖式布局数据结构
 */
export interface VerticalLayout {
	problem: Problem;
	topNumber: string;
	bottomNumber: string;
	operator: string;
	resultDigits: string[];
	maxDigits: number;
}

/**
 * 将题目转换为竖式布局数据
 */
export function toVerticalLayout(problem: Problem): VerticalLayout {
	const { a, b, op, result, blank } = problem;

	const opSymbol = op === 'add' ? '+' : op === 'sub' ? '-' : op === 'mul' ? '×' : '÷';

	const topStr = blank === 'first' ? '' : String(a);
	const bottomStr = blank === 'second' ? '' : String(b);
	const resultStr = blank === 'result' ? '' : String(result);

	const maxDigits = Math.max(String(a).length, String(b).length, String(result).length);

	const resultDigits = resultStr ? resultStr.split('') : Array(maxDigits).fill('');

	return {
		problem,
		topNumber: topStr,
		bottomNumber: bottomStr,
		operator: opSymbol,
		resultDigits,
		maxDigits
	};
}

/**
 * 批量转换为竖式布局
 */
export function toVerticalLayouts(problems: Problem[]): VerticalLayout[] {
	return problems.map(toVerticalLayout);
}
