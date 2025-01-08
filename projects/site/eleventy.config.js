import { join } from 'node:path';
import { EleventyRenderPlugin } from '@11ty/eleventy';
import EleventyPluginVite from '@11ty/eleventy-plugin-vite';
import markdownIt from 'markdown-it';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.setFrontMatterParsingOptions({ language: 'js' });
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('robots.txt');
  eleventyConfig.addPassthroughCopy('src/**/*.ts');
  eleventyConfig.addPassthroughCopy('src/**/*.css');
  eleventyConfig.addPlugin(EleventyPluginVite, {
    viteOptions: {
      base: join('/elements', process.env.PAGES_SITE_PREFIX ?? '')
    }
  });

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
      output: 'dist',
      layouts: '_layouts'
    }
  };
}
