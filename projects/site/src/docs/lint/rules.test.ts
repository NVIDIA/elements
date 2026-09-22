import { describe, expect, it } from 'vitest';
import { createLintRules, lintRules } from './rules.js';
import { data, renderRulePage } from './rules/index.11ty.js';

describe('lint rule documentation', () => {
  it('should create one sorted record for every registered rule', () => {
    expect(createLintRules()).toHaveLength(42);
    expect(lintRules.map(rule => rule.name)).toEqual([...lintRules.map(rule => rule.name)].sort());
    expect(new Set(lintRules.map(rule => rule.name)).size).toBe(42);
  });

  it('should merge language registrations for shared rules', () => {
    expect(lintRules.find(rule => rule.name === 'no-deprecated-css-variable')).toMatchObject({
      languageLabel: 'HTML/CSS',
      severityLabel: 'error'
    });
  });

  it('should generate rule-specific permalinks', () => {
    const rule = lintRules.find(candidate => candidate.name === 'no-missing-icon-name');

    expect(data.permalink({ lintRule: rule })).toBe('docs/lint/rules/no-missing-icon-name/index.html');
    expect(data.eleventyComputed.title({ lintRule: rule })).toBe('@nvidia-elements/lint/no-missing-icon-name');
  });

  it('should render rule facts and escaped do and dont examples', async () => {
    const rule = lintRules.find(candidate => candidate.name === 'no-missing-icon-name');
    const page = await renderRulePage(rule);

    expect(page).toContain('<h1 nve-text="display emphasis semibold">@nvidia-elements/lint/no-missing-icon-name</h1>');
    expect(page).toContain('Require icon elements to have an icon name attribute.');
    expect(page).toContain('<dl aria-label="Rule details" nve-layout="grid gap:lg span-items:6">');
    expect(page).toContain('<dt nve-text="body sm medium muted">Language</dt>');
    expect(page).not.toContain('<nve-grid>');
    expect(page).toContain('<nve-badge status="success">Do</nve-badge>');
    expect(page).toContain('<nve-badge status="danger">Don\'t</nve-badge>');
    expect(page).toContain('&lt;nve-icon name=&quot;person&quot;&gt;');
    expect(page).toContain('&lt;nve-icon&gt;&lt;/nve-icon&gt;');
    expect(page).toContain('<h2 nve-text="heading xl emphasis">Additional resources</h2>');
    expect(page).toContain('https://eslint.org/docs/latest/use/configure/rules');
    expect(page).toContain('https://html-eslint.org/docs/getting-started');
    expect(page).toContain(
      'https://github.com/NVIDIA/elements/blob/main/projects/lint/src/eslint/rules/no-missing-icon-name.ts'
    );
  });
});
