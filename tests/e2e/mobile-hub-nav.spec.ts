import { test, expect } from '@playwright/test';
import { openHome, openMobileHub, setConfig } from './helpers';

test.describe('移动端 Hub 导航（方案二）', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('Hub 首页：问候语、四宫格、无桌面顶栏 Tab', async ({ page }) => {
		await openMobileHub(page);
		await expect(page.getByText('今天想做什么？')).toBeVisible();
		await expect(page.getByTestId('hub-card-print')).toBeVisible();
		await expect(page.getByTestId('hub-card-practice')).toBeVisible();
		await expect(page.getByTestId('app-header')).toBeHidden();
		await expect(page.getByTestId('mobile-app-header')).toBeVisible();
		await expect(page.getByTestId('nav-practice')).toBeHidden();
	});

	test('根路径 / 会进入 Hub', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/hub$/);
		await expect(page.getByTestId('mobile-hub')).toBeVisible();
	});

	test('打印题：返回 Hub、主题底部 sheet、出题按钮首屏可见', async ({ page }) => {
		await setConfig(page, {});
		await page.goto('/print');
		await expect(page.getByTestId('mobile-nav-back')).toBeVisible();
		await expect(page.getByTestId('generate')).toBeVisible();
		const generateBox = await page.getByTestId('generate').boundingBox();
		expect(generateBox).toBeTruthy();
		expect(generateBox!.y).toBeLessThan(844 * 0.92);

		await page.getByTestId('mobile-nav-back').click();
		await expect(page).toHaveURL(/\/hub$/);

		await page.getByTestId('hub-card-print').click();
		await expect(page).toHaveURL(/\/print$/);

		await page.getByTestId('mobile-theme-open').click();
		await expect(page.getByTestId('ui-theme-sheet')).toBeVisible();
		await page.getByTestId('ui-theme-sheet-b').click();
		await expect(page.locator('html')).toHaveAttribute('data-ui-theme', 'b');
		await expect(page.getByTestId('ui-theme-sheet')).toHaveCount(0);
	});

	test('练习页返回 Hub', async ({ page }) => {
		await page.goto('/practice');
		await page.getByTestId('mobile-nav-back').click();
		await expect(page).toHaveURL(/\/hub$/);
	});

	test('统计 FAB 在功能页仍可见', async ({ page }) => {
		await setConfig(page, {});
		await page.goto('/print');
		await expect(page.getByTestId('stats-toggle')).toBeVisible();
	});

	test('打印页：操作栏贴底，末项可滚到操作栏上方', async ({ page }) => {
		await setConfig(page, {});
		await page.goto('/print');
		await expect(page.locator('html')).toHaveAttribute('data-mobile-feature', '1');

		const bar = page.locator('.button-group');
		await expect(bar).toBeVisible();
		const barBox = await bar.boundingBox();
		expect(barBox).toBeTruthy();
		const vp = page.viewportSize()!;
		expect(barBox!.y + barBox!.height).toBeGreaterThan(vp.height - 4);
		expect(barBox!.y + barBox!.height).toBeLessThan(vp.height + 2);

		const answerOpt = page.getByText('加一张答案', { exact: true });
		await answerOpt.scrollIntoViewIfNeeded();
		const optBox = await answerOpt.boundingBox();
		expect(optBox).toBeTruthy();
		expect(optBox!.y + optBox!.height).toBeLessThanOrEqual(barBox!.y + 1);

		const statsBox = await page.getByTestId('stats-toggle').boundingBox();
		expect(statsBox).toBeTruthy();
		expect(statsBox!.y + statsBox!.height).toBeLessThanOrEqual(barBox!.y + 2);
	});
});

test.describe('桌面顶栏中等宽度', () => {
	test('769–1100px：主题收成按钮，导航仍一行', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 900 });
		await setConfig(page, {});
		await openHome(page);
		await expect(page.getByTestId('app-header')).toBeVisible();
		await expect(page.getByTestId('ui-theme-compact')).toBeVisible();
		await expect(page.getByTestId('ui-theme-switcher')).toHaveCount(0);
		await expect(page.getByTestId('nav-practice')).toBeVisible();

		const navBox = await page.getByTestId('nav-practice').boundingBox();
		const brandBox = await page.locator('.ah-brand').boundingBox();
		expect(navBox && brandBox).toBeTruthy();
		expect(Math.abs(navBox!.y - brandBox!.y)).toBeLessThan(8);

		await page.getByTestId('ui-theme-compact').click();
		await expect(page.getByTestId('ui-theme-sheet')).toBeVisible();
		await page.getByTestId('ui-theme-sheet-c').click();
		await expect(page.locator('html')).toHaveAttribute('data-ui-theme', 'c');
	});

	test('宽屏仍显示完整主题切换', async ({ page }) => {
		await page.setViewportSize({ width: 1400, height: 1000 });
		await openHome(page);
		await expect(page.getByTestId('ui-theme-switcher')).toBeVisible();
		await expect(page.getByTestId('ui-theme-compact')).toHaveCount(0);
	});
});
