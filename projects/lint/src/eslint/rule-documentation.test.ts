// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it } from 'vitest';
import { Linter, type Linter as LinterTypes, type Rule } from 'eslint';
import { elementsCssConfig } from './configs/css.js';
import { elementsHtmlConfig } from './configs/html.js';
import { elementsJsonConfig } from './configs/json.js';
import { DEPRECATED_ATTRIBUTE_VALUES } from './rules/no-deprecated-global-attribute-value.js';
import type { LintRuleDocumentation, LintRuleExampleLanguage } from './rule-documentation.js';

const PLUGIN_NAME = '@nvidia-elements/lint';

interface DocumentedRule extends Rule.RuleModule {
  meta: Rule.RuleMetaData & { docs: LintRuleDocumentation };
}

interface RuleConfig {
  language: LintRuleExampleLanguage;
  filename: string;
  files: string[];
  config: LinterTypes.Config;
}

const configs: RuleConfig[] = [
  { language: 'html', filename: 'src/example.html', files: ['**/*.html'], config: elementsHtmlConfig },
  { language: 'css', filename: 'src/example.css', files: ['**/*.css'], config: elementsCssConfig },
  { language: 'json', filename: 'package.json', files: ['**/*.json'], config: elementsJsonConfig }
];

function getRules(config: LinterTypes.Config): Record<string, DocumentedRule> {
  return config.plugins?.[PLUGIN_NAME]?.rules as unknown as Record<string, DocumentedRule>;
}

function getDocumentedRules(): Array<{ name: string; rule: DocumentedRule }> {
  const rules = new Map<string, DocumentedRule>();
  for (const { config } of configs) {
    for (const [name, rule] of Object.entries(getRules(config))) rules.set(name, rule);
  }
  return [...rules].map(([name, rule]) => ({ name, rule }));
}

function lintExample(name: string, documentation: LintRuleDocumentation, code: string) {
  const selected = configs.find(
    ({ config, language }) => language === documentation.examples.language && name in getRules(config)
  );
  if (!selected) throw new Error(`No ${documentation.examples.language} config registers ${name}.`);

  const { language, languageOptions, plugins } = selected.config;
  const config: LinterTypes.Config = {
    files: selected.files,
    ...(language ? { language } : {}),
    ...(languageOptions ? { languageOptions } : {}),
    plugins,
    rules: { [`${PLUGIN_NAME}/${name}`]: 'error' }
  };

  return new Linter().verify(code, config, { filename: selected.filename });
}

afterEach(() => {
  delete DEPRECATED_ATTRIBUTE_VALUES['nve-text'];
});

describe('rule documentation', () => {
  it('should document every registered rule', () => {
    const rules = getDocumentedRules();

    expect(rules).toHaveLength(42);
    for (const { name, rule } of rules) {
      expect(rule.meta.docs).toMatchObject({
        name,
        description: expect.any(String),
        category: expect.stringMatching(/^(Accessibility|Best Practice)$/),
        recommended: expect.any(Boolean),
        examples: {
          language: expect.stringMatching(/^(css|html|json)$/),
          valid: expect.any(String),
          invalid: expect.any(String)
        }
      });
      expect(rule.meta.docs.url).toMatch(new RegExp(`/docs/lint/rules/${name}/$`));
    }
  });

  it.each(getDocumentedRules())('should verify the documented examples for $name', ({ name, rule }) => {
    if (name === 'no-deprecated-global-attribute-value') {
      DEPRECATED_ATTRIBUTE_VALUES['nve-text'] = { default: 'body' };
    }

    const id = `${PLUGIN_NAME}/${name}`;
    const validMessages = lintExample(name, rule.meta.docs, rule.meta.docs.examples.valid);
    const invalidMessages = lintExample(name, rule.meta.docs, rule.meta.docs.examples.invalid);

    expect(validMessages.filter(message => message.ruleId === id)).toEqual([]);
    expect(invalidMessages.some(message => message.ruleId === id)).toBe(true);
  });
});
