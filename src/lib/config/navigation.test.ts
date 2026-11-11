import { describe, expect, it } from 'vitest';
import { HUB_PATH, isHubHomePath, isMobileFeaturePath, navItemForPath, pathIsActive } from './navigation.js';

describe('navigation helpers', () => {
	it('hub path', () => {
		expect(isHubHomePath(HUB_PATH)).toBe(true);
		expect(isHubHomePath('/print')).toBe(false);
	});

	it('mobile feature paths', () => {
		expect(isMobileFeaturePath('/print')).toBe(true);
		expect(isMobileFeaturePath('/practice')).toBe(true);
		expect(isHubHomePath('/')).toBe(false);
	});

	it('nav item lookup', () => {
		expect(navItemForPath('/print')?.label).toBe('打印题');
		expect(navItemForPath('/practice')?.label).toBe('做题');
	});

	it('active path includes print alias for home', () => {
		expect(pathIsActive('/print', '/')).toBe(true);
		expect(pathIsActive('/hub', '/')).toBe(false);
	});
});
