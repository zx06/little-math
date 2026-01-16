/** 中文文本 */
export const zh = {
	appName: '小小数学家',
	appSubtitle: '数学练习生成打印工具',

	// 配置面板
	config: {
		gradePreset: '年级选择',
		operations: '运算类型',
		range: '数字范围',
		rangeMin: '最小值',
		rangeMax: '最大值',
		blankPosition: '留空位置比例',
		blankFirst: '第一个数',
		blankSecond: '第二个数',
		blankResult: '结果',
		exerciseType: '题型',
		horizontal: '横式',
		vertical: '竖式',
		columns: '列数',
		columns2: '2列（大字）',
		columns3: '3列（紧凑）',
		countPerPage: '每页题数',
		totalCount: '总题数',
		showAnswerPage: '生成答案页'
	},

	// 按钮
	buttons: {
		generate: '生成',
		print: '打印'
	},

	// 打印
	print: {
		exerciseTitle: '数学练习',
		answerTitle: '答案',
		name: '姓名',
		date: '日期',
		score: '得分'
	}
};

export type Locale = typeof zh;
