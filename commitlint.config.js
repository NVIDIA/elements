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
        'starters',
        'elements',
        'elements-react',
        'pages',
        'playground',
        'styles',
        'testing',
        'themes',
        'labs-behaviors-alpine',
        'labs-code',
        'labs-playwright-screencast',
        'labs-snippets',
        'monaco'
      ]
    ]
  }
};
