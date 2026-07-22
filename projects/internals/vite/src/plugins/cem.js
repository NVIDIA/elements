import fs from 'fs';
import path from 'path';
import { cli } from '@custom-elements-manifest/analyzer/cli.js';
import { generateVsCodeCustomElementData } from 'custom-element-vs-code-integration';

const resolve = rel => path.join(process.cwd(), rel);

function getCustomDataPaths(packageJson) {
  const customDataPaths = packageJson.contributes?.html?.customData;
  if (customDataPaths === undefined) return [];

  if (
    !Array.isArray(customDataPaths) ||
    customDataPaths.length === 0 ||
    customDataPaths.some(customDataPath => typeof customDataPath !== 'string')
  ) {
    throw new Error(
      `${packageJson.name}: contributes.html.customData must be a non-empty array of package-relative paths.`
    );
  }

  return customDataPaths;
}

function isPackageRelativePath(packagePath) {
  return packagePath.startsWith('./') && !packagePath.split('/').includes('..');
}

function getPackagePath(packageDirectory, packagePath) {
  if (!isPackageRelativePath(packagePath)) return undefined;

  const resolvedPath = path.resolve(packageDirectory, packagePath);
  const pathFromPackage = path.relative(packageDirectory, resolvedPath);
  return pathFromPackage.startsWith('..') || pathFromPackage === '' ? undefined : resolvedPath;
}

function hasManifestTags(manifest) {
  return (manifest.modules ?? []).some(module => (module.declarations ?? []).some(declaration => declaration.tagName));
}

export function getCustomDataOutputs(packageJson, manifest, packageDirectory) {
  const customDataPaths = getCustomDataPaths(packageJson);
  const hasComponents = hasManifestTags(manifest);
  const customDataOutputs = customDataPaths.map(customDataPath => {
    const outputPath = getPackagePath(packageDirectory, customDataPath);
    if (!outputPath) {
      throw new Error(
        `${packageJson.name}: contributes.html.customData path "${customDataPath}" must be package-relative.`
      );
    }

    return {
      outdir: path.dirname(outputPath),
      htmlFileName: path.basename(outputPath)
    };
  });

  if (hasComponents && customDataOutputs.length === 0) {
    throw new Error(
      `${packageJson.name}: Custom Elements Manifest declares tags but contributes.html.customData is missing.`
    );
  }

  return hasComponents ? customDataOutputs : [];
}

function normalizeURL(value) {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

const referenceNameByMetadataName = {
  aria: 'WAI-ARIA Reference',
  documentation: 'Documentation'
};

function generateVsCodeCustomElementDataReference(manifestMetadataName, manifestMetadataValue) {
  const name = referenceNameByMetadataName[manifestMetadataName];
  const url = normalizeURL(manifestMetadataValue);

  return name && url ? { name, url } : null;
}

/**
 * Generates a Custom Elements Manifest on initial build
 */
export function cem() {
  return {
    name: 'cem',
    apply: 'build',
    async buildEnd() {
      if (process.env.VITE_INITIAL_BUILD) {
        const hasConfig = fs.existsSync(resolve('./custom-elements-manifest.config.mjs'));
        const configPath = hasConfig
          ? resolve('./custom-elements-manifest.config.mjs')
          : new URL('cem.config.mjs', import.meta.url).toString().replace('file://', '');

        const manifest = await cli({ argv: ['analyze', '--config', configPath, '--outdir', './dist'] });
        const packageJson = JSON.parse(fs.readFileSync(resolve('./package.json'), 'utf8'));
        const customDataOutputs = getCustomDataOutputs(packageJson, manifest, process.cwd());

        if (customDataOutputs.length > 0) {
          // deep clone
          const vsCodeManifest = structuredClone(manifest);
          vsCodeManifest.modules.forEach(module => {
            module.declarations
              .filter(declaration => declaration.tagName)
              .forEach(declaration => {
                declaration.attributes = (declaration.attributes ?? []).filter(attr => !attr.deprecated);
              });
          });

          customDataOutputs.forEach(output => {
            generateVsCodeCustomElementData(vsCodeManifest, {
              ...output,
              cssFileName: null,
              referencesTemplate: (_name, tag) => {
                const declaration = vsCodeManifest.modules
                  .flatMap(module => module.declarations)
                  .find(d => d.tagName === tag);
                return Object.entries(declaration?.metadata ?? {}).flatMap(([name, value]) => {
                  const reference = generateVsCodeCustomElementDataReference(name, value);
                  return reference ? [reference] : [];
                });
              }
            });
          });
        }
      }
    }
  };
}
