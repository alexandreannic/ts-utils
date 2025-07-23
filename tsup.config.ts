import {defineConfig} from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    browser: 'src/browser/index.ts',
    node: 'src/node/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  minify: false,
  splitting: true,
  sourcemap: true,
  clean: true,
  keepNames: true,
  treeshake: true,
})
