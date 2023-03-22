import * as esbuild from 'esbuild'
import { copy } from 'esbuild-plugin-copy';

await esbuild.build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  outfile: 'dist/app.js',
  platform: 'node',
  target: 'node18',
  packages: 'external',
  sourcemap: true,
  plugins: [
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['src/views/*'],
        to: ['dist/views'],
      },
    }),
  ],
})