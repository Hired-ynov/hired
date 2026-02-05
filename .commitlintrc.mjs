/** @type {import("@commitlint/types").UserConfig} */
const Configuration = {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
  plugins: [
    {
      rules: {
        'hir-reference': (parsed) => {
          const hirPattern = /HIR-\d+$/;
          const hasHirReference = hirPattern.test(parsed.header);
          return [
            hasHirReference,
            hasHirReference
              ? ''
              : 'Le commit doit se terminer par une référence HIR-<numéro> (ex: feat(homepage): add login HIR-123)',
          ];
        },
      },
    },
  ],
  rules: {
    'hir-reference': [2, 'always'],
    'body-empty': [2, 'always'],
    'footer-empty': [2, 'always'],
    'header-case': [0, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 200],
    'header-trim': [2, 'always'],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-delimiter-style': [2, 'always', ['/', '-']],
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      [
        'global',
        'front',
        'files',
        'domain',
        'communication',
        'auth',
        'gateway',
        'packages',
        'models',
        'config',
        'ui',
        'core',
      ],
    ],
    'subject-case': [0, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'libs',
        'ci',
        'docs',
        'feat',
        'fix',
        'refacto',
        'style',
        'test',
      ],
    ],
  },
};

export default Configuration;
