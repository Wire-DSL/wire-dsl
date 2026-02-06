// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rehypeWirePreviewPlugin from './src/lib/rehype-wire-previews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wireGrammar = JSON.parse(
	readFileSync(join(__dirname, 'src/assets/wire.tmLanguage.json'), 'utf-8')
);

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Wire-DSL Documentation',
			description: 'Build wireframes with code, not clicks',
			components: {
				Head: './src/components/Head.astro',
			},
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/wire-dsl/wire-dsl' },
				{ icon: 'rocket', label: 'Web Preview', href: 'https://live.wire-dsl.org' },
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Your First Wireframe', slug: 'getting-started/first-wire' },
						{ label: 'Web Preview', slug: 'getting-started/web-preview' },
					],
				},
				{
					label: 'Language Guide',
					items: [
						{ label: 'Syntax', slug: 'language/syntax' },
						{ label: 'Components', slug: 'language/components' },
						{ label: 'Containers', slug: 'language/containers' },
						{ label: 'Theming', slug: 'language/theming' },
						{ label: 'Icons', slug: 'language/icons' },
					],
				},
				{
					label: 'Architecture',
					items: [
						{ label: 'Overview', slug: 'architecture/overview' },
						{ label: 'IR Format', slug: 'architecture/ir-format' },
						{ label: 'Layout Engine', slug: 'architecture/layout-engine' },
						{ label: 'Validation', slug: 'architecture/validation' },
					],
				},
				{
					label: 'Examples',
					items: [
						{ label: 'Example Catalog', slug: 'examples' },
					],
				},
				{
					label: 'Tooling',
					items: [
						{ label: 'CLI Reference', slug: 'tooling/cli' },
						{ label: 'Web Editor', slug: 'tooling/web-editor' },
						{ label: 'LLM Prompting', slug: 'tooling/llm-prompting' },
					],
				},
				{
					label: 'Contributing',
					items: [
						{ label: 'Development Guide', slug: 'contribute/development' },
						{ label: 'Roadmap', slug: 'contribute/roadmap' },
					],
				},
			],
			customCss: ['./src/styles/custom.css'],
		}),
	],
	markdown: {
		rehypePlugins: [rehypeWirePreviewPlugin],
		shikiConfig: {
			langs: [
				{
					id: 'wire',
					scopeName: wireGrammar.scopeName,
					grammar: wireGrammar,
					aliases: ['wire', 'wire-dsl'],
				},
			],
		},
	},
});
