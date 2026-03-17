// @ts-check

import { EleventyRenderPlugin, IdAttributePlugin } from '@11ty/eleventy';
import EleventyPluginVite from '@11ty/eleventy-plugin-vite';
import litPlugin from '@lit-labs/eleventy-plugin-lit';

import { BASE_URL } from './src/_11ty/layouts/common.js';
import { searchPlugin } from './src/_11ty/plugins/search.js';
import { elementLoaderTransform } from './src/_11ty/transforms/element-loader.js';
import { anchorGeneratorTransform } from './src/_11ty/transforms/anchor-generator.js';
import { htmlMinifyTransform } from './src/_11ty/transforms/html-minify.js';
import { installShortcode, doDontShortcode, splitShortcode } from './src/_11ty/shortcodes/index.js';
import { exampleShortcode, exampleTagsShortcode } from './src/_11ty/shortcodes/example.js';
import { exampleDocShortcode } from './src/_11ty/shortcodes/example-doc.js';
import { exampleGroupShortcode } from './src/_11ty/shortcodes/example-group.js';
import { apiShortcode } from './src/_11ty/shortcodes/api.js';
import {
  renderInstallShortcode,
  renderInstallArtifactoryShortcode,
  renderInstallCLIShortcode,
  renderIntegrationShortcode
} from './src/docs/integrations/shortcodes.js';
import { renderArtifactoryUsageShortcode } from './src/_11ty/shortcodes/artifactory-usage.js';
import { svgLogoShortcode, svgLogosShortcode } from './src/_11ty/shortcodes/svg-logo.js';
import { tokensShortcode } from './src/_11ty/shortcodes/tokens.js';
import markdown from './src/_11ty/libraries/markdown.js';
import { ApiService } from '@internals/metadata';

const apis = await ApiService.getData();

/**
 * List of components that benefit from Server-Side Rendering (SSR).
 * These components are selected based on:
 * - High performance gains from SSR
 * - Low inline script size
 * This helps minimize Rollup's memory footprint by limiting the dependency graph.
 */
const ssrEntrypoints = new Set([
  '@nvidia-elements/core/button',
  '@nvidia-elements/core/card',
  '@nvidia-elements/core/icon-button',
  '@nvidia-elements/core/logo',
  '@nvidia-elements/core/page',
  '@nvidia-elements/core/page-header',
  '@nvidia-elements/core/tabs'
]);

/**
 * Generate list of component entrypoints for SSR.
 * Filters components based on ssrEntrypoints set and maps to their define.js paths.
 */
const entrypoints = [
  ...new Set(
    apis.data.elements
      .filter(
        e =>
          e.manifest?.metadata?.entrypoint &&
          e.manifest.metadata.entrypoint.includes('@nvidia-elements/core') &&
          e.manifest?.deprecated !== 'true' &&
          ssrEntrypoints.has(e.manifest?.metadata?.entrypoint)
      )
      .map(
        e => `node_modules/${e.manifest?.metadata?.entrypoint.replace('@nvidia-elements/core', '@nvidia-elements/core/dist')}/define.js`
      )
  )
];

/**
 * Main 11ty configuration function
 * Sets up plugins, transforms, collections, and build options
 */
