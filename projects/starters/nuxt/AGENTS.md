# Elements Nuxt Starter

This file only covers how this starter wires Elements into Nuxt. For component APIs, template validation, and project setup commands, use the Elements CLI/MCP documentation instead.

## Integration Points

- Keep `vue.compilerOptions.isCustomElement` in `nuxt.config.ts` so Vue treats `nve-*` tags as custom elements.
- Keep global `htmlAttrs` for `lang`, `nve-theme`, and `nve-transition` in `nuxt.config.ts`.
- Keep Elements Vue type references in `env.d.ts`.
- Import global Elements CSS in `app/app.vue`.

## Layouts And Pages

- Register Elements in the SFC that renders them. Shared page shell registrations belong in `app/layouts/default.vue`.
- Use `NuxtLink` inside Elements navigation components such as `nve-tabs-item`.
- Keep route content in `app/pages/*` and shared shell in layouts.

## Vue Syntax

- Use Vue custom element syntax: `:property` for properties and `@event` for custom events.
- Run `nuxi typecheck` through the package build before trusting template types.

## Verification

- Run `pnpm run build` in `projects/starters/nuxt` after config, layout, page, or type changes.
- Run `pnpm run lint` after Vue, TypeScript, or config edits.
