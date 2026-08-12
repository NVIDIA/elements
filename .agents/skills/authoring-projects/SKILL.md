---
name: authoring-projects
description: Author a new standalone NVIDIA Elements workspace project containing a Lit component, including package files, the five test types, Wireit tasks, workspace and CI registration, metadata generation, documentation-site integration, dependency-lint configuration, and generated lock/notice files. Use when creating or scaffolding a new `projects/<name>` package based on the standalone component-library pattern. Do not use for adding a component to an existing project; use the authoring-components skill instead.
---

# Authoring Projects

Create a private-by-default project from a current in-repository reference, then wire every consumer before customizing the component.

## Required context

1. Read the repository `AGENTS.md`.
2. Read [references/integration-checklist.md](references/integration-checklist.md).
3. Use the `authoring-components` skill for the component class, API, examples, and five test files.
4. Use the `guidance-build-system` skill for Wireit changes and the `authoring-testing` skill when modifying tests.
5. Read `projects/internals/RELEASE.md` only when the user wants the package published.

## Workflow

1. Confirm the kebab-case project/component name, purpose, package description, and whether the project is private or publish-ready. Default the component name to the project name and keep a new scaffold private.
2. Inspect `git status`, confirm `projects/<name>` does not exist, and preserve unrelated work.
3. Preview the deterministic scaffold from the repository root:

   ```shell
   node .agents/skills/authoring-projects/scripts/scaffold-project.mjs \
     --name <component-name> \
     --description "<package and component description>" \
     --dry-run
   ```

4. Review the planned paths, then rerun without `--dry-run`. Pass `--reference <project-name>` when another standalone project is a better structural match.
5. Customize the placeholder component through the `authoring-components` workflow. Keep `index.ts` side-effect free, isolate registration in `define.ts`, use `@since 0.0.0`, and make the `@documentation` URL match the generated site route.
6. Refresh generated workspace state:

   ```shell
   mise exec -- pnpm install
   mise exec -- pnpm run format:fix
   mise exec -- pnpm run notice
   ```

7. Run the project checks listed in its `DEVELOPMENT.md`, then verify the repository integrations:

   ```shell
   mise exec -- pnpm -C projects/<component-name> run ci
   mise exec -- pnpm -C projects/<component-name> run test:lighthouse
   mise exec -- pnpm -C projects/internals/metadata run generate:api
   mise exec -- pnpm -C projects/internals/metadata run build
   mise exec -- pnpm -C projects/site run build
   mise exec -- pnpm run lint:knip
   ```

8. Use targeted project checks for isolated changes. Because scaffolding affects cross-project interfaces, generated artifacts, and more than one package, run broader CI from the repository root after the targeted checks:

   ```shell
   mise exec -- pnpm run ci
   ```

   Inspect the final diff for generated artifacts, missing build edges, copied visual baselines, and unrelated lockfile churn.

## Guardrails

- Never overwrite an existing project or reuse another component's visual baselines.
- Declare every generated metadata/site input with its matching Wireit build dependency.
- Keep site-only workspace packages in `projects/site` dev dependencies and its workspace-scoped dependency-lint ignore because Eleventy creates their imports dynamically.
- Include CSS linting and use the repository-root stylelint path (`../../stylelint.config.mjs`) from a top-level project.
- Do not create tags, publish packages, edit release wiring, or make a private project public without explicit user authorization.
- Treat commit `c88b885b` as historical evidence, not a byte-for-byte template; the checklist records the defects that the scaffold must avoid.
