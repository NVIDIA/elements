// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, resolve, dirname } from 'path';

const rootDir = resolve(import.meta.dirname, '../../../../../');
const wireitScripts = new Map(); // key: "package-path:script-name", value: script config

function findPackageJsonFiles(dir: string, results: string[] = []): string[] {
  try {
    const items = readdirSync(dir);

    for (const item of items) {
      if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'coverage' || item === '.wireit') {
        continue;
      }

      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        findPackageJsonFiles(fullPath, results);
      } else if (item === 'package.json') {
        results.push(fullPath);
      }
    }
  } catch {
    // skip directories we can't read
  }

  return results;
}

function parseDependency(dep: string | { script: string; cascade?: boolean }, currentPackagePath: string) {
  let scriptRef: string = typeof dep === 'string' ? dep : dep.script;
  let cascade = true;

  if (typeof dep === 'object' && dep.script) {
    scriptRef = dep.script;
    cascade = dep.cascade !== false;
  }

  // Check if this is a cross-package dependency (e.g., "../other-package:build")
  // vs a same-package script with colon in name (e.g., "build:styledictionary")
  // Cross-package refs will contain path separators before the colon
  const colonIndex = scriptRef.indexOf(':');
  const isCrossPackageRef = colonIndex > 0 && scriptRef.substring(0, colonIndex).includes('/');

  if (isCrossPackageRef) {
    const [path, scriptName] = scriptRef.split(':');
    const absolutePath = resolve(dirname(currentPackagePath), path!);
    const packagePath = findPackageJsonInDir(absolutePath);
    return { packagePath, scriptName, cascade };
  } else {
    return { packagePath: currentPackagePath, scriptName: scriptRef, cascade };
  }
}

function findPackageJsonInDir(dir: string): string | null {
  let currentDir = resolve(dir);
  const root = resolve('/');

  while (currentDir !== root) {
    const packagePath = join(currentDir, 'package.json');
    try {
      statSync(packagePath);
      return packagePath;
    } catch {
      currentDir = dirname(currentDir);
    }
  }

  return null;
}

function extractWireitScripts(packageJsonPath: string) {
  try {
    const content = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const wireit = content.wireit || {};
    const packageName = content.name || relative(rootDir, dirname(packageJsonPath));

    for (const [scriptName, config] of Object.entries(wireit)) {
      const key = `${packageJsonPath}:${scriptName}`;
      wireitScripts.set(key, {
        packagePath: packageJsonPath,
        packageName,
        scriptName,
        config,
        dependencies: []
      });
    }
  } catch (err) {
    console.error(`Error reading ${packageJsonPath}:`, (err as Error).message);
  }
}

function buildDependencyGraph() {
  for (const [key, script] of wireitScripts.entries()) {
    const deps = script.config.dependencies || [];

    for (const dep of deps) {
      try {
        const { packagePath, scriptName } = parseDependency(dep, script.packagePath);
        if (packagePath) {
          const depKey = `${packagePath}:${scriptName}`;
          script.dependencies.push(depKey);
        }
      } catch (err) {
        console.error(`error parsing dependency in ${key}:`, (err as Error).message);
      }
    }
  }
}

function createLabel(packageName: string, scriptName: string) {
  const shortName = packageName
    .replace('@nvidia-elements/', '')
    .replace('@nvidia-elements/', 'labs/')
    .replace('@internals/', 'internals/');
  return `${shortName}:${scriptName}`;
}

export function generateGraphData() {
  findPackageJsonFiles(rootDir).forEach(file => extractWireitScripts(file));
  buildDependencyGraph();

  const nodes = [];
  const links = [];

  const dependencyCounts = new Map();
  for (const script of wireitScripts.values()) {
    for (const depKey of script.dependencies) {
      dependencyCounts.set(depKey, (dependencyCounts.get(depKey) || 0) + 1);
    }
  }

  for (const [key, script] of wireitScripts.entries()) {
    const label = createLabel(script.packageName, script.scriptName);
    const dependents = dependencyCounts.get(key) || 0;

    let category = 'other';
    if (script.packageName.includes('elements-workspace')) category = 'root';
    else if (script.packageName.includes('internals/')) category = 'internals';
    else if (script.packageName.includes('labs/')) category = 'labs';
    else if (script.packageName.includes('elements')) category = 'elements';
    else if (script.packageName.includes('starter')) category = 'starters';
    else if (script.packageName.includes('site')) category = 'site';
    else if (script.packageName.includes('testing')) category = 'testing';
    else if (script.packageName.includes('themes')) category = 'themes';
    else if (script.packageName.includes('styles')) category = 'styles';

    nodes.push({
      id: key.replace(rootDir, ''),
      label,
      packageName: script.packageName,
      scriptName: script.scriptName,
      dependents,
      dependencies: script.dependencies.length,
      category
    });
  }

  for (const [key, script] of wireitScripts.entries()) {
    for (const depKey of script.dependencies) {
      if (wireitScripts.has(depKey)) {
        links.push({
          source: key.replace(rootDir, ''),
          target: depKey.replace(rootDir, '')
        });
      }
    }
  }

  return { nodes, links };
}
