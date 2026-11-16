// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Unicode ranges copied from Fontsource so the browser only downloads the
// latin-ext file when a page actually uses Croatian characters (č, ć, đ, š, ž).
const LATIN =
	'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT =
	'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

/**
 * Builds the two @font-face variants (latin + latin-ext) for one weight.
 * @param {string} file  file name prefix in src/assets/fonts, e.g. "poppins"
 * @param {number} weight
 */
const variants = (file, weight) => [
	{
		weight,
		style: /** @type {const} */ ('normal'),
		src: [`./src/assets/fonts/${file}-latin-${weight}-normal.woff2`],
		unicodeRange: /** @type {[string]} */ ([LATIN]),
	},
	{
		weight,
		style: /** @type {const} */ ('normal'),
		src: [`./src/assets/fonts/${file}-latin-ext-${weight}-normal.woff2`],
		unicodeRange: /** @type {[string]} */ ([LATIN_EXT]),
	},
];

// https://astro.build/config
export default defineConfig({
	// TODO: replace with the real domain once it is decided (PRD §13).
	// Used for canonical URLs, Open Graph URLs and the sitemap.
	site: 'https://example.com',
	integrations: [sitemap()],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Poppins',
			cssVariable: '--font-poppins',
			fallbacks: ['sans-serif'],
			options: {
				variants: [...variants('poppins', 500), ...variants('poppins', 600), ...variants('poppins', 700)],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Noticia Text',
			cssVariable: '--font-noticia-text',
			fallbacks: ['serif'],
			options: {
				variants: variants('noticia-text', 400),
			},
		},
	],
});
