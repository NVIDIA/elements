const fs = require('node:fs');
const path = require('node:path');
const resolve = (...value) => path.resolve(__dirname, ...value);

const DRY_RUN = true;

/**
 * https://github.com/semantic-release/semantic-release
 * https://github.com/pmowrer/semantic-release-monorepo
 */
function getBaseConfig(config = { basePath: '' }) {
  const projectPath = resolve('../', config.basePath);
  const packageFilePath = resolve(projectPath, 'package.json');
  const packageFile = JSON.parse(fs.readFileSync(packageFilePath));
  console.log('packageFilePath: ', packageFilePath);
  console.log('packageFile: ', packageFile);
  console.log('CHANGELOG Path: ', resolve('../CHANGELOG.md'));

  return {
    dryRun: DRY_RUN,
    extends: 'semantic-release-monorepo',
    branches: ['main'],
    tagFormat: 'v${version}',
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
            }
          ]
        }
      ],
      [
        '@semantic-release/changelog',
        {
          changelogFile: resolve('../CHANGELOG.md')
        }
      ],
      [
        '@semantic-release/gitlab',
        {
          successComment:
            '🎉 This issue has been resolved in version ${nextRelease.version} 🎉\n\n[Changelog](https://NVIDIA.github.io/elements/api/?path=/docs/about-changelog--docs)',
          assets: [
            {
              label: packageFile.name,
              type: 'package',
              url: `https://registry.npmjs.org'/', '%2F')}`
            }
          ]
        }
      ],
      [
        '@semantic-release/exec',
        {
          execCwd: projectPath,
          publishCmd: [
            `pnpm publish --no-git-checks --registry=$URM_ELEMENTS_NPM_CONFIG_REGISTRY ${DRY_RUN ? '--dry-run' : ''}`,
            `pnpm publish --no-git-checks --registry=$MAGLEV_ELEMENTS_NPM_CONFIG_REGISTRY ${DRY_RUN ? '--dry-run' : ''}`
          ].join(' && ')
        }
      ],
      [
        '@semantic-release/git',
        {
          assets: [resolve('../CHANGELOG.md'), packageFilePath],
          message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
        }
      ]
    ]
  };
}

module.exports = getBaseConfig;
