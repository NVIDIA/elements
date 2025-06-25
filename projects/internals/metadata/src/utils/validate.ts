import sanitizeHtml from 'sanitize-html';
import { getAvailableElementTags } from './utils.js';
import type { MetadataSummary } from '../types.js';

interface AllowedAttributes {
  [key: string]: ({ name: string; values: string[] } | string)[];
}

const standardElements = [
  'div',
  'section',
  'article',
  'header',
  'footer',
  'main',
  'aside',
  'nav',
  'span',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'video',
  'audio',
  'iframe',
  'canvas',
  'svg',
  'dialog'
];

const formElements = ['label', 'form', 'optgroup', 'fieldset', 'input', 'textarea', 'button', 'select', 'option'];
const standardAttrs = ['nve-text', 'nve-layout', 'nve-control', 'slot', 'id', 'name', 'style'];
const formAttrs = [
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-hidden',
  'aria-disabled',
  'aria-expanded',
  'aria-controls',
  'nve-control',
  'slot',
  'name',
  'required',
  'pattern',
  'placeholder',
  'type',
  'value',
  'disabled',
  'type',
  'checked',
  'id',
  'for'
];

export function validateTemplate(
  source: string,
  metadata: MetadataSummary,
  config: { allowStyleAttribute?: boolean; allowGlobalElements?: boolean; allowVulnerableTags?: boolean } = {}
): string {
  const defaultConfig = { allowStyleAttribute: false, allowGlobalElements: false, allowVulnerableTags: false };
  const mergedConfig = { ...defaultConfig, ...config };
  const allowedTags = [
    ...standardElements,
    ...formElements,
    ...sanitizeHtml.defaults.allowedTags,
    ...getAvailableElementTags(metadata),
    ...(mergedConfig.allowVulnerableTags ? ['script'] : [])
  ].filter(tag => {
    if (!mergedConfig.allowGlobalElements) {
      return tag !== 'nve-page' && tag !== 'body' && tag !== 'html' && tag !== 'head';
    } else {
      return true;
    }
  });

  const elementsAllowedAttributes: AllowedAttributes = Object.values(metadata.projects)
    .filter(project => project.elements)
    .flatMap(project => project.elements)
    .reduce((acc, element) => {
      const customAttrs =
        element.manifest.attributes?.map(attribute => {
          // allow arbitrary values for boolean,string, number, and icon name attributes
          if (
            attribute.type?.text === 'boolean' ||
            attribute.type?.text === 'string' ||
            attribute.type?.text === 'number' ||
            attribute.type?.text.includes('IconName')
          ) {
            return attribute.name;
          } else {
            // allow enumerated values for other attributes
            let values =
              attribute.type?.text
                ?.replaceAll(`'`, '')
                ?.replaceAll(`"`, '')
                ?.split('|')
                ?.map(i => i.trim()) ?? [];

            return {
              name: attribute.name,
              values
            };
          }
        }) ?? [];

      acc[element.name] = [...(acc[element.name] ?? []), ...formAttrs, ...customAttrs, 'slot', 'id', 'name'];
      return acc;
    }, {});

  const allowedAttributes: AllowedAttributes = {
    ...sanitizeHtml.defaults.allowedAttributes,
    script: mergedConfig.allowVulnerableTags ? ['type'] : [],
    html: ['nve-theme'],
    body: ['nve-text', 'nve-layout', 'nve-theme'],
    ...elementsAllowedAttributes,
    ...formElements.reduce((acc, element) => {
      acc[element] = formAttrs;
      return acc;
    }, {}),
    ...standardElements.reduce((acc, element) => {
      acc[element] = [...(acc[element] ?? []), ...standardAttrs];
      return acc;
    }, {}),
    '*': mergedConfig.allowStyleAttribute ? ['style'] : []
  };

  const nonBooleanAttributes = Object.values(allowedAttributes)
    .filter(i => typeof i !== 'string')
    .flatMap(i => (Array.isArray(i?.values) ? i.values : []));

  return sanitizeHtml(source, {
    allowedTags,
    allowedAttributes,
    allowVulnerableTags: mergedConfig.allowVulnerableTags,
    nonBooleanAttributes: [...sanitizeHtml.defaults.nonBooleanAttributes, ...nonBooleanAttributes]
  });
}
