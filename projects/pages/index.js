import { readFile, writeFile, readdir } from 'node:fs/promises';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { brotliCompress, constants } from 'node:zlib';
import { join, extname } from 'node:path';
import { promisify } from 'node:util';

if (!existsSync('./dist')) {
  mkdirSync('./dist/starters', { recursive: true });
  mkdirSync('./dist/api', { recursive: true });
}

cpSync('./_redirects', './dist/_redirects');
cpSync('../site/dist/', './dist/', { recursive: true });
cpSync('../internals/metadata/static/index.json', './dist/metadata/index.json');
cpSync('../internals/metadata/static/stories.json', './dist/metadata/stories.json');

cpSync('../starters/dist/', './dist/starters/download/', { recursive: true });
cpSync('../starters/angular/dist/angular-starter/browser/', './dist/starters/angular/', { recursive: true });
cpSync('../starters/bundles/dist/', './dist/starters/bundles/', { recursive: true });
cpSync('../starters/importmaps/dist/', './dist/starters/importmaps/', { recursive: true });
cpSync('../starters/eleventy/dist/', './dist/starters/eleventy/', { recursive: true });
cpSync('../starters/mpa/dist/', './dist/starters/mpa/', { recursive: true });
cpSync('../starters/nextjs/dist/', './dist/starters/nextjs/', { recursive: true });
cpSync('../starters/react/dist/', './dist/starters/react/', { recursive: true });
cpSync('../starters/solidjs/dist/', './dist/starters/solidjs/', { recursive: true });
cpSync('../starters/typescript/dist/', './dist/starters/typescript/', { recursive: true });
cpSync('../starters/vue/dist/', './dist/starters/vue/', { recursive: true });

// https://docs.gitlab.com/user/project/pages/introduction/#serving-compressed-assets

const TEXT_EXTENSIONS = ['.html', '.css', '.js', '.json', '.xml', '.txt', '.md', '.svg', '.map', '.woff2'];

function isUTF8Text(buffer) {
  try {
    // Try to decode the buffer as UTF-8
    const text = buffer.toString('utf8');
    // Check if the text contains any non-printable characters
    return !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text);
  } catch {
    return false;
  }
}

let count = 0;
async function compressFile(filePath) {
  const ext = extname(filePath);
  if (TEXT_EXTENSIONS.includes(ext)) {
    try {
      const content = await readFile(filePath);
      const brotliOptions = {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 11,
          [constants.BROTLI_PARAM_SIZE_HINT]: content.length
        }
      };

      if (ext === '.woff2') {
        brotliOptions.params[constants.BROTLI_PARAM_MODE] = constants.BROTLI_MODE_FONT;
      } else if (isUTF8Text(content)) {
        brotliOptions.params[constants.BROTLI_PARAM_MODE] = constants.BROTLI_MODE_TEXT;
      }

      const brotlied = await promisify(brotliCompress)(content, brotliOptions);
      await writeFile(`${filePath}.br`, brotlied);
      count++;
      process.stdout.write(`Compressed files: ${count}\r`);
    } catch (error) {
      console.error(`Error compressing ${filePath}:`, error);
    }
  }
}

async function getAllFilePaths(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively get paths from subdirectories
      const subPaths = await getAllFilePaths(fullPath);
      paths.push(...subPaths);
    } else {
      paths.push(fullPath);
    }
  }

  return paths;
}

if (process.env.CI === 'true' || process.env.LOCAL_PREVIEW === 'true') {
  console.log('Starting compression...');
  const files = await getAllFilePaths('./dist');

  Promise.all(files.map(path => compressFile(path)))
    .then(() => console.log(`Compressed files: ${count}\nCompression complete!`))
    .catch(error => console.error('Compression failed:', error));
} else {
  console.log('Local build, skipping deployment compression');
}
