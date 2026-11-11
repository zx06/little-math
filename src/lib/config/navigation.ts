/** 全站主导航（桌面顶栏 + 移动端 Hub 卡片） */
export const MOBILE_NAV_MAX_PX = 768;

export interface NavItem {
	href: string;
	/** 桌面「打印题」用 `/`，移动端打印页用 `/print` */
	mobileHref?: string;
	icon: string;
	label: string;
	desc: string;
	testid: string;
}

export const NAV_ITEMS: NavItem[] = [
	{
		href: '/',
		mobileHref: '/print',
		icon: '📝',
		label: '打印题',
		desc: '出题、打印、看答案',
		testid: 'nav-home'
	},
	{
		href: '/practice',
		icon: '🎯',
		label: '做题',
		desc: '在线练习口算',
		testid: 'nav-practice'
	},
	{
		href: '/wrong-book',
		icon: '📕',
		label: '错题本',
		desc: '复习错过的题',
		testid: 'nav-wrong-book'
	},
	{
		href: '/favorites',
		icon: '⭐',
		label: '收藏',
		desc: '收藏的题目',
		testid: 'nav-favorites'
	}
];

export const HUB_PATH = '/hub';

const FEATURE_PATHS = new Set(['/print', '/practice', '/wrong-book', '/favorites']);

export function isHubHomePath(pathname: string): boolean {
	return pathname === HUB_PATH;
}

export function isMobileFeaturePath(pathname: string): boolean {
	return FEATURE_PATHS.has(pathname);
}

export function navItemForPath(pathname: string): NavItem | undefined {
	if (pathname === '/print' || pathname === '/') return NAV_ITEMS[0];
	return NAV_ITEMS.find((item) => item.href === pathname);
}

export function pathIsActive(pathname: string, href: string): boolean {
	if (href === '/') return pathname === '/' || pathname === '/print';
	return pathname.startsWith(href);
}
