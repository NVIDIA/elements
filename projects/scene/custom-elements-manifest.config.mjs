// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import baseConfig from '../internals/vite/src/plugins/cem.config.mjs';

const streamingSourceTypes = new Map([
  ['nve-scene-lines', 'LineVertexInstanceSource | null'],
  ['nve-scene-points', 'PointInstanceSource | null'],
  ['nve-scene-triangles', 'TriangleVertexInstanceSource | null']
]);

const frameworkTypeNames = [
  'LineVertexBuffer',
  'LineVertexInstanceSource',
  'MarkerBuffer',
  'MarkerInstanceSource',
  'PickHit',
  'PointInstanceSource',
  'PolygonGeometry',
  'Quaternion',
  'RGBA',
  'SceneCameraChangeDetail',
  'SceneCameraProjection',
  'SceneErrorDetail',
  'TriangleVertexBuffer',
  'TriangleVertexInstanceSource',
  'Vec3'
];

function scenePublicApiPlugin() {
  return {
    name: 'scene-public-api',
    packageLinkPhase({ customElementsManifest }) {
      customElementsManifest.modules
        .flatMap(module => module.declarations ?? [])
        .filter(declaration => declaration.tagName)
        .forEach(declaration => {
          const instances = declaration.members?.find(member => member.name === 'instances');
          if (!instances) return;

          const sourceType = streamingSourceTypes.get(declaration.tagName);
          instances.type = {
            text: sourceType ?? 'MarkerInstanceSource | null'
          };
        });

      customElementsManifest.modules = customElementsManifest.modules.filter(
        module => !module.path.startsWith('/src/internal/') && module.path !== '/src/errors.js'
      );
    }
  };
}

function frameworkTypeImportsPlugin() {
  const typeImport = `import type {\n${frameworkTypeNames.map(name => `  ${name},`).join('\n')}\n} from './index.js';\n\n`;

  return {
    name: 'scene-framework-type-imports',
    packageLinkPhase() {
      for (const fileName of ['custom-elements-jsx.d.ts', 'custom-elements-vue.d.ts']) {
        const filePath = resolve('dist', fileName);
        const contents = readFileSync(filePath, 'utf8');
        if (!contents.startsWith(typeImport)) writeFileSync(filePath, `${typeImport}${contents}`);
      }
    }
  };
}

const plugins = [...baseConfig.plugins];
const publicPropertiesIndex = plugins.findIndex(plugin => plugin.name === 'public-properties-plugin');
plugins.splice(publicPropertiesIndex, 0, scenePublicApiPlugin());
plugins.push(frameworkTypeImportsPlugin());

export default {
  ...baseConfig,
  plugins
};
