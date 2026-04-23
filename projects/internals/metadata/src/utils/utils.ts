// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function getElementChangelog(name: string, changelog: string) {
  const changelogJSON = changelogMarkdownToJSON(changelog);
  const elementChangelog = changelogJSON
    .map(release => {
      release.bugFixes =
        release.bugFixes.filter(bugFix => bugFix.includes(name) || bugFix.includes(name.replace('nve-', ''))) || [];
      release.features =
        release.features.filter(feature => feature.includes(name) || feature.includes(name.replace('nve-', ''))) || [];
      release.breakingChanges =
        release.breakingChanges.filter(
          breakingChange => breakingChange.includes(name) || breakingChange.includes(name.replace('nve-', ''))
        ) || [];
      return release;
    })
    .filter(
      release => release.bugFixes.length > 0 || release.features.length > 0 || release.breakingChanges.length > 0
    );

  const releasesMarkdown = elementChangelog.map(release => {
    const features = release.features.length > 0 ? `\n\n### Features\n${release.features.join('\n')}` : '';
    const breakingChanges =
      release.breakingChanges.length > 0 ? `\n\n### Breaking Changes\n${release.breakingChanges.join('\n')}` : '';
    const bugFixes = release.bugFixes.length > 0 ? `\n\n### Bug Fixes\n${release.bugFixes.join('\n')}` : '';
    return `## ${release.title}${features}${breakingChanges}${bugFixes}`;
  });

  return `# Changelog - ${name}\n\n${releasesMarkdown.join('\n\n')}`;
}

export function changelogMarkdownToJSON(changelog: string) {
  return changelog
    .split('## [')
    .map(release => `## [${release}`)
    .map(releaseString => {
      const title = (releaseString.split('\n')[0] ?? '').replace('## [', '[');
      const releaseBody = releaseString.split('\n').slice(1).join('\n');
      const bugFixes = releaseBody.includes('### Bug Fixes')
        ? (releaseBody
            .split('### Bug Fixes')[1]
            ?.trim()
            ?.split('\n')
            .map(line => line.trim()) ?? [])
        : [];
      const features = releaseBody.includes('### Features')
        ? (releaseBody
            .split('### Features')[1]
            ?.trim()
            ?.split('\n')
            .map(line => line.trim()) ?? [])
        : [];
      const breakingChanges = releaseBody.includes('### Breaking Changes')
        ? (releaseBody
            .split('### Breaking Changes')[1]
            ?.trim()
            ?.split('\n')
            .map(line => line.trim()) ?? [])
        : [];
      return { title, bugFixes, features, breakingChanges };
    });
}
