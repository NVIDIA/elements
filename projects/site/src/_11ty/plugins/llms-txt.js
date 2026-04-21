import { promises as fsp } from 'node:fs';
import markdownIt from 'markdown-it';
import { ApiService } from '@internals/tools/api';
import { ExamplesService } from '@internals/tools/examples';
import { prompts, skills } from '@internals/tools';
import { ELEMENTS_PAGES_BASE_URL } from '../utils/env.js';

const BASE = ELEMENTS_PAGES_BASE_URL || 'http://localhost:8082/elements';

const md = markdownIt({ html: true, linkify: true, breaks: false });
const CSS = `:root{color-scheme:light dark}body{font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:48rem;margin:0 auto;padding:2rem 1rem 4rem;color:#1a1a1a;background:#fff}@media (prefers-color-scheme:dark){body{color:#e6e6e6;background:#111}a{color:#6ea8ff}code,pre{background:#222}hr,td,th{border-color:#333}}code,pre{background:#f3f3f3}nav.crumbs{margin-bottom:2rem;font-size:.875rem}nav.crumbs a{color:inherit;opacity:.7;text-decoration:none}nav.crumbs a:hover{opacity:1;text-decoration:underline}h1,h2,h3,h4,h5,h6{line-height:1.25;margin:2em 0 .5em}h1{font-size:2rem;margin-top:0}h2{font-size:1.5rem;border-bottom:1px solid currentColor;padding-bottom:.3em;opacity:.95}h3{font-size:1.2rem}ol,p,ul{margin:.75em 0}a{color:#0969da}code{font:0.9em/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;padding:.1em .3em;border-radius:3px}pre{padding:1rem;border-radius:6px;overflow-x:auto}pre code{background:0 0;padding:0}table{border-collapse:collapse;width:100%;margin:1em 0;font-size:.9em}td,th{border:1px solid #ddd;padding:.5em .75em;text-align:left;vertical-align:top}th{background:#f7f7f7}@media (prefers-color-scheme:dark){th{background:#1a1a1a}}blockquote{border-left:4px solid #ccc;margin:1em 0;padding:.25em 1em;opacity:.85}hr{border:0;border-top:1px solid #eee;margin:2em 0}`;

async function writeDoc(path, markdown) {
  const nav = path.endsWith('context/index')
    ? ''
    : `<nav class="crumbs"><a href="${BASE}/context/index.html">← All context</a></nav>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="alternate" type="text/markdown" title="Markdown version" href="${path.replace('./.11ty-vite/public', BASE)}.md" /><meta name="viewport" content="width=device-width, initial-scale=1"><title>Elements</title><style>${CSS}</style></head><body>${nav}<main>${md.render(markdown).replaceAll('.md"', '.html"')}</main></body></html>`;
  await fsp.writeFile(`${path}.md`, markdown, 'utf-8');
  await fsp.writeFile(`${path}.html`, html, 'utf-8');
}

