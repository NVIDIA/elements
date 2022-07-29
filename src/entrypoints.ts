/**
 * @internal - Do not use this file in production
 * 
 * Multi entrypoints enable modules to be independently/conditionally loaded.
 * Vite does not support multi-entrypoint libraries by default. This file enables
 * Vite to compile all entrypoints by passing it this single starting entrypoint.
 */

import '@elements/elements';                              // imports all independent component entrypoints
import '@elements/elements/internal';                     // internal utilities for @elements/elements
import '@elements/elements/polyfills';                     // optional polyfills for non-chromium envs
import '@elements/elements/test';                         // internal testing utilities for @elements/elements

import '@elements/elements/css/module.typography.css'; // base typography styles
import '@elements/elements/css/module.layout.css';     // layout utilities
import '@elements/elements/css/module.reset.css';      // common reset/base styles
import '@elements/elements/index.css';                 // global styles including all above style modules