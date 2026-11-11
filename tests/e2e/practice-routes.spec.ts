import { test, expect } from '@playwright/test';
import { enterPracticeAnswer } from './helpers';

async function startPractice(
	page: import('@playwright/test').Page,
	opts: { mode?: string; count?: number; ops?: string[]; alreadyOnPractice?: boolean } = {}
) {
	if (!opts.alreadyOnPractice) await page.goto('/practice');
	if (opts.mode) await page.getByTestId('practice-mode').selectOption(opts.mode);
	if (opts.count != null) {
		await page.locator('label', { hasText: '做几道' }).locator('input').fill(String(opts.count));
	}
	if (opts.ops) {
		for (const label of ['加法', '减法', '乘法', '除法']) {
			const box = page.locator('label', { hasText: new RegExp(`^${label}$`) }).locator('input[type=checkbox]');
			if (await box.count()) {
				const want = opts.ops.includes(label);
				if (want) await box.check();
				else await box.uncheck();
			}
		}
	}
	await page.getByTestId('practice-start').click();
	await expect(page.getByTestId('practice-progress')).toContainText('第 1 /');
}

test.describe('B. 在线练习', () => {
	test('B1 各模式能开始：normal/makeTarget/chain/compare/remainder', async ({ page }) => {
		for (const mode of ['normal', 'makeTarget', 'chain', 'compare', 'remainder']) {
			await startPractice(page, { mode, count: 2 });
			await expect(page.getByTestId('practice-progress')).toContainText('第 1 / 2');
		}
	});

	test('B2/B4 即时反馈与结果页正确率/用时', async ({ page }) => {
		await startPractice(page, { mode: 'normal', count: 1, ops: ['加法'] });
		await enterPracticeAnswer(page, '99999');
		await expect(page.getByTestId('feedback')).toContainText(/正确|错误|答/);
		await page.getByRole('button', { name: /看看成绩/ }).click();
		await expect(page.getByTestId('practice-result')).toBeVisible();
		await expect(page.getByTestId('result-accuracy')).toBeVisible();
		await expect(page.getByTestId('practice-result')).toContainText(/用时|秒|分/);
	});

	test('B3 计时器走动', async ({ page }) => {
		await startPractice(page, { mode: 'normal', count: 3, ops: ['加法'] });
		const t0 = await page.getByTestId('timer-value').innerText();
		await page.waitForTimeout(1600);
		const t1 = await page.getByTestId('timer-value').innerText();
		expect(t1).not.toBe(t0);
	});

	test('B6 普通计算错题进错题本', async ({ page }) => {
		await page.goto('/practice');
		await page.evaluate(() => localStorage.removeItem('little-math-wrong-book'));
		await startPractice(page, { mode: 'normal', count: 1, ops: ['加法'] });
		await enterPracticeAnswer(page, '99999');
		await expect(page.getByTestId('feedback')).toContainText('正确答案');
		const wrongBook = await page.evaluate(() => JSON.parse(localStorage.getItem('little-math-wrong-book') || '[]'));
		expect(wrongBook.length).toBe(1);
	});

	function stubSpeech() {
		return `(() => {
			const spoken = [];
			(window).speechSynthesis = {
				speaking: false,
				pending: false,
				paused: false,
				getVoices: () => [{ lang: 'zh-CN', name: 'stub' }],
				speak: (u) => { spoken.push(u && u.text); if (u && typeof u.onend === 'function') setTimeout(() => u.onend(), 0); },
				cancel: () => {},
				pause: () => {},
				resume: () => {},
				addEventListener: () => {},
				removeEventListener: () => {}
			};
			(window).SpeechSynthesisUtterance = function (text) { this.text = text; };
			(window).__spoken = spoken;
		})()`;
	}

	test('B9 语音读题按钮与开关', async ({ page }) => {
		await page.addInitScript(stubSpeech());
		await page.goto('/practice');
		const toggle = page.getByTestId('voice-toggle');
		await expect(toggle).toBeVisible();
		await expect(toggle).toContainText('语音');
		await startPractice(page, { mode: 'normal', count: 1, ops: ['加法'] });
		await expect(page.getByTestId('voice-toggle')).toBeVisible();
		const btn = page.getByTestId('speech-btn');
		await expect(btn).toBeVisible();
		await btn.click();
		await expect(page.getByTestId('practice-area')).toBeVisible();
		// 关掉语音后喇叭消失，只保留开关
		await page.getByTestId('voice-toggle').click();
		await expect(page.getByTestId('speech-btn')).toHaveCount(0);
		await expect(page.getByTestId('voice-toggle')).toContainText('语音');
		const stored = await page.evaluate(() => localStorage.getItem('little-math-voice-enabled'));
		expect(stored).toBe('0');
	});
});

