import type { StatisticsData } from '$lib/types';

export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	condition: (stats: StatisticsData) => boolean;
}

export interface UserAchievement {
	achievementId: string;
	unlockedAt: number;
}

const ACHIEVEMENTS: Achievement[] = [
	{
		id: 'first-10',
		name: '初露锋芒',
		description: '完成 10 道题',
		icon: '⭐',
		condition: (stats) => stats.totalGenerations >= 10
	},
	{
		id: 'first-50',
		name: '小试牛刀',
		description: '完成 50 道题',
		icon: '🌟',
		condition: (stats) => stats.totalGenerations >= 50
	},
	{
		id: 'first-100',
		name: '小小数学家',
		description: '完成 100 道题',
		icon: '🏆',
		condition: (stats) => stats.totalGenerations >= 100
	},
	{
		id: 'first-500',
		name: '数学达人',
		description: '完成 500 道题',
		icon: '👑',
		condition: (stats) => stats.totalGenerations >= 500
	},
	{
		id: 'first-1000',
		name: '数学大师',
		description: '完成 1000 道题',
		icon: '🎖️',
		condition: (stats) => stats.totalGenerations >= 1000
	},
	{
		id: 'add-master',
		name: '加法专家',
		description: '完成 100 道加法题',
		icon: '➕',
		condition: (stats) => stats.operationsCount.add >= 100
	},
	{
		id: 'sub-master',
		name: '减法专家',
		description: '完成 100 道减法题',
		icon: '➖',
		condition: (stats) => stats.operationsCount.sub >= 100
	},
	{
		id: 'mul-master',
		name: '乘法专家',
		description: '完成 100 道乘法题',
		icon: '✖️',
		condition: (stats) => stats.operationsCount.mul >= 100
	},
	{
		id: 'div-master',
		name: '除法专家',
		description: '完成 100 道除法题',
		icon: '➗',
		condition: (stats) => stats.operationsCount.div >= 100
	},
	{
		id: 'print-lover',
		name: '打印达人',
		description: '打印 20 次',
		icon: '🖨️',
		condition: (stats) => stats.totalPrints >= 20
	},
	{
		id: 'daily-warrior',
		name: '坚持练习',
		description: '连续练习 7 天',
		icon: '🔥',
		condition: (stats) => {
			const days = Object.keys(stats.dailyStats);
			if (days.length < 7) return false;
			const sortedDays = days.sort();
			const today = new Date().toISOString().split('T')[0];
			const todayDate = new Date(today);
			for (let i = 0; i < 7; i++) {
				const checkDate = new Date(todayDate);
				checkDate.setDate(checkDate.getDate() - i);
				const checkStr = checkDate.toISOString().split('T')[0];
				if (!stats.dailyStats[checkStr]) return false;
			}
			return true;
		}
	}
];

const STORAGE_KEY = 'little-math-achievements';

export function getAchievements(): Achievement[] {
	return ACHIEVEMENTS;
}

export function getUserAchievements(): UserAchievement[] {
	if (typeof window === 'undefined') return [];

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored) as UserAchievement[];
		}
	} catch (error) {
		console.error('Failed to load achievements:', error);
	}
	return [];
}

function saveUserAchievements(achievements: UserAchievement[]): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
	} catch (error) {
		console.error('Failed to save achievements:', error);
	}
}

export function checkAchievements(stats: StatisticsData): Achievement[] {
	const userAchievements = getUserAchievements();
	const unlockedIds = new Set(userAchievements.map((a) => a.achievementId));
	const newAchievements: Achievement[] = [];

	for (const achievement of ACHIEVEMENTS) {
		if (!unlockedIds.has(achievement.id) && achievement.condition(stats)) {
			newAchievements.push(achievement);
			userAchievements.push({
				achievementId: achievement.id,
				unlockedAt: Date.now()
			});
		}
	}

	if (newAchievements.length > 0) {
		saveUserAchievements(userAchievements);
	}

	return newAchievements;
}

export function isAchievementUnlocked(achievementId: string): boolean {
	const userAchievements = getUserAchievements();
	return userAchievements.some((a) => a.achievementId === achievementId);
}