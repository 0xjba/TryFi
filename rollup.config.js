import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/tryfi.umd.js',
      format: 'umd',
      name: 'TryFi',
      globals: {},
      banner: '/* TryFi - Bundled with ethers.js to avoid conflicts */'
    },
    {
      file: 'dist/tryfi.esm.js',
      format: 'es',
      banner: '/* TryFi - Bundled with ethers.js to avoid conflicts */'
    }
  ],
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        'global.ethers': 'global.TryFiEthers',
        'window.ethers': 'window.TryFiEthers'
      }
    }),
    alias({
      entries: [
        { find: 'ethers', replacement: path.resolve('./node_modules/ethers') }
      ]
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
      exportConditions: ['browser', 'import', 'module', 'default']
    }),
    commonjs({
      include: ['node_modules/**'],
      transformMixedEsModules: true
    }),
    !isDev && terser({
      mangle: {
        reserved: ['TryFi', 'TryFiEthers']
      },
      compress: {
        drop_console: !isDev
      }
    })
  ].filter(Boolean)
};