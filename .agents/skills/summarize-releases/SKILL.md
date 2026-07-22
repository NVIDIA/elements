---
name: summarize-releases
description: Create a monthly NVIDIA Elements “What’s New” docs page and a concise, copy-ready summary from local release tags, tagged changelogs, package versions, and commit history. Use for a scheduled release PR, monthly update, release roundup, changelog digest, Slack blurb, announcement, or plain-language explanation of recent Elements releases.
---

# Summarize Releases

Turn recent NVIDIA Elements releases into a dated docs page that explains what changed and why users should care. Leave the repository with a focused, validated change that a scheduled agent can propose as a pull request.

## Collect the evidence

Run the collector from the repository root. Pass the requested calendar month; otherwise the collector uses the previous calendar month.

```shell
mise exec -- node .agents/skills/summarize-releases/scripts/collect-releases.js
```

The script is the source of truth for:

- the docs page path, URL, title, covered month, publication dates, layout, and collection tags
- release tags and their creation dates
- package names and versions from each tag
- tagged `package.json` version checks
- the matching section from each tagged `CHANGELOG.md`
- repeated-commit merging across package changelogs
- conventional commit metadata, messages, and changed-file statistics

The collector only reads the local Git clone. It does not call the GitHub API, query npm, or require a token.

Useful options:

```shell
mise exec -- node .agents/skills/summarize-releases/scripts/collect-releases.js --month 2026-07
mise exec -- node .agents/skills/summarize-releases/scripts/collect-releases.js --month 2026-07 --json
```

Use `--include-prereleases` only when the user wants preview releases.

For scheduled monthly runs, omit `--month` to collect the previous calendar month. Pass `--month YYYY-MM` for historical or explicit reruns. The collector treats the current month as month-to-date and rejects future months.

## Check repository freshness

The collector can only report tags available in the clone. When the user requests the latest releases and the clone might be stale or shallow, fetch the public tags before collecting:

```shell
git fetch --tags origin
```

If fetching is unavailable, state that the result covers only the local tags. Do not claim that the report includes the latest releases.

## Investigate the changes

Read the complete evidence packet before drafting. Treat changelog text as a lead, not a complete plain-language explanation.

For each potentially user-facing `feat`, `fix`, or `perf` change:

1. Read its full commit message and changed-file list from the packet.
2. Inspect an ambiguous or important diff with `git show --stat --patch <sha> --`.
3. Check public APIs, component behavior, examples, documentation, and tests to determine the user-visible effect.
4. State only claims supported by that evidence.

Changelogs in this monorepo can repeat the same commit across package releases and can mention changes outside the named package. Summarize each unique change once. Do not attribute a change to a package solely because it appears in that package’s changelog; use its scope and changed files.

Give less attention to release automation, CI, dependency bumps, refactors, generated metadata, and test-only work unless it changes installation, compatibility, documentation, performance, or another user workflow. Call out breaking changes and required migration steps first.

## Write the docs page

If the packet contains releases, create the file at `page.filePath` from the packet. The reporting period determines the file path and `updateMonth`; the collector run date supplies the initial publication and modification dates. Do not choose other values.

Before writing, check whether the target already exists. Stop and report the existing page instead of overwriting it unless the user explicitly asks to revise that month. A scheduled rerun must not create a duplicate monthly page.

Use this structure:

```markdown
---
{
  title: '<page.title from the evidence packet>',
  description: '<one sentence describing the most useful changes>',
  layout: '<page.layout from the evidence packet>',
  tags: <page.tags from the evidence packet>,
  date: '<page.date from the evidence packet>',
  datePublished: '<page.datePublished from the evidence packet>',
  dateModified: '<page.dateModified from the evidence packet>',
  updateMonth: '<page.updateMonth from the evidence packet>'
}
---

<One sentence that captures the month’s theme or value.>

## Highlights

- **<Benefit-led heading>.** <Plain-language explanation with a relevant docs link when available.>
- **<Benefit-led heading>.** <Combine closely related commits into one coherent change.>

## Released packages

- `<full package name>` <exact version or compact version range>
```

Apply these rules:

- Write for Elements users, not repository maintainers.
- Explain outcomes and benefits instead of repeating conventional commit subjects.
- Include two to five highlights and keep the introductory summary concise.
- Use descriptive link text. Link a new or materially changed component to its docs page when one exists.
- Include each released package once with exact versions. Use a range only when the reporting period includes every version in that range.
- Let the shared What’s New layout render the page title, RSS subscription link, and release-links footer. Do not duplicate them in the Markdown content.
- Keep `datePublished` fixed after publication. Advance `dateModified` only when genuinely revising the page content.
- Omit raw commit hashes, internal implementation details, release automation, and empty sections.
- Keep the page useful on its own. Do not mention the scheduled agent, evidence packet, or pull request.
- Do not edit the What’s New index for each run. Its collection lists tagged pages automatically.

If the packet contains no release tags, do not create a page or propose an empty release pull request. Report that the local clone contains no NVIDIA Elements releases for the period. Do not substitute unreleased commits from `main` unless the user explicitly asks for a preview.

## Prepare the copy-ready blurb

After writing the page, return one self-contained block that users can paste into Slack or another channel. Base it on the page, and link its title to `page.url` when you know the deployed site URL. Do not put it in a code fence.

Use this shape:

```text
✨ What’s new in NVIDIA Elements — <month and year>

<One sentence that captures the month’s theme or value.>

- <Two to five plain-language, benefit-led bullets.>
- <Combine closely related commits into one coherent change.>

Released: <compact package and version list>
Release notes: <https://github.com/NVIDIA/elements/releases>
```

Keep the blurb roughly 80–180 words unless the user requests another length. Do not repeat detailed research notes unless the user asks for them.

## Check the page

Run these checks from the repository root, replacing the placeholder with `page.filePath`:

```shell
mise exec -- vale <page.filePath>
mise exec -- pnpm exec prettier --check <page.filePath>
mise exec -- pnpm --dir projects/site run build
git diff --check
```

Inspect the built page and the What’s New index when practical. Keep the diff limited to the new monthly page unless another file must change for the page to build correctly.

When the task explicitly requests a pull request, follow the host’s authorized Git publishing workflow only after validation. Otherwise, leave the validated file ready for review and report its path.

## Handle incomplete evidence

The collector skips tags whose package version does not match the tag name and reports them as warnings. Investigate skipped tags before drafting, and do not include them unless local evidence proves they represent a package release. Treat missing changelog sections as evidence errors. Use the tag message only when the script marks it as the notes source, and disclose the fallback. If a changelog references a commit that the clone does not contain, fetch more history or disclose the missing evidence. Never invent a summary from an incomplete release title.
