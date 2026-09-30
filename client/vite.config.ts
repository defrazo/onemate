import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
	base: '/',
	plugins: [
		react(),
		svgr(),
		tailwindcss(),
		visualizer({ filename: 'stats.html', template: 'treemap', gzipSize: true, open: false }),
	],
	resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
	build: { outDir: 'dist' },
	server: {
		host: '0.0.0.0',
		port: 3000,
		open: true,
		proxy: {
			'/api': { target: 'http://localhost:8000', changeOrigin: true },
			'/sanctum': { target: 'http://localhost:8000', changeOrigin: true },
		},
	},
});
