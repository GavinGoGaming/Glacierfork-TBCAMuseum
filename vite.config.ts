import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		assetsInlineLimit: (filePath, content) => {
			return filePath.includes("src/assets/") ? false : content.length >= 4096;
		},
	},
});
