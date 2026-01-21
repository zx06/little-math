import type { StatisticsData, Operation, DailyStatRecord, PracticeProgressRecord } from '$lib/types';
import { INITIAL_STATS } from '$lib/types';

const STORAGE_KEY = 'little-math-stats';

/** 获取统计数据 */
export function getStats(): StatisticsData {
	if (typeof window === 'undefined') return INITIAL_STATS;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored) as StatisticsData;
		}
	} catch (error) {
		console.error('Failed to load stats:', error);
	}
	return INITIAL_STATS;
}

/** 保存统计数据 */
function saveStats(stats: StatisticsData): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
	} catch (error) {
		console.error('Failed to save stats:', error);
	}
}

/** 获取今天的日期字符串（YYYY-MM-DD） */
function getToday(): string {
	return new Date().toISOString().split('T')[0];
}

/** 更新每日统计 */
function updateDailyStats(
	stats: StatisticsData,
	type: 'visits' | 'generations' | 'prints'
): void {
	const today = getToday();

	if (!stats.dailyStats[today]) {
		stats.dailyStats[today] = { visits: 0, generations: 0, prints: 0 };
	}

	stats.dailyStats[today][type]++;
}

/** 记录页面访问 */
export function trackVisit(): void {
	const stats = getStats();
	const today = getToday();

	stats.totalVisits++;
	stats.lastVisitDate = today;
	updateDailyStats(stats, 'visits');

	saveStats(stats);
}

/** 记录生成练习 */
export function trackGeneration(operations: Operation[], gradePreset: string): void {
	const stats = getStats();

	stats.totalGenerations++;
	updateDailyStats(stats, 'generations');

	operations.forEach((op) => {
		stats.operationsCount[op]++;
	});

	if (gradePreset) {
		stats.gradePresetCount[gradePreset] = (stats.gradePresetCount[gradePreset] || 0) + 1;
	}

	saveStats(stats);
}

/** 记录打印 */
export function trackPrint(): void {
	const stats = getStats();

	stats.totalPrints++;
	updateDailyStats(stats, 'prints');

	saveStats(stats);
}

/** 重置统计数据 */
export function resetStats(): void {
	saveStats(INITIAL_STATS);
}

/** 获取最近7天的统计数据 */
export function getLast7DaysStats() {
	const stats = getStats();
	const result: Array<{ date: string; visits: number; generations: number; prints: number }> = [];

	for (let i = 6; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().split('T')[0];

		result.push({
			date: dateStr,
			visits: stats.dailyStats[dateStr]?.visits || 0,
			generations: stats.dailyStats[dateStr]?.generations || 0,
			prints: stats.dailyStats[dateStr]?.prints || 0
		});
	}

	return result;
}

/** 存储练习进度 */
export function savePracticeProgress(progress: Omit<PracticeProgressRecord, 'date'> & { date?: string }): void {
	const stats = getStats();
	const today = getToday();

	if (!stats.dailyStats[today]) {
		stats.dailyStats[today] = { visits: 0, generations: 0, prints: 0, practiceProgress: [] };
	}

	if (!stats.dailyStats[today].practiceProgress) {
		stats.dailyStats[today].practiceProgress = [];
	}

	stats.dailyStats[today].practiceProgress!.push({
		totalProblems: progress.totalProblems,
		correctProblems: progress.correctProblems,
		timeSpent: progress.timeSpent
	});

	saveStats(stats);
}

/** 获取每日进度数据 */
export function getDailyProgress(days: number = 7): Array<{
	date: string;
	totalProblems: number;
	correctProblems: number;
	correctRate: number;
	timeSpent: number;
	avgTimePerProblem: number;
}> {
	const stats = getStats();
	const result: Array<{
		date: string;
		totalProblems: number;
		correctProblems: number;
		correctRate: number;
		timeSpent: number;
		avgTimePerProblem: number;
	}> = [];

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().split('T')[0];

		const dayStats = stats.dailyStats[dateStr];
		const progressList = dayStats?.practiceProgress || [];

		const totalProblems = progressList.reduce((sum, p) => sum + p.totalProblems, 0);
		const correctProblems = progressList.reduce((sum, p) => sum + p.correctProblems, 0);
		const timeSpent = progressList.reduce((sum, p) => sum + p.timeSpent, 0);

		result.push({
			date: dateStr,
			totalProblems,
			correctProblems,
			correctRate: totalProblems > 0 ? Math.round((correctProblems / totalProblems) * 100) : 0,
			timeSpent,
			avgTimePerProblem: totalProblems > 0 ? Math.round(timeSpent / totalProblems) : 0
		});
	}

	return result;
}