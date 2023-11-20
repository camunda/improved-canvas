/* eslint-env node */
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');

const pkg = require('./package.json');
const nonbundledDependencies = Object.keys({ ...pkg.dependencies });

const nodeResolve = require('@rollup/plugin-node-resolve');

const css = require('rollup-plugin-import-css');

module.exports = {
  input: 'lib/index.js',
  output: [ {
    file: pkg.main,
    format: 'cjs'
  },
  {
    file: pkg.module,
    format: 'esm'
  } ],
  plugins: [
    commonjs(),
    json(),
    nodeResolve(),
    css()
  ],
  external: nonbundledDependencies
};