test.describe('C. 错题本', () => {
	test('C1 空状态文案', async ({ page }) => {
		await page.addInitScript(() => localStorage.setItem('little-math-wrong-book', '[]'));
		await page.goto('/wrong-book');
		await expect(page.getByTestId('wrong-book-empty')).toContainText('没有错题');
	});

	test('C2/C3 练习做错后可见，复习入口可点', async ({ page }) => {
		await page.goto('/practice');
		await page.evaluate(() => localStorage.removeItem('little-math-wrong-book'));
		await startPractice(page, { mode: 'normal', count: 1, ops: ['加法'] });
		await enterPracticeAnswer(page, '99999');
		await expect(page.getByTestId('feedback')).toContainText('正确答案');
		const n = await page.evaluate(() => JSON.parse(localStorage.getItem('little-math-wrong-book') || '[]').length);
		expect(n).toBe(1);
		await page.goto('/wrong-book');
		await expect(page.getByTestId('wrong-record')).toHaveCount(1);
		await expect(page.getByTestId('wrong-book-review')).toBeVisible();
		await page.getByTestId('wrong-book-review').click();
		await expect(page).toHaveURL(/practice/);
		await expect(page.locator('body')).toBeVisible();
	});
});

test.describe('D. 收藏', () => {
	test('D1 空状态', async ({ page }) => {
		await page.addInitScript(() => localStorage.setItem('little-math-favorites', '[]'));
		await page.goto('/favorites');
		await expect(page.getByTestId('favorites-empty')).toContainText('还没有收藏');
	});

	test('D2/D3 收藏后出现，可取消', async ({ page }) => {
		await page.goto('/practice');
		await page.evaluate(() => localStorage.setItem('little-math-favorites', '[]'));
		await startPractice(page, { mode: 'normal', count: 1, ops: ['加法'] });
		await enterPracticeAnswer(page, '99999');
		await page.getByRole('button', { name: /看看成绩/ }).click();
		await page.getByTestId('favorite-btn').first().click();
		const n = await page.evaluate(() => JSON.parse(localStorage.getItem('little-math-favorites') || '[]').length);
		expect(n).toBe(1);
		await page.goto('/favorites');
		await expect(page.getByTestId('favorite-record')).toHaveCount(1);
		await page.getByTestId('favorite-remove').click();
		await expect(page.getByTestId('favorites-empty')).toBeVisible();
	});
});

test.describe('E. 统计面板', () => {
	test('E1/E2 打开统计，生成后计数增加', async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('[data-testid=sheet-page]');
		await page.getByTestId('stats-toggle').click();
		await expect(page.getByTestId('stats-panel')).toBeVisible();
		await expect(page.getByTestId('stat-visits')).toContainText(/\d/);
		const genBefore = Number((await page.getByTestId('stat-generations').locator('.stat-value').innerText()).trim());
		await page.getByTestId('generate').click();
		await page.waitForTimeout(1200);
		const genAfter = Number((await page.getByTestId('stat-generations').locator('.stat-value').innerText()).trim());
		expect(genAfter).toBeGreaterThanOrEqual(genBefore + 1);
	});

	test('E3 导出 JSON/CSV 触发 download', async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('[data-testid=sheet-page]');
		await page.getByTestId('stats-toggle').click();
		const [dlJson] = await Promise.all([
			page.waitForEvent('download'),
			page.getByTestId('stats-export-json').click()
		]);
		expect(dlJson.suggestedFilename()).toMatch(/\.json$/i);
		const [dlCsv] = await Promise.all([
			page.waitForEvent('download'),
			page.getByTestId('stats-export-csv').click()
		]);
		expect(dlCsv.suggestedFilename()).toMatch(/\.csv$/i);
	});

	test('E4 重置统计确认后归零', async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('[data-testid=sheet-page]');
		await page.getByTestId('generate').click();
		await page.getByTestId('stats-toggle').click();
		page.once('dialog', (d) => d.accept());
		await page.getByTestId('stats-reset').click();
		await page.waitForTimeout(200);
		await expect(page.getByTestId('stat-generations').locator('.stat-value')).toHaveText('0');
	});
});

