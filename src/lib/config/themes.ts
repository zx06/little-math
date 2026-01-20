/** 打印主题配置 */
export interface PrintTheme {
	id: string;
	name: string;
	icon: string;
	colors: {
		primary: string;
		secondary: string;
		accent: string;
		background: string;
		border: string;
	};
	decorations?: {
		headerEmoji?: string;
		borderStyle?: string;
	};
}

/** 可用主题列表 */
export const THEMES: PrintTheme[] = [
	{
		id: 'default',
		name: '经典',
		icon: '📝',
		colors: {
			primary: '#ff6b6b',
			secondary: '#ff922b',
			accent: '#51cf66',
			background: '#fff9e6',
			border: '#ffc078'
		},
		decorations: {
			headerEmoji: '🌟',
			borderStyle: 'solid'
		}
	},
	{
		id: 'cartoon',
		name: '卡通',
		icon: '🎨',
		colors: {
			primary: '#ff6b9d',
			secondary: '#ffa07a',
			accent: '#87ceeb',
			background: '#fff0f5',
			border: '#ffb6c1'
		},
		decorations: {
			headerEmoji: '🎈',
			borderStyle: 'dashed'
		}
	},
	{
		id: 'spring',
		name: '春节',
		icon: '🧧',
		colors: {
			primary: '#e74c3c',
			secondary: '#f39c12',
			accent: '#27ae60',
			background: '#fff5e6',
			border: '#e74c3c'
		},
		decorations: {
			headerEmoji: '🏮',
			borderStyle: 'double'
		}
	},
	{
		id: 'stars',
		name: '星空',
		icon: '⭐',
		colors: {
			primary: '#9b59b6',
			secondary: '#3498db',
			accent: '#f1c40f',
			background: '#f4f0ff',
			border: '#9b59b6'
		},
		decorations: {
			headerEmoji: '🌙',
			borderStyle: 'dotted'
		}
	},
	{
		id: 'nature',
		name: '自然',
		icon: '🌿',
		colors: {
			primary: '#27ae60',
			secondary: '#2ecc71',
			accent: '#f39c12',
			background: '#f0fff4',
			border: '#27ae60'
		},
		decorations: {
			headerEmoji: '🌸',
			borderStyle: 'solid'
		}
	}
];

/** 根据ID获取主题 */
export function getThemeById(id: string): PrintTheme {
	return THEMES.find((theme) => theme.id === id) || THEMES[0];
}