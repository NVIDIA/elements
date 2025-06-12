import sanitizeHtml from 'sanitize-html';
import { getAvailableElementTags } from './utils.js';
import type { MetadataSummary } from '../types.js';

interface AllowedAttributes {
  [key: string]: { name: string; values: string[] }[] | string[];
}

export function validateTemplate(
  source: string,
  metadata: MetadataSummary,
  config: { allowStyleAttribute?: boolean; allowGlobalElements?: boolean } = {}
): string {
  const defaultConfig = { allowStyleAttribute: true, allowGlobalElements: true };
  const mergedConfig = { ...defaultConfig, ...config };
  const allowedTags = [
    'form',
    'label',
    'input',
    'textarea',
    ...sanitizeHtml.defaults.allowedTags,
    ...getAvailableElementTags(metadata)
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
      acc[element.name] =
        element.manifest.attributes?.map(attribute => {
          const values =
            attribute.type?.text
              ?.replaceAll(`'`, '')
              ?.replaceAll(`"`, '')
              ?.split('|')
              ?.map(i => i.trim()) ?? [];
          return {
            name: attribute.name,
            values
          };
        }) ?? [];
      return acc;
    }, {});

  const standardAttrs = ['nve-text', 'nve-layout', 'slot'];
  const standardElements = [
    'label',
    'form',
    'optgroup',
    'fieldset',
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
    'svg'
  ];
  const formAttrs = [
    'nve-text',
    'nve-layout',
    'slot',
    'name',
    'required',
    'pattern',
    'placeholder',
    'type',
    'value',
    'disabled',
    'type',
    'checked'
  ];
  const formElements = ['input', 'textarea', 'button', 'select', 'option'];
  const allowedAttributes: AllowedAttributes = {
    ...sanitizeHtml.defaults.allowedAttributes,
    ...elementsAllowedAttributes,
    '*': mergedConfig.allowStyleAttribute ? ['style'] : [],
    html: ['nve-theme'],
    body: ['nve-text', 'nve-layout', 'nve-theme'],
    ...formElements.reduce((acc, element) => {
      acc[element] = formAttrs;
      return acc;
    }, {}),
    ...standardElements.reduce((acc, element) => {
      acc[element] = standardAttrs;
      return acc;
    }, {})
  };

  const nonBooleanAttributes = Object.values(allowedAttributes).flatMap(i => (Array.isArray(i?.values) ? i.values : i));

  return sanitizeHtml(source, {
    allowedTags,
    allowedAttributes,
    nonBooleanAttributes: [...sanitizeHtml.defaults.nonBooleanAttributes, ...nonBooleanAttributes]
  });
}
