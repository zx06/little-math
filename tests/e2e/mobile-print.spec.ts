import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { SHOTS, expectNoOverflow, hasPoppler, openHome, pdfInfo, renderPdf, setConfig } from './helpers';

const MOBILE_CFG = {
	columns: 2,
	countPerPage: 20,
	totalCount: 40,
	showAnswerPage: true
};

test.describe('移动端打印页（~390px）', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('屏幕上不显示卷面预览，DOM 内仍保持完整 A4', async ({ page }) => {
		await setConfig(page, MOBILE_CFG);
		await openHome(page);
		await expect(page.locator('html')).toHaveAttribute('data-mobile-feature', '1');
		await expect(page.getByTestId('sheet-page').first()).toBeAttached();

		const previewInView = await page.locator('.preview').evaluate((el) => {
			const r = el.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			return r.right > 0 && r.left < vw && r.bottom > 0 && r.top < vh;
		});
		expect(previewInView, '卷面不应出现在手机可视区域内').toBe(false);

		const res = await expectNoOverflow(page);
		expect(res.pages).toBe(4);
		expect(res.cells).toBe(80);
	});

	test('浏览器打印：一页卷子仍是一页 A4', async ({ page }) => {
		test.skip(!hasPoppler(), '需要 poppler（pdfinfo）');
		await setConfig(page, MOBILE_CFG);
		await openHome(page);
		await expectNoOverflow(page);

		await page.emulateMedia({ media: 'print' });
		const file = path.join(SHOTS, 'mobile-print-2col-20pp.pdf');
		await page.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true });
		const info = pdfInfo(file);
		expect(info.pages, 'browser print page count').toBe(4);
		expect(info.size).toContain('(A4)');
		renderPdf(file, path.join(SHOTS, 'mobile-print-2col-20pp'));
	});

	test('存成 PDF：导出完整卷面而非空白页', async ({ page }) => {
		test.skip(!hasPoppler(), '需要 poppler（pdfinfo / pdftoppm）');
		await setConfig(page, MOBILE_CFG);
		await page.clock.setFixedTime(new Date('2026-10-19T23:30:00Z'));
		await openHome(page);

		const sizesBefore = await page.evaluate(() =>
			[...document.querySelectorAll<HTMLElement>('.page')].map((p) => [p.offsetWidth, p.offsetHeight])
		);
		for (const [w, h] of sizesBefore) {
			expect(w, '导出前卷面应有非零宽度').toBeGreaterThan(100);
			expect(h, '导出前卷面应有非零高度').toBeGreaterThan(100);
		}

		const downloadPromise = page.waitForEvent('download');
		await page.getByTestId('export-pdf').click();
		const download = await downloadPromise;
		const file = path.join(SHOTS, 'mobile-export-2col-20pp.pdf');
		await download.saveAs(file);

		const info = pdfInfo(file);
		expect(info.pages, 'exported pdf page count').toBe(4);
		expect(info.size).toContain('(A4)');

		const prefix = path.join(SHOTS, 'mobile-export-2col-20pp-page1');
		execFileSync('pdftoppm', ['-r', '40', '-f', '1', '-l', '1', '-singlefile', file, prefix]);
		const buf = readFileSync(`${prefix}.ppm`);
		let off = 0;
		const head: string[] = [];
		for (let n = 0; n < 3; off++) {
			if (buf[off] === 0x0a) n++;
			head.push(String.fromCharCode(buf[off]));
		}
		const [w, h] = head.join('').split(/\s+/).slice(1, 3).map(Number);
		let darkInk = 0;
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const i = off + (y * w + x) * 3;
				const r = buf[i],
					g = buf[i + 1],
					b = buf[i + 2];
				if (r < 80 && g < 80 && b < 80) darkInk++;
			}
		}
		expect(darkInk, '导出 PDF 第一页应有题目墨迹（非空白）').toBeGreaterThan(800);
	});
});
