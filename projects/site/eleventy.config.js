import { EleventyRenderPlugin, IdAttributePlugin } from '@11ty/eleventy';
import EleventyPluginVite from '@11ty/eleventy-plugin-vite';
import litPlugin from '@lit-labs/eleventy-plugin-lit';

import { BASE_URL } from './src/_11ty/layouts/common.js';
import { searchPlugin } from './src/_11ty/plugins/search.js';
import { elementLoaderTransform } from './src/_11ty/transforms/element-loader.js';
import { anchorGeneratorTransform } from './src/_11ty/transforms/anchor-generator.js';
import { htmlMinifyTransform } from './src/_11ty/transforms/html-minify.js';
import { apiShortcode, storyShortcode, installShortcode } from './src/_11ty/shortcodes/index.js';
import { svgLogosShortcode } from './src/_11ty/shortcodes/svg-logos.js';
import { tokensShortcode } from './src/_11ty/shortcodes/tokens.js';
import markdown from './src/_11ty/libraries/markdown.js';
import { MetadataService } from '@nve-internals/metadata';

const metadata = await MetadataService.getMetadata();

// Temporary:Exclude certain components that have low performance gains from SSR or high inline
// This minimizes the memory footprint of Rollup which builds a dependency graph of all pages
const ssrEntrypoints = new Set([
  '@nvidia-elements/core/accordion',
  '@nvidia-elements/core/alert',
  '@nvidia-elements/core/avatar',
  '@nvidia-elements/core/badge',
  '@nvidia-elements/core/button',
  '@nvidia-elements/core/card',
  '@nvidia-elements/core/icon',
  '@nvidia-elements/core/icon-button',
  '@nvidia-elements/core/logo',
  '@nvidia-elements/core/page',
  '@nvidia-elements/core/page-header'
]);

const entrypoints = [
  ...new Set(
    metadata['@nvidia-elements/core'].elements
      .filter(e => e.manifest?.metadata?.entrypoint && ssrEntrypoints.has(e.manifest?.metadata?.entrypoint))
      .map(
        e => `node_modules/${e.manifest.metadata.entrypoint.replace('@nvidia-elements/core', '@nvidia-elements/core/dist')}/define.js`
      )
  )
];

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(IdAttributePlugin, { checkDuplicates: false });
  eleventyConfig.setFrontMatterParsingOptions({ language: 'js' });
  eleventyConfig.addPassthroughCopy('src/**/*.ts');
  eleventyConfig.addPassthroughCopy('src/**/*.css');

  eleventyConfig.addPlugin(litPlugin, {
    mode: 'worker',
    componentModules: ['node_modules/@nvidia-elements/core/dist/icon/server.js', ...entrypoints]
  });

  eleventyConfig.addPlugin(EleventyPluginVite, {
    viteOptions: {
      base: BASE_URL,
      build: {
        target: 'esnext',
        sourcemap: false,
        modulePreload: false
      }
    }
  });

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

  eleventyConfig.addPlugin(searchPlugin, {
    outputPath: './.11ty-vite/public/.pagefind'
  });

  eleventyConfig.setLibrary('md', markdown);

  eleventyConfig.addAsyncShortcode('story', storyShortcode);
  eleventyConfig.addAsyncShortcode('api', apiShortcode);
  eleventyConfig.addAsyncShortcode('tokens', tokensShortcode);
  eleventyConfig.addAsyncShortcode('install', installShortcode);
  eleventyConfig.addShortcode('svg-logos', svgLogosShortcode);
  eleventyConfig.addTransform('element-loader', elementLoaderTransform);
  eleventyConfig.addTransform('anchor-generator', anchorGeneratorTransform);
  eleventyConfig.addTransform('html-minify', htmlMinifyTransform);
  return {
    dir: {
      input: 'src',
      output: 'dist',
      layouts: '_11ty/layouts'
    }
  };
}
