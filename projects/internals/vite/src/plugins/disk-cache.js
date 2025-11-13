import { extname } from 'path';

const cache = {};
export function diskCache(options = {}) {
  return {
    name: 'disk-cache',
    generateBundle(_options, bundles) {
      for (const [key, bundleFile] of Object.entries(bundles)) {
        const path = `${options.outDir}/${bundleFile.fileName}`;

        if (extname(path) === '.js' && cache[path] !== bundleFile.code) {
          cache[path] = bundleFile.code;
        } else {
          delete bundles[key];
        }
      }
    }
  };
}
