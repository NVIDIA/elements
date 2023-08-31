const StyleDictionary = require('style-dictionary');
const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;
const buildPath = process.argv[process.argv.findIndex((i) => i === '--outDir') + 1];

StyleDictionary.registerTransform({
  name: 'custom/validate',
  type: 'value',
  transitive: true,
  transformer: (obj) => {
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
      console.error('\x1b[31m', `Token ${name} is a invalid color. Color must implement a reference to a {ref.*} token to prevent cross theme color divergence`);
      throw new Error();
    }

    if (isPxValue && isRawValue && !isSizeToken && !isSpaceToken && !isBorderToken && !isOutlineToken) {
      console.error('\x1b[31m', `Token ${name} is a invalid size/space value. Value must implement a reference to a {ref.space-*} or {ref.size-*} token to prevent cross theme layout divergence`);
      throw new Error();
    }

    return value;
  },
});

StyleDictionary.registerTransform({
  name: 'custom/css-calc',
  type: 'value',
  transitive: true,
  matcher: ({ value }) => typeof value === 'string' && value?.includes('*'),
  transformer: ({ value, attributes }) => {
    if (attributes.type === 'font') {
      const [scale, base] = value.split('*').map(i => i.trim().replace('px', ''));
      return `calc(${scale} * ${parseInt(base, 10) / 16}rem)`;
    } else {
      return `calc(${value})`;
    }
  },
});

StyleDictionary.registerFormat({
  name: 'custom/css',
  formatter: ({ dictionary, file, options }) => {
    const selector = options.theme ? `[nve-theme~='${options.theme}']` : `:root, [nve-theme~='light']`;
    return `${fileHeader({ file })}\n${selector} {\n${formattedVariables({ format: 'css', dictionary, outputReferences: options.outputReferences })}\n}`;
  }
});

StyleDictionary.registerFormat({
  name: 'custom/json',
  transformGroup: 'web',
  formatter: ({ dictionary }) => {
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

function buildTokens() {
  StyleDictionary.extend({
    source: ['./tokens/tokens.json'],
    platforms: { css: cssOutput(`${buildPath}css/module.tokens.css`), json: jsonOutput(`${buildPath}tokens/tokens.json`) }
  }).buildAllPlatforms();

  StyleDictionary.extend({
    include: ['./tokens/tokens.json'],
    source: ['./tokens/theme.dark.json'],
    platforms: { json: jsonOutput(`${buildPath}tokens/tokens.dark.json`) }
  }).buildAllPlatforms();

  StyleDictionary.extend({
    include: ['./tokens/tokens.json'],
    source: ['./tokens/theme.high-contrast.json'],
    platforms: { json: jsonOutput(`${buildPath}tokens/tokens.high-contrast.json`) }
  }).buildAllPlatforms();

  StyleDictionary.extend({
    include: ['./tokens/tokens.json'],
    source: ['./tokens/theme.dark.json'],
    platforms: { css: cssOutput(`${buildPath}css/theme.dark.css`) }
  }).buildAllPlatforms();

  StyleDictionary.extend({
    include: ['./tokens/tokens.json'],
    source: ['./tokens/theme.compact.json'],
    platforms: { css: cssOutput(`${buildPath}css/theme.compact.css`) }
  }).buildAllPlatforms();

  StyleDictionary.extend({
    include: ['./tokens/tokens.json'],
    source: ['./tokens/theme.high-contrast.json'],
    platforms: { css: cssOutput(`${buildPath}css/theme.high-contrast.css`) }
  }).buildAllPlatforms();

  StyleDictionary.extend({
    include: ['./tokens/tokens.json'],
    source: ['./tokens/theme.reduced-motion.json'],
    platforms: { css: cssOutput(`${buildPath}css/theme.reduced-motion.css`) }
  }).buildAllPlatforms();
}

function cssOutput(destination) {
  const theme = getTheme(destination);
  return {
    prefix: 'mlv',
    transforms: ['attribute/cti', 'name/cti/kebab', 'size/px', 'color/css',  'custom/css-calc', 'custom/validate'],
    files: [{
      format: 'custom/css',
      destination,
      filter: theme ? (token) => getTheme(token.filePath) : null
    }],
    options: {
      outputReferences: true,
      theme
    }
  }
}

function jsonOutput(destination) {
  const theme = getTheme(destination);
  return {
    prefix: 'mlv',
    transformGroup: 'web',
    transforms: ['attribute/cti', 'name/cti/kebab', 'size/px', 'color/css', 'custom/css-calc', 'custom/validate'],
    files: [{
      format: 'custom/json',
      destination,
      filter: theme ? (token) => getTheme(token.filePath) : null
    }],
    options: {
      outputReferences: true,
      theme
    }
  };
}

function getTheme(path) {
  const m = /.*?theme.(.*?)\..*?/g.exec(path);
  return m ? m[1] : false;
};

buildTokens();