export default function (eleventyConfig) {
  // Add core 11ty plugins
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(IdAttributePlugin, { checkDuplicates: false });

  // Configure front matter parsing and file copying
  eleventyConfig.setFrontMatterParsingOptions({ language: 'js' });
  eleventyConfig.addPassthroughCopy('src/**/*.ts');
  eleventyConfig.addPassthroughCopy('src/**/*.css');

  // Configure Lit SSR plugin for web components
  eleventyConfig.addPlugin(litPlugin, {
    mode: 'worker',
    componentModules: ['node_modules/@nvidia-elements/core/dist/icon/server.js', ...entrypoints]
  });

  // Configure Vite plugin for modern JavaScript bundling
  eleventyConfig.addPlugin(EleventyPluginVite, {
    viteOptions: {
      base: BASE_URL,
      build: {
        rollupOptions: {
          external: ['open', '@nvidia-elements/lint', '@nvidia-elements/lint/eslint/internals'] // todo: remove when tools have conditional exports
        },
        target: 'esnext',
        sourcemap: false,
        modulePreload: false,
        reportCompressedSize: false,
        watch:
          process.env.ELEVENTY_RUN_MODE !== 'build'
            ? {
                buildDelay: 1000
              }
            : undefined
      },
      plugins: [
        {
          name: 'remove-sourcemaps',
          transform(code) {
            return {
              code,
              map: { mappings: '' }
            };
          }
        }
      ]
    }
  });

  // Configure server options for development
  eleventyConfig.setServerOptions({
    onRequest: {
      '/': () => ({
        status: 307,
        headers: {
          Location: BASE_URL
        }
      })
    }
  });

  // Add search plugin for documentation search functionality
  if (process.env.ELEVENTY_RUN_MODE === 'build') {
    eleventyConfig.addPlugin(searchPlugin, {
      outputPath: './.11ty-vite/public/.pagefind'
    });
  }

  // Set custom markdown library
  eleventyConfig.setLibrary('md', markdown);

  // Register custom shortcodes for documentation
  eleventyConfig.addAsyncShortcode('example', exampleShortcode);
  eleventyConfig.addAsyncShortcode('example-doc', exampleDocShortcode);
  eleventyConfig.addPairedShortcode('example-group', exampleGroupShortcode);
  eleventyConfig.addAsyncShortcode('example-tags', exampleTagsShortcode);
  eleventyConfig.addAsyncShortcode('api', apiShortcode);
  eleventyConfig.addAsyncShortcode('tokens', tokensShortcode);
  eleventyConfig.addAsyncShortcode('install', installShortcode);
  eleventyConfig.addShortcode('svg-logos', svgLogosShortcode);
  eleventyConfig.addShortcode('svg-logo', svgLogoShortcode);
  eleventyConfig.addShortcode('installation', renderInstallShortcode);
  eleventyConfig.addShortcode('install-artifactory', renderInstallArtifactoryShortcode);
  eleventyConfig.addShortcode('install-cli', renderInstallCLIShortcode);
  eleventyConfig.addShortcode('integration', renderIntegrationShortcode);
  eleventyConfig.addShortcode('artifactory-usage', renderArtifactoryUsageShortcode);
  eleventyConfig.addPairedShortcode('dodont', doDontShortcode);
  eleventyConfig.addPairedShortcode('split', splitShortcode);

  // Register custom transforms for content processing
  eleventyConfig.addTransform('element-loader', elementLoaderTransform);
  eleventyConfig.addTransform('anchor-generator', anchorGeneratorTransform);

  if (process.env.ELEVENTY_RUN_MODE === 'build') {
    eleventyConfig.addTransform('html-minify', htmlMinifyTransform);
  }

  /**
   * Collections in 11ty are groups of content that can be filtered, sorted and accessed as a single unit.
   * They allow us to:
   *
   * - Group related content (like component docs) together
   * - Access the collection data in templates and layouts
   * - Sort and filter content based on frontmatter or other criteria
   *
   * This collection includes all markdown files in src/docs/elements/, making component docs easily accessible throughout the site build process.
   *
   * Used by `../src/docs/elements/_tabs/api.11ty.js` to generate the API documentation page for each component.
   */
  eleventyConfig.addCollection('componentDocs', function (collection) {
    // https://github.com/11ty/eleventy/issues/3838 each rebuild of any md file triggers all rebuilds of collection
    return collection.getFilteredByGlob([
      'src/docs/elements/*.md',
      'src/docs/elements/data-grid/index.md',
      'src/docs/code/*.md',
      'src/docs/monaco/*.md',
      'src/docs/markdown/index.md'
    ]);
  });

  // prevent rebuild of api, examples tabs, and example pages on each run
  if (process.env.ELEVENTY_RUN_MODE === 'serve') {
    const collectionCache = new Set();
    eleventyConfig.addPreprocessor('api-collection', '11ty.js', data => {
      if (collectionCache.has(data.page.filePathStem)) {
        return false; // skip collection file if already written
      }

      if (
        data.page.filePathStem.includes('_tabs/api') ||
        data.page.filePathStem.includes('_tabs/examples') ||
        data.page.filePathStem.startsWith('/examples/')
      ) {
        collectionCache.add(data.page.filePathStem); // add file to cache to skip it on next run
      }

      return undefined; // continue with the build
    });
  }

  return {
    dir: {
      input: 'src',
      output: 'dist',
      layouts: '_11ty/layouts'
    }
  };
}
