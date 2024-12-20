import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const buildScripts = [
  '*.js',
  '*.mjs'
];

export default [
  {
    ignores: [
      'dist',
      '.nyc_output',
      'coverage'
    ]
  },
  ...bpmnIoPlugin.configs.browser.map(config => {
    return {
      ...config,
      ignores: buildScripts
    };
  }),
  ...bpmnIoPlugin.configs.node.map(config => {
    return {
      ...config,
      files: buildScripts
    };
  }),
  ...bpmnIoPlugin.configs.mocha.map(config => {
    return {
      ...config,
      files: [
        'test/**/*.js'
      ]
    };
  }),
  {
    files: [
      'test/**/*.js'
    ],
    languageOptions: {
      globals: {
        require: false,
        sinon: false
      }
    }
  }
];
