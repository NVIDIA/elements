import { EleventyRenderPlugin } from '@11ty/eleventy';
import EleventyPluginVite from '@11ty/eleventy-plugin-vite';
import litPlugin from '@lit-labs/eleventy-plugin-lit';
import { MetadataService } from '@nve-internals/metadata';

const metadata = await MetadataService.getMetadata();
const entrypoints = metadata.projects['@nvidia-elements/core'].elements
  .filter(e => e.manifest?.metadata?.entrypoint)
  .map(e => `node_modules/${e.manifest.metadata.entrypoint.replace('@nvidia-elements/core', '@nvidia-elements/core/dist')}/define.js`);

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.setFrontMatterParsingOptions({ language: 'js' });
  eleventyConfig.addPassthroughCopy('src/**/*.ts');
  eleventyConfig.addPassthroughCopy('src/**/*.css');

  eleventyConfig.addPlugin(litPlugin, {
    mode: 'worker',
    componentModules: ['node_modules/@nvidia-elements/core/dist/icon/server.js', ...entrypoints]
  });

  eleventyConfig.addPlugin(EleventyPluginVite, {
    viteOptions: {
      build: {
        target: 'esnext'
      }
    }
  });

  return {
    dir: {
      input: 'src',
      output: 'dist'
    }
  };
}
