# Focus Buddy Extension

Chrome extension for focus management with attention and tracking features.

## 🚀 Setup

### Move Existing Files

The extension code currently lives in the root. To complete the migration:

1. Move all files from the root `src/` folder to `apps/extension/src/`
2. Move configuration files to `apps/extension/`:
   - `vite.config.ts`
   - `tsconfig.json`
   - `tsconfig.app.json`
   - `tsconfig.node.json`
   - `manifest.json`
   - `tailwind.config.ts`
   - `postcss.config.js`
   - `eslint.config.js`

3. Move public assets to `apps/extension/public/`:
   - `index.html`
   - `popup.html`
   - `offscreen.html`
   - `robots.txt`

4. Update imports and ensure all paths are correct

### Development

```bash
# From monorepo root
bun dev --filter=@focus-buddy/extension

# Or from apps/extension
cd apps/extension
bun dev
```

### Building

```bash
# From monorepo root
bun build --filter=@focus-buddy/extension

# Built output will be in dist/
```

## 📖 Technologies

- **Vite** - Build tool
- **React 18** - UI framework  
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

## 🔗 Links

- [Chrome Extension Manifest Docs](https://developer.chrome.com/docs/extensions/reference/manifest/)
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
