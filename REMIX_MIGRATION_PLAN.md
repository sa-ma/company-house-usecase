# Plan: Recreate App in Remix v2

## Overview

Recreate the UK Company Search application in Remix v2 in a new folder `/Users/sama/dev/personal/frontend-prac-remix`.

**Current Stack:** React Router 7 + Vite + TailwindCSS v4 + TypeScript
**Target Stack:** Remix v2 + TailwindCSS v4 + TypeScript

---

## Phase 1: Project Setup

### 1.1 Create Remix v2 Project
```bash
cd /Users/sama/dev/personal
npx create-remix@latest frontend-prac-remix
```

Options to select:
- TypeScript: Yes
- Initialize git: Yes
- Install dependencies: Yes

### 1.2 Install Additional Dependencies
```bash
cd frontend-prac-remix
npm install @tailwindcss/vite tailwindcss
```

### 1.3 Configure TailwindCSS v4
- Update `vite.config.ts` to include TailwindCSS plugin
- Create/update `app/tailwind.css` with `@import "tailwindcss"`

### 1.4 Environment Setup
- Copy `.env` file with `COMPANY_HOUSE_API_KEY` and `COMPANY_HOUSE_API_URL`

---

## Phase 2: Core Infrastructure

### 2.1 Copy Data Files
Copy from `app/data/` to new project:
- `company-data.json` (1,352 lines - translation mappings)
- `filing-history-enum.json` (1,183 lines - filing type descriptions)

### 2.2 Copy Utility Libraries
Copy and adapt from `app/lib/`:

**`api-client.ts`** - No changes needed
- Companies House API client with basic auth
- Endpoints: search, company details, officers, filing history

**`company-data.ts`** - No changes needed
- Translation functions for company types, statuses, SIC codes
- Officer role and filing history description formatters

---

## Phase 3: Root Layout & Styling

### 3.1 Update Root Component (`app/root.tsx`)

**Key differences from React Router 7 to Remix v2:**

| Feature | React Router 7 | Remix v2 |
|---------|---------------|----------|
| Imports | `react-router` | `@remix-run/react` |
| Meta export | `meta()` function | `meta()` function (same) |
| Links | `links()` function | `links()` function (same) |
| Layout | `Layout` component | Direct in `App` default export |
| Error Boundary | `ErrorBoundary` export | `ErrorBoundary` export (same) |

**Items to include:**
- Google Fonts (Inter) via links
- TailwindCSS import
- Favicon links
- Meta tags (charset, viewport)
- Error boundary with custom styling
- Hydrate fallback for SSR

### 3.2 Copy Global Styles (`app/tailwind.css`)
```css
@import "tailwindcss";

html {
  font-family: "Inter", system-ui, sans-serif;
}
```

---

## Phase 4: Components

Copy all components from `app/components/` with minimal changes:

### 4.1 `Logo.tsx`
- Animated SVG logo with dashed stroke animation
- No changes needed

### 4.2 `Search.tsx`
- Search form component
- Change: `import { Form } from "@remix-run/react"`

### 4.3 `BackButton.tsx`
- Smart back navigation with query preservation
- Change: `import { useNavigate, useLocation } from "@remix-run/react"`

### 4.4 `ErrorBoundary.tsx`
- Reusable error display component
- Change: `import { Link } from "@remix-run/react"`

### 4.5 `LoadingSkeleton.tsx`
- Loading placeholder UI (search results & company details variants)
- No changes needed (pure React component)

---

## Phase 5: Routes

### 5.1 Route Structure Mapping

| Current (React Router 7) | Remix v2 | Purpose |
|-------------------------|----------|---------|
| `routes/_index.tsx` | `routes/_index.tsx` | Home page |
| `routes/search-results.tsx` | `routes/search-results.tsx` | Search results |
| `routes/company.$id._index.tsx` | `routes/company.$id._index.tsx` | Company details |
| `routes/company.$id.activity.tsx` | `routes/company.$id.activity.tsx` | Filing history |

**Note:** Remix v2 uses the same flat file routing convention, so file names stay identical.

### 5.2 Home Page (`routes/_index.tsx`)
**Changes needed:**
- `import { type MetaFunction } from "@remix-run/node"`
- `import { ... } from "@remix-run/react"`

**Features:**
- Logo component with animation
- Search form
- Simple centered layout

