import { EleventyRenderPlugin } from '@11ty/eleventy';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import markdownIt from 'markdown-it';
// import litPlugin from '@lit-labs/eleventy-plugin-lit';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.setFrontMatterParsingOptions({ language: 'js' });

  // eleventyConfig.addPlugin(litPlugin, {
  //   mode: 'worker',
  //   componentModules: [
  //     'node_modules/@nvidia-elements/core/dist/dot/define.js'
  //   ],
  // });

  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('src/**/*.ts');
  eleventyConfig.addPassthroughCopy('src/**/*.css');
  // eleventyConfig.addPassthroughCopy('node_modules/@nvidia-elements/themes/dist/');
  // eleventyConfig.addPassthroughCopy('node_modules/@nvidia-elements/styles/dist/');
  // eleventyConfig.addPassthroughCopy('node_modules/@nvidia-elements/core/dist/bundles/');
  // eleventyConfig.addPassthroughCopy('node_modules/@lit-labs/ssr-client/lit-element-hydrate-support.js');

  const markdown = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  });

  const formats = {
    h1: 'heading xl',
    h2: 'heading lg',
    h3: 'heading md',
    h4: 'heading sm',
    h5: 'heading',
    h6: 'heading',
    p: 'body',
    a: 'link'
  };

  function renderer(tokens, idx, options, env, slf) {
    if (
      tokens[idx].type === 'heading_open' ||
      tokens[idx].type === 'link_open' ||
      tokens[idx].type === 'paragraph_open'
    ) {
      tokens[idx].attrSet('nve-text', formats[tokens[idx].tag]);
    }

    if (tokens[idx].type === 'bullet_list_open') {
      tokens[idx].attrSet('nve-text', 'list');
      tokens[idx].attrSet('nve-layout', 'column gap:xs');
    }

    return slf.renderToken(tokens, idx, options, env, slf);
  }

  markdown.renderer.rules.heading_open = renderer;
  markdown.renderer.rules.link_open = renderer;
  markdown.renderer.rules.paragraph_open = renderer;
  markdown.renderer.rules.bullet_list_open = renderer;

  eleventyConfig.setLibrary('md', markdown);

  return {
    dir: {
      input: 'src',
      output: '_site',
      layouts: '_layouts',
      inlcudes: '_includes',
      data: '_data'
    }
    // templateFormats: ['liquid', 'html', 'md', '11ty.js']
  };
}
