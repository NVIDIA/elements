import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Color from 'colorjs.io';

// Tokens

import lightTokens from '@nvidia-elements/themes/index.json' assert { type: 'json' };
import darkTokens from '@nvidia-elements/themes/dark.json' assert { type: 'json' };

// Paths

const scriptPath = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(scriptPath, '../src/themes/');
const outputPath = path.join(scriptPath, '../src/themes/generated/');

// Types

type TokenColorWithAlphaRef = { token: string; alpha: number };
type TokenColorRef = string | TokenColorWithAlphaRef;

interface TokenBasedRule extends Record<string, unknown> {
  foreground?: TokenColorRef;
  background?: TokenColorRef;
}

interface TokenBasedThemeJSON extends Record<string, unknown> {
  colors: Record<string, TokenColorRef>;
  rules: TokenBasedRule[];
}

// Type Guards

function hasProperties<T extends Record<string, unknown>>(
  value: unknown,
  props: Record<keyof T, (value: unknown) => boolean>
): value is T {
  if (!isObject(value)) {
    return false;
  }
  return Object.entries(props).every(([key, guard]) => guard(value[key]));
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOptional<T>(guard: (v: unknown) => v is T): (v: unknown) => v is T | undefined {
  return (value): value is T | undefined => value === undefined || guard(value);
}

function isRecordOf<T>(value: unknown, guard: (v: unknown) => v is T): value is Record<string, T> {
  return isObject(value) && Object.values(value).every(guard);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isTokenColorWithAlphaRef(ref: unknown): ref is TokenColorWithAlphaRef {
  return hasProperties<TokenColorWithAlphaRef>(ref, {
    token: isString,
    alpha: isNumber
  });
}

function isTokenColorRef(ref: unknown): ref is TokenColorRef {
  return isString(ref) || isTokenColorWithAlphaRef(ref);
}

function isTokenBasedRule(rule: unknown): rule is TokenBasedRule {
  return hasProperties<TokenBasedRule>(rule, {
    foreground: isOptional(isTokenColorRef),
    background: isOptional(isTokenColorRef)
  });
}

function isTokenBasedThemeJSON(json: unknown): json is TokenBasedThemeJSON {
  if (!isObject(json)) return false;

  return hasProperties<TokenBasedThemeJSON>(json, {
    colors: value => isRecordOf(value, isTokenColorRef),
    rules: value => isRecordOf(value, isTokenBasedRule)
  });
}

// Theme processing logic

function lookupTokenValue(path: string, tokens: Record<string, unknown>): string {
  try {
    const tokenKey = `nve-${path.replace(/\./g, '-')}`;
    if (tokenKey in tokens) {
      const value = tokens[tokenKey];
      if (typeof value === 'string') {
        return value;
      }
      throw new Error(`Token value is not a string: ${path}`);
    }
    throw new Error(`Token not found: ${path}`);
  } catch (error) {
    throw new Error(
      `Failed to lookup token value for path "${path}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function parseColor(value: string) {
  try {
    const color = new Color(value);
    return color;
  } catch (error) {
    throw new Error(`Invalid color value: ${value}`);
  }
}

function rewriteColor(ref: TokenColorRef, tokens: Record<string, unknown>): string {
  if (isString(ref)) {
    const value = lookupTokenValue(ref, tokens);
    return parseColor(value).to('srgb').toString({ format: 'hex', collapse: false });
  }

  const baseValue = lookupTokenValue(ref.token, tokens);
  const color = parseColor(baseValue);
  color.alpha = ref.alpha;
  return color.to('srgb').toString({ format: 'hex', collapse: false });
}

function rewriteColors(colors: Record<string, TokenColorRef>, tokens: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(colors).map(([key, ref]) => [key, rewriteColor(ref, tokens)]));
}

function rewriteRule(rule: TokenBasedRule, tokens: Record<string, unknown>): TokenBasedRule {
  const result: TokenBasedRule = { ...rule };
  if (rule.foreground !== undefined) {
    result.foreground = rewriteColor(rule.foreground, tokens);
  }

  if (rule.background !== undefined) {
    result.background = rewriteColor(rule.background, tokens);
  }
  return result;
}

function rewriteRules(rules: TokenBasedRule[], tokens: Record<string, unknown>): TokenBasedRule[] {
  return rules.map(rule => rewriteRule(rule, tokens));
}

function buildTheme(filePath: string, tokens: Record<string, unknown>) {
  try {
    const theme = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!isTokenBasedThemeJSON(theme)) {
      throw new Error(`Invalid theme structure in file: ${filePath}`);
    }

    const colors = rewriteColors(theme.colors, tokens);
    const rules = rewriteRules(theme.rules, tokens);

    return { ...theme, colors, rules };
  } catch (error) {
    throw new Error(
      `Failed to build theme from file "${filePath}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Main

try {
  const lightTheme = buildTheme(path.join(inputPath, 'light.json'), lightTokens);
  const darkTheme = buildTheme(path.join(inputPath, 'dark.json'), darkTokens);

  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  fs.writeFileSync(path.join(outputPath, 'light.json'), JSON.stringify(lightTheme, null, 2));
  fs.writeFileSync(path.join(outputPath, 'dark.json'), JSON.stringify(darkTheme, null, 2));

  console.log('Successfully built themes');
} catch (error) {
  console.error('Failed to build themes:', error);
  process.exit(1);
}
