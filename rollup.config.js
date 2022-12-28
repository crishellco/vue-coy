const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonJs = require('@rollup/plugin-commonjs');

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/main.js',
      format: 'cjs',
    },
  ],
  plugins: [commonJs(), nodeResolve()],
  external: ['chalk', 'chokidar', 'glob', 'lodash'],
};
