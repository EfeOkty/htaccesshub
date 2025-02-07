import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  base: '/htaccesshub/',
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 70 },
      jpg: { quality: 70 },
      jpeg: { quality: 70 },
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                removeTitle: false,
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          // Favicon ve manifest dosyaları için özel yol
          if (/\.(ico|png|svg|webmanifest)$/.test(assetInfo.name)) {
            return '[name][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  },
})
