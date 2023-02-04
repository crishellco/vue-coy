exports.DEFAULT_CONFIG = {
  ignore: ['**/node_modules/**'],
  paths: ['**'],
  regex: '(.+)?{key}(.+)?',
  testFileExtension: 'spec.js',
};
exports.GROUPS_TO_TEST = ['watch', 'computed', 'methods'];
exports.HOOKS_TO_TEST = [
  'activated',
  'beforeCreate',
  'beforeDestroy',
  'beforeMount',
  'beforeUnmount',
  'beforeUpdate',
  'created',
  'deactivated',
  'destroyed',
  'errorCaptured',
  'mounted',
  'renderTracked',
  'renderTriggered',
  'unmounted',
  'updated',
];
exports.IGNORE_COMMENT = 'coy-ignore-next';
