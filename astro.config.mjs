import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';

export default defineConfig({
  integrations: [
    tailwind({
      config: { mode: 'jit' }
    }),
    compress({
      css: true,
      html: true,
      img: true,
      js: true,
      svg: true,
    }),
  ],
  output: 'static',
  compressHTML: true,
  
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    format: ['avif', 'webp', 'png', 'jpg'],
    quality: 80,
  },
  
  build: {
    inlineStylesheets: 'auto',
    split: true,
  },
  
  vite: {
    build: {
      cssMinify: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          ecma: 2020,
        },
      },
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    ssr: {
      noExternal: ['matter-js'],
    },
    optimizeDeps: {
      include: ['matter-js'],
    },
    plugins: [
      {
        name: 'vite-plugin-compression',
        apply: 'build',
        enforce: 'post',
      }
    ],
  },
});

