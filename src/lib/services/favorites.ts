import type { AnyProblem } from '$lib/types';

const FAVORITES_KEY = 'little-math-favorites';

export interface FavoriteRecord {
	problem: AnyProblem;
	timestamp: number;
}

export function getFavorites(): FavoriteRecord[] {
	if (typeof window === 'undefined') return [];
	try {
		const data = localStorage.getItem(FAVORITES_KEY);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

export function addFavorite(problem: AnyProblem): void {
	const favorites = getFavorites();
	const exists = favorites.some(
		(f) => JSON.stringify(f.problem) === JSON.stringify(problem)
	);
	if (!exists) {
		favorites.push({ problem, timestamp: Date.now() });
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
	}
}

export function removeFavorite(timestamp: number): void {
	const favorites = getFavorites().filter((f) => f.timestamp !== timestamp);
	localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function clearFavorites(): void {
	localStorage.removeItem(FAVORITES_KEY);
}

export function isFavorited(problem: AnyProblem): boolean {
	const favorites = getFavorites();
	return favorites.some(
		(f) => JSON.stringify(f.problem) === JSON.stringify(problem)
	);
}

export function generateFavoriteReview(count: number): AnyProblem[] {
	const favorites = getFavorites();
	if (favorites.length === 0) return [];
	
	const shuffled = [...favorites].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, Math.min(count, favorites.length)).map((f) => f.problem);
}
