exports.DEFAULT_CONFIG = {
  ignore: ['node_modules'],
  paths: ['**'],
  regex: '(.+)?{key}(.+)?',
  testFileExtension: 'spec.js',
};
exports.GROUPS_TO_TEST = ['watch', 'computed', 'methods'];
exports.IGNORE_COMMENT = 'coy-ignore-next';
