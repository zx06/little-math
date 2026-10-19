import { test, expect } from '@playwright/test';
import { openHome, setConfig, setOpsOnly, problemTexts, waitPreviewSettled } from './helpers';

test.describe('A. 主页出题与配置', () => {
	test('A1 年级预设切换后范围与运算变化，预览有题', async ({ page }) => {
		await setConfig(page, {});
		await openHome(page);
		await page.getByTestId('preset').selectOption('kindergarten');
		await waitPreviewSettled(page);
		await expect(page.getByTestId('range-min')).toHaveValue('1');
		await expect(page.getByTestId('range-max')).toHaveValue('10');
		await expect(page.getByTestId('op-add')).toBeChecked();
		await expect(page.getByTestId('op-sub')).toBeChecked();
		await expect(page.locator('[data-testid=sheet-page] [data-testid=problem]')).toHaveCount(20);

		await page.getByTestId('preset').selectOption('grade3');
		await waitPreviewSettled(page);
		await expect(page.getByTestId('range-max')).toHaveValue('100');
		await expect(page.getByTestId('op-mul')).toBeChecked();
		await expect(page.getByTestId('op-div')).toBeChecked();
		await expect(page.locator('[data-testid=sheet-page] [data-testid=problem]').first()).toBeVisible();
	});

	test('A2 四则运算勾选组合：只加/只减/只乘/只除', async ({ page }) => {
		await setConfig(page, { operations: ['add'], totalCount: 12, countPerPage: 12 });
		await openHome(page);

		const cases: Array<{ ops: Array<'add' | 'sub' | 'mul' | 'div'>; must: string; mustNot: string[] }> = [
			{ ops: ['add'], must: '+', mustNot: ['×', '÷'] },
			{ ops: ['sub'], must: '-', mustNot: ['×', '÷'] },
			{ ops: ['mul'], must: '×', mustNot: ['÷'] },
			{ ops: ['div'], must: '÷', mustNot: ['×'] }
		];
		for (const c of cases) {
			await setOpsOnly(page, c.ops);
			await waitPreviewSettled(page);
			const texts = await problemTexts(page);
			expect(texts.length).toBeGreaterThan(0);
			for (const t of texts) {
				expect(t).toContain(c.must);
				for (const bad of c.mustNot) expect(t).not.toContain(bad);
			}
		}
	});

	test('A3 表内乘除开关：开则因数/除数/商 ≤9', async ({ page }) => {
		await setConfig(page, {
			operations: ['mul'],
			range: { min: 1, max: 100 },
			tableMulDiv: true,
			totalCount: 30,
			countPerPage: 30
		});
		await openHome(page);
		await expect(page.getByTestId('table-muldiv')).toBeChecked();
		const texts = await problemTexts(page);
		for (const t of texts) {
			const m = t.match(/(\d+)\s*×\s*(\d+)/);
			if (!m) continue;
			expect(Number(m[1])).toBeLessThanOrEqual(9);
			expect(Number(m[2])).toBeLessThanOrEqual(9);
		}
		await page.getByTestId('table-muldiv').uncheck();
		await waitPreviewSettled(page);
		await expect(page.locator('[data-testid=sheet-page] [data-testid=problem]').first()).toBeVisible();
	});

	test('A5 题型模式 normal/makeTarget/chain/compare/remainder 预览正确', async ({ page }) => {
		await setConfig(page, { totalCount: 10, countPerPage: 10, columns: 2 });
		await openHome(page);

		await page.getByTestId('mode').selectOption('makeTarget');
		await waitPreviewSettled(page);
		let texts = await problemTexts(page);
		expect(texts.every((t) => t.includes('=') && t.includes('+'))).toBe(true);

		await page.getByTestId('mode').selectOption('chain');
		await waitPreviewSettled(page);
		texts = await problemTexts(page);
		expect(texts.length).toBe(10);

		await page.getByTestId('mode').selectOption('compare');
		await waitPreviewSettled(page);
		texts = await problemTexts(page);
		expect(texts.every((t) => t.includes('○'))).toBe(true);

		await page.getByTestId('mode').selectOption('remainder');
		await waitPreviewSettled(page);
		texts = await problemTexts(page);
		expect(texts.every((t) => t.includes('÷') && t.includes('……'))).toBe(true);
	});

	test('A6 凑数目标 10/20/100', async ({ page }) => {
		await setConfig(page, { problemMode: 'makeTarget', makeTargetValue: 10, totalCount: 8, countPerPage: 8 });
		await openHome(page);
		await expect(page.getByTestId('make-target')).toHaveValue('10');
		let texts = await problemTexts(page);
		expect(texts.every((t) => t.includes('10'))).toBe(true);

		await page.getByTestId('make-target').selectOption('20');
		await waitPreviewSettled(page);
		texts = await problemTexts(page);
		expect(texts.every((t) => t.includes('20'))).toBe(true);

		await page.getByTestId('make-target').selectOption('100');
		await waitPreviewSettled(page);
		texts = await problemTexts(page);
		expect(texts.every((t) => t.includes('100'))).toBe(true);
	});

	test('A7 连续运算长度 3/4', async ({ page }) => {
		await setConfig(page, { problemMode: 'chain', chainLength: 3, totalCount: 6, countPerPage: 6 });
		await openHome(page);
		await expect(page.getByTestId('chain-length')).toHaveValue('3');
		let texts = await problemTexts(page);
		for (const t of texts) {
			const nums = t.match(/\d+/g) ?? [];
			expect(nums.length).toBeGreaterThanOrEqual(3);
		}
		await page.getByTestId('chain-length').selectOption('4');
		await waitPreviewSettled(page);
		texts = await problemTexts(page);
		for (const t of texts) {
			const ops = (t.match(/[+\-×÷]/g) ?? []).length;
			expect(ops).toBeGreaterThanOrEqual(3);
		}
	});

	test('A8 有余数 blank=quotient/remainder/both', async ({ page }) => {
		await setConfig(page, {
			problemMode: 'remainder',
			remainderBlank: 'quotient',
			totalCount: 8,
			countPerPage: 8
		});
		await openHome(page);
		await expect(page.getByTestId('remainder-blank')).toHaveValue('quotient');
		let texts = await problemTexts(page);
		expect(texts.every((t) => t.includes('……'))).toBe(true);

		await page.getByTestId('remainder-blank').selectOption('remainder');
		await waitPreviewSettled(page);
		texts = await problemTexts(page);
		expect(texts.every((t) => t.includes('……'))).toBe(true);

		await page.getByTestId('remainder-blank').selectOption('both');
		await waitPreviewSettled(page);
		texts = await problemTexts(page);
		expect(texts.every((t) => t.includes('……'))).toBe(true);
		for (const t of texts) {
			expect(t).toMatch(/÷/);
			expect(t.indexOf('……')).toBeGreaterThan(t.indexOf('÷'));
		}
	});

	test('A9 横式 2列/3列与竖式结构', async ({ page }) => {
		await setConfig(page, { columns: 2, totalCount: 12, countPerPage: 12 });
		await openHome(page);
		await expect(page.getByTestId('columns')).toHaveValue('2');
		await expect(page.locator('.grid.cols-2')).toHaveCount(1);

		await page.getByTestId('columns').selectOption('3');
		await waitPreviewSettled(page);
		await expect(page.locator('.grid.cols-3')).toHaveCount(1);

		await page.getByTestId('vertical').selectOption('true');
		await waitPreviewSettled(page);
		await expect(page.locator('.grid.vertical')).toHaveCount(1);
		await expect(page.locator('[data-testid=sheet-page] [data-testid=problem]')).toHaveCount(12);
	});

	test('A12 答案页开关：页数×2', async ({ page }) => {
		await setConfig(page, { totalCount: 40, countPerPage: 20, showAnswerPage: false });
		await openHome(page);
		await expect(page.locator('[data-testid=sheet-page]')).toHaveCount(2);
		await expect(page.locator('[data-testid=answer-page]')).toHaveCount(0);

		await page.getByTestId('show-answer-page').check();
		await waitPreviewSettled(page);
		await expect(page.locator('[data-testid=sheet-page]')).toHaveCount(2);
		await expect(page.locator('[data-testid=answer-page]')).toHaveCount(2);
	});

	test('A13 自定义标题/姓名/日期出现在卷头', async ({ page }) => {
		await setConfig(page, {
			customTitle: 'E2E自定义卷',
			studentName: '测试同学',
			showDate: true,
			totalCount: 4,
			countPerPage: 4
		});
		await openHome(page);
		await expect(page.locator('.page-header h1').first()).toContainText('E2E自定义卷');
		await expect(page.locator('.page-header .info-value').first()).toContainText('测试同学');
		await expect(page.locator('.page-header').first()).toContainText(/\d/);
	});

	test('A14 生成按钮刷新题目且统计 generations+1', async ({ page }) => {
		await setConfig(page, { operations: ['add'], totalCount: 10, countPerPage: 10 });
		await openHome(page);
		const before = await problemTexts(page);
		const genBefore = await page.evaluate(() => {
			const s = JSON.parse(localStorage.getItem('little-math-stats') || '{}');
			return s.totalGenerations ?? 0;
		});
		await page.getByTestId('generate').click();
		await waitPreviewSettled(page);
		const after = await problemTexts(page);
		expect(after.length).toBe(before.length);
		const genAfter = await page.evaluate(() => {
			const s = JSON.parse(localStorage.getItem('little-math-stats') || '{}');
			return s.totalGenerations ?? 0;
		});
		expect(genAfter).toBeGreaterThanOrEqual(genBefore + 1);
	});

	test('A15 打印按钮可用（非 disabled）', async ({ page }) => {
		await setConfig(page, {});
		await openHome(page);
		await expect(page.getByTestId('print')).toBeEnabled();
	});

	test('A17 配置持久化：reload 后恢复', async ({ page }) => {
		await setConfig(page, {
			operations: ['mul'],
			range: { min: 2, max: 9 },
			columns: 3,
			customTitle: '持久化标题'
		});
		await openHome(page);
		await page.getByTestId('custom-title').fill('持久化标题');
		await page.getByTestId('columns').selectOption('3');
		await setOpsOnly(page, ['mul']);
		await waitPreviewSettled(page);
		await page.getByTestId('generate').click();
		await waitPreviewSettled(page);
		await page.reload();
		await page.waitForSelector('[data-testid=sheet-page]');
		await expect(page.getByTestId('custom-title')).toHaveValue('持久化标题');
		await expect(page.getByTestId('columns')).toHaveValue('3');
		await expect(page.getByTestId('op-mul')).toBeChecked();
	});

	test('A18 主题切换后 CSS 变量变化，预览仍有题', async ({ page }) => {
		await setConfig(page, { totalCount: 8, countPerPage: 8 });
		await openHome(page);
		const before = await page.locator('.sheet-container').evaluate((el) =>
			getComputedStyle(el).getPropertyValue('--theme-primary').trim()
		);
		await page.getByTestId('theme-cartoon').click();
		await page.waitForTimeout(200);
		const after = await page.locator('.sheet-container').evaluate((el) =>
			getComputedStyle(el).getPropertyValue('--theme-primary').trim()
		);
		expect(after).not.toBe(before);
		await expect(page.locator('[data-testid=sheet-page] [data-testid=problem]').first()).toBeVisible();
	});
});
