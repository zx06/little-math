import type { WrongRecord, AnyProblem } from '$lib/types';

const STORAGE_KEY = 'little-math-wrong-book';
const MAX_RECORDS = 100;

/** 获取所有错题记录 */
export function getWrongRecords(): WrongRecord[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (e) {
		console.warn('Failed to load wrong records:', e);
	}
	return [];
}

/** 保存错题记录 */
function saveWrongRecords(records: WrongRecord[]): void {
	try {
		const trimmed = records.slice(-MAX_RECORDS);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
	} catch (e) {
		console.warn('Failed to save wrong records:', e);
	}
}

/** 添加错题记录 */
export function addWrongRecord(
	problem: AnyProblem,
	wrongAnswer: number,
	correctAnswer: number
): void {
	const records = getWrongRecords();
	records.push({
		problem,
		wrongAnswer,
		correctAnswer,
		timestamp: Date.now(),
		reviewCount: 0
	});
	saveWrongRecords(records);
}

/** 获取错题数量 */
export function getWrongCount(): number {
	return getWrongRecords().length;
}

/** 生成错题复习题目 */
export function generateWrongReview(count: number): AnyProblem[] {
	const records = getWrongRecords();
	const sorted = [...records].sort((a, b) => a.reviewCount - b.reviewCount);
	const selected = sorted.slice(0, count);

	const updatedRecords = records.map((r) => {
		if (selected.some((s) => s.timestamp === r.timestamp)) {
			return { ...r, reviewCount: r.reviewCount + 1 };
		}
		return r;
	});
	saveWrongRecords(updatedRecords);

	return selected.map((r) => r.problem);
}

/** 清空错题本 */
export function clearWrongRecords(): void {
	localStorage.removeItem(STORAGE_KEY);
}

/** 删除单条错题 */
export function removeWrongRecord(timestamp: number): void {
	const records = getWrongRecords().filter((r) => r.timestamp !== timestamp);
	saveWrongRecords(records);
}
