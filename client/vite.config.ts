import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
	plugins: [
		react(),
		svgr(),
		tailwindcss(),
		VitePWA({
			manifest: false,
			includeManifestIcons: false,
			injectRegister: false,
			registerType: 'prompt',
			includeAssets: ['favicon.ico', 'theme-init.js', 'manifest.webmanifest', 'icons/*.png'],
			workbox: {
				cacheId: 'onemate-static',
				globPatterns: ['index.html', 'assets/**/*.{js,css,woff,woff2,ttf,otf,svg,png,webp,jpg,jpeg}'],
				cleanupOutdatedCaches: true,
				skipWaiting: false,
				clientsClaim: false,
				navigateFallback: '/index.html',
				navigateFallbackAllowlist: [
					/^\/(?:\?.*)?$/,
					/^\/(?:dashboard|todo|kanban|monitoring|about|demo|terms|privacy|reset-password)\/?(?:\?.*)?$/,
					/^\/account\/(?:profile|deleted)\/?(?:\?.*)?$/,
					/^\/share\/[^/?]+\/?(?:\?.*)?$/,
					/^\/email\/verify\/[^/?]+\/[^/?]+\/?(?:\?.*)?$/,
				],
				navigateFallbackDenylist: [
					/^\/(?:api|sanctum|oauth|cloud)(?:\/|\?|$)/,
					/^\/auth\/authorize(?:\/|\?|$)/,
				],
			},
		}),
	],
	resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
	server: {
		host: '0.0.0.0',
		port: 3000,
		strictPort: true,
		proxy: {
			'/api': { target: 'http://localhost:8000', changeOrigin: true },
			'/cloud': { target: 'http://localhost:8000', changeOrigin: true },
			'/sanctum': { target: 'http://localhost:8000', changeOrigin: true },
			'/oauth': { target: 'http://localhost:8000', changeOrigin: true },
		},
	},
});
