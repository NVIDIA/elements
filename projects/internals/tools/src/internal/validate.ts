import type { MetadataSummary } from '@internals/metadata';
import sanitizeHtml from 'sanitize-html';
import { getAvailableElementTags } from './utils.js';

interface AllowedAttributes {
  [key: string]: ({ name: string; values: string[] } | string)[];
}

const globalElements = ['html', 'body', 'head', 'meta', 'title', 'doctype'];

const nativeElements = [
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
  'dialog'
];

const svgElements = [
  'svg',
  'path',
  'g',
  'defs',
  'linearGradient',
  'stop',
  'circle',
  'text',
  'line',
  'ellipse',
  'rect',
  'polygon',
  'polyline',
  'pattern'
];
const svgAttrs = [
  'id',
  'class',
  'width',
  'height',
  'dominant-baseline',
  'rx',
  'ry',
  'style',
  'cx',
  'cy',
  'r',
  'fill',
  'd',
  'opacity',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'stroke',
  'stroke-width',
  'transform',
  'viewBox',
  'preserveAspectRatio',
  'stroke-dashoffset',
  'stroke-dasharray',
  'text-anchor',
  'font-size',
  'font-weight',
  'patternUnits',
  'points'
];
const formElements = ['label', 'form', 'optgroup', 'fieldset', 'input', 'textarea', 'button', 'select', 'option'];
const nativeElementAttrs = [
  'nve-text',
  'nve-layout',
  `nve-display`,
  'nve-control',
  'slot',
  'id',
  'name',
  'class',
  'hidden',
  'href',
  'data-*'
];
const formAttrs = [
  'nve-control',
  'minlength',
  'maxlength',
  'min',
  'max',
  'step',
  'multiple',
  'size',
  'rows',
  'cols',
  'wrap',
  'spellcheck',
  'readonly',
  'autocomplete',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-hidden',
  'aria-disabled',
  'aria-expanded',
  'aria-controls',
  'slot',
  'name',
  'required',
  'pattern',
  'placeholder',
  'value',
  'disabled',
  'type',
  'checked',
  'id',
  'for',
  'hidden',
  'data-*'
];

export function validateTemplate(
  source: string,
  metadata: MetadataSummary,
  config: { allowStyles?: boolean; allowGlobalElements?: boolean; allowVulnerableTags?: boolean } = {}
): string {
  const defaultConfig = { allowStyles: true, allowGlobalElements: false, allowVulnerableTags: true };
  const mergedConfig = { ...defaultConfig, ...config };

  const allowedTags = [
    ...nativeElements,
    ...svgElements,
    ...formElements,
    ...sanitizeHtml.defaults.allowedTags,
    ...getAvailableElementTags(metadata),
    ...(mergedConfig.allowVulnerableTags ? ['script'] : []),
    ...(mergedConfig.allowStyles ? ['style'] : []),
    ...(mergedConfig.allowGlobalElements ? globalElements : [])
  ];

  const customElementsAllowedAttributes: AllowedAttributes = Object.values(metadata.projects)
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

      acc[element.name] = [...(acc[element.name] ?? []), ...formAttrs, ...customAttrs];
      return acc;
    }, {});

  const allowedSvgAttributes: AllowedAttributes = svgElements.reduce((acc, element) => {
    acc[element] = svgAttrs;
    return acc;
  }, {});

  const allowedAttributes: AllowedAttributes = {
    ...sanitizeHtml.defaults.allowedAttributes,
    script: mergedConfig.allowVulnerableTags ? ['type'] : [],
    html: ['nve-theme'],
    body: ['nve-text', 'nve-layout', 'nve-theme'],
    ...customElementsAllowedAttributes,
    ...allowedSvgAttributes,
    ...formElements.reduce((acc, element) => {
      acc[element] = [...nativeElementAttrs, ...formAttrs];
      return acc;
    }, {}),
    ...nativeElements.reduce((acc, element) => {
      acc[element] = [...(acc[element] ?? []), ...nativeElementAttrs];
      return acc;
    }, {}),
    '*': [
      'slot',
      'id',
      'name',
      'class',
      'hidden',
      'href',
      'data-*',
      'nve-display',
      ...(mergedConfig.allowStyles ? ['style'] : [])
    ]
  };

  const customElementsNonBooleanAttributes = Object.values(allowedAttributes)
    .filter(i => typeof i !== 'string')
    .flatMap(i => (Array.isArray(i?.values) ? i.values : []));

  const nonBooleanAttributes = sanitizeHtml.defaults.nonBooleanAttributes.filter(attr => attr !== 'hidden');

  source = removeBodyStyleSelectors(source);

  const result = sanitizeHtml(source, {
    allowedTags,
    allowedAttributes,
    allowVulnerableTags: mergedConfig.allowVulnerableTags || mergedConfig.allowStyles, // allows script and style tags
    nonBooleanAttributes: [...nonBooleanAttributes, ...customElementsNonBooleanAttributes],
    parser: {
      lowerCaseTags: false,
      lowerCaseAttributeNames: false
    }
  });

  return result;
}

function removeBodyStyleSelectors(styles: string) {
  // Simple regex to remove basic body selectors: body, body.class, body#id, body[attr], etc. followed by CSS rule block
  return styles.replace(/body[^\s{]*\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gi, '');
}
