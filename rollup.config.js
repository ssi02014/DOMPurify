import fs from 'fs';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const env = process.env.NODE_ENV;
const event = process.env.npm_lifecycle_event; // build, build:umd, ...
const version = process.env.npm_package_version;
const license = fs
  .readFileSync('./src/license_header', 'utf8')
  .replace(/VERSION/gi, version);

const commonOutputConfig = {
  name: 'DOMPurify',
  sourcemap: true,
  banner: license,
  exports: 'default',
};

export default {
  input: 'src/purify.js',
  external: [],
  output: [
    {
      ...commonOutputConfig,
      file: pkg.browser,
      format: 'umd',
    },
    {
      ...commonOutputConfig,
      file: pkg.production,
      format: 'umd',
      plugins: event === 'build' ? [terser()] : [],
    },
    {
      ...commonOutputConfig,
      file: pkg.module,
      format: 'es',
    },
    {
      ...commonOutputConfig,
      file: pkg.main,
      format: 'cjs',
    },
  ],
  plugins: [
    babel({
      // It is recommended to configure this option explicitly (even if with its default value) so an informed decision is taken on how those babel helpers are inserted into the code.
      // Ref: https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
      babelHelpers: 'bundled',
      exclude: ['**/node_modules/**'],
    }),
    nodeResolve(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(env),
        VERSION: `'${version}'`,
      },
    }),
  ],
};
