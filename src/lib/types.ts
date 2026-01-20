/** 运算类型 */
export type Operation = 'add' | 'sub' | 'mul' | 'div';

/** 留空位置 */
export type BlankPosition = 'first' | 'second' | 'result';

/** 题目模式 */
export type ProblemMode = 'normal' | 'makeTarget' | 'chain';

/** 凑数目标 */
export type MakeTargetValue = 10 | 20 | 100;

/** 凑数练习题目 */
export interface MakeTargetProblem {
	type: 'makeTarget';
	a: number;
	target: number;
	answer: number;
	blankFirst: boolean;
}

/** 连续运算题目 */
export interface ChainProblem {
	type: 'chain';
	numbers: number[];
	ops: Operation[];
	result: number;
	blank: 'result' | number;
}

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
	customTitle?: string;
	studentName?: string;
	showDate?: boolean;
	problemMode: ProblemMode;
	makeTargetValue: MakeTargetValue;
	chainLength: 3 | 4;
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

/** 统计数据接口 */
export interface StatisticsData {
	totalVisits: number;
	totalGenerations: number;
	totalPrints: number;
	operationsCount: Record<Operation, number>;
	gradePresetCount: Record<string, number>;
	lastVisitDate: string;
	dailyStats: Record<string, { visits: number; generations: number; prints: number }>;
}

/** 任意题目类型 */
export type AnyProblem = Problem | MakeTargetProblem | ChainProblem;

/** 错题记录 */
export interface WrongRecord {
	problem: AnyProblem;
	wrongAnswer: number;
	correctAnswer: number;
	timestamp: number;
	reviewCount: number;
}

/** 初始化统计数据 */
export const INITIAL_STATS: StatisticsData = {
	totalVisits: 0,
	totalGenerations: 0,
	totalPrints: 0,
	operationsCount: { add: 0, sub: 0, mul: 0, div: 0 },
	gradePresetCount: {},
	lastVisitDate: '',
	dailyStats: {}
};
