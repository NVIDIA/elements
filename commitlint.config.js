export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-empty': [0, 'never'],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [0, 'always'],
    'footer-leading-blank': [2, 'always'],
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 100],
    'type-enum': [2, 'always', ['chore', 'fix', 'feat']],
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      [
        'ci',
        'docs',
        'internals',
        'create',
        'starters',
        'core',
        'pages',
        'playground',
        'styles',
        'themes',
        'cli',
        'code',
        'forms',
        'lint',
        'markdown',
        'media',
        'monaco'
      ]
    ]
  }
};
