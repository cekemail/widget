import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const input = 'src/index.ts';

// Shared TypeScript options (no declarations)
const tsPluginNoDeclaration = typescript({
  tsconfig: './tsconfig.json',
  declaration: false,
  declarationDir: undefined,
});

export default [
  // ES Module (with declarations)
  {
    input,
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
      }),
    ],
  },
  // CommonJS
  {
    input,
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          declaration: false,
          declarationDir: undefined,
        },
      }),
    ],
  },
  // UMD (for browsers)
  {
    input,
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'CekEmailWidget',
      sourcemap: true,
      globals: {},
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          declaration: false,
          declarationDir: undefined,
        },
      }),
    ],
  },
  // UMD Minified (for CDN)
  {
    input,
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: 'CekEmailWidget',
      sourcemap: true,
      globals: {},
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          declaration: false,
          declarationDir: undefined,
        },
      }),
      terser({
        format: {
          comments: false,
        },
      }),
    ],
  },
];
