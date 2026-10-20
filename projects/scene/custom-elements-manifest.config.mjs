// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import baseConfig from '../internals/vite/src/plugins/cem.config.mjs';

// Analyze shared hosts so public layers retain inherited properties, methods, and events.
const inheritedApiSources = new Set([
  resolve('src/internal/layers/markers/layer-element.ts'),
  resolve('src/internal/layers/streaming/layer-element.ts')
]);

function layerSourceTypesPlugin() {
  const sources = new Map();
  return {
    name: 'scene-layer-source-types',
    analyzePhase({ ts, node }) {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const base = node.heritageClauses
        ?.flatMap(clause => [...clause.types])
        .find(type => ['MarkerLayerElement', 'StreamingLayerElement'].includes(type.expression.getText()));
      const source = base?.typeArguments?.[0]?.getText();
      if (source) sources.set(node.name.text, source);
    },
    packageLinkPhase({ customElementsManifest }) {
      for (const module of customElementsManifest.modules) {
        for (const declaration of module.declarations ?? []) {
          const sourceType = sources.get(declaration.name);
          const source = declaration.members?.find(member => member.name === 'source');
          // Specialize the shared host's type parameter using the actual extends clause.
          if (sourceType && source?.inheritedFrom) source.type = { text: `${sourceType} | null` };
        }
      }
    }
  };
}

function sourceFiles(directory) {
  return readdirSync(resolve(directory), { recursive: true })
    .filter(path => typeof path === 'string' && path.endsWith('.ts'))
    .map(path => resolve(directory, path));
}

export default {
  ...baseConfig,
  plugins: [layerSourceTypesPlugin(), ...baseConfig.plugins],
  exclude: [
    ...baseConfig.exclude,
    ...sourceFiles('src/internal').filter(path => !inheritedApiSources.has(path)),
    resolve('src/errors.ts')
  ]
};
