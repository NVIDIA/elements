import StyleDictionary from 'style-dictionary';
import { formattedVariables } from 'style-dictionary/utils';
import { globSync } from 'glob';

const buildPath = 'dist/';
const sourcePath = 'src/';
const baseReset = `
html { box-sizing: border-box; }
*, *:before, *:after { box-sizing: inherit; }

html[nve-theme], html[mlv-theme], body[nve-theme], body[mlv-theme], [nve-theme~='root'], [mlv-theme~='root'] {
  color-scheme: var(--nve-sys-color-scheme) !important;
  background: var(--nve-sys-layer-canvas-background) !important;
  color: var(--nve-sys-layer-canvas-color) !important;
  font-family: var(--nve-ref-font-family) !important;
  text-rendering: optimizeSpeed;
}

[nve-theme] body, [mlv-theme] body {
  margin: 0;
}

body:has([nve-popover]:popover-open) {
  overflow-x: hidden;
}

*:has([nve-popover]),
*:has([mlv-popover]) {
  contain: initial;
}`;

StyleDictionary.registerFormat({
  name: 'custom/schema',
  format: dictionary => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema',
      definitions: {
        reference: {
          type: 'string',
          enum: dictionary.allTokens.map(property => `{${property.path.join('.')}.value}`)
        }
      },
      type: 'object',
      patternProperties: {
        '.*': {
          anyOf: [
            {
              type: 'object',
              required: ['value'],
              properties: {
                value: {
                  anyOf: [{ $ref: '#/definitions/reference' }, { type: 'string' }]
                }
              }
            },
            {
              $ref: '#'
            }
          ]
        }
      }
    };

    return JSON.stringify(schema, null, 2);
  }
});

StyleDictionary.registerTransform({
  name: 'custom/validate',
  type: 'value',
  transitive: true,
  transform: obj => {
    const { value, type, name, original, filePath } = obj;
    const isHighContrast = filePath.includes('high-contrast');
    const isReferenceToken = name.includes('nve-ref');
    const isVisualizationToken = name?.includes('nve-sys-visualization');
    const isColorToken = type === 'color';
    const isRawValue = !original.value.startsWith('{');
    const isPxValue = original.value.endsWith('px');
    const isSizeToken = name?.includes('nve-ref-size');
    const isSpaceToken = name?.includes('nve-ref-space');
    const isBorderToken = name?.includes('nve-ref-border');
    const isOutlineToken = name?.includes('nve-ref-outline');

    if (isColorToken && isRawValue && !isReferenceToken && !isVisualizationToken && !isHighContrast) {
      console.error(
        '\x1b[31m',
        `Token ${name} is a invalid color. Color must implement a reference to a {ref.*} token to prevent cross theme color divergence`
      );
      throw new Error();
    }

    if (isPxValue && isRawValue && !isSizeToken && !isSpaceToken && !isBorderToken && !isOutlineToken) {
      console.error(
        '\x1b[31m',
        `Token ${name} is a invalid size/space value. Value must implement a reference to a {ref.space-*} or {ref.size-*} token to prevent cross theme layout divergence`
      );
      throw new Error();
    }

    return value;
  }
});

StyleDictionary.registerFormat({
  name: 'custom/css',
  format: async ({ dictionary, options }) => {
    const experimental = dictionary.allTokens.find(t => t.name.includes('experimental')) ? '/** @experimental */' : '';
    const selector =
      options.theme !== 'index'
        ? `[nve-theme*='${options.theme}'], [mlv-theme*='${options.theme}']`
        : `:root, [nve-theme~='light'], [mlv-theme~='light']`;
    const formatted = formattedVariables({ format: 'css', dictionary, outputReferences: options.outputReferences })
      .split('\n')
      .map(line => {
        // https://github.com/amzn/style-dictionary/issues/1055
        if (line.includes('ref-font') && line.includes(' * ') && line.includes('px')) {
          const [ref, base] = line.split('*').map(i => i.trim().replace('px;', ''));
          return `  ${ref.replace(': ', ': calc(')} * ${parseInt(base, 10) / 16}rem);`; // convert font types to use scaled rem
        } else if (line.includes(' * ')) {
          return line.replace(': ', ': calc(').replace(';', ');'); // convert '*' to use CSS calc
        } else {
          return line;
        }
      })
      .join('\n');

    return `${experimental}\n${options.theme === 'index' ? `${baseReset}\n` : ''}${selector} {\n${formatted}\n}`;
  }
});

StyleDictionary.registerFormat({
  name: 'custom/json',
  transformGroup: 'web',
  format: ({ dictionary }) => {
    const content = formattedVariables({ format: 'json', dictionary, outputReferences: true })
      .replaceAll(';', '')
      .split('\n')
      .map(i => {
        const [key, value] = i.split(' = ');
        const formattedValue = value.includes('calc') ? value.replace('calc(', '').replace(')', '') : value;
        return `  "${key}": "${formattedValue}"`;
      })
      .join(',\n');
    return `{\n${content}\n}`;
  }
});

async function buildTokens() {
  const themes = globSync(`${sourcePath}*.json`).filter(path => !path.includes('index'));

  const sd = new StyleDictionary({
    source: [`${sourcePath}index.json`],
    platforms: {
      css: cssOutput(`${buildPath}index.css`),
      json: jsonOutput(`${buildPath}index.json`),
      schema: schemaOutput(`${buildPath}schema.json`)
    }
  });
  await sd.hasInitialized;
  sd.buildAllPlatforms();

  await Promise.all(
    themes.map(async path => {
      const theme = getTheme(path);

      const sdTheme = new StyleDictionary({
        include: [`${sourcePath}index.json`],
        source: [`${sourcePath}${theme}.json`],
        platforms: {
          css: cssOutput(`${buildPath}${theme}.css`),
          json: jsonOutput(`${buildPath}${theme}.json`)
        }
      });
      await sdTheme.hasInitialized;
      sdTheme.buildAllPlatforms();
    })
  );
}

function cssOutput(destination) {
  const theme = getTheme(destination);

  return {
    prefix: 'nve',
    transforms: ['attribute/cti', 'name/kebab', 'size/px', 'color/css', 'custom/validate'],
    files: [
      {
        format: 'custom/css',
        destination,
        filter: theme !== 'index' ? token => getTheme(token.filePath) !== 'index' : null
      }
    ],
    options: {
      outputReferences: true,
      theme
    }
  };
}

function jsonOutput(destination) {
  const theme = getTheme(destination);
  return {
    prefix: 'nve',
    transformGroup: 'web',
    transforms: ['attribute/cti', 'name/kebab', 'size/px', 'color/css', 'custom/validate'],
    files: [
      {
        format: 'custom/json',
        destination,
        filter: theme !== 'index' ? token => getTheme(token.filePath) !== 'index' : null
      }
    ],
    options: {
      outputReferences: true,
      theme
    }
  };
}

function schemaOutput(destination) {
  return {
    prefix: 'nve',
    transformGroup: 'web',
    transforms: ['attribute/cti', 'name/kebab', 'size/px', 'color/css', 'custom/validate'],
    files: [
      {
        format: 'custom/schema',
        destination
      }
    ],
    options: {
      outputReferences: true
    }
  };
}

function getTheme(path) {
  return path.replace('dist/', '').replace(`src/`, '').split('.')[0];
}

buildTokens();
