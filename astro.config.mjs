import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [
    // Optimización de Tailwind
    tailwind({
      // Modo JIT para reducir CSS no utilizado
      config: { mode: 'jit' }
    }),
    // Añadir compresión de assets
    compress({
      css: true,
      html: true,
      img: true,
      js: true,
      svg: true,
    }),
  ],
  output: 'static',
  // Adaptador de Cloudflare (opcional, solo si usas Cloudflare Pages con funciones)
  // Si solo usas el hosting estático de Cloudflare, puedes omitir esta línea
  // adapter: cloudflare(),
  
  // Comprimir HTML para reducir tamaño
  compressHTML: true,
  
  // Optimización de imágenes
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    // Configuración de calidad y formatos
    format: ['avif', 'webp', 'png', 'jpg'],
    // Calidad predeterminada para imágenes
    quality: 80,
  },
  
  build: {
    // Inlinear estilos pequeños para reducir peticiones HTTP
    inlineStylesheets: 'auto',
    // Dividir el bundle para mejor caching
    split: true,
  },
  
  vite: {
    // Optimización de build
    build: {
      // Minimizar CSS y JS
      cssMinify: true,
      minify: 'terser',
      // Configuración de Terser para máxima compresión
      terserOptions: {
        compress: {
          drop_console: true,
          ecma: 2020,
        },
      },
      // Dividir el código en chunks más pequeños
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Agrupar dependencias de node_modules
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
    // Habilitar compresión Brotli/Gzip
    plugins: [
      {
        name: 'vite-plugin-compression',
        apply: 'build',
        enforce: 'post',
      }
    ],
  },
});

