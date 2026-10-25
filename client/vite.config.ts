import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
	plugins: [react(), svgr(), tailwindcss()],
	resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
	server: {
		host: '0.0.0.0',
		port: 3000,
		strictPort: true,
		proxy: {
			'/api': { target: 'http://localhost:8000', changeOrigin: true },
			'/sanctum': { target: 'http://localhost:8000', changeOrigin: true },
			'/oauth': { target: 'http://localhost:8000', changeOrigin: true },
		},
	},
});
