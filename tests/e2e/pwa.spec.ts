import { test, expect } from '@playwright/test';
import { openHome } from './helpers';

test('PWA：manifest / theme-color / apple-touch-icon / SW 注册', async ({ page }) => {
	await openHome(page);

	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
		'href',
		'/manifest.webmanifest'
	);
	await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#d4607f');

	const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
	expect(appleIcon).toMatch(/\/icons\/apple-touch-icon\.png$/);

	await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
		'content',
		'yes'
	);
	await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
		'content',
		'小小数学'
	);

	const manifest = await page.request.get('/manifest.webmanifest');
	expect(manifest.ok()).toBeTruthy();
	const body = await manifest.json();
	expect(body.name).toBe('小小数学家');
	expect(body.short_name).toBe('小小数学');
	expect(body.display).toBe('standalone');
	expect(body.start_url).toBe('/');
	expect(body.scope).toBe('/');
	expect(body.lang).toBe('zh-CN');
	expect(body.theme_color).toBe('#d4607f');
	expect(body.background_color).toBe('#fbf6f1');
	expect(body.icons?.length).toBeGreaterThanOrEqual(2);

	for (const icon of body.icons) {
		const res = await page.request.get(icon.src);
		expect(res.ok(), icon.src).toBeTruthy();
	}

	// preview / 生产会自动注册 SW；等 register 完成
	await expect
		.poll(async () =>
			page.evaluate(async () => {
				if (!('serviceWorker' in navigator)) return 'no-sw-api';
				const reg = await navigator.serviceWorker.getRegistration();
				return reg?.active?.state ?? reg?.installing?.state ?? reg?.waiting?.state ?? 'none';
			})
		)
		.not.toBe('none');
});
