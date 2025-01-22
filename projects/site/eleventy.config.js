import { EleventyRenderPlugin, IdAttributePlugin } from '@11ty/eleventy';
import EleventyPluginVite from '@11ty/eleventy-plugin-vite';
// import litPlugin from '@lit-labs/eleventy-plugin-lit';
import markdownIt from 'markdown-it';
import { BASE_URL } from './src/_layouts/common.js';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(IdAttributePlugin);
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

  // eleventyConfig.addPlugin(litPlugin, {
  //   mode: 'worker',
  //   componentModules: [
  //     './node_modules/@nvidia-elements/core/dist/page/define.js'
  //   ],
  // });

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

  const markdown = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    // highlight: function (/*str, lang*/) { return ''; }
    highlight: function (str, lang) {
      return /* html */ `<nve-codeblock language="${lang}" style="--padding: var(--nve-ref-space-lg)">${markdown.utils.escapeHtml(str)}</nve-codeblock>`;
    }
  });

  const formats = {
    h1: 'display',
    h2: 'heading xl',
    h3: 'heading lg',
    h4: 'heading',
    h5: 'heading',
    h6: 'heading sm',
    p: 'body',
    a: 'link'
  };

  function renderer(tokens, idx, options, env, slf) {
    if (
      tokens[idx].type === 'heading_open' ||
      tokens[idx].type === 'link_open' ||
      tokens[idx].type === 'paragraph_open'
    ) {
      tokens[idx].attrSet('nve-text', `${formats[tokens[idx].tag]} mkd`);
    }

    if (tokens[idx].type === 'bullet_list_open') {
      tokens[idx].attrSet('nve-text', 'list mkd');
      tokens[idx].attrSet('nve-layout', 'column gap:xs');
    }

    return slf.renderToken(tokens, idx, options, env, slf);
  }

  markdown.renderer.rules.heading_open = renderer;
  markdown.renderer.rules.link_open = renderer;
  markdown.renderer.rules.paragraph_open = renderer;
  markdown.renderer.rules.bullet_list_open = renderer;

  eleventyConfig.setLibrary('md', markdown);

  eleventyConfig.addAsyncShortcode('story', async function (tag, storyName) {
    const name = tag.replace('nve-', '');
    const storybook = await import(`../elements/dist/${name}/${name}.stories.json`, { with: { type: 'json' } });
    const story = storybook.default.stories.find(s => s.id === storyName);
    return /* html */ `<div><nve-api-canvas source="${markdown.utils.escapeHtml(story.template)}">${story.template}</nve-api-canvas></div>`;
  });

  eleventyConfig.addAsyncShortcode('api', async function (tag, type, value) {
    return /* html */ `<nve-api-detail tag="${tag}" type="${type}" value="${value}"></nve-api-detail>`;
  });

  return {
    dir: {
      input: 'src',
      output: 'dist',
      layouts: '_layouts'
    }
  };
}
