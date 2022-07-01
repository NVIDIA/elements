/**
 * @internal - Do not use this file in production
 * 
 * Multi entrypoints enable modules to be independently/conditionally loaded.
 * Vite does not support multi-entrypoint libraries by default. This file enables
 * Vite to compile all entrypoints by passing it this single starting entrypoint.
 */
 import '@elements/elements';          // imports all independent component entrypoints
 import '@elements/elements/internal'; // Internal utilities for @elements/elements
 import '@elements/elements/polyfills'; // Optional polyfills for non-chromium envs
 import '@elements/elements/test';     // Internal testing utilities for @elements/elements