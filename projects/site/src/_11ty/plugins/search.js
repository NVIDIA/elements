import * as pagefind from 'pagefind';

export async function searchPlugin(eleventyConfig, pluginOptions) {
  const { index } = await pagefind.createIndex();

  eleventyConfig.addTransform('search-index', async function (content) {
    const ignoredPaths = ['changelog', 'metrics', 'stories'];

    if (!ignoredPaths.find(path => this.page.url.includes(path))) {
      await index.addHTMLFile({
        sourcePath: this.page.inputPath,
        url: this.page.url,
        content: content
      });
    }

    return content;
  });

  eleventyConfig.on('eleventy.after', async () => {
    const { errors } = await index.writeFiles({
      outputPath: pluginOptions.outputPath
    });
    if (errors.length > 0) {
      console.error('Pagefind errors', errors);
    }

    await pagefind.close();
  });
}
