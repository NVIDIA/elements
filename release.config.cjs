const fs = require('node:fs');

const DRY_RUN = false;
const packageFilePath = `${process.cwd()}/package.json`;
const packageFile = JSON.parse(fs.readFileSync(packageFilePath));

/**
 * https://github.com/semantic-release/semantic-release
 * https://github.com/RimacTechnology/semantic-release-monorepo
 */
module.exports = {
  dryRun: DRY_RUN,
  // ci: false, // enable to bypass local dry run https://github.com/semantic-release/semantic-release/issues/1316
  tagFormat: `${packageFile.name}-v\${version}`,
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'fix', release: 'patch' },
          { type: 'feat', release: 'minor' },
          { type: 'chore', release: false }
        ]
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits'
      }
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md'
      }
    ],
    [
      'semantic-release-replace-plugin',
      {
        replacements: [
          {
            files: [packageFilePath],
            from: `"version": "${packageFile.version}"`,
            to: '"version": "${nextRelease.version}"',
            results: [
              {
                file: packageFilePath,
                hasChanged: true,
                numMatches: 1,
                numReplacements: 1
              }
            ],
            countMatches: true
          },
          {
            files: [`${process.cwd()}/dist/**/*.js`],
            from: '"0.0.0"',
            to: '"${nextRelease.version}"'
          }
        ]
      }
    ],
    [
      '@semantic-release/exec',
      {
        publishCmd: [
          `pnpm publish --no-git-checks --registry=$URM_ELEMENTS_NPM_CONFIG_REGISTRY ${DRY_RUN ? '--dry-run' : ''}`,
          `pnpm publish --no-git-checks --registry=$MAGLEV_ELEMENTS_NPM_CONFIG_REGISTRY ${DRY_RUN ? '--dry-run' : ''}`
        ].join(' && ')
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'projects/**/package.json', 'projects/**/CHANGELOG.md'],
        message: `chore(release): ${packageFile.name}` + '-v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    [
      '@semantic-release/gitlab',
      {
        successComment:
          '🎉 This issue has been resolved in version ${nextRelease.version} 🎉\n\n[Changelog](https://NVIDIA.github.io/elements/docs/changelog/)',
        assets: [
          {
            label: packageFile.name,
            type: 'package',
            url: `https://registry.npmjs.org'/', '%2F')}`
          }
        ]
      }
    ]
  ]
};
