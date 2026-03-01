# ⚡ Vite Configuration Guide

## 🎯 Overview
ScanPilot uses Vite as the frontend build tool and dev server. This guide documents Vite configuration patterns discovered using Context7 MCP.

## 📚 Context7 Research
```bash
# Get Vite documentation
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/vite_dev" \
  --topic "configuration development server proxy environment variables" \
  --tokens 1500

# Get Tailwind CSS + Vite integration
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/tailwindcss_installation_using-vite" \
  --topic "vite postcss configuration setup tailwind v4" \
  --tokens 1500

# Result: Complete Vite + Tailwind v4 documentation
```

## 🎨 Tailwind CSS v4 Integration

### ⚡ New in Tailwind v4
Tailwind v4 uses Vite plugin directly - **NO PostCSS config needed!**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 👈 Tailwind v4 Vite plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 Add this
  ],
  server: {
    port: 3000,
  }
})
```

```css
/* src/index.css */
@import "tailwindcss"; /* 👈 Simple import */
```

**Installation**:
```bash
npm install vite@latest @vitejs/plugin-react@latest
npm install tailwindcss@latest @tailwindcss/vite
```

**What's NOT needed**:
- ❌ `postcss.config.js` - Delete it
- ❌ `@tailwind` directives - Use `@import` instead
- ❌ `autoprefixer` - Built-in

📖 **See**: [TAILWIND_V4_MIGRATION.md](TAILWIND_V4_MIGRATION.md) for full migration guide

## 🔧 Development Server Configuration

### Basic Dev Server Setup
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    // Dev server port
    port: 3000,
    
    // Automatically open browser
    open: true,
    
    // Enable CORS for API calls
    cors: true,
    
    // Strict port - fail if port is already in use
    strictPort: false,
    
    // Host configuration
    host: true, // Listen on all addresses (0.0.0.0)
  }
})
```

## 🌐 API Proxy Configuration

### Proxying Backend Requests
```typescript
// From Context7 documentation
export default defineConfig({
  server: {
    proxy: {
      // String shorthand:
      // http://localhost:3000/api -> http://localhost:8000/api
      '/api': 'http://localhost:8000',
      
      // With options for more control
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true, // Change host header to target
        secure: false,      // Accept self-signed certificates
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
        
        // Custom headers
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err)
          })
          
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.method, req.url)
          })
        }
      },
      
      // WebSocket proxying for real-time features
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        rewriteWsOrigin: true,
      },
      
      // RegExp matching
      '^/fallback/.*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      }
    }
  }
})
```

**ScanPilot Implementation**:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

## 🌍 Environment Variables

### Loading Environment Variables
```typescript
// From Context7 pattern
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env file based on mode (.env.development, .env.production)
  // Third parameter '' loads all env vars regardless of VITE_ prefix
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // Expose app-level constants
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      __API_URL__: JSON.stringify(env.VITE_API_URL),
    },
    
    // Use env vars in config
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : 5173,
      host: env.VITE_HOST || 'localhost',
    },
    
    // Base URL for production
    base: env.VITE_BASE_URL || '/',
  }
})
```

### Environment Files
```bash
# .env - Shared across all modes
VITE_APP_TITLE=ScanPilot

# .env.development - Development only
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# .env.production - Production only
VITE_API_URL=https://api.scanpilot.com
VITE_WS_URL=wss://api.scanpilot.com
```

