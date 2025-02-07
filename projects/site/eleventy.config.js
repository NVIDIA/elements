import { EleventyRenderPlugin, IdAttributePlugin } from '@11ty/eleventy';
import EleventyPluginVite from '@11ty/eleventy-plugin-vite';
import { BASE_URL } from './src/_layouts/common.js';
import { elementLoaderTransform } from './src/_internals/transforms.js';
import { apiShortcode, storyShortcode } from './src/_internals/shortcodes.js';
import markdown from './src/_internals/markdown.js';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(IdAttributePlugin, { checkDuplicates: false });
  eleventyConfig.setFrontMatterParsingOptions({ language: 'js' });
  eleventyConfig.addPassthroughCopy('src/**/*.ts');
  eleventyConfig.addPassthroughCopy('src/**/*.css');
  eleventyConfig.addPlugin(EleventyPluginVite, {
    viteOptions: {
      base: BASE_URL,
      build: {
        target: 'esnext'
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
  eleventyConfig.addTransform('element-loader', elementLoaderTransform);

  return {
    dir: {
      input: 'src',
      output: 'dist',
      layouts: '_layouts'
    }
  };
}
