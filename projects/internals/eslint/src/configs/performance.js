import noGpuUploadInLoop from '../local/no-gpu-upload-in-loop.js';
import noHotPathBufferAllocation from '../local/no-hot-path-buffer-allocation.js';
import noHotPathCollectionAllocation from '../local/no-hot-path-collection-allocation.js';
import noInlineGpuUploadAllocation from '../local/no-inline-gpu-upload-allocation.js';
import preferDirectTypedArrayIteration from '../local/prefer-direct-typed-array-iteration.js';
import requireAnimationFrameCleanup from '../local/require-animation-frame-cleanup.js';
import requireGpuResourceCleanup from '../local/require-gpu-resource-cleanup.js';
import requireObserverDisconnect from '../local/require-observer-disconnect.js';

const source = ['src/**/*.ts', 'src/**/*.tsx'];
const ignores = [
  '**/*.examples.ts',
  '**/*.test*.ts',
  '**/*.test*.tsx',
  'build/',
  'coverage/',
  'dist/',
  'node_modules/'
];

/**
 * Enables performance rules for production TypeScript. Consumers may override
 * individual severities in a later flat-config entry after spreading this config.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const performanceConfig = [
  {
    plugins: {
      'local-performance': {
        rules: {
          'no-gpu-upload-in-loop': noGpuUploadInLoop,
          'no-hot-path-buffer-allocation': noHotPathBufferAllocation,
          'no-hot-path-collection-allocation': noHotPathCollectionAllocation,
          'no-inline-gpu-upload-allocation': noInlineGpuUploadAllocation,
          'prefer-direct-typed-array-iteration': preferDirectTypedArrayIteration,
          'require-animation-frame-cleanup': requireAnimationFrameCleanup,
          'require-gpu-resource-cleanup': requireGpuResourceCleanup,
          'require-observer-disconnect': requireObserverDisconnect
        }
      }
    }
  },
  {
    files: source,
    ignores,
    rules: {
      'local-performance/no-gpu-upload-in-loop': 'error',
      'local-performance/no-hot-path-buffer-allocation': 'error',
      'local-performance/no-hot-path-collection-allocation': 'error',
      'local-performance/no-inline-gpu-upload-allocation': 'error',
      'local-performance/prefer-direct-typed-array-iteration': 'error',
      'local-performance/require-animation-frame-cleanup': 'error',
      'local-performance/require-gpu-resource-cleanup': 'error',
      'local-performance/require-observer-disconnect': 'error'
    }
  }
];
