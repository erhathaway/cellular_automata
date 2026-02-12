import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			'$lib-core': '../lib',
			'$lib-core/*': '../lib/*'
		}
	},
	preprocess: [mdsvex({ extensions: ['.md', '.svx'] })],
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
