import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  external: ['ethers', 'qrious'],
  output: [
    {
      file: 'dist/tryfi.umd.js',
      format: 'umd',
      name: 'TryFi',
      globals: {
        'ethers': 'ethers',
        'qrious': 'QRious'
      }
    },
    {
      file: 'dist/tryfi.esm.js',
      format: 'es'
    }
  ],
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    terser()
  ]
};