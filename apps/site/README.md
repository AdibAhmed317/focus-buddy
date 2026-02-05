# Focus Buddy - Site

SEO-optimized Next.js marketing landing page for Focus Buddy.

## 🎯 SEO Focus

This is built with **Next.js** for maximum SEO performance:

- ✅ **Static Generation** - Fast page loads, perfect for SEO
- ✅ **Server-Side Rendering** - Fresh content on every request
- ✅ **Built-in Image Optimization** - Automatic WebP/AVIF conversion
- ✅ **Built-in Font Optimization** - Reduced Core Web Vitals
- ✅ **Automatic Sitemap** - For search engine crawling
- ✅ **OpenGraph Support** - Rich social media previews
- ✅ **Structured Data** - Schema.org markup support

## 🚀 Setup

### Initialize Next.js Project

```bash
# From apps/site
cd apps/site

# Create Next.js project
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --no-git \
  --no-eslint \
  --import-alias '@/*'

# This creates a production-ready Next.js setup
```

### Development

```bash
# From monorepo root
bun dev --filter=@focus-buddy/site

# Or from apps/site
cd apps/landing
npm run dev
```

Visit `http://localhost:3000`

### Building for Production

```bash
# From monorepo root
bun build --filter=@focus-buddy/site

# Or from apps/site
npm run build
npm start
```

## 📄 Key Pages to Create

1. **`/`** - Homepage with hero, features, CTA
2. **`/pricing`** - Pricing plans
3. **`/docs`** - Documentation
4. **`/blog`** - Blog posts (for SEO)
5. **`/about`** - About Focus Buddy
6. **`/contact`** - Contact form

## 🔍 SEO Essentials

### Meta Tags

Use Next.js Metadata API:

```typescript
export const metadata = {
  title: 'Focus Buddy - Stay Focused, Boost Productivity',
  description: 'Focus Buddy helps you stay on track...',
  openGraph: {
    type: 'website',
    url: 'https://focusbuddy.app',
    title: 'Focus Buddy',
    description: 'Stay Focused, Boost Productivity',
  },
};
```

### Sitemap & Robots

Create `app/sitemap.ts` and `app/robots.ts`

### JSON-LD Schema

For rich snippets in search results:

```typescript
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Focus Buddy"
}
</script>
```

## 📚 Structure

```
apps/site/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   ├── sitemap.ts       # SEO sitemap
│   └── robots.ts        # robots.txt
├── public/
│   ├── og-image.png     # OpenGraph image
│   └── favicon.ico
└── package.json
```

## 🔗 Resources

- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Performance Guide](https://developers.google.com/web/tools/lighthouse)

---

**Next Steps:**

1. Run the setup command above
2. Create your main layout in `app/layout.tsx`
3. Build your homepage in `app/page.tsx`
4. Add SEO metadata to each page
5. Create sitemap and robots.txt
6. Deploy to Vercel for optimal Next.js performance
