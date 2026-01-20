import type { ExerciseConfig } from '$lib/types';
import { DEFAULT_CONFIG } from '$lib/config/presets';

const STORAGE_KEY = 'little-math-config';
const PRESETS_KEY = 'little-math-presets';

/** 保存当前配置 */
export function saveConfig(config: ExerciseConfig): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
	} catch (e) {
		console.warn('Failed to save config:', e);
	}
}

/** 加载保存的配置 */
export function loadConfig(): ExerciseConfig {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
		}
	} catch (e) {
		console.warn('Failed to load config:', e);
	}
	return { ...DEFAULT_CONFIG };
}

/** 保存自定义预设 */
export function savePreset(name: string, config: ExerciseConfig): void {
	try {
		const presets = getPresets();
		presets[name] = config;
		localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
	} catch (e) {
		console.warn('Failed to save preset:', e);
	}
}

/** 获取所有自定义预设 */
export function getPresets(): Record<string, ExerciseConfig> {
	try {
		const stored = localStorage.getItem(PRESETS_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (e) {
		console.warn('Failed to load presets:', e);
	}
	return {};
}

/** 删除自定义预设 */
export function deletePreset(name: string): void {
	try {
		const presets = getPresets();
		delete presets[name];
		localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
	} catch (e) {
		console.warn('Failed to delete preset:', e);
	}
}
