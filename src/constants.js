exports.DEFAULT_CONFIG = {
  ignore: ['node_modules'],
  paths: ['**'],
  regex: '(.+)?{key}(.+)?',
  testFileExtension: 'spec.js',
};
exports.GROUPS_TO_TEST = ['watch', 'computed', 'methods'];
exports.HOOKS_TO_TEST = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'activated',
  'deactivated',
  'beforeUnmount',
  'unmounted',
  'beforeDestroy',
  'destroyed',
  'renderTracked',
  'renderTriggered',
  'errorCaptured',
];
exports.IGNORE_COMMENT = 'coy-ignore-next';
