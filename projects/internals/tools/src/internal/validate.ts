// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Element } from '@internals/metadata';
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
const formElements = [
  'label',
  'form',
  'optgroup',
  'fieldset',
  'input',
  'textarea',
  'button',
  'select',
  'option',
  'datalist'
];
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

interface TemplateConfig {
  allowStyles: boolean;
  allowGlobalElements: boolean;
  allowVulnerableTags: boolean;
}

function buildAllowedTags(elements: Element[], config: TemplateConfig): string[] {
  return [
    ...nativeElements,
    ...svgElements,
    ...formElements,
    ...sanitizeHtml.defaults.allowedTags,
    ...getAvailableElementTags(elements),
    ...(config.allowVulnerableTags ? ['script'] : []),
    ...(config.allowStyles ? ['style'] : []),
    ...(config.allowGlobalElements ? globalElements : [])
  ];
}

function buildCustomElementsAllowedAttributes(elements: Element[]): AllowedAttributes {
  return elements.reduce((acc: AllowedAttributes, element) => {
    const customAttrs =
      element.manifest?.attributes?.map(attribute => {
        const typeText = attribute.type?.text ?? '';
        if (typeText === 'boolean' || typeText === 'string' || typeText === 'number' || typeText.includes('IconName')) {
          return attribute.name;
        }
        const values = [...typeText.matchAll(/['"]([^'"]+)['"]/g)].map(([, v]) => v!.trim());
        if (values.length === 0) return attribute.name;
        return { name: attribute.name, values };
      }) ?? [];

    acc[element.name] = [...(acc[element.name] ?? []), ...formAttrs, ...customAttrs];
    return acc;
  }, {});
}

function buildAllowedAttributes(elements: Element[], config: TemplateConfig): AllowedAttributes {
  const allowedSvgAttributes: AllowedAttributes = svgElements.reduce<AllowedAttributes>((acc, element) => {
    acc[element] = svgAttrs;
    return acc;
  }, {});

  return {
    ...sanitizeHtml.defaults.allowedAttributes,
    script: config.allowVulnerableTags ? ['type'] : [],
    html: ['nve-theme'],
    body: ['nve-text', 'nve-layout', 'nve-theme'],
    ...buildCustomElementsAllowedAttributes(elements),
    ...allowedSvgAttributes,
    ...formElements.reduce<AllowedAttributes>((acc, element) => {
      acc[element] = [...nativeElementAttrs, ...formAttrs];
      return acc;
    }, {}),
    ...nativeElements.reduce<AllowedAttributes>((acc, element) => {
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
      ...(config.allowStyles ? ['style'] : [])
    ]
  };
}

export function validateTemplate(
  source: string,
  elements: Element[],
  config: { allowStyles?: boolean; allowGlobalElements?: boolean; allowVulnerableTags?: boolean } = {}
): string {
  const mergedConfig: TemplateConfig = {
    allowStyles: true,
    allowGlobalElements: false,
    allowVulnerableTags: true,
    ...config
  };

  const allowedAttributes = buildAllowedAttributes(elements, mergedConfig);
  const customElementsNonBooleanAttributes = Object.values(allowedAttributes)
    .filter(i => typeof i !== 'string')
    .flatMap(i => (Array.isArray(i?.values) ? i.values : []));
  const nonBooleanAttributes = sanitizeHtml.defaults.nonBooleanAttributes.filter((attr: string) => attr !== 'hidden');

  return sanitizeHtml(removeBodyStyleSelectors(source), {
    allowedTags: buildAllowedTags(elements, mergedConfig),
    allowedAttributes,
    allowVulnerableTags: mergedConfig.allowVulnerableTags || mergedConfig.allowStyles,
    nonBooleanAttributes: [...nonBooleanAttributes, ...customElementsNonBooleanAttributes],
    parser: { lowerCaseTags: false, lowerCaseAttributeNames: false }
  });
}

function removeBodyStyleSelectors(html: string) {
  // Process <style> tags: remove body selectors from their contents
  let result = html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (match, attributes, content) => {
    const cleanedContent = content.replace(/body[^\s{]*\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gi, '');
    return `<style${attributes}>${cleanedContent}</style>`;
  });

  // Process style="" attributes: remove body selectors from their values
  result = result.replace(/style=["']([^"']*)["']/gi, (match, content) => {
    const cleanedContent = content.replace(/body[^\s{]*\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gi, '');
    return `style="${cleanedContent}"`;
  });

  return result;
}
