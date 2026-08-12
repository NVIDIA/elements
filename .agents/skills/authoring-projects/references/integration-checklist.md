# Standalone component project checklist

Use this checklist after scaffolding and before final verification. Commit `c88b885b` (`chore(ci): setup scene and plot`) established the reference integration surface, but this checklist corrects its omissions.

## Project package

- Create `projects/<name>/` with package metadata, exports, `sideEffects`, Wireit tasks, TypeScript/Vite/Vitest configs, README, CHANGELOG, DEVELOPMENT, NOTICE, and `.gitignore`.
- Create a side-effect-free package `src/index.ts` exporting `VERSION = '0.0.0'` and its unit/Lighthouse coverage.
- Create the component's class, CSS, example, `define.ts`, `index.ts`, and unit, axe, visual, SSR, and Lighthouse tests.
- Keep the package private until release is explicitly requested.
- List every supported command in `DEVELOPMENT.md`, including visual and SSR tests.
- Make `lint` depend on both `lint:eslint` and `lint:style`; use `../../stylelint.config.mjs` from `projects/<name>`.
- Set component metadata and JSDoc to version `0.0.0`. Route documentation to `/elements/docs/<name>/` when the page is `projects/site/src/docs/<name>/index.md`.

## Repository wiring

| Consumer                | Required change                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm-workspace.yaml`   | Add `projects/<name>`.                                                                                                           |
| Root `package.json`     | Add `<name>:ci`, `<name>:test:lighthouse`, and `<name>:lint:fix` dependencies.                                                   |
| `knip.config.js`        | Add the project workspace entry. Add the package to the site's scoped `ignoreDependencies` when Eleventy generates site imports. |
| Metadata `api.utils.ts` | Add the project to the API project list.                                                                                         |
| Metadata `package.json` | Add package/custom-elements inputs and a matching `<name>:build` dependency.                                                     |
| Site `package.json`     | Add dist inputs, a matching build dependency, and the workspace dev dependency.                                                  |
| Site docs               | Add `projects/site/src/docs/<name>/index.md` with a matching `nve-<name>` tag.                                                   |
| Generated files         | Run pnpm install and the notice generator to update `pnpm-lock.yaml`, root NOTICE, and project NOTICE files.                     |

## Historical traps to avoid

- The reference commit added both metadata inputs but only the `scene` build edge. Add one build edge per project input.
- Eleventy generates package imports into HTML. The site needs an actual workspace dependency even though dependency lint cannot observe a source import; use a site-scoped ignore.
- The reference package inherited a dormant `../../../stylelint.config.mjs` path and omitted `lint:style` from `lint`. Use the two-level root path and run CSS linting.
- The starter component used `@since 0.10.0` and a documentation URL that did not match its site route. New scaffolds start at `0.0.0` and keep route/file placement aligned.
- Do not copy `.visual/*.png`; generate baselines from the new component after it renders meaningful output.
- A private scaffold is not release-ready. Do not infer authorization to publish it.

## Publish-ready additions

Only when requested, follow `projects/internals/RELEASE.md` and current repository examples to:

- remove or change `private` intentionally;
- add the root semantic-release task and dependency ordering;
- add the commitlint scope;
- add build artifacts and JUnit reports to `.github/workflows/ci.yml`;
- verify the release configuration and package files;
- tell the user that the initial remote tag still requires explicit external action.

## Verification

Run commands through mise. At minimum, verify install, format, notice generation, project CI, project Lighthouse, metadata build, site build, dependency lint, and `git diff --check`. Browser-backed checks may require permission outside a sandbox. Do not raise bundle limits until measured output justifies a change.
