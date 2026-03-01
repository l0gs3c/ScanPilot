# 🎨 Tailwind CSS v4 Migration Guide

**Date**: February 23, 2026  
**Source**: Context7 MCP Documentation

## 🚨 Breaking Change

Tailwind CSS v4 đã thay đổi hoàn toàn cách tích hợp với Vite. **PostCSS plugin không còn được dùng nữa.**

## 📚 Context7 Research

```bash
# Resolve Tailwind library
mcp_context7_resolve-library-id --libraryName "tailwindcss"

# Get v4 documentation
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/tailwindcss_installation_using-vite" \
  --topic "vite postcss configuration setup tailwind v4" \
  --tokens 1500
```

**Result**: Official Tailwind v4 + Vite integration guide

## ❌ Old Way (Tailwind v3)

### Installation
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### tailwind.config.js
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### CSS
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## ✅ New Way (Tailwind v4)

### Installation
```bash
# Requires Vite v5+
npm install vite@latest @vitejs/plugin-react@latest
npm install tailwindcss@latest @tailwindcss/vite
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 Tailwind CSS v4 Vite plugin
  ],
  server: {
    port: 3000,
  }
})
```

### CSS (index.css or style.css)
```css
/* Simple import - that's it! */
@import "tailwindcss";
```

### What's NOT needed anymore
- ❌ `postcss.config.js` - Delete it
- ❌ `tailwind.config.js` - Optional (for customization only)
- ❌ `@tailwind` directives - Use `@import` instead
- ❌ `autoprefixer` - Built-in with Vite

## 🔧 Configuration (Optional)

If you need customization, create `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
      },
    },
  },
}
```

But for ScanPilot, we don't need this - default Tailwind works perfectly!

## 🐛 Common Errors

### Error 1: PostCSS Plugin Error
```
[plugin:vite:css] [postcss] It looks like you're trying to use `tailwindcss` 
directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package...
```

**Solution**: Migrate to v4 as shown above

### Error 2: Vite Version Mismatch
```
npm error peer vite@"^5.2.0 || ^6 || ^7" from @tailwindcss/vite@4.2.0
```

**Solution**: Upgrade Vite to v5+
```bash
npm install vite@latest
```

### Error 3: CSS Not Loading
**Problem**: Utility classes not working

**Solution**: Make sure you have `@import "tailwindcss";` in your CSS file

## 📦 Package Versions (ScanPilot)

```json
{
  "devDependencies": {
    "vite": "^7.3.1",
    "@vitejs/plugin-react": "^4.1.1",
    "tailwindcss": "^4.2.0",
    "@tailwindcss/vite": "^4.2.0"
  }
}
```

## 🚀 Usage in Components

No changes needed! Use Tailwind classes as before:

```tsx
function Button() {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Click me
    </button>
  )
}
```

## 🎯 ScanPilot Implementation

### Files Changed
1. ✅ **vite.config.ts** - Added `tailwindcss()` plugin
2. ✅ **src/index.css** - Changed to `@import "tailwindcss";`
3. ✅ **postcss.config.js** - Deleted (not needed)
4. ✅ **package.json** - Upgraded Vite to v7, Tailwind to v4

### Migration Steps
```bash
# 1. Remove old packages
npm uninstall tailwindcss postcss autoprefixer

# 2. Upgrade Vite
npm install vite@latest @vitejs/plugin-react@latest

# 3. Install Tailwind v4
npm install tailwindcss@latest @tailwindcss/vite

# 4. Update vite.config.ts (see above)

# 5. Update CSS file (see above)

# 6. Delete postcss.config.js
rm postcss.config.js

# 7. Start dev server
npm run dev
```

## 📊 Context7 Documentation Used

### Library: `/websites/tailwindcss_installation_using-vite`
- **Trust Score**: 9.9
- **Code Snippets**: 10
- **Topic**: Vite integration for Tailwind CSS

### Key Snippets Retrieved
1. **Vite Plugin Configuration**
```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

2. **CSS Import**
```css
@import "tailwindcss";
```

3. **Installation Command**
```bash
npm install tailwindcss @tailwindcss/vite
```

## ✨ Benefits of Tailwind v4

1. ✅ **Simpler Setup** - No PostCSS config needed
2. ✅ **Faster Build** - Integrated with Vite pipeline
3. ✅ **Less Configuration** - Works out of the box
4. ✅ **Better DX** - Cleaner integration
5. ✅ **Smaller Bundle** - Optimized by Vite

## 🔗 Resources

- [Tailwind v4 Documentation](https://tailwindcss.com)
- [Tailwind + Vite Guide](https://tailwindcss.com/docs/installation/using-vite)
- Context7 Library: `/websites/tailwindcss_installation_using-vite`

## 📝 Notes

- Tailwind v4 is a major version with breaking changes
- Requires Vite v5+ (we're using v7.3.1)
- No need for `tailwind.config.js` unless you want customization
- PostCSS configuration is handled automatically by Vite

---

**🎨 Migrated successfully using Context7 MCP documentation!**

**Frontend**: http://localhost:3001  
**Status**: ✅ Running with Tailwind CSS v4
