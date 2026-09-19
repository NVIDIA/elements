# Elements Sphinx Starter

- Keep the starter implementation Python-only. The local `package.json` is repository-only Wireit orchestration and must not be exported in the downloadable starter.
- Keep Elements CDN URLs unversioned in source; the archive pipeline pins package versions.
- Build with `uv run --locked sphinx-build -W --keep-going -n -b html docs dist`.
- Validate every `nve-*` element and attribute with the Elements CLI before changing theme templates.
