# @internals/vite

This project is a private and internal API for the elements repo. This provides default Vite build and test configs for our projects.

The default configs are standard Vite configuration objects. The objects can be overridden per project level. The configs provide common standard options for our libraries including library API/performance optimizations and test coverage requirements.

## Build

```typescript
// vite.config.ts
import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      include: ['./src/**/*.test.lighthouse.ts'],
      alias: { '@nvidia-elements/library': resolve(import.meta.dirname, './src') }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
```

## Test

```typescript
// vitest.config.ts
import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite';

export default mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/library': resolve(import.meta.dirname, './src') }
  }
});
```

## Axe

```typescript
// vitest.axe.ts
import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@internals/vite';

export default mergeConfig(libraryAxeTestConfig, {
  test: {
    include: ['./src/**/*.test.axe.ts'],
    alias: { '@nvidia-elements/library': resolve(import.meta.dirname, './dist') },
  }
});

```