### Using in React Code
```typescript
// Access env vars in React components
const apiUrl = import.meta.env.VITE_API_URL
const appTitle = import.meta.env.VITE_APP_TITLE
const mode = import.meta.env.MODE // 'development' or 'production'
const isDev = import.meta.env.DEV // boolean
const isProd = import.meta.env.PROD // boolean

// TypeScript env types
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_WS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 🏗️ Build Configuration

### Production Build Optimization
```typescript
export default defineConfig({
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps for debugging
    sourcemap: true,
    
    // Minify with terser (better compression)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      }
    },
    
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
        }
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inlining threshold (bytes)
    assetsInlineLimit: 4096,
  }
})
```

## 🎨 Plugin Configuration

### React Plugin
```typescript
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      
      // Babel plugins
      babel: {
        plugins: [
          // Add custom babel plugins
        ]
      },
      
      // JSX runtime (automatic by default)
      jsxRuntime: 'automatic',
    })
  ]
})
```

### Path Aliases
```typescript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@utils': resolve(__dirname, './src/utils'),
      '@pages': resolve(__dirname, './src/pages'),
      '@services': resolve(__dirname, './src/services'),
    }
  }
})
```

Usage in code:
```typescript
// Instead of: import Button from '../../components/ui/Button'
import Button from '@components/ui/Button'
import { api } from '@services/api'
import { formatDate } from '@utils/formatters'
```

## 🚀 Performance Optimization

### Dependency Pre-bundling
```typescript
export default defineConfig({
  optimizeDeps: {
    // Include dependencies for pre-bundling
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
    ],
    
    // Exclude from pre-bundling
    exclude: ['some-large-package'],
    
    // Force optimization even if cached
    force: false,
  }
})
```

### Multiple Environments
```typescript
// From Context7 advanced patterns
export default defineConfig({
  environments: {
    client: {
      build: {
        outDir: 'dist/client',
        sourcemap: false,
      }
    },
    ssr: {
      build: {
        outDir: 'dist/ssr',
        ssr: true,
      }
    }
  }
})
```

## 🔍 Development Features

### CSS Configuration
```typescript
export default defineConfig({
  css: {
    // CSS preprocessor options
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    
    // PostCSS configuration
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ]
    },
    
    // CSS modules
    modules: {
      localsConvention: 'camelCase',
      scopeBehaviour: 'local',
    }
  }
})
```

### Hot Module Replacement (HMR)
```typescript
// Vite provides HMR by default
// Custom HMR API usage:
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Handle hot update
  })
  
  import.meta.hot.dispose(() => {
    // Cleanup before update
  })
}
```

## 🐛 Debugging Configuration

### Verbose Logging
```typescript
export default defineConfig({
  logLevel: 'info', // 'info' | 'warn' | 'error' | 'silent'
  
  clearScreen: false, // Keep terminal history
  
  server: {
    // Log all requests
    middlewareMode: false,
  }
})
```

## 📊 Complete ScanPilot Configuration

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Tailwind v4
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      tailwindcss(), // Tailwind CSS v4 Vite plugin
    ],
    
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@utils': resolve(__dirname, './src/utils'),
        '@pages': resolve(__dirname, './src/pages'),
        '@services': resolve(__dirname, './src/services'),
        '@contexts': resolve(__dirname, './src/contexts'),
      }
    },
    
    server: {
      port: 3000,
      host: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    },
    
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          }
        }
      }
    },
    
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    }
  }
})
```

## 📖 Context7 Commands Used

```bash
# Vite configuration
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/vite_dev" \
  --topic "configuration development server" \
  --tokens 1500

# Proxy configuration
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/vite_dev" \
  --topic "proxy api configuration" \
  --tokens 1000

# Environment variables
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/vite_dev" \
  --topic "environment variables loadEnv" \
  --tokens 1000

# Build optimization
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/vite_dev" \
  --topic "build optimization production" \
  --tokens 1500
```

## ✅ Best Practices

1. **Use environment variables** for configuration
2. **Enable proxy** for API calls to avoid CORS issues
3. **Configure aliases** for cleaner imports
4. **Optimize chunks** for better caching
5. **Enable sourcemaps** for debugging
6. **Use HMR** for fast development
7. **Pre-bundle dependencies** for faster startup
8. **Remove console.logs** in production

## 🔗 Resources

- [Vite Documentation](https://vite.dev)
- [Vite GitHub](https://github.com/vitejs/vite)
- Context7 Library: `/websites/vite_dev`

---

**⚡ Powered by Vite + Context7 MCP**
