const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonJS = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');

const inputOptions = {
  input: './src/index.js',
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**',
    }),
    commonJS({
      include: 'node_modules/**',
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
};

const outputOptions = {
  name: 'cellular',
  format: 'umd',
  file: 'dist/cellular.js',
  sourcemap: true,
};

const watchOptions = {
  include: '../src/**',
};

module.exports = {
  input: inputOptions,
  output: outputOptions,
  watch: watchOptions,
};