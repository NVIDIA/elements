import fs from 'node:fs';

const DRY_RUN = process.env.DRY_RUN === 'true';
const PLACEHOLDER_VERSION = '"0.0.0"';
const packageFilePath = `${process.cwd()}/package.json`;
const packageFile = JSON.parse(fs.readFileSync(packageFilePath));
const mcpServerFilePath = packageFile.mcpName ? `${process.cwd()}/server.json` : undefined;
const [_org, scope] = packageFile.name.split('/');

/**
 * https://github.com/semantic-release/semantic-release
 *
 * Monorepo support: scope-based filtering via releaseRules (commit-analyzer)
 * and ignoreCommits (release-notes-generator). Wireit handles release ordering.
 */
export default {
  dryRun: DRY_RUN,
  // ci: false, // enable to bypass local dry run https://github.com/semantic-release/semantic-release/issues/1316
  tagFormat: `${packageFile.name}-v\${version}`,
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        parserOpts: {
          headerPattern: /^(\w+)(?:\(([^)]*)\))?(!)?: (.*)$/,
          headerCorrespondence: ['type', 'scope', 'breaking', 'subject']
        },
        releaseRules: [
          // Catch-all first: suppress default rules (false acts as baseline)
          { breaking: true, release: false },
          { type: 'feat', release: false },
          { type: 'fix', release: false },
          { type: 'perf', release: false },
          { type: 'revert', release: false },
          { type: 'chore', release: false },
          // Scope-matched rules last: override false for matching scope
          { breaking: true, scope, release: 'major' },
          { type: 'feat', scope, release: 'minor' },
          { type: 'fix', scope, release: 'patch' }
        ]
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          ignoreCommits: `^(?![^]*\\(${scope}\\))(?![^]*\\[${scope}\\]).*$`
        }
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
            from: PLACEHOLDER_VERSION,
            to: '"${nextRelease.version}"',
            allowEmptyPaths: true
          },
          ...(mcpServerFilePath
            ? [
                {
                  files: [mcpServerFilePath],
                  from: `"version": "${packageFile.version}"`,
                  to: '"version": "${nextRelease.version}"',
                  results: [
                    {
                      file: mcpServerFilePath,
                      hasChanged: true,
                      numMatches: 2,
                      numReplacements: 2
                    }
                  ],
                  countMatches: true
                }
              ]
            : [])
        ]
      }
    ],
    [
      '@semantic-release/exec',
      {
        publishCmd: `pnpm publish --no-git-checks --registry=https://registry.npmjs.org ${DRY_RUN ? '--dry-run' : ''}`
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package.json',
          'projects/**/package.json',
          'projects/**/CHANGELOG.md',
          ...(mcpServerFilePath ? ['server.json'] : [])
        ],
        message: `chore(release): ${packageFile.name}` + '-v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    [
      '@semantic-release/github',
      {
        successComment:
          '🎉 This issue has been resolved in version ${nextRelease.version} 🎉\n\n[Changelog](https://NVIDIA.github.io/elements/docs/changelog/)'
      }
    ]
  ]
};
