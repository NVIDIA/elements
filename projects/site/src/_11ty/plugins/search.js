import { join } from 'node:path';
import * as pagefind from 'pagefind';

export async function searchPlugin(eleventyConfig) {
  const { index } = await pagefind.createIndex();

  eleventyConfig.addTransform('search-index', async function (content) {
    const ignoredPaths = ['changelog', 'metrics', 'examples'];

    if (!ignoredPaths.find(path => this.page.url.includes(path))) {
      await index.addHTMLFile({
        sourcePath: this.page.inputPath,
        url: this.page.url,
        content: content
      });
    }

    return content;
  });

  eleventyConfig.on('eleventy.after', async ({ directories }) => {
    const { errors } = await index.writeFiles({
      outputPath: join(directories.output, '.pagefind')
    });
    if (errors.length > 0) {
      console.error('Pagefind errors', errors);
    }

    await pagefind.close();
  });
}
