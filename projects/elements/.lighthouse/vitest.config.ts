import { defineConfig } from 'vitest/config';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const resolve = (rel) => path.resolve(__dirname, rel);

export default defineConfig({
  logLevel: 'info',
  resolve: {
    alias: {
      'elements-lighthouse': resolve('.'),
    }
  },
  test: {
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    reporters: ['basic', 'junit'],
    outputFile: {
      junit: resolve('./coverage/junit.xml')
    },
    setupFiles: [resolve('./setup.ts')],
    include: [
      process.env.LIGHTHOUSE_ALL ? 'src/**/*.test.lighthouse.ts' : 'src/index.test.lighthouse.ts'
    ],
    testTimeout: 60000,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  }
});
