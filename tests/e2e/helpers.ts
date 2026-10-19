import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';

export const SHOTS = process.env.SHOTS_DIR ?? path.resolve('test-results/shots');
mkdirSync(SHOTS, { recursive: true });

export function hasPoppler(): boolean {
	try {
		execFileSync('pdfinfo', ['-v'], { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

export function pdfInfo(file: string): { pages: number; size: string } {
	const out = execFileSync('pdfinfo', [file]).toString();
	const pages = Number(/Pages:\s+(\d+)/.exec(out)?.[1]);
	const size = /Page size:\s+(.+)/.exec(out)?.[1]?.trim() ?? '';
	return { pages, size };
}

/** 把 PDF 每页渲染成 PNG（证据图），返回生成的文件前缀 */
export function renderPdf(file: string, prefix: string, dpi = 60): string {
	execFileSync('pdftoppm', ['-png', '-r', String(dpi), file, prefix]);
	return prefix;
}

export async function setConfig(page: Page, config: Record<string, unknown>) {
	await page.addInitScript((c) => {
		const base = {
			gradePreset: 'custom',
			range: { min: 1, max: 20 },
			operations: ['add', 'sub'],
			blankRatio: { first: 0.2, second: 0.3, result: 0.5 },
			isVertical: false,
			columns: 2,
			countPerPage: 20,
			totalCount: 20,
			showAnswerPage: false,
			customTitle: '',
			studentName: '',
			showDate: true,
			problemMode: 'normal',
			makeTargetValue: 10,
			chainLength: 3,
			remainderBlank: 'quotient'
		};
		if (!sessionStorage.getItem('__cfg_set')) {
			localStorage.setItem('little-math-config', JSON.stringify({ ...base, ...c }));
			sessionStorage.setItem('__cfg_set', '1');
		}
	}, config);
}

export async function openHome(page: Page) {
	await page.goto('/');
	await page.waitForSelector('[data-testid=sheet-page]');
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(150);
}

/** 检查每一页内容都没有溢出 A4、每道题都没有挤出自己的格子 */
export async function expectNoOverflow(page: Page) {
	const res = await page.evaluate(() => {
		const pages = [...document.querySelectorAll<HTMLElement>('.page')];
		const pageOverflow = pages.filter((p) => p.scrollHeight > p.clientHeight + 1 || p.scrollWidth > p.clientWidth + 1).length;
		const cells = [...document.querySelectorAll<HTMLElement>('[data-testid=problem]')];
		const cellOverflow = cells.filter((c) => c.scrollWidth > c.clientWidth + 1 || c.scrollHeight > c.clientHeight + 1).length;
		const sizes = pages.map((p) => [p.offsetWidth, p.offsetHeight]);
		return { pages: pages.length, pageOverflow, cellOverflow, cells: cells.length, sizes };
	});
	expect(res.pageOverflow, 'page overflow').toBe(0);
	expect(res.cellOverflow, 'cell overflow').toBe(0);
	for (const [w, h] of res.sizes) {
		expect(Math.abs(w - 794)).toBeLessThanOrEqual(1);
		expect(Math.abs(h - 1123)).toBeLessThanOrEqual(1);
	}
	return res;
}


/** 仅勾选给定运算（首页 ConfigPanel） */
export async function setOpsOnly(page: Page, ops: Array<'add' | 'sub' | 'mul' | 'div'>) {
	const all = ['add', 'sub', 'mul', 'div'] as const;
	for (const op of all) {
		const box = page.getByTestId(`op-${op}`);
		if (ops.includes(op)) await box.check();
		else await box.uncheck();
	}
}

/** 读首页所有题目文本 */
export async function problemTexts(page: Page): Promise<string[]> {
	return page.locator('[data-testid=sheet-page] [data-testid=problem]').allInnerTexts();
}

/** 等预览稳定（无 stale banner） */
export async function waitPreviewSettled(page: Page) {
	await expect(page.getByTestId('stale-banner')).toHaveCount(0, { timeout: 3000 });
	await page.waitForTimeout(200);
}
