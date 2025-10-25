import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Enable JSX runtime
      jsxRuntime: 'automatic',
    }),
  ],
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@components': resolve(__dirname, './components'),
      '@pages': resolve(__dirname, './pages'),
      '@lib': resolve(__dirname, './lib'),
      '@hooks': resolve(__dirname, './hooks'),
      '@context': resolve(__dirname, './context'),
      '@utils': resolve(__dirname, './utils'),
      '@types': resolve(__dirname, './types.ts'),
    },
  },

  // Build configuration
  build: {
    // Enable source maps for production debugging
    sourcemap: true,
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['framer-motion', 'react-hot-toast'],
          'utils-vendor': ['lodash-es', 'date-fns', 'zod'],
        },
      },
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    // Fix MIME type issues
    middlewareMode: false,
    fs: {
      strict: false,
    },
    // Ensure proper module serving
    hmr: {
      port: 3001,
    },
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
    open: true,
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    postcss: './postcss.config.js',
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'react-hot-toast',
      'framer-motion',
      'lodash-es',
      'date-fns',
    ],
    // Force re-optimization to fix MIME issues
    force: true,
  },

  // Performance optimizations
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});