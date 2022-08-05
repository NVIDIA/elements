import { default as StyleDictionary } from 'style-dictionary';

const index = process.argv.findIndex((i) => i === '--outDir') + 1;
const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;

StyleDictionary.registerTransform({
  name: 'custom/css-calc',
  type: 'value',
  transitive: true,
  matcher: ({ value }) => typeof value === 'string' && value?.includes('*'),
  transformer: ({ value }) => `calc(${value})`,
});

StyleDictionary.registerFormat({
  name: 'custom/css',
  formatter: ({ dictionary, file, options }) => {
    const selector = options.theme ? `[nve-theme~='${options.theme}']` : `:root, [nve-theme~='light']`;
    const colorScheme = options.theme === 'dark' ? '\n  color-scheme: dark;' : '';
    return `${fileHeader({ file })}\n${selector} {${colorScheme}\n${formattedVariables({ format: 'css', dictionary, outputReferences: options.outputReferences })}\n}`;
  }
});

export function buildTokens(buildPath) {
  StyleDictionary.extend({
    source: ['./tokens/tokens.json'],
    platforms: { css: cssOutput(`${buildPath}css/module.tokens.css`), json: jsonOutput(`${buildPath}tokens/tokens.json`) }
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
}

function cssOutput(destination) {
  const theme = getTheme(destination);
  return {
    prefix: 'mlv',
    transforms: ['attribute/cti', 'name/cti/kebab', 'size/px', 'color/css',  'custom/css-calc'],
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
    files: [{
      format: 'json/flat',
      destination,
      filter: theme ? (token) => getTheme(token.filePath) : null
    }]
  };
}

function getTheme(path) {
  const m = /.*?theme.(.*?)\..*?/g.exec(path);
  return m ? m[1] : false;
};