### 5.3 Search Results (`routes/search-results.tsx`)
**Changes needed:**
- `import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node"`
- `import { useLoaderData, Link, useSearchParams } from "@remix-run/react"`

**Features:**
- Server-side loader with Companies House API search
- Pagination (20 items per page, max 250 pages)
- Company status badges with color coding
- Error boundary for failed searches

### 5.4 Company Details (`routes/company.$id._index.tsx`)
**Changes needed:**
- `import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node"`
- `import { useLoaderData, Link } from "@remix-run/react"`

**Features:**
- Parallel API calls: company + officers + filing history (preview)
- Company info display with translated types/statuses
- Officers grid (responsive 1/2/3 columns)
- Recent filings preview (5 items)
- Link to full activity page

### 5.5 Filing History (`routes/company.$id.activity.tsx`)
**Changes needed:**
- `import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node"`
- `import { useLoaderData, useFetcher, Link } from "@remix-run/react"`

**Features:**
- Initial server-side load of first 50 filings
- Client-side "Load More" with useFetcher
- Timeline visualization with animated dots
- Filing description translation

---

## Phase 6: Type Definitions

### 6.1 API Types
Create `app/types/api.ts` (or keep inline) with:
- `CompanySearchResult`
- `CompanyProfile`
- `Officer`
- `FilingHistoryItem`
- Loader data types for each route

---

## Phase 7: Configuration

### 7.1 `vite.config.ts`
```typescript
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
});
```

### 7.2 `tsconfig.json`
Ensure path alias is configured:
```json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./app/*"]
    }
  }
}
```

---

## Phase 8: Testing & Verification

### 8.1 Verify All Routes
- [ ] Home page loads with logo and search
- [ ] Search returns results and pagination works
- [ ] Company details page shows all sections
- [ ] Activity page loads with infinite scroll

### 8.2 Verify Features
- [ ] Server-side rendering works
- [ ] Error boundaries display correctly
- [ ] Loading skeletons appear during navigation
- [ ] Back button preserves search context
- [ ] All translations work (company types, SIC codes, filing types)

### 8.3 Verify Styling
- [ ] TailwindCSS classes render correctly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Logo animation plays correctly
- [ ] Status badges have correct colors

---

## File-by-File Migration Checklist

### Copy Directly (no changes)
- [ ] `app/data/company-data.json`
- [ ] `app/data/filing-history-enum.json`
- [ ] `app/lib/api-client.ts`
- [ ] `app/lib/company-data.ts`
- [ ] `app/components/Logo.tsx`
- [ ] `app/components/LoadingSkeleton.tsx`
- [ ] `.env`

### Copy with Import Changes
- [ ] `app/components/Search.tsx` - Form import
- [ ] `app/components/BackButton.tsx` - useNavigate, useLocation imports
- [ ] `app/components/ErrorBoundary.tsx` - Link import
- [ ] `app/routes/_index.tsx` - All Remix imports
- [ ] `app/routes/search-results.tsx` - All Remix imports
- [ ] `app/routes/company.$id._index.tsx` - All Remix imports
- [ ] `app/routes/company.$id.activity.tsx` - All Remix imports
- [ ] `app/root.tsx` - Significant restructure for Remix conventions

### Create New
- [ ] `app/tailwind.css` (copy from app.css)
- [ ] Update `vite.config.ts` with Remix + Tailwind plugins

---

## Key Import Mapping Reference

| React Router 7 | Remix v2 |
|---------------|----------|
| `react-router` | `@remix-run/react` |
| `Route` types | `@remix-run/node` |
| `type Route` from generated | Define manually or use Remix types |
| `loaderData` via destructuring | `useLoaderData<typeof loader>()` |

---

## Estimated Files to Create/Modify

| Category | Count |
|----------|-------|
| Routes | 4 |
| Components | 5 |
| Lib/Utils | 2 |
| Data files | 2 |
| Config files | 3 |
| Root/Entry | 1 |
| **Total** | **17** |

---

## Commands Summary

```bash
# 1. Create project
cd /Users/sama/dev/personal
npx create-remix@latest frontend-prac-remix

# 2. Install dependencies
cd frontend-prac-remix
npm install @tailwindcss/vite tailwindcss

# 3. Start dev server (after migration)
npm run dev
```
