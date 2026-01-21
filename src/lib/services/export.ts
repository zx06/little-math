import type { StatisticsData } from '$lib/types';
import { getStats } from '$lib/services/statistics';
import { getAchievements, getUserAchievements } from '$lib/services/achievements';

export function exportStatistics(): string {
	const stats = getStats();
	const achievements = getUserAchievements();

	const exportData = {
		exportDate: new Date().toISOString(),
		statistics: stats,
		achievements: achievements.map((a) => ({
			id: a.achievementId,
			unlockedAt: new Date(a.unlockedAt).toISOString()
		}))
	};

	return JSON.stringify(exportData, null, 2);
}

export function exportToCSV(): string {
	const stats = getStats();
	const dailyStats = stats.dailyStats;

	// 生成 CSV 头部
	let csv = '日期,访问次数,生成次数,打印次数\n';

	// 添加每日数据
	const sortedDates = Object.keys(dailyStats).sort();
	for (const date of sortedDates) {
		const day = dailyStats[date];
		csv += `${date},${day.visits},${day.generations},${day.prints}\n`;
	}

	// 添加汇总数据
	csv += '\n汇总统计\n';
	csv += `总访问次数,${stats.totalVisits}\n`;
	csv += `总生成次数,${stats.totalGenerations}\n`;
	csv += `总打印次数,${stats.totalPrints}\n`;
	csv += `最后访问日期,${stats.lastVisitDate}\n`;

	return csv;
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
	if (typeof window === 'undefined') {
		console.warn('Cannot download file in non-browser environment');
		return;
	}

	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function downloadStatisticsJSON(): void {
	const json = exportStatistics();
	const filename = `little-math-stats-${new Date().toISOString().split('T')[0]}.json`;
	downloadFile(json, filename, 'application/json');
}

export function downloadStatisticsCSV(): void {
	const csv = exportToCSV();
	const filename = `little-math-stats-${new Date().toISOString().split('T')[0]}.csv`;
	downloadFile(csv, filename, 'text/csv;charset=utf-8');
}