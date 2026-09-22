import { elementsCssConfig, elementsHtmlConfig, elementsJsonConfig } from '@nvidia-elements/lint/eslint';

const PLUGIN_NAME = '@nvidia-elements/lint';
const SEVERITIES = new Map([
  [0, 'off'],
  [1, 'warn'],
  [2, 'error']
]);

const configs = [
  { language: 'HTML', config: elementsHtmlConfig },
  { language: 'CSS', config: elementsCssConfig },
  { language: 'JSON', config: elementsJsonConfig }
];

function getSeverity(config, ruleId) {
  const configured = config.rules?.[ruleId];
  const severity = Array.isArray(configured) ? configured[0] : configured;
  return SEVERITIES.get(severity) ?? severity;
}

function getRules(config) {
  const plugin = config.plugins?.[PLUGIN_NAME];
  if (!plugin || typeof plugin !== 'object' || !plugin.rules) {
    throw new Error(`Missing ${PLUGIN_NAME} rules in lint config.`);
  }
  return plugin.rules;
}

function getDocumentation(name, rule) {
  const documentation = rule?.meta?.docs;
  if (
    !documentation ||
    documentation.name !== name ||
    !documentation.description ||
    !documentation.category ||
    typeof documentation.recommended !== 'boolean' ||
    !documentation.examples?.language ||
    !documentation.examples.valid ||
    !documentation.examples.invalid
  ) {
    throw new Error(`Incomplete documentation metadata for ${name}.`);
  }
  return documentation;
}

export function createLintRules(ruleConfigs = configs) {
  const rules = new Map();

  for (const { config, language } of ruleConfigs) {
    for (const [name, rule] of Object.entries(getRules(config))) {
      const documentation = getDocumentation(name, rule);
      const ruleId = `${PLUGIN_NAME}/${name}`;
      const setting = { language, severity: getSeverity(config, ruleId) };
      const existing = rules.get(name);

      if (existing) {
        existing.settings.push(setting);
        continue;
      }

      rules.set(name, {
        name,
        ruleId,
        path: `/docs/lint/rules/${name}/`,
        description: documentation.description,
        category: documentation.category,
        recommended: documentation.recommended,
        examples: documentation.examples,
        settings: [setting]
      });
    }
  }

  return [...rules.values()]
    .map(rule => {
      const severities = [...new Set(rule.settings.map(setting => setting.severity))];
      return {
        ...rule,
        languageLabel: rule.settings.map(setting => setting.language).join('/'),
        severityLabel:
          severities.length === 1
            ? severities[0]
            : rule.settings.map(setting => `${setting.language}: ${setting.severity}`).join(', ')
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const lintRules = createLintRules();
