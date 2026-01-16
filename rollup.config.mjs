import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-import-css';

import { readFileSync } from 'fs';

const pkg = importPkg();
const nonbundledDependencies = Object.keys({ ...pkg.dependencies });


export default {
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
    css(),
    alias({
      entries: [
        { find: 'react', replacement: '@bpmn-io/properties-panel/preact/compat' },
        { find: 'preact', replacement: '@bpmn-io/properties-panel/preact' }
      ]
    })
  ],
  external: nonbundledDependencies
};

function importPkg() {
  return JSON.parse(readFileSync('./package.json', { encoding:'utf8' }));
}
