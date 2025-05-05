import { EleventyRenderPlugin, IdAttributePlugin } from '@11ty/eleventy';
import EleventyPluginVite from '@11ty/eleventy-plugin-vite';
import litPlugin from '@lit-labs/eleventy-plugin-lit';
import { BASE_URL } from './src/_11ty/layouts/common.js';
import { elementLoaderTransform } from './src/_11ty/transforms/element-loader.js';
import { anchorGeneratorTransform } from './src/_11ty/transforms/anchor-generator.js';
import { apiShortcode, storyShortcode } from './src/_11ty/shortcodes/index.js';
import { tokensShortcode } from './src/_11ty/shortcodes/tokens.js';
import markdown from './src/_11ty/libraries/markdown.js';
import { MetadataService } from '@nve-internals/metadata';

const metadata = await MetadataService.getMetadata();
const entrypoints = metadata['@nvidia-elements/core'].elements
  .filter(
    e =>
      e.manifest?.metadata?.entrypoint &&
      !e.manifest?.metadata?.entrypoint.includes('tree') &&
      !e.manifest?.metadata?.entrypoint.includes('grid')
  )
  .map(e => `node_modules/${e.manifest.metadata.entrypoint.replace('@nvidia-elements/core', '@nvidia-elements/core/dist')}/define.js`);

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
        sourcemap: false
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

  eleventyConfig.setLibrary('md', markdown);
  eleventyConfig.addAsyncShortcode('story', storyShortcode);
  eleventyConfig.addAsyncShortcode('api', apiShortcode);
  eleventyConfig.addAsyncShortcode('tokens', tokensShortcode);
  eleventyConfig.addTransform('element-loader', elementLoaderTransform);
  eleventyConfig.addTransform('anchor-generator', anchorGeneratorTransform);
  return {
    dir: {
      input: 'src',
      output: 'dist',
      layouts: '_11ty/layouts'
    }
  };
}
