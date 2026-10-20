import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, libraryConfig, litConfig, jsonConfig, performanceConfig } from '@internals/eslint';

const decoderImportBoundary = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { boundary: 'Load geometry decoders only through dynamic imports in the decoder table.' }
  },
  create(context) {
    const table = context.filename.replaceAll('\\', '/').endsWith('/internal/layers/body/decoders.ts');
    const check = node => {
      const path = node.source?.value;
      if (typeof path !== 'string' || !/(?:^|\/)decoders\//.test(path)) return;
      if (table && node.type === 'ImportExpression') return;
      context.report({ node, messageId: 'boundary' });
    };
    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check
    };
  }
};

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...browserTypescriptConfig.map(config =>
    config.files?.includes('**/*.test.ts') ? { ...config, files: [...config.files, 'test/**/*.ts'] } : config
  ),
  ...performanceConfig,
  ...libraryConfig,
  ...litConfig,
  ...jsonConfig,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: { scene: { rules: { 'decoder-import-boundary': decoderImportBoundary } } },
    rules: {
      'local-typescript/no-internal-external-imports': 'error',
      'scene/decoder-import-boundary': 'error'
    }
  },
  {
    rules: {
      'local/primitive-property': 'off',
      'local-typescript/example-template-size': 'off'
    }
  }
];
