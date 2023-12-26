module.exports = {
  dryRun: true,
  branches: ['main'],
  tagFormat: '${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'fix', release: 'patch' },
          { type: 'feat', release: 'major' },
          { type: 'chore', release: false }
        ]
      }
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md'
      }
    ],
    '@semantic-release/gitlab',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    [
      'semantic-release-replace-plugin',
      {
        replacements: [
          {
            files: ['./projects/elements/dist/index.js'],
            from: '0.0.0',
            to: '${nextRelease.version}',
            results: [
              {
                file: './projects/elements/dist/index.js',
                haseChanged: true,
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
                haseChanged: true,
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
          elements: {
            npmPublish: true,
            pkgRoot: './projects/elements'
          },
          react: {
            npmPublish: true,
            pkgRoot: './projects/react'
          }
        }
      }
    ]
  ]
};
