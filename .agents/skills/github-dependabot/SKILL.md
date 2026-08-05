---
name: github-dependabot
description: Use the GitHub CLI to retrieve current open `Dependabot` alerts for a repository, inspect affected dependencies and patched versions, update manifests and lock files, and verify the local fixes. Use whenever a user asks to inspect, address, resolve, remediate, or fix `Dependabot` alerts or dependency security vulnerabilities reported by GitHub. Use `gh`, rather than a browser or GitHub connector, for alert discovery.
---

# Fix `Dependabot` Alerts

Use `gh api` to get live alert data, then make the smallest safe dependency changes that resolve the current open alerts.

## Workflow

### 1. Establish the repository context

1. Read `AGENTS.md` and the instructions for every affected project.
2. Inspect `git status --short` and the relevant diffs. Preserve unrelated user changes.
3. If GitHub access fails, run `gh auth status`. Treat `403` and `404` responses as possible permission or feature-availability problems, not proof that the repository has no alerts. Do not change authentication or repository settings without the user's approval.

### 2. Fetch the current alerts

Always query GitHub at the start of the task. Treat "latest alerts" as the current open alerts unless the user gives a narrower scope.

```shell
gh api --paginate -X GET \
  'repos/{owner}/{repo}/dependabot/alerts' \
  -f state=open \
  -f sort=created \
  -f direction=desc \
  -f per_page=100 \
  --jq '.[] | {
    number,
    created_at,
    updated_at,
    package: .dependency.package.name,
    ecosystem: .dependency.package.ecosystem,
    manifest: .dependency.manifest_path,
    scope: .dependency.scope,
    severity: .security_advisory.severity,
    ghsa: .security_advisory.ghsa_id,
    cve: .security_advisory.cve_id,
    vulnerable_range: .security_vulnerability.vulnerable_version_range,
    patched_version: .security_vulnerability.first_patched_version.identifier,
    url: .html_url
  }'
```

Keep `--paginate`; repositories can have more than one page of alerts. If the user asks for only the newest alert, select the first result. Otherwise, address every open alert in scope.

Fetch complete data for an individual alert when necessary:

```shell
gh api -X GET 'repos/{owner}/{repo}/dependabot/alerts/<number>'
```

Do not dismiss alerts or change their state through the API. GitHub closes resolved alerts after it processes the updated dependency graph.

### 3. Plan the dependency changes

1. Group alerts by ecosystem, manifest, and package. One dependency update can resolve more than one advisory.
2. Record each alert number, vulnerable range, first patched version, and affected manifest before editing.
3. Locate the canonical version declaration. In this repository, check `pnpm-workspace.yaml` catalogs and overrides before changing individual `package.json` files.
4. For a transitive dependency, use the ecosystem's dependency-inspection command to find which direct dependency introduces it. Prefer updating that direct dependency. Add or change an override only when a direct update cannot resolve the advisory safely and the repository already supports that mechanism.
5. Choose the smallest compatible version that satisfies every patched-version floor for the grouped alerts. Avoid unrelated major-version or toolchain upgrades unless the security fix requires them.
6. If GitHub reports no patched version, investigate whether upgrading or removing the introducing dependency resolves the vulnerable range. Do not invent a safe version or conceal an unresolved alert.

### 4. Apply the fixes

Use the package manager and toolchain pinned by the repository. Run Elements repository commands through `mise exec --`.

- Update the canonical dependency declaration and every required lockfile together.
- Preserve workspace protocols, catalogs, overrides, peer ranges, and published dependency ranges unless the fix requires a deliberate change.
- Use targeted package-manager update commands when possible. For pnpm workspaces, scope the update to the affected workspace or edit the central catalog and run `mise exec -- pnpm install` to refresh `pnpm-lock.yaml`.
- Inspect package release notes when the safe version crosses a major version or changes runtime behavior.
- Do not weaken `minimumReleaseAge`, allowed-build, integrity, or other supply chain controls merely to make installation succeed. If a security release needs an exception, keep it exact and narrow and explain the need.
- Make necessary compatibility changes in source, configuration, tests, or examples when the dependency update changes an API.

Do not overwrite unrelated work or broaden the dependency update beyond the alerts in scope.

### 5. Verify the fixes

1. Inspect the final diff and confirm that every changed dependency addresses an alert or supports a necessary compatibility fix.
2. Confirm that the resolved versions no longer match the vulnerable ranges. Use the package manager's dependency tree command when checking transitive versions.
3. Read the affected project's `DEVELOPMENT.md`, then run its relevant build, lint, and test commands through `mise exec --`.
4. Run broader repository checks when a shared catalog, override, lockfile, build tool, or runtime dependency affects two or more projects.
5. Re-query open alerts for situational awareness, but do not treat an unchanged GitHub result as a failed local fix; dependency-graph processing is asynchronous.

If verification fails, diagnose whether the dependency update, a compatibility change, or an unrelated existing failure caused it. Continue fixing in-scope failures and separate unrelated failures.

## Result

Report:

- alert numbers, advisories, packages, and severity levels addressed;
- old vulnerable versions or ranges and the resolved versions;
- files changed and any compatibility work required;
- validation commands and outcomes; and
- alerts that remain open, including the exact blocker for each one.
