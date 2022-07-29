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

export function buildTokens(dist) {
  const buildPath = `${dist}/`;
  StyleDictionary.extend({
    source: ['./tokens/tokens.json'],
    platforms: { css: cssOutput('css/module.tokens.css', buildPath), json: jsonOutput('tokens/tokens.json', buildPath) }
  }).buildAllPlatforms();

  StyleDictionary.extend({
    include: ['./tokens/tokens.json'],
    source: ['./tokens/theme.dark.json'],
    platforms: { css: cssOutput('css/theme.dark.css', buildPath) }
  }).buildAllPlatforms();

  StyleDictionary.extend({
    include: ['./tokens/tokens.json'],
    source: ['./tokens/theme.compact.json'],
    platforms: { css: cssOutput('css/theme.compact.css', buildPath) }
  }).buildAllPlatforms();

  StyleDictionary.extend({
    include: ['./tokens/tokens.json'],
    source: ['./tokens/theme.high-contrast.json'],
    platforms: { css: cssOutput('css/theme.high-contrast.css', buildPath) }
  }).buildAllPlatforms();
}

function cssOutput(destination, buildPath) {
  const theme = getTheme(destination);
  return {
    prefix: 'mlv',
    transforms: ['attribute/cti', 'name/cti/kebab', 'size/px', 'color/css',  'custom/css-calc'],
    buildPath,
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

function jsonOutput(destination, buildPath) {
  const theme = getTheme(destination);
  return {
    prefix: 'mlv',
    transformGroup: 'web',
    buildPath,
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
