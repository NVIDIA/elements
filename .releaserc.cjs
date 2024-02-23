const fs = require('node:fs');
const { globSync } = require('glob');

const sourceFiles = globSync('./projects/elements/dist/**/*.js')
  .filter(file => !file.includes('dist/index.js'))
  .filter(file => fs.readFileSync(file, 'utf8').includes('0.0.0'));

console.log(`${sourceFiles.length} source file inline versions to be updated`);

module.exports = {
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
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md'
      }
    ],
    [
      '@semantic-release/gitlab',
      {
        successComment:
          '🎉 This issue has been resolved in version ${nextRelease.version} 🎉\n\n[Changelog](https://NVIDIA.github.io/elements/api/?path=/docs/about-changelog--docs)',
        assets: [
          {
            label: '@elements/elements',
            type: 'package',
            url: 'https://registry.npmjs.org'
          },
          {
            label: '@elements/elements-react',
            type: 'package',
            url: 'https://registry.npmjs.org'
          },
          {
            label: '@nvidia-elements/testing',
            type: 'package',
            url: 'https://registry.npmjs.org'
          }
        ]
      }
    ],
    [
      'semantic-release-replace-plugin',
      {
        replacements: [
          {
            files: sourceFiles,
            from: '0.0.0',
            to: '${nextRelease.version}'
          },
          {
            files: ['./projects/elements/dist/index.js'],
            from: '0.0.0',
            to: '${nextRelease.version}',
            results: [
              {
                file: './projects/elements/dist/index.js',
                hasChanged: true,
                numMatches: 1,
                numReplacements: 1
              }
            ],
            countMatches: true
          },
          {
            files: ['./projects/elements/package.json'],
            from: '"version": "0.0.0"',
            to: '"version": "${nextRelease.version}"',
            results: [
              {
                file: './projects/elements/package.json',
                hasChanged: true,
                numMatches: 1,
                numReplacements: 1
              }
            ],
            countMatches: true
          },
          {
            files: ['./projects/elements-react/package.json'],
            from: '0.0.0',
            to: '${nextRelease.version}',
            results: [
              {
                file: './projects/elements-react/package.json',
                hasChanged: true,
                numMatches: 2,
                numReplacements: 2
              }
            ],
            countMatches: true
          }
        ]
      }
    ],
    [
      '@amanda-mitchell/semantic-release-npm-multiple',
      {
        registries: {
          urm_elements: {
            npmPublish: true,
            pkgRoot: './projects/elements'
          },
          urm_react: {
            npmPublish: true,
            pkgRoot: './projects/elements-react'
          },
          urm_testing: {
            npmPublish: true,
            pkgRoot: './projects/testing'
          },
          elements_elements: {
            npmPublish: true,
            pkgRoot: './projects/elements'
          },
          elements_react: {
            npmPublish: true,
            pkgRoot: './projects/elements-react'
          },
          elements_testing: {
            npmPublish: true,
            pkgRoot: './projects/testing'
          }
        }
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md'],
        message: 'chore(release): v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
};