test.describe('F. 成就', () => {
	test('F1 临界值触发 Toast 或写入成就存储', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem(
				'little-math-stats',
				JSON.stringify({
					totalVisits: 1,
					totalGenerations: 0,
					totalPrints: 0,
					totalAnswered: 9,
					totalCorrect: 0,
					operationsCount: { add: 0, sub: 0, mul: 0, div: 0 },
					answeredByOp: { add: 0, sub: 0, mul: 0, div: 0 },
					dailyStats: {},
					lastVisitDate: ''
				})
			);
			localStorage.setItem('little-math-achievements', '[]');
		});
		await startPractice(page, { mode: 'normal', count: 1, ops: ['加法'] });
		await enterPracticeAnswer(page, '0');
		await page.waitForTimeout(500);
		const toast = page.getByTestId('achievement-toast');
		const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('little-math-achievements') || '[]'));
		const hasToast = (await toast.count()) > 0;
		const hasStore = stored.some((a: { achievementId: string }) => a.achievementId === 'first-10');
		expect(hasToast || hasStore).toBe(true);
	});
});

test.describe('G. 移动端响应式', () => {
	test('G1 viewport 390×844 首页与练习控件可见', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/print');
		await expect(page.getByTestId('generate')).toBeVisible();
		await expect(page.getByTestId('print')).toBeVisible();
		const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
		expect(overflowX).toBeLessThan(40);

		await page.goto('/practice');
		await expect(page.getByTestId('practice-start')).toBeVisible();
		await expect(page.getByTestId('practice-mode')).toBeVisible();
	});
});

