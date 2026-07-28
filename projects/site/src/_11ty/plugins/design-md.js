import { promises as fsp } from 'node:fs';
import nodePath from 'node:path';
import { getPublicOutputPath } from '../utils/public-output.js';

const DESIGN_MD_SOURCE_PATH = '../internals/design/dist/DESIGN.md';

export function designMdPlugin(eleventyConfig) {
  eleventyConfig.on('eleventy.before', async ({ directories } = {}) => {
    const publicOutputPath = getPublicOutputPath(directories);

    await fsp.mkdir(publicOutputPath, { recursive: true });
    await fsp.copyFile(DESIGN_MD_SOURCE_PATH, nodePath.join(publicOutputPath, 'DESIGN.md'));
  });
}
