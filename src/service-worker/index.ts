/**
 * 生产环境 Service Worker：预缓存构建产物与 static 资源；
 * 离线时壳页与已缓存资源可打开。不做过度缓存（跳过非 GET / no-store）。
 * 见 https://svelte.dev/docs/kit/service-workers
 */
import { self } from '$app/service-worker';
import { version } from '$app/env';
import { immutable, assets, prerendered } from '$app/manifest';
import { asset, resolve } from '$app/paths';

const CACHE = `little-math-${version}`;

/** 把相对路径统一成以 / 开头的 pathname（本站未配置 paths.base） */
function toPathname(path: string): string {
	return path.startsWith('/') ? path : `/${path}`;
}

/**
 * immutable 为 Vite 构建产物（string）；assets 用 asset()；
 * prerendered 为路由 Path（本站目前为空，预留）。
 */
const ASSETS: string[] = [
	...immutable.map((a) => toPathname(a.path)),
	...assets.map((a) => asset(a.path)),
	...prerendered.map((a) => toPathname(a.path))
];

/** 导航离线回退的壳页 */
const SHELL = resolve('/');

self.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		const toCache = [...new Set([...ASSETS, SHELL])];
		await cache.addAll(toCache);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// 同源预缓存资源：直接走缓存
		if (url.origin === self.location.origin && ASSETS.includes(url.pathname)) {
			const cached = await cache.match(url.pathname);
			if (cached) return cached;
		}

		try {
			const response = await fetch(event.request);

			// 只缓存成功且允许存储的同源响应（避免把会变的 API / no-store 塞进缓存）
			if (
				response.status === 200 &&
				url.origin === self.location.origin &&
				!response.headers.get('cache-control')?.includes('no-store')
			) {
				void cache.put(event.request, response.clone());
			}

			return response;
		} catch (error) {
			const cached = await cache.match(event.request);
			if (cached) return cached;

			if (event.request.mode === 'navigate') {
				const shell = (await cache.match(SHELL)) ?? (await cache.match('/'));
				if (shell) return shell;
			}

			throw error;
		}
	}

	event.respondWith(respond());
});