test.describe('H. 做题防误退出', () => {
	test('H1 对局中点退出：第一次提示，第二次回配置', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await startPractice(page, { mode: 'normal', count: 3, ops: ['加法'] });
		await expect(page.getByTestId('practice-exit')).toBeVisible();

		await page.getByTestId('practice-exit').click();
		await expect(page.getByTestId('exit-hint')).toContainText('再按一次');
		await expect(page.getByTestId('practice-area')).toBeVisible();

		await page.getByTestId('practice-exit').click();
		await expect(page.getByTestId('practice-start')).toBeVisible();
		await expect(page.getByTestId('practice-area')).toHaveCount(0);
	});

	test('H2 对局中点顶栏导航：第一次拦住，第二次才离开', async ({ page }) => {
		await startPractice(page, { mode: 'normal', count: 3, ops: ['加法'] });
		await page.getByTestId('nav-home').click();
		await expect(page.getByTestId('exit-hint')).toContainText('再按一次');
		await expect(page).toHaveURL(/\/practice/);
		await expect(page.getByTestId('practice-area')).toBeVisible();

		await page.getByTestId('nav-home').click();
		await expect(page.getByTestId('generate')).toBeVisible();
		await expect(page.getByTestId('practice-area')).toHaveCount(0);
	});

	test('H3 浏览器返回：第一次不离局，第二次离开', async ({ page }) => {
		// 站内进入 + pushState 垫层：模拟手机侧滑/系统返回
		await page.goto('/');
		await expect(page.getByTestId('generate')).toBeVisible();
		await page.getByTestId('nav-practice').click();
		await expect(page.getByTestId('practice-start')).toBeVisible();
		await startPractice(page, { alreadyOnPractice: true, mode: 'normal', count: 2, ops: ['加法'] });
		await expect(page.getByTestId('practice-area')).toBeVisible();
		await expect
			.poll(async () => page.evaluate(() => !!(history.state && history.state.__lmExitGuard)))
			.toBe(true);

		await page.goBack();
		await expect(page.getByTestId('exit-hint')).toContainText('再按一次');
		await expect(page.getByTestId('practice-area')).toBeVisible();
		await expect(page).toHaveURL(/\/practice/);

		await page.goBack();
		await expect(page.getByTestId('generate')).toBeVisible();
		await expect(page.getByTestId('practice-area')).toHaveCount(0);
	});

	test('H4 结果页回首页不拦', async ({ page }) => {
		await startPractice(page, { mode: 'normal', count: 1, ops: ['加法'] });
		await enterPracticeAnswer(page, '99999');
		await page.getByRole('button', { name: /看看成绩/ }).click();
		await expect(page.getByTestId('practice-result')).toBeVisible();
		await page.getByRole('button', { name: /回首页/ }).click();
		await expect(page.getByTestId('generate')).toBeVisible();
		await expect(page.getByTestId('exit-hint')).toHaveCount(0);
	});

	test('H5 配置页不拦导航', async ({ page }) => {
		await page.goto('/practice');
		await expect(page.getByTestId('practice-start')).toBeVisible();
		await page.getByTestId('nav-home').click();
		await expect(page.getByTestId('generate')).toBeVisible();
		await expect(page.getByTestId('exit-hint')).toHaveCount(0);
	});

	test('H6 直达 /practice 开局后侧滑：第一次垫层拦住', async ({ page }) => {
		// 无站内上一页时，仍靠 pushState 垫层拦住第一次返回
		await startPractice(page, { mode: 'normal', count: 2, ops: ['加法'] });
		await expect
			.poll(async () => page.evaluate(() => !!(history.state && history.state.__lmExitGuard)))
			.toBe(true);
		await page.goBack();
		await expect(page.getByTestId('exit-hint')).toContainText('再按一次');
		await expect(page.getByTestId('practice-area')).toBeVisible();
		await expect(page).toHaveURL(/\/practice/);
	});
});

test.describe('I. 自绘数字键盘', () => {
	test('I1 窄屏对局用自绘键、无系统 number input', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await startPractice(page, { mode: 'normal', count: 1, ops: ['加法'] });
		await expect(page.getByTestId('numeric-keypad')).toBeVisible();
		await expect(page.getByTestId('answer-display')).toBeVisible();
		await expect(page.locator('.answer-input input[type=number]')).toHaveCount(0);
		await expect(page.locator('input[inputmode=numeric]')).toHaveCount(0);
		await enterPracticeAnswer(page, '1');
		await expect(page.getByTestId('feedback')).toBeVisible();
	});

	test('I2 比较模式大按钮可点', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await startPractice(page, { mode: 'compare', count: 1 });
		await expect(page.getByTestId('compare-input')).toBeVisible();
		await page.getByTestId('compare-eq').click();
		await expect(page.getByTestId('feedback')).toBeVisible();
	});

	test('I3 余数模式自绘键可提交', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await startPractice(page, { mode: 'remainder', count: 1 });
		await expect(page.getByTestId('remainder-input')).toBeVisible();
		await expect(page.getByTestId('numeric-keypad')).toBeVisible();
		// 乱填也能出反馈
		for (const d of '9') await page.getByTestId(`keypad-digit-${d}`).click();
		// both 可能要填两项；若只有商，好了可点；若 both 则再点余数框
		const remField = page.getByTestId('remainder-field-remainder');
		if (await remField.count()) {
			await remField.click();
			await page.getByTestId('keypad-digit-1').click();
		}
		await page.getByTestId('keypad-submit').click();
		await expect(page.getByTestId('feedback')).toBeVisible();
	});
});
