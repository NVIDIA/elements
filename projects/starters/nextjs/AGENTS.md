# Elements NextJS Starter

This file only covers how this starter wires Elements into Next.js. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Use the React custom elements type augmentation in `src/global.d.ts`.
- Keep global theme attributes on `src/pages/_document.tsx`.
- Keep global CSS imports in `src/styles/globals.css`.
- Register Elements in the page or component module that renders them.

## Next.js Runtime

- This starter uses the pages router and `output: 'export'`.
- Keep `basePath`, `output`, and `distDir` aligned in `next.config.ts` for static starter output.
- Import server-specific modules, such as `@nvidia-elements/core/icon/server.js`, only when a component needs server render support.

## SSR Status

- Treat `@lit-labs/nextjs` integration as experimental in this starter. Do not enable it casually; the current config leaves it commented with the upstream issue.
- If enabling Lit SSR, import or configure it before any Elements registration imports and run a full build.

## JSX Syntax

- Use React custom element event naming such as `onclose` for a `close` event.
- Use primitive JSX props for custom element properties and strings for attributes when the Elements API expects attributes.

## Verification

- Run `pnpm run build` in `projects/starters/nextjs` after React, config, SSR, or type changes.
- Run `pnpm run lint` after TSX or config edits.
