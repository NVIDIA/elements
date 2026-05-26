import { EleventyRenderPlugin } from '@11ty/eleventy';
import EleventyPluginVite from '@11ty/eleventy-plugin-vite';
import litPlugin from '@lit-labs/eleventy-plugin-lit';
import { ApiService } from '@internals/metadata';

const ssrPackageNames = ['@nvidia-elements/code', '@nvidia-elements/core', '@nvidia-elements/media'];

const getSsrPackageName = entrypoint => ssrPackageNames.find(packageName => entrypoint?.startsWith(`${packageName}/`));

const apis = await ApiService.getData();
const entrypoints = apis.data.elements
  .filter(
    e =>
      e.manifest?.metadata?.entrypoint &&
      getSsrPackageName(e.manifest.metadata.entrypoint) &&
      e.manifest?.deprecated !== 'true'
  )
  .map(e => {
    const packageName = getSsrPackageName(e.manifest.metadata.entrypoint);
    return `node_modules/${e.manifest.metadata.entrypoint.replace(packageName, `${packageName}/dist`)}/define.js`;
  });

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
        target: 'esnext',
        sourcemap: false,
        reportCompressedSize: false
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
