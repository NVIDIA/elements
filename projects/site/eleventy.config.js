import { EleventyRenderPlugin, IdAttributePlugin } from '@11ty/eleventy';
import EleventyPluginVite from '@11ty/eleventy-plugin-vite';
import litPlugin from '@lit-labs/eleventy-plugin-lit';

import { BASE_URL } from './src/_11ty/layouts/common.js';
import { searchPlugin } from './src/_11ty/plugins/search.js';
import { elementLoaderTransform } from './src/_11ty/transforms/element-loader.js';
import { anchorGeneratorTransform } from './src/_11ty/transforms/anchor-generator.js';
import { htmlMinifyTransform } from './src/_11ty/transforms/html-minify.js';
import { apiShortcode, storyShortcode, installShortcode } from './src/_11ty/shortcodes/index.js';
import { renderInstallationShortcode, renderIntegrationShortcode } from './src/docs/integrations/shortcodes.js';
import { svgLogosShortcode } from './src/_11ty/shortcodes/svg-logos.js';
import { tokensShortcode } from './src/_11ty/shortcodes/tokens.js';
import markdown from './src/_11ty/libraries/markdown.js';
import { MetadataService } from '@internals/metadata';

const metadata = await MetadataService.getMetadata();

/**
 * List of components that benefit from Server-Side Rendering (SSR).
 * These components are selected based on:
 * - High performance gains from SSR
 * - Low inline script size
 * This helps minimize Rollup's memory footprint by limiting the dependency graph.
 */
const ssrEntrypoints = new Set([
  '@nvidia-elements/core/alert',
  '@nvidia-elements/core/avatar',
  '@nvidia-elements/core/badge',
  '@nvidia-elements/core/button',
  '@nvidia-elements/core/card',
  '@nvidia-elements/core/icon',
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
    metadata.projects['@nvidia-elements/core'].elements
      .filter(e => e.manifest?.metadata?.entrypoint && ssrEntrypoints.has(e.manifest?.metadata?.entrypoint))
      .map(
        e => `node_modules/${e.manifest.metadata.entrypoint.replace('@nvidia-elements/core', '@nvidia-elements/core/dist')}/define.js`
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
          external: ['open'] // todo: remove when tools have conditional exports
        },
        target: 'esnext',
        sourcemap: false,
        modulePreload: false,
        watch:
          process.env.ELEVENTY_RUN_MODE !== 'build'
            ? {
                buildDelay: 100
              }
            : undefined
      }
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
  eleventyConfig.addAsyncShortcode('story', storyShortcode);
  eleventyConfig.addAsyncShortcode('api', apiShortcode);
  eleventyConfig.addAsyncShortcode('tokens', tokensShortcode);
  eleventyConfig.addAsyncShortcode('install', installShortcode);
  eleventyConfig.addShortcode('svg-logos', svgLogosShortcode);
  eleventyConfig.addShortcode('installation', renderInstallationShortcode);
  eleventyConfig.addShortcode('integration', renderIntegrationShortcode);

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
      'src/docs/monaco/*.md'
    ]);
  });

  // Return build configuration
  return {
    dir: {
      input: 'src',
      output: 'dist',
      layouts: '_11ty/layouts'
    }
  };
}
