import fs from 'node:fs';
import path from 'node:path';
import process from 'process';
import { fileURLToPath } from 'node:url';

const buildPath = 'dist/';
const sourcePath = 'src/';

function resolve(relativePath) {
  return path.join(process.cwd(), relativePath);
}

// ---

export function readJSONFile(jsonFilePath) {
  try {
    const fileContents = fs.readFileSync(jsonFilePath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    throw new Error(`Error attempting to read: "${jsonFilePath}": ${error.message}`);
  }
}

export function writeJSONFile(jsonFilePath, data) {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error(`Error attempting to write: "${jsonFilePath}": ${error.message}`);
  }
}

// ---

export function isObject(value) {
  return typeof value === 'object' && value !== null;
}

// ---

export function visitTokenTree(tokens, visitor, prefix = '') {
  for (const [key, value] of Object.entries(tokens)) {
    const path = key !== '@' ? `${prefix}${key}` : prefix.slice(0, -1);
    if (isObject(value)) {
      if ('value' in value) {
        visitor(path, value);
      } else {
        visitTokenTree(value, visitor, `${path}.`);
      }
    }
  }
}

export function loadTokenDictionary(tokenJsonFilePath) {
  const tokensByPath = {};
  const tokensJson = readJSONFile(resolve(tokenJsonFilePath));
  visitTokenTree(tokensJson, (path, token) => {
    tokensByPath[path] = token;
  });
  return tokensByPath;
}

// ---

// {token.path.reference}
const REFERENCE_PATTERN = /\{([^}]*)\}/g;

// Resolve all of the token value's path references (including resolution of their resolved values' path references).
export function resolveTokenValue(value, tokenDictionary, referencePath = []) {
  return value.replaceAll(REFERENCE_PATTERN, (_, referencedPath) => {
    if (referencePath.includes(referencedPath)) {
      throw new Error(`Cyclic token reference: ${[...referencePath, referencedPath].join(' -> ')}`);
    }

    const referencedValue = tokenDictionary[referencedPath]?.value;
    if (referencedValue === undefined) {
      throw new Error(`Unable to resolve a referenced token for path: "${referencedPath}"`);
    }

    return resolveTokenValue(referencedValue, tokenDictionary, [...referencePath, referencedPath]);
  });
}

// ---

// Collect a categorized token value for the specified category and path.
function collectCategorizedToken(categorizedTokens, path, details, category, value) {
  if (categorizedTokens[path] === undefined) {
    categorizedTokens[path] = { ...details, values: { [category]: value } };
  } else {
    categorizedTokens[path].values[category] = value;
  }
}

// Collect categorized token values relative to the specified token dictionaries (last definition wins).
function collectCategorizedTokens(categorizedTokens, category, ...tokenDictionaries) {
  const mergedTokenDictionary = Object.assign({}, ...tokenDictionaries);
  for (const [path, token] of Object.entries(mergedTokenDictionary)) {
    const { value, ...details } = token;
    const resolvedValue = resolveTokenValue(value, mergedTokenDictionary, [path]);
    collectCategorizedToken(categorizedTokens, path, details, category, resolvedValue);
  }
}

export function valuesMatch(values) {
  if (values.length === 0) {
    return true;
  }
  const [first, ...remaining] = values;
  for (const value of remaining) {
    if (value !== first) {
      return false;
    }
  }
  return true;
}

export function categoryValuesMatch(values, categories) {
  return valuesMatch(categories.map(category => values[category]));
}

export function createCssVarCompletions({
  baseTokenDictionary,
  compactThemeTokenDictionary,
  darkThemeTokenDictionary,
  highContrastThemeTokenDictionary,
  reducedMotionThemeTokenDictionary
}) {
  const categorizedTokens = {};

  collectCategorizedTokens(categorizedTokens, 'light', baseTokenDictionary);
  collectCategorizedTokens(categorizedTokens, 'dark', baseTokenDictionary, darkThemeTokenDictionary);
  collectCategorizedTokens(categorizedTokens, 'high-contrast', baseTokenDictionary, highContrastThemeTokenDictionary);
  collectCategorizedTokens(categorizedTokens, 'compact', baseTokenDictionary, compactThemeTokenDictionary);
  collectCategorizedTokens(categorizedTokens, 'reduced-motion', baseTokenDictionary, reducedMotionThemeTokenDictionary);

  // Consolidate categorized token values that are the same.
  for (const token of Object.values(categorizedTokens)) {
    const values = token.values;
    if (categoryValuesMatch(values, ['light', 'dark'])) {
      values[''] = values['light'];
      delete values['light'];
      delete values['dark'];
    }
    if (categoryValuesMatch(values, ['', 'high-contrast']) || categoryValuesMatch(values, ['light', 'high-contrast'])) {
      delete values['high-contrast'];
    }
    if (categoryValuesMatch(values, ['', 'compact']) || categoryValuesMatch(values, ['light', 'compact'])) {
      delete values['compact'];
    }
    if (
      categoryValuesMatch(values, ['', 'reduced-motion']) ||
      categoryValuesMatch(values, ['light', 'reduced-motion'])
    ) {
      delete values['reduced-motion'];
    }
  }

  // Collect all tokens with their paths transformed to css variable identifiers.
  const cssVarCompletions = {};
  for (const [path, token] of Object.entries(categorizedTokens)) {
    cssVarCompletions[`--nve-${path.replaceAll('.', '-')}`] = token;
  }

  return cssVarCompletions;
}

export function buildCssVarCompletions() {
  const baseTokenDictionary = loadTokenDictionary(`${sourcePath}/index.json`);
  const compactThemeTokenDictionary = loadTokenDictionary(`${sourcePath}/compact.json`);
  const darkThemeTokenDictionary = loadTokenDictionary(`${sourcePath}/dark.json`);
  const highContrastThemeTokenDictionary = loadTokenDictionary(`${sourcePath}/high-contrast.json`);
  const reducedMotionThemeTokenDictionary = loadTokenDictionary(`${sourcePath}/reduced-motion.json`);

  const cssVarCompletions = createCssVarCompletions({
    baseTokenDictionary,
    compactThemeTokenDictionary,
    darkThemeTokenDictionary,
    highContrastThemeTokenDictionary,
    reducedMotionThemeTokenDictionary
  });

  if (!fs.existsSync(`${buildPath}`)) {
    fs.mkdirSync(`${buildPath}`);
  }

  writeJSONFile('./dist/data.css-vars.json', cssVarCompletions);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildCssVarCompletions();
}
