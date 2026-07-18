const PACKAGE_FILES = ['*.config.{js,ts,mjs,cjs}', '*.{js,ts,mjs,cjs}'];
const PROJECT_FILES = ['*.{js,ts,mjs,cjs}'];
const SOURCE_FILES = ['src/**/*.{js,ts,tsx}'];
const SOURCE_INDEX = ['src/**/index.{js,ts,tsx}'];
const BUILD_FILES = ['build/**/*.{js,ts}'];
const DEFINE_ENTRIES = ['src/**/define.ts'];
const SERVER_ENTRIES = ['src/**/server.ts'];
const EXAMPLE_ENTRIES = ['src/**/*.examples.ts'];
const TEST_ENTRIES = ['src/**/*.test.{ts,tsx}'];
const TEST_VARIANT_ENTRIES = ['src/**/*.test.*.ts'];
const BUNDLE_ENTRIES = ['src/bundle.ts'];
const VITE_CONFIGS = ['vite*.ts'];
const VITEST_CONFIGS = ['vitest*.ts'];

/** @type {import('knip').KnipConfig} */
export default {
  exclude: ['catalog'],
  ignoreBinaries: ['codesign', 'vale'],
  ignoreDependencies: [
    '@eslint/js',
    '@internals/patterns',
    '@internals/testing',
    '@lit-labs/ssr-client',
    '@modelcontextprotocol/ext-apps',
    '@nvidia-elements/code',
    '@nvidia-elements/forms',
    '@nvidia-elements/lint',
    '@nvidia-elements/markdown',
    '@nvidia-elements/media',
    '@nvidia-elements/styles',
    '@semantic-release/commit-analyzer',
    '@semantic-release/github',
    '@semantic-release/npm',
    '@semantic-release/release-notes-generator',
    '@typescript-eslint/parser',
    '@typescript/lib-dom',
    'adm-zip',
    'archiver',
    'axe-core',
    'bun',
    'glob',
    'highlight.js',
    'lit',
    'lit-html',
    'lint-staged',
    'markdown-it',
    'minisearch',
    'monaco-editor',
    'open',
    'publint',
    'stylelint',
    'stylelint-config-standard',
    'ts-morph',
    'vite-plugin-virtual-html'
  ],
  ignoreFiles: ['projects/internals/vite/src/index.d.ts'],
  ignoreWorkspaces: ['projects/starters', 'projects/starters/**'],
  ignoreUnresolved: [
    '^\\.\\./test/demo\\.js$' // grid.examples.ts
  ],
  treatConfigHintsAsErrors: true,
  // Keep this map explicit so package additions and entrypoint changes are reviewed.
  workspaces: {
    '.': {
      entry: ['stylelint.config.mjs', '.husky/*', 'projects/internals/ci/**/*.js'],
      project: ['*.{js,mjs}', '.husky/*', 'projects/internals/ci/**/*.js']
    },
    'projects/cli': {
      entry: [...PACKAGE_FILES, ...SOURCE_INDEX, ...TEST_ENTRIES, ...VITE_CONFIGS, ...VITEST_CONFIGS],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/code': {
      entry: [
        ...PACKAGE_FILES,
        ...SOURCE_INDEX,
        ...DEFINE_ENTRIES,
        ...EXAMPLE_ENTRIES,
        ...TEST_ENTRIES,
        ...TEST_VARIANT_ENTRIES,
        ...BUNDLE_ENTRIES,
        ...VITE_CONFIGS,
        ...VITEST_CONFIGS
      ],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/core': {
      entry: [
        ...PACKAGE_FILES,
        ...BUILD_FILES,
        ...SOURCE_INDEX,
        ...DEFINE_ENTRIES,
        ...SERVER_ENTRIES,
        ...EXAMPLE_ENTRIES,
        ...TEST_ENTRIES,
        ...TEST_VARIANT_ENTRIES,
        ...BUNDLE_ENTRIES,
        ...VITE_CONFIGS,
        ...VITEST_CONFIGS
      ],
      project: [...PROJECT_FILES, ...BUILD_FILES, ...SOURCE_FILES]
    },
    'projects/create': {
      entry: [...PACKAGE_FILES, ...SOURCE_INDEX, ...VITE_CONFIGS],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/forms': {
      entry: [
        ...PACKAGE_FILES,
        ...SOURCE_INDEX,
        ...EXAMPLE_ENTRIES,
        ...TEST_ENTRIES,
        ...TEST_VARIANT_ENTRIES,
        ...VITE_CONFIGS,
        ...VITEST_CONFIGS
      ],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/internals/eslint': {
      entry: [...SOURCE_INDEX],
      project: [...SOURCE_FILES]
    },
    'projects/internals/metadata': {
      entry: [...PACKAGE_FILES, ...SOURCE_INDEX, ...TEST_ENTRIES, ...VITE_CONFIGS, ...VITEST_CONFIGS],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/internals/patterns': {
      entry: [...PACKAGE_FILES, ...SOURCE_INDEX, ...EXAMPLE_ENTRIES, ...VITE_CONFIGS],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/internals/testing': {
      entry: [...PACKAGE_FILES, ...SOURCE_INDEX, ...VITE_CONFIGS],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/internals/tools': {
      entry: [...PACKAGE_FILES, ...SOURCE_INDEX, ...TEST_ENTRIES, ...VITE_CONFIGS, ...VITEST_CONFIGS],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/internals/vite': {
      entry: [...SOURCE_INDEX],
      project: [...SOURCE_FILES]
    },
    'projects/lint': {
      entry: [...PACKAGE_FILES, ...SOURCE_INDEX, ...TEST_ENTRIES, ...VITE_CONFIGS, ...VITEST_CONFIGS],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/markdown': {
      entry: [
        ...PACKAGE_FILES,
        ...SOURCE_INDEX,
        ...DEFINE_ENTRIES,
        ...EXAMPLE_ENTRIES,
        ...TEST_ENTRIES,
        ...TEST_VARIANT_ENTRIES,
        ...VITE_CONFIGS,
        ...VITEST_CONFIGS
      ],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/media': {
      entry: [
        ...PACKAGE_FILES,
        ...SOURCE_INDEX,
        ...EXAMPLE_ENTRIES,
        ...TEST_ENTRIES,
        ...TEST_VARIANT_ENTRIES,
        ...VITE_CONFIGS,
        ...VITEST_CONFIGS
      ],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
    'projects/monaco': {
      entry: [
        ...PACKAGE_FILES,
        ...BUILD_FILES,
        ...SOURCE_INDEX,
        ...DEFINE_ENTRIES,
        ...EXAMPLE_ENTRIES,
        ...TEST_ENTRIES,
        ...TEST_VARIANT_ENTRIES,
        ...BUNDLE_ENTRIES,
        ...VITE_CONFIGS,
        ...VITEST_CONFIGS
      ],
      project: [...PROJECT_FILES, ...BUILD_FILES, ...SOURCE_FILES]
    },
    'projects/pages': {
      entry: [...PROJECT_FILES],
      project: [...PROJECT_FILES]
    },
    'projects/site': {
      entry: [...PACKAGE_FILES, 'src/**/*.{js,ts}', ...VITEST_CONFIGS],
      project: [...PACKAGE_FILES, 'src/**/*.{js,ts}', ...VITEST_CONFIGS]
    },
    'projects/styles': {
      entry: [
        ...PACKAGE_FILES,
        ...BUILD_FILES,
        ...SOURCE_INDEX,
        ...EXAMPLE_ENTRIES,
        ...TEST_VARIANT_ENTRIES,
        ...VITE_CONFIGS,
        ...VITEST_CONFIGS
      ],
      project: [...PROJECT_FILES, ...BUILD_FILES, ...SOURCE_FILES]
    },
    'projects/themes': {
      entry: [
        ...PACKAGE_FILES,
        ...BUILD_FILES,
        ...SOURCE_INDEX,
        ...EXAMPLE_ENTRIES,
        ...TEST_VARIANT_ENTRIES,
        ...VITE_CONFIGS,
        ...VITEST_CONFIGS
      ],
      project: [...PROJECT_FILES, ...BUILD_FILES, ...SOURCE_FILES]
    }
  }
};
