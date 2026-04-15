import { findHtmlTemplate, getTemplateText, hasTag } from './example-helpers.js';

const APPROVED_DOMAINS = ['nvidia.com', 'github.com'];
const URL_ATTRIBUTES = ['href', 'src', 'srcset'];
const URL_ATTRIBUTE_PATTERN = new RegExp(`\\b(${URL_ATTRIBUTES.join('|')})\\s*=\\s*("([^"]*)"|'([^']*)')`, 'gi');

function isAllowedDomain(hostname) {
  return APPROVED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
}

function isRelativeReference(value) {
  if (
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('#') ||
    value.startsWith('?')
  ) {
    return true;
  }

  // Paths like "images/demo.png" are relative references.
  if (!value.startsWith('//') && !/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) {
    return true;
  }

  return false;
}

function getUnapprovedDomain(value) {
  const trimmed = value.trim();
  if (!trimmed || isRelativeReference(trimmed)) {
    return null;
  }

  const isHttpUrl = /^(https?:)?\/\//i.test(trimmed);
  if (!isHttpUrl) {
    return null;
  }

  const candidate = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (isAllowedDomain(hostname)) {
    return null;
  }

  return hostname;
}

function getSrcsetCandidates(value) {
  return value
    .split(',')
    .map(candidate => candidate.trim())
    .filter(Boolean)
    .map(candidate => candidate.split(/\s+/)[0] ?? '')
    .filter(Boolean);
}

/**
 * ESLint rule that rejects unapproved domains in example template URL references.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'example-approved-domains',
    docs: {
      description: 'Disallow unapproved external domains in example template links and source references.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'unapproved-domain':
        'Example `{{name}}` uses unapproved domain `{{domain}}` in `{{attribute}}`. Use only approved domains ({{allowed}}) or relative paths.'
    }
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration || node.declaration.type !== 'VariableDeclaration') {
          return;
        }

        const declarator = node.declaration.declarations[0];
        if (!declarator || declarator.id.type !== 'Identifier') {
          return;
        }

        if (hasTag(context, node, 'test-case')) {
          return;
        }

        const template = findHtmlTemplate(declarator.init);
        if (!template) {
          return;
        }

        const name = declarator.id.name;
        const templateText = getTemplateText(template);

        for (const match of templateText.matchAll(URL_ATTRIBUTE_PATTERN)) {
          const attribute = match[1]?.toLowerCase() ?? '';
          const value = (match[3] ?? match[4] ?? '').trim();
          if (!attribute || !value) {
            continue;
          }

          const candidates = attribute === 'srcset' ? getSrcsetCandidates(value) : [value];
          for (const candidate of candidates) {
            const unapprovedDomain = getUnapprovedDomain(candidate);
            if (!unapprovedDomain) {
              continue;
            }

            context.report({
              node,
              messageId: 'unapproved-domain',
              data: {
                name,
                domain: unapprovedDomain,
                attribute,
                allowed: APPROVED_DOMAINS.join(', ')
              }
            });
          }
        }
      }
    };
  }
};