// https://llmstxt.org
export function llmsTxtPlugin(eleventyConfig) {
  eleventyConfig.on('eleventy.after', async () => {
    await fsp.mkdir('./.11ty-vite/public/context/skills/', { recursive: true });
    await fsp.mkdir('./.11ty-vite/public/context/api/', { recursive: true });
    await fsp.mkdir('./.11ty-vite/public/context/api/icons/', { recursive: true });
    await fsp.mkdir('./.11ty-vite/public/context/api/tokens/', { recursive: true });
    await fsp.mkdir('./.11ty-vite/public/context/examples/', { recursive: true });

    const skillsContent = `# Skills\n\nList of all available skills.\n\n${[...prompts, ...skills].map(s => `- [${s.name}](${BASE}/context/skills/${s.name}.md): ${s.description}`).join('\n')}`;
    await writeDoc('./.11ty-vite/public/context/skills/index', skillsContent);

    [...prompts, ...skills].forEach(async ({ name, context, handler }) => {
      const skill = handler ? handler().messages[0].content.text : context;
      await writeDoc(`./.11ty-vite/public/context/skills/${name}`, skill);
    });

    const cliReadme = await fsp.readFile('../cli/README.md', 'utf-8');
    const lintReadme = await fsp.readFile('../lint/README.md', 'utf-8');
    await writeDoc('./.11ty-vite/public/context/cli', cliReadme);
    await writeDoc('./.11ty-vite/public/context/lint', lintReadme);

    const { elements, attributes } = await ApiService.list({ format: 'json' });
    const apis = [...elements, ...attributes];
    const apiMarkdown = await Promise.all(
      apis.map(async e => {
        const api = String(await ApiService.get({ names: e.name, format: 'markdown' }));
        await writeDoc(`./.11ty-vite/public/context/api/${e.name.replace(/^nve-/, '')}`, api);
        return api;
      })
    );

    const apiContent = `## APIs\n\nAvailable APIs: \`nve-*\` custom elements and \`nve-*\` global style utility attributes.\n
${elements.map(e => `- [${e.name.replace(/^nve-/, '')}](${BASE}/context/api/${e.name.replace(/^nve-/, '')}.md): ${e.description}`).join('\n')}
${attributes.map(e => `- [${e.name.replace(/^nve-/, '')} (attribute utility)](${BASE}/context/api/${e.name.replace(/^nve-/, '')}.md): ${e.description}`).join('\n')}`;

    await writeDoc(`./.11ty-vite/public/context/api/index`, apiContent);

    const icons = await ApiService.iconsList({ format: 'markdown' });
    const iconsContent = `## Icons\n\nList of all available icon names for nve-icon and nve-icon-button.\n\n${icons}`;
    await writeDoc(`./.11ty-vite/public/context/api/icons/index`, iconsContent);

    const tokens = await ApiService.tokensList({ format: 'markdown' });
    const tokensContent = `## Tokens\n\nList of all available semantic CSS custom properties / design tokens for theming.\n\n${tokens}`;
    await writeDoc(`./.11ty-vite/public/context/api/tokens/index`, tokensContent);

    const examples = await ExamplesService.list({ format: 'json' });
    const exampleMarkdown = await Promise.all(
      examples.map(async ({ id }) => {
        const example = String(await ExamplesService.get({ id, format: 'markdown' }));
        await writeDoc(`./.11ty-vite/public/context/examples/${id}`, example);
        return example;
      })
    );

    const examplesContent = `# Examples\n\nList of all available UI patterns and example templates.\n\n${examples.map(({ id, summary }) => `- [${id.replace('patterns-', '').replace('elements-', '')}](${BASE}/context/examples/${id}.md): ${summary}`).join('\n')}`;
    await writeDoc(`./.11ty-vite/public/context/examples/index`, examplesContent);

    const content = `# Elements

> The design language for AI/ML factories. A framework-agnostic web-component library, theme system, and toolkit from NVIDIA for building exceptional AI/ML user experiences.

Elements ships Web Components/HTML custom elements (\`nve-*\`), design tokens, CSS utilities, server-side rendering support, and starter templates for TypeScript, React, Vue, Angular, Svelte, Lit, SolidJS, Preact, Next.js, Nuxt, Hugo, and Go. Accessibility (WCAG), theming, and internationalization are first-class. Components follow the ARIA Authoring Practices Guide and are distributed as framework-agnostic custom elements.

- [CLI/MCP](${BASE}/context/cli.md): Command-line and MCP server. Recommended starting point for agents and developers.
- [ESLint](${BASE}/context/lint.md): ESLint rules for Elements projects. Validate HTML and CSS for API best practices.
- [APIs List](${BASE}/context/api/index.md): List of all available Elements (nve-*) APIs and components.
- [Examples List](${BASE}/context/examples/index.md): List of all available UI patterns and example templates.
- [Skills List](${BASE}/context/skills/index.md): List of all available agent skills.
- [Icons List](${BASE}/context/api/icons/index.md): List of all available icon names for nve-icon and nve-icon-button.
- [Tokens List](${BASE}/context/api/tokens/index.md): List of all available semantic CSS custom properties / design tokens for theming.

For the complete documentation archive in a large single file, use [llms-full.txt](${BASE}/llms-full.txt). Intended for offline use or content vectorization.
`;

    await writeDoc('./.11ty-vite/public/context/index', content);
    await fsp.writeFile('./.11ty-vite/public/llms.txt', content, 'utf-8');

    const fullContent = [
      content,
      cliReadme,
      lintReadme,
      apiContent,
      ...apiMarkdown,
      iconsContent,
      tokensContent,
      examplesContent,
      ...exampleMarkdown
    ].join('\n\n');
    await fsp.writeFile('./.11ty-vite/public/llms-full.txt', fullContent, 'utf-8');
    await fsp.writeFile('./.11ty-vite/public/context/full.md', fullContent, 'utf-8');
  });
}
