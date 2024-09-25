import React from 'react';

const createElementOriginal = globalThis.REACT_CREATE_ELEMENT;
const createElementWrapped = React.createElement;

if (createElementOriginal && createElementOriginal != createElementWrapped && !globalThis.IS_CREATE_ELEMENT_PATCHED) {
  const createElementWithFallback = (...args: Parameters<typeof createElementWrapped>) => {
    try {
      return createElementWrapped(...args);
    } catch (error) {
      if (typeof args[0] === 'string') {
        if (error instanceof Error) {
          console.error(`${args[0]}: ${error.message}`);
        } else {
          console.error(args[0], error);
        }

        if (args[1] && typeof args[1] === 'object') {
          (args[1] as any)['data-ssr-source'] = 'client';
          (args[1] as any)['data-ssr-error'] = error instanceof Error ? error.message : `${error}`;
        }
      }

      return createElementOriginal(...args);
    }
  };

  globalThis.IS_CREATE_ELEMENT_PATCHED = true;

  Object.assign(React, { createElement: createElementWithFallback });
}
