// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { basename, extname, isAbsolute, relative, resolve } from 'node:path';
import { ESLint, type Linter } from 'eslint';
import fastGlob from 'fast-glob';
import ignore from 'ignore';
import { elementsHtmlConfig, elementsJsonConfig } from '@nvidia-elements/lint/eslint';

export type ValidationLanguage = 'html' | 'json';

interface ValidationDiagnostic {
  file: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  severity: 'error' | 'warning';
  rule: string;
  message: string;
  suggestion?: string;
  fixable: boolean;
}

export interface ValidationResult {
  ok: boolean;
  summary: { files: number; errors: number; warnings: number; truncated: boolean };
  diagnostics: ValidationDiagnostic[];
}

interface ValidationInput {
  filename: string;
  source: string;
  lang?: ValidationLanguage;
  path?: string;
}

interface ValidateOptions {
  cwd?: string;
  maxDiagnostics?: number;
  fix?: boolean;
}

const MAX_FILES = 200;
const MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_DIAGNOSTICS = 100;

function languageForFilename(filename: string): ValidationLanguage | undefined {
  switch (extname(filename).toLowerCase()) {
    case '.html':
    case '.htm':
      return 'html';
    case '.json':
      return 'json';
    default:
      return undefined;
  }
}

function isWithinCwd(path: string, cwd: string): boolean {
  const pathRelative = relative(cwd, path);
  return pathRelative === '' || (!pathRelative.startsWith('..') && !isAbsolute(pathRelative));
}

function recommendedConfig(lang: ValidationLanguage): Linter.Config {
  const config = lang === 'html' ? elementsHtmlConfig : elementsJsonConfig;
  const files = lang === 'html' ? ['**/*.{html,htm}'] : ['**/*.json'];
  return { ...config, files };
}

function createLinter(lang: ValidationLanguage, options: ValidateOptions): ESLint {
  const cwd = options.cwd ?? process.cwd();
  return new ESLint({
    cwd,
    fix: options.fix ?? false,
    overrideConfigFile: true,
    overrideConfig: recommendedConfig(lang)
  });
}

function diagnosticFromMessage(file: string, message: Linter.LintMessage): ValidationDiagnostic {
  const suggestion = message.suggestions?.[0]?.fix.text ?? suggestionInMessage(message.message);
  const line = diagnosticPosition(message.line);
  const column = diagnosticPosition(message.column);
  return {
    file,
    line,
    column,
    endLine: message.endLine ?? line,
    endColumn: message.endColumn ?? column,
    severity: message.severity === 2 ? 'error' : 'warning',
    rule: message.ruleId ?? 'eslint',
    message: message.message,
    ...(suggestion ? { suggestion } : {}),
    fixable: Boolean(message.fix)
  };
}

function diagnosticPosition(position: number | undefined): number {
  return position ?? 1;
}

function suggestionInMessage(message: string): string | undefined {
  return message.match(/Use <([^>]+)> instead\./)?.[1] ?? message.match(/Use "([^"]+)" instead\./)?.[1];
}

export async function validate(inputs: ValidationInput[], options: ValidateOptions = {}): Promise<ValidationResult> {
  const cwd = options.cwd ?? process.cwd();
  const maxDiagnostics = options.maxDiagnostics ?? DEFAULT_MAX_DIAGNOSTICS;
  if (!Number.isSafeInteger(maxDiagnostics) || maxDiagnostics < 1)
    throw new Error('maxDiagnostics must be a positive integer.');
  if (inputs.length > MAX_FILES) throw new Error(`Validation is limited to ${MAX_FILES} files per invocation.`);
  if (inputs.reduce((total, input) => total + Buffer.byteLength(input.source), 0) > MAX_BYTES)
    throw new Error(`Validation is limited to ${MAX_BYTES} bytes per invocation.`);
  const allDiagnostics = (await Promise.all(inputs.map(input => validateInput(input, { ...options, cwd })))).flat();
  const errors = allDiagnostics.filter(diagnostic => diagnostic.severity === 'error').length;
  const warnings = allDiagnostics.length - errors;
  return {
    ok: errors === 0,
    summary: { files: inputs.length, errors, warnings, truncated: allDiagnostics.length > maxDiagnostics },
    diagnostics: allDiagnostics.slice(0, maxDiagnostics)
  };
}

async function validateInput(input: ValidationInput, options: ValidateOptions): Promise<ValidationDiagnostic[]> {
  const cwd = options.cwd ?? process.cwd();
  const filename = resolve(cwd, input.filename);
  if (!isWithinCwd(filename, cwd))
    throw new Error(`Refusing to validate outside the current directory: ${input.filename}`);
  const eslint = createLinter(getValidationLanguage(input), options);
  const [result] = await eslint.lintText(input.source, { filePath: filename });
  await writeFixedFile(input, result?.output, { fix: options.fix ?? false, cwd });
  return (result?.messages ?? []).map(message => diagnosticFromMessage(input.filename, message));
}

function getValidationLanguage(input: ValidationInput): ValidationLanguage {
  const lang = input.lang ?? languageForFilename(input.filename);
  if (!lang) throw new Error(`Unsupported validation file type: ${input.filename}. Use HTML or JSON.`);
  return lang;
}

async function writeFixedFile(
  input: ValidationInput,
  output: string | undefined,
  options: { fix: boolean; cwd: string }
) {
  if (!options.fix || output === undefined || !input.path) return;
  const canonicalCwd = await realpath(options.cwd);
  const canonicalPath = await realpath(resolve(canonicalCwd, input.path));
  if (!isWithinCwd(canonicalPath, canonicalCwd))
    throw new Error(`Refusing to write outside the current directory: ${input.path}`);
  await writeFile(canonicalPath, output);
}

/** Expand and read safe, supported paths for validation. */
export async function readValidationPaths(paths: string[], cwd = process.cwd()): Promise<ValidationInput[]> {
  if (paths.length === 0) throw new Error('Provide one or more paths, or use --stdin.');
  const canonicalCwd = await realpath(cwd);
  const safePaths = await getSafePathPatterns(paths, canonicalCwd);
  const gitignore = await readGitignore(canonicalCwd);
  const resolvedPaths = fastGlob.stream(safePaths, {
    cwd: canonicalCwd,
    absolute: true,
    onlyFiles: true,
    ignore: ['**/node_modules/**', '**/.git/**'],
    dot: false
  });
  const matches = await getSupportedPaths(resolvedPaths as AsyncIterable<string>, canonicalCwd, gitignore);
  if (!matches.found) throw new Error('No files matched the provided paths.');
  const supportedPaths = matches.paths;
  const bytes = (await Promise.all(supportedPaths.map(path => stat(path)))).reduce(
    (total, file) => total + file.size,
    0
  );
  if (bytes > MAX_BYTES) throw new Error(`Validation is limited to ${MAX_BYTES} bytes per invocation.`);
  const supportedFiles = await Promise.all(supportedPaths.map(path => readValidationPath(path, canonicalCwd)));
  if (supportedFiles.length === 0) throw new Error('No supported HTML or JSON files matched the provided paths.');
  return supportedFiles;
}

async function readGitignore(cwd: string) {
  try {
    return ignore().add(await readFile(resolve(cwd, '.gitignore'), 'utf8'));
  } catch (error) {
    if (isMissingFileError(error)) return undefined;
    throw error;
  }
}

async function getSafePathPatterns(paths: string[], cwd: string): Promise<string[]> {
  return Promise.all(paths.map(path => getSafePathPattern(path, cwd)));
}

async function getSafePathPattern(path: string, cwd: string): Promise<string> {
  if (path.split(/[\\/]/).includes('..'))
    throw new Error(`Refusing path traversal outside the current directory: ${path}`);
  const resolvedPath = resolve(cwd, path);
  try {
    const canonicalPath = await realpath(resolvedPath);
    if (!isWithinCwd(canonicalPath, cwd)) throw new Error(`Refusing to read outside the current directory: ${path}`);
    return fastGlob.convertPathToPattern(canonicalPath);
  } catch (error) {
    if (!isMissingFileError(error)) throw error;
  }
  if (isAbsolute(path) && !isWithinCwd(resolvedPath, cwd))
    throw new Error(`Refusing to read outside the current directory: ${path}`);
  return process.platform === 'win32' ? path.replaceAll('\\', '/') : path;
}

async function getSupportedPaths(
  paths: AsyncIterable<string>,
  cwd: string,
  gitignore: ReturnType<typeof ignore> | undefined
) {
  let found = false;
  const supportedPaths: string[] = [];
  for await (const path of paths) {
    found = true;
    if (!languageForFilename(path)) continue;
    const supportedPath = await getSupportedPath(path, cwd, gitignore);
    if (!supportedPath) continue;
    if (supportedPaths.length === MAX_FILES)
      throw new Error(`Validation is limited to ${MAX_FILES} files per invocation.`);
    supportedPaths.push(supportedPath);
  }
  return { found, paths: supportedPaths.sort() };
}

async function getSupportedPath(path: string, cwd: string, gitignore: ReturnType<typeof ignore> | undefined) {
  const relativePath = relative(cwd, path).replaceAll('\\', '/');
  if (gitignore?.ignores(relativePath)) return undefined;
  const canonicalPath = await realpath(path);
  if (!isWithinCwd(canonicalPath, cwd)) throw new Error(`Refusing to read outside the current directory: ${path}`);
  if (!languageForFilename(canonicalPath)) return undefined;
  return canonicalPath;
}

async function readValidationPath(path: string, cwd: string): Promise<ValidationInput> {
  const lang = languageForFilename(path);
  if (!lang) throw new Error(`Unsupported validation file type: ${path}.`);
  return {
    filename: relative(cwd, path),
    source: await readFile(path, 'utf8'),
    lang,
    path
  };
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

/**
 * Read UTF-8 text from standard input.
 * @returns A promise that resolves to the accumulated input.
 */
export function readStdin(): Promise<string> {
  return new Promise((resolveStdin, reject) => {
    let source = '';
    let bytes = 0;
    const stdin = process.stdin;
    const cleanup = () => {
      stdin.off('data', onData);
      stdin.off('end', onEnd);
      stdin.off('error', onError);
    };
    const onData = (chunk: string | Buffer) => {
      const text = String(chunk);
      source += text;
      bytes += Buffer.byteLength(text);
      if (bytes > MAX_BYTES) {
        stdin.pause();
        cleanup();
        reject(new Error(`Validation is limited to ${MAX_BYTES} bytes per invocation.`));
      }
    };
    const onEnd = () => {
      cleanup();
      resolveStdin(source);
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    stdin.setEncoding('utf8');
    stdin.on('data', onData);
    stdin.on('end', onEnd);
    stdin.on('error', onError);
  });
}

export function validateVirtualFilename(filename: string, cwd = process.cwd()): string {
  const resolvedFilename = resolve(cwd, filename);
  if (!isWithinCwd(resolvedFilename, cwd))
    throw new Error(`Refusing a virtual filename outside the current directory: ${filename}`);
  return relative(cwd, resolvedFilename) || basename(resolvedFilename);
}

export function formatValidationResult(result: ValidationResult): string {
  const heading = result.ok ? 'Validation passed' : 'Validation found errors';
  const summary = `${result.summary.files} file${result.summary.files === 1 ? '' : 's'}, ${result.summary.errors} errors, ${result.summary.warnings} warnings`;
  const diagnostics = result.diagnostics.map(diagnostic => {
    const location = `${diagnostic.file}:${diagnostic.line}:${diagnostic.column}`;
    const suggestion = diagnostic.suggestion ? ` Suggestion: \`${diagnostic.suggestion}\`.` : '';
    return `- **${diagnostic.severity}** ${location} \`${diagnostic.rule}\`: ${diagnostic.message}${suggestion}`;
  });
  return [`## ${heading}`, '', summary, ...(diagnostics.length ? ['', ...diagnostics] : [])].join('\n');
}
