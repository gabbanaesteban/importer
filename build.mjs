import * as esbuild from 'esbuild'
import { copy } from 'esbuild-plugin-copy';

await esbuild.build({
  bundle: true,
  entryPoints: ['src/app.ts', 'src/tasks/consumer.ts'],
  outdir: 'dist',
  platform: 'node',
  target: 'node18',
  packages: 'external',
  sourcemap: true,
  plugins: [
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['src/views/**/*'],
        to: ['dist/views'],
      },
    }),
  ],
})