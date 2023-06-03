import fs from 'fs';
import path from 'path';
import process from 'process';

import postcss from 'postcss';
import postcssrc from 'postcss-load-config';

function resolve(relativePath) {
  return path.join(process.cwd(), relativePath);
}

// ---

function readJSONFile(jsonFilePath) {
  try {
    const fileContents = fs.readFileSync(jsonFilePath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    throw new Error(`Error attempting to read: "${jsonFilePath}": ${error.message}`);
  }
}

function writeJSONFile(jsonFilePath, data) {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error(`Error attempting to write: "${jsonFilePath}": ${error.message}`);
  }
}

// ---

function isBoolean(value) {
  return typeof value === 'boolean';
}

// ---

const IGNORABLE_VALUE_TYPES = ['number', 'string', 'undefined', 'HTMLElement'];
const STRING_VALUE_TYPE_PATTERN = /^'(.*)'$/;

const unrecognizedAttributeValueTypes = new Set();

function toDeprecationNotice(deprecated) {
  if (!deprecated) {
    return '';
  }
  return `**Note**: ${isBoolean(deprecated) ? 'This tag has been deprecated.' : declaration.deprecated}\n`
}

function toAttributeValues(attribute) {
  const text = attribute.type?.text;
  if (!text) {
    return {};
  }

  if (text === 'boolean') {
    // ¯\_(ツ)_/¯
    // See: https://github.com/microsoft/vscode-html-languageservice/blob/main/src/languageFacts/data/webCustomData.ts
    return { valueSet: 'v' };
  }

  const types = text.split('|').map((value) => value.trim());
  const values = [];
  for (const type of types) {
    if (!type || IGNORABLE_VALUE_TYPES.includes(type)) {
      continue;
    }
    const matches = STRING_VALUE_TYPE_PATTERN.exec(type);
    if (matches) {
      // string value
      values.push({ name: matches[1] });
    } else if (Number(type).toString() === type) {
      // number value
      values.push({ name: type });
    } else {
      unrecognizedAttributeValueTypes.add(type);
    }
  }

  return values.length > 0 ? { values } : {};
}

function toAttributeDescription(attribute) {
  let value = '';
  if (attribute.description) {
    value += `${attribute.description}\n`;
  }
  value += toDeprecationNotice(attribute.deprecated);

  return {
    kind: 'markdown',
    value
  };
}

function toAttributeReferences(declaration, attribute) {
  const resources = [];
  const { aria, storybook } = declaration.metadata ?? {};
  if (attribute.tagName?.startsWith('aria-')) {
    resources.push({ name: 'WAI-ARIA', url: aria });
  }
  if (storybook) {
    resources.push({ name: 'Storybook', url: storybook });
  }
  return resources;
}

function toAttribute(declaration, attribute) {
  return {
    name: attribute.name,
    description: toAttributeDescription(attribute),
    ...toAttributeValues(attribute),
    references: toAttributeReferences(declaration, attribute)
  };
}

function toAttributes(declaration) {
  const attributes = [];
  for (const attribute of declaration.attributes ?? []) {
    attributes.push(toAttribute(declaration, attribute));
  }
  return attributes;
}

function toTagReferences(declaration) {
  const resources = [];
  const { aria, figma, storybook, zeroheight } = declaration.metadata ?? {};
  if (aria) {
    resources.push({ name: 'WAI-ARIA', url: aria });
  }
  if (figma) {
    resources.push({ name: 'Figma', url: figma });
  }
  if (storybook) {
    resources.push({ name: 'Storybook', url: storybook });
  }
  if (zeroheight) {
    resources.push({ name: 'Zeroheight', url: storybook });
  }
  return resources;
}

function toCategoryList(categoryName, items) {
  let categoryList = '';
  if (items && items.length > 0) {
    categoryList += `#### ${categoryName}\n`;
    categoryList += items
      .map((item) => {
        const name = item.name ? `**${item.name}**` : '*default*';
        const description = item.description ? ` - ${item.description}` : ''
        return `- ${name}${description}\n`
      })
      .join('\n');
  }
  return categoryList;
}

function toTagDescription(declaration) {
  let value = '';
  if (declaration.description) {
    value += `${declaration.description}\n`;
  }
  value += toDeprecationNotice(declaration.deprecated);
  value += toCategoryList('Slots', declaration.slots);
  value += toCategoryList('Events', declaration.events);
  value += toCategoryList('CSS Properties', declaration.cssProperties);
  value += toCategoryList('CSS Parts', declaration.cssParts);
  return {
    kind: 'markdown',
    value
  };
}

function toTag(declaration) {
  return {
    name: declaration.tagName,
    description: toTagDescription(declaration),
    attributes: toAttributes(declaration),
    references: toTagReferences(declaration)
  };
}

function toTags(modules) {
  const tags = [];
  for (const module of modules) {
    if (module.path.startsWith('src/internal/') || module.path.endsWith('.stories.ts')) {
      continue;
    }
    for (const declaration of module.declarations) {
      if (!declaration?.metadata?.package) {
        continue;
      }
      if (declaration.customElement) {
        tags.push(toTag(declaration));
      }
    }
  }
  return tags;
}

// ---

async function extractAttributeValuesFromSelectors(files, attributes) {
  const attributeValues = {};
  for (const attribute of attributes) {
    attributeValues[attribute] = new Set();
  }

  const { plugins, options } = await postcssrc({ from: undefined });
  const processor = postcss(plugins);

  for (const file of files) {
    const css = fs.readFileSync(file, 'utf-8');
    const { root } = await processor.process(css, options);
    root.walkRules((rule) => {
      for (let attribute of attributes) {
        const pattern = new RegExp(`\\[${attribute}[~]?=['"]?(.*?)['"]?\\]`, 'g');
        let match;
        while ((match = pattern.exec(rule.selector)) !== null) {
          attributeValues[attribute].add(match[1]);
        }
      }
    });
  }

  return Object.fromEntries(Object.entries(attributeValues).map(([entry, set]) => [entry, Array.from(set)]));
}

function toGlobalAttributes(utilityAttributes) {
  const globalAttributes = [];
  for (const [attribute, values] of Object.entries(utilityAttributes)) {
    globalAttributes.push({
      name: attribute,
      values: values.map((value) => ({
        name: value
      }))
    });
  }
  return globalAttributes;
}

// ---

const customElementsManifest = readJSONFile(resolve('./dist/custom-elements.json'));

const utilityAttributes = await extractAttributeValuesFromSelectors(
  [resolve('./src/css/module.layout.css'), resolve('./src/css/module.typography.css')],
  ['mlv-layout', 'mlv-text']
);

const htmlCustomData = {
  version: 1.1,
  tags: toTags(customElementsManifest.modules),
  globalAttributes: toGlobalAttributes(utilityAttributes),
  valueSets: []
};

writeJSONFile(resolve('./dist/elements.html-data.json'), htmlCustomData);
