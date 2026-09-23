import markdown from '../../../_11ty/libraries/markdown.js';
import { doDontShortcode } from '../../../_11ty/shortcodes/index.js';

export const data = {
  layout: 'docs.11ty.js',
  pagination: {
    data: 'lintRules',
    size: 1,
    alias: 'lintRule',
    addAllPagesToCollections: true
  },
  eleventyComputed: {
    title: data => `${data.lintRule.name} Lint Rule`,
    description: data => data.lintRule.description
  },
  permalink: data => `docs/lint/rules/${data.lintRule.name}/index.html`
};

function renderCode(code, language) {
  return markdown.render(`\`\`\`${language}\n${code}\n\`\`\``);
}

export async function renderRulePage(rule) {
  const examples = await doDontShortcode(
    `${renderCode(rule.examples.valid, rule.examples.language)}${renderCode(rule.examples.invalid, rule.examples.language)}`
  );
  const ruleId = markdown.utils.escapeHtml(rule.ruleId);
  const ruleName = markdown.utils.escapeHtml(rule.name);
  const description = markdown.utils.escapeHtml(rule.description);
  const sourceUrl = `https://github.com/NVIDIA/elements/blob/main/projects/lint/src/eslint/rules/${encodeURIComponent(rule.name)}.ts`;

  return /* html */ `
<nve-breadcrumb>
  <nve-button container="inline"><a href="/docs/lint/" target="_self">Lint</a></nve-button>
  <span>${ruleName}</span>
</nve-breadcrumb>

<header nve-layout="column gap:lg">
  <h1 nve-text="display emphasis semibold">${ruleId}</h1>
  <p nve-text="body lg">${description}</p>
  <dl aria-label="Rule details" nve-layout="grid gap:lg span-items:6">
    <div nve-layout="column gap:xs">
      <dt nve-text="body sm medium muted">Language</dt>
      <dd nve-text="body semibold">${rule.languageLabel}</dd>
    </div>
    <div nve-layout="column gap:xs">
      <dt nve-text="body sm medium muted">Severity</dt>
      <dd nve-text="body"><code nve-text="code">${rule.severityLabel}</code></dd>
    </div>
    <div nve-layout="column gap:xs">
      <dt nve-text="body sm medium muted">Category</dt>
      <dd nve-text="body semibold">${rule.category}</dd>
    </div>
    <div nve-layout="column gap:xs">
      <dt nve-text="body sm medium muted">Recommended</dt>
      <dd nve-text="body semibold">${rule.recommended ? 'Yes' : 'No'}</dd>
    </div>
  </dl>
</header>

<h2 nve-text="heading xl emphasis">Example</h2>

${examples}

<h2 nve-text="heading xl emphasis">Additional resources</h2>

<ul nve-text="list" nve-layout="column gap:sm pad-top:lg">
  <li><a href="https://eslint.org/docs/latest/use/configure/rules" target="_blank" rel="noopener" nve-text="link">Configure ESLint rules</a> to change rule severities and options.</li>
  <li><a href="https://html-eslint.org/docs/getting-started" target="_blank" rel="noopener" nve-text="link">HTML ESLint</a> documents the parser and plugin used to lint HTML.</li>
  <li><a href="/docs/lint/" nve-text="link">NVIDIA Elements lint overview</a> covers installation, configuration, and all available rules.</li>
  <li><a href="${sourceUrl}" target="_blank" rel="noopener" nve-text="link">View this rule on GitHub</a> to inspect its implementation and tests.</li>
</ul>
`;
}

export async function render(data) {
  return renderRulePage(data.lintRule);
}
