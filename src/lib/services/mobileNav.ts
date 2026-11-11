import { browser } from '$app/env';
import { MOBILE_NAV_MAX_PX } from '#lib/config/navigation.js';

export function mobileNavMq(): string {
	return `(max-width: ${MOBILE_NAV_MAX_PX}px)`;
}

export function isMobileNavViewport(): boolean {
	if (!browser) return false;
	return window.matchMedia(mobileNavMq()).matches;
}

/** 桌面中等宽度：主题收成按钮，避免顶栏换行 */
export const DESKTOP_THEME_COMPACT_MAX_PX = 1100;

export function desktopThemeCompactMq(): string {
	return `(min-width: ${MOBILE_NAV_MAX_PX + 1}px) and (max-width: ${DESKTOP_THEME_COMPACT_MAX_PX}px)`;
}
