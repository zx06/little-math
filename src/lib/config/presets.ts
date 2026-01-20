import type { GradePreset, Operation, ExerciseConfig, BlankPosition } from '$lib/types';

/** 年级预设配置 */
export const GRADE_PRESETS: Record<string, GradePreset> = {
	kindergarten: {
		label: '幼儿园',
		range: { min: 1, max: 10 },
		operations: ['add', 'sub']
	},
	grade1: {
		label: '一年级',
		range: { min: 1, max: 20 },
		operations: ['add', 'sub']
	},
	grade2: {
		label: '二年级',
		range: { min: 1, max: 100 },
		operations: ['add', 'sub']
	},
	grade3: {
		label: '三年级',
		range: { min: 1, max: 100 },
		operations: ['add', 'sub', 'mul', 'div']
	},
	custom: {
		label: '自定义',
		range: { min: 1, max: 100 },
		operations: ['add', 'sub']
	}
};

/** 运算组合快捷选项 */
export const OP_COMBOS: Record<string, { label: string; ops: Operation[] }> = {
	'add-only': { label: '仅加法', ops: ['add'] },
	'sub-only': { label: '仅减法', ops: ['sub'] },
	'add-sub': { label: '加减混合', ops: ['add', 'sub'] },
	'mul-only': { label: '仅乘法', ops: ['mul'] },
	'div-only': { label: '仅除法', ops: ['div'] },
	'mul-div': { label: '乘除混合', ops: ['mul', 'div'] },
	all: { label: '四则混合', ops: ['add', 'sub', 'mul', 'div'] }
};

/** 默认配置 */
export const DEFAULT_CONFIG: ExerciseConfig = {
	gradePreset: 'grade1',
	range: { min: 1, max: 20 },
	operations: ['add', 'sub'],
	blankRatio: {
		first: 0.2,
		second: 0.3,
		result: 0.5
	},
	isVertical: false,
	columns: 2,
	countPerPage: 20,
	totalCount: 20,
	showAnswerPage: false,
	customTitle: '',
	studentName: '',
	showDate: true,
	problemMode: 'normal',
	makeTargetValue: 10
};

/** 竖式默认每页题数 */
export const VERTICAL_COUNT_PER_PAGE = 8;

/** 横式默认每页题数（三列布局） */
export const HORIZONTAL_COUNT_PER_PAGE = 30;
