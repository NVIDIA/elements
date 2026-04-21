# notice

Generates `NOTICE.md` for every published project and the repo-root
`NOTICE.md` by reading each project's runtime `dependencies`, resolving
versions from `node_modules`, and merging per-project overrides from
`projects/<name>/notice.json` (bundled third-party code, icon assets).

## Run

The script runs from the repo root. Wireit requires the declaring package
to own every output path, and these outputs span the whole monorepo:

```shell
pnpm run notice
```

The root `ci` wireit target runs the script automatically when any of these
change: `pnpm-lock.yaml`, `pnpm-workspace.yaml`, any project `package.json`,
or any project `notice.json`.

## Extending

- Add `"NOTICE.md"` to a project's `package.json` `files` array to opt it
  into generation. The script auto-discovers based on this field.
- Add a new SPDX license by appending to `LICENSE_BODIES` and `SPDX_URLS`
  in `licenses.js`. The generator throws if a dependency uses an unknown
  license.
- Declare bundled third-party code (shipped inside `dist/` but not in
  `dependencies`) in `projects/<name>/notice.json` under `bundled`.
- Declare non-package assets (fonts, icon libraries) under `assets`.
