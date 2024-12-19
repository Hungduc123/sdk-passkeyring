import { URL_PASSKEY } from './lib/constants/index'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'
import dts from 'vite-plugin-dts'
// import { EsLinter, linterPlugin } from 'vite-plugin-linter'

// https://vitejs.dev/config/
export default defineConfig(configEnv => ({
  plugins: [
    react(),
    tsConfigPaths(),
    // linterPlugin({
    //   include: ['./src}/**/*.{ts,tsx}'],
    //   linters: [new EsLinter({ configEnv })],
    // }),
    dts({
      include: ['lib/main.tsx'],
      beforeWriteFile: (filePath, content) => ({
        filePath: filePath.replace('/lib', ''),
        content,
      }),
    }),
  ],
  build: {
    lib: {
      entry: resolve('lib', 'main.tsx'),
      name: 'ReactFeatureFlag',
      fileName: (format) => `main.${format}.js`,
    },
    rollupOptions: {
      external: ['react'],
    },
  },
  server: {
    origin: 'http://localhost:3002',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    proxy: {
      '/api/ankrRpc': {
        target: 'https://smart.keyring.app', // Replace with the actual API endpoint
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api\/ankrRpc/, ''),
      },
    },
  },
}))
