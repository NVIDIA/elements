import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import path from 'path';
import * as url from 'url';
import { renderProjectNotice, renderRootNotice } from './template.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../../');
const PROJECTS_DIR = path.join(REPO_ROOT, 'projects');

const NOTICE_CONFIG_FIELDS = new Set(['bundled', 'assets']);
const BUNDLED_FIELDS = new Set(['name', 'version', 'license', 'author']);
const ASSETS_FIELDS = new Set(['header', 'entries']);
const ASSET_ENTRY_FIELDS = new Set(['name', 'url', 'license', 'copyright']);

function filterRuntimeDeps(pkg) {
  const out = [];
  const deps = pkg.dependencies ?? {};
  for (const [name, spec] of Object.entries(deps)) {
    if (typeof spec !== 'string') continue;
    if (spec.startsWith('workspace:') || spec.startsWith('link:') || spec.startsWith('file:')) {
      continue;
    }
    out.push(name);
  }
  return out;
}

function readInstalledPackage(projectDir, name) {
  const candidates = [
    path.join(projectDir, 'node_modules', name, 'package.json'),
    path.join(REPO_ROOT, 'node_modules', name, 'package.json')
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return JSON.parse(readFileSync(candidate, 'utf-8'));
  }
  throw new Error(
    `Could not locate installed package.json for "${name}" (searched ${candidates.join(', ')}). Run 'pnpm install' first.`
  );
}

function parseAuthor(author) {
  if (!author) return 'Unknown';
  if (typeof author === 'string') {
    return author.trim() || 'Unknown';
  }
  if (typeof author === 'object') {
    const { name, email, url: authorUrl } = author;
    if (!name) return 'Unknown';
    let result = name;
    if (email) result += ` <${email}>`;
    if (authorUrl) result += ` (${authorUrl})`;
    return result;
  }
  return 'Unknown';
}

function normalizeLicense(license) {
  if (!license) return 'Unknown';
  if (typeof license === 'string') return license;
  if (typeof license === 'object' && license !== null && 'type' in license) return license.type;
  return 'Unknown';
}

function discoverProjects() {
  const entries = readdirSync(PROJECTS_DIR, { withFileTypes: true });
  const projects = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(PROJECTS_DIR, entry.name, 'package.json');
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (Array.isArray(pkg.files) && pkg.files.includes('NOTICE.md')) {
      projects.push(entry.name);
    }
  }
  projects.sort();
  return projects;
}

function resolveDep(projectDir, name) {
  const pkg = readInstalledPackage(projectDir, name);
  if (!pkg.name) throw new Error(`Installed package at "${name}" has no "name" field.`);
  if (!pkg.version) throw new Error(`Installed package "${pkg.name}" has no "version" field.`);
  return {
    name: pkg.name,
    version: pkg.version,
    license: normalizeLicense(pkg.license),
    copyright: parseAuthor(pkg.author)
  };
}

function loadNoticeConfig(projectDir) {
  const noticePath = path.join(projectDir, 'notice.json');
  if (!existsSync(noticePath)) return { bundled: [], assets: null };

  const raw = JSON.parse(readFileSync(noticePath, 'utf-8'));
  for (const key of Object.keys(raw)) {
    if (!NOTICE_CONFIG_FIELDS.has(key)) {
      throw new Error(`Unknown key "${key}" in ${noticePath}. Allowed: ${[...NOTICE_CONFIG_FIELDS].join(', ')}.`);
    }
  }

  const bundled = raw.bundled ?? [];
  for (const entry of bundled) {
    for (const key of Object.keys(entry)) {
      if (!BUNDLED_FIELDS.has(key)) {
        throw new Error(
          `Unknown key "${key}" in bundled entry in ${noticePath}. Allowed: ${[...BUNDLED_FIELDS].join(', ')}.`
        );
      }
    }
    for (const required of BUNDLED_FIELDS) {
      if (!entry[required]) throw new Error(`Missing "${required}" in bundled entry in ${noticePath}.`);
    }
  }

  const assets = raw.assets ?? null;
  if (assets !== null) {
    for (const key of Object.keys(assets)) {
      if (!ASSETS_FIELDS.has(key)) {
        throw new Error(`Unknown key "${key}" in assets in ${noticePath}. Allowed: ${[...ASSETS_FIELDS].join(', ')}.`);
      }
    }
    if (!assets.header) throw new Error(`Missing "header" in assets in ${noticePath}.`);
    if (!Array.isArray(assets.entries) || assets.entries.length === 0) {
      throw new Error(`Missing or empty "entries" in assets in ${noticePath}.`);
    }
    for (const entry of assets.entries) {
      for (const key of Object.keys(entry)) {
        if (!ASSET_ENTRY_FIELDS.has(key)) {
          throw new Error(
            `Unknown key "${key}" in asset entry in ${noticePath}. Allowed: ${[...ASSET_ENTRY_FIELDS].join(', ')}.`
          );
        }
      }
      for (const required of ['name', 'license', 'copyright']) {
        if (!entry[required]) throw new Error(`Missing "${required}" in asset entry in ${noticePath}.`);
      }
    }
  }

  return { bundled, assets };
}

function resolveBundled(projectDir, entry) {
  const installed = readInstalledPackage(projectDir, entry.name);
  if (installed.version && installed.version !== entry.version) {
    throw new Error(
      `notice.json declares ${entry.name}@${entry.version} but node_modules has @${installed.version}. Update notice.json.`
    );
  }
  return {
    name: entry.name,
    version: entry.version,
    license: entry.license,
    copyright: entry.author
  };
}

function resolveProject(project) {
  const projectDir = path.join(PROJECTS_DIR, project);
  const pkg = JSON.parse(readFileSync(path.join(projectDir, 'package.json'), 'utf-8'));
  const depNames = filterRuntimeDeps(pkg);
  const resolvedDeps = depNames.map(name => resolveDep(projectDir, name));
  const { bundled, assets } = loadNoticeConfig(projectDir);
  const bundledDeps = bundled.map(entry => resolveBundled(projectDir, entry));
  const deps = [...resolvedDeps, ...bundledDeps];
  return { project, projectDir, pkg, deps, assets };
}

function aggregateForRoot(resolved) {
  const byKey = new Map();
  for (const { pkg, deps } of resolved) {
    for (const dep of deps) {
      const key = `${dep.name}@${dep.version}`;
      if (!byKey.has(key)) {
        byKey.set(key, { dep, usedBy: [] });
      }
      const entry = byKey.get(key);
      if (!entry.usedBy.includes(pkg.name)) {
        entry.usedBy.push(pkg.name);
      }
    }
  }
  return [...byKey.values()];
}

function writeFile(filePath, content) {
  writeFileSync(filePath, content, 'utf-8');
  console.log(`wrote ${path.relative(REPO_ROOT, filePath)}`);
}

const projects = discoverProjects();
const resolved = projects.map(resolveProject);

for (const { projectDir, deps, assets } of resolved) {
  const content = renderProjectNotice({ deps, assets });
  writeFile(path.join(projectDir, 'NOTICE.md'), content);
}

const rootEntries = aggregateForRoot(resolved);
writeFile(path.join(REPO_ROOT, 'NOTICE.md'), renderRootNotice(rootEntries));
