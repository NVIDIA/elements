// https://www.11ty.dev/docs/data-template-dir/
export default {
  title: 'Eleventy + Elements',
  tags: [],
  templateEngineOverride: '11ty.js,md',
  layout: 'index.11ty.js',
  eleventyComputed: {
    permalink: data => `/${data.page.filePathStem.replace('_pages', '')}.html`
  }
};
