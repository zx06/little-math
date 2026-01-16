/** 运算类型 */
export type Operation = 'add' | 'sub' | 'mul' | 'div';

/** 留空位置 */
export type BlankPosition = 'first' | 'second' | 'result';

/** 单道题目 */
export interface Problem {
	a: number;
	b: number;
	op: Operation;
	result: number;
	blank: BlankPosition;
}

/** 年级预设配置 */
export interface GradePreset {
	label: string;
	range: { min: number; max: number };
	operations: Operation[];
}

/** 练习配置 */
export interface ExerciseConfig {
	gradePreset: string;
	range: { min: number; max: number };
	operations: Operation[];
	blankRatio: Record<BlankPosition, number>;
	isVertical: boolean;
	columns: 2 | 3;
	countPerPage: number;
	totalCount: number;
	showAnswerPage: boolean;
}

/** 运算符显示映射 */
export const OP_SYMBOLS: Record<Operation, string> = {
	add: '+',
	sub: '-',
	mul: '×',
	div: '÷'
};

/** 运算符中文名 */
export const OP_NAMES: Record<Operation, string> = {
	add: '加法',
	sub: '减法',
	mul: '乘法',
	div: '除法'
};
