# E-Commerce Architecture Documentation

This document outlines the complete architecture of the Nike E-Commerce project, designed to be reused for new frontend projects (like a toy store) while maintaining the same backend structure.

---

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Database Schema](#database-schema)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Styling System](#styling-system)
6. [Key Patterns & Conventions](#key-patterns--conventions)
7. [Reusable Components](#reusable-components)
8. [Quick Start for New Project](#quick-start-for-new-project)

---

## 🛠 Tech Stack

### Core
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS v4

### Key Dependencies
```json
{
  "drizzle-orm": "^0.45.0",
  "drizzle-zod": "^0.8.3",
  "better-auth": "^1.4.6",
  "query-string": "^9.3.1",
  "zustand": "^5.0.9",
  "@faker-js/faker": "^10.1.0"
}
```

---

## 🗄️ Database Schema

### Core Product Schema

#### **Products Table**
```typescript
products {
  id: uuid (PK)
  name: text
  description: text
  categoryId: uuid (FK → categories)
  genderId: uuid (FK → genders)
  brandId: uuid (FK → brands)
  isPublished: boolean
  defaultVariantId: uuid (FK → product_variants)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### **Product Variants Table**
```typescript
product_variants {
  id: uuid (PK)
  productId: uuid (FK → products)
  sku: text (unique)
  price: numeric(10,2)
  salePrice: numeric(10,2)
  colorId: uuid (FK → colors)
  sizeId: uuid (FK → sizes)
  inStock: integer
  weight: real
  dimensions: jsonb
  createdAt: timestamp
}
```

#### **Product Images Table**
```typescript
product_images {
  id: uuid (PK)
  productId: uuid (FK → products)
  variantId: uuid (FK → product_variants, nullable)
  url: text
  sortOrder: integer
  isPrimary: boolean
}
```

### Filter/Taxonomy Tables

#### **Categories**
```typescript
categories {
  id: uuid (PK)
  name: text
  slug: text (unique)
  parentId: uuid (FK → categories, self-reference)
}
```

#### **Brands**
```typescript
brands {
  id: uuid (PK)
  name: text
  slug: text (unique)
  logoUrl: text
}
```

#### **Genders**
```typescript
genders {
  id: uuid (PK)
  label: text
  slug: text (unique)
}
```

#### **Colors**
```typescript
colors {
  id: uuid (PK)
  name: text
  slug: text (unique)
  hexCode: text
}
```

#### **Sizes**
```typescript
sizes {
  id: uuid (PK)
  name: text
  slug: text (unique)
  sortOrder: integer
}
```

### Supporting Tables

#### **Collections**
```typescript
collections {
  id: uuid (PK)
  name: text
  slug: text (unique)
  description: text
  imageUrl: text
  isActive: boolean
  createdAt: timestamp
}

product_collections {
  id: uuid (PK)
  productId: uuid (FK → products)
  collectionId: uuid (FK → collections)
  sortOrder: integer
}
```

#### **Reviews**
```typescript
reviews {
  id: uuid (PK)
  productId: uuid (FK → products)
  userId: uuid (FK → users)
  rating: integer (1-5)
  title: text
  comment: text
  createdAt: timestamp
}
```

### User & Auth Tables

```typescript
users {
  id: uuid (PK)
  name: text
  email: text (unique)
  emailVerified: boolean
  image: text
  createdAt: timestamp
  updatedAt: timestamp
}

session, account, verification, guest
// Managed by Better Auth
```

### Cart & Orders

```typescript
carts {
  id: uuid (PK)
  userId: uuid (FK → users, nullable)
  guestId: uuid (FK → guests, nullable)
  createdAt: timestamp
  updatedAt: timestamp
}

cart_items {
  id: uuid (PK)
  cartId: uuid (FK → carts)
  variantId: uuid (FK → product_variants)
  quantity: integer
  addedAt: timestamp
}

orders {
  id: uuid (PK)
  userId: uuid (FK → users, nullable)
  guestId: uuid (FK → guests, nullable)
  status: text
  totalAmount: numeric(10,2)
  shippingAddressId: uuid (FK → addresses)
  billingAddressId: uuid (FK → addresses)
  createdAt: timestamp
  updatedAt: timestamp
}

order_items {
  id: uuid (PK)
  orderId: uuid (FK → orders)
  variantId: uuid (FK → product_variants)
  quantity: integer
  priceAtPurchase: numeric(10,2)
}
```

---

## 🔧 Backend Architecture

### Server Actions Pattern

**Location**: `/src/lib/actions/`

#### **Product Actions** (`product.ts`)

```typescript
// Core function signature
export async function getAllProducts(
  filters: ProductFilters
): Promise<ProductListResult>

// Return type
interface ProductListResult {
  products: ProductWithDetails[];
  totalCount: number;
}

// Filters supported
interface ProductFilters {
  search?: string;
  gender?: string[];
  size?: string[];
  color?: string[];
  priceRange?: string[];
  sort?: string;
  page?: number;
}
```

**Key Features**:
- Two-step query strategy (IDs first, then details)
- Optimized with `EXISTS` subqueries for filtering
- Aggregates `minPrice`/`maxPrice` on server
- Supports pagination, sorting, search
- Single query for product details with all relations

#### **Query Optimization Strategy**

1. **Step 1**: Fetch matching product IDs with sorting
   ```typescript
   const rows = await db
     .select({ id: products.id, minPrice: sql`MIN(price)` })
     .from(products)
     .leftJoin(productVariants, eq(products.id, productVariants.productId))
     .where(and(...conditions))
     .groupBy(products.id)
     .orderBy(/* sort logic */)
     .limit(limit)
     .offset(offset);
   ```

2. **Step 2**: Fetch full details for matched IDs
   ```typescript
   const productsData = await db.query.products.findMany({
     where: inArray(products.id, matchedIds),
     with: {
       category: true,
       gender: true,
       brand: true,
       variants: { with: { color: true, size: true } },
       images: true,
     },
   });
   ```

3. **Step 3**: Calculate aggregates and sort images in JS

### Database Connection

**Location**: `/src/lib/db/index.ts`

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Seeding Strategy

**Location**: `/src/lib/db/seed.ts`

**Pattern**:
1. Clean existing data (in FK-safe order)
2. Seed filters (genders, colors, sizes)
3. Seed taxonomy (brands, categories)
4. Seed collections
5. Seed products with variants
6. Link images to variants
7. Set default variants

---

## 🎨 Frontend Architecture

### App Router Structure

```
src/app/
├── (auth)/           # Auth routes (sign-in, sign-up)
│   ├── sign-in/
│   └── sign-up/
├── (root)/           # Main app routes
│   ├── page.tsx      # Homepage
│   ├── products/     # Product listing
│   │   ├── page.tsx
│   │   ├── FiltersClient.tsx
│   │   ├── ActiveFilters.tsx
│   │   ├── MobileHeader.tsx
│   │   ├── MobileFiltersWrapper.tsx
│   │   └── SortClient.tsx
│   └── layout.tsx    # Root layout with Navbar/Footer
├── api/
│   └── auth/[...all]/route.ts  # Better Auth API
├── layout.tsx        # Root HTML layout
└── globals.css       # Global styles
```

### Page Component Pattern

**Server Component** (`page.tsx`):
```typescript
export default async function ProductsPage({ searchParams }: PageProps) {
  // 1. Await searchParams (Next.js 15+)
  const params = await searchParams;
  
  // 2. Parse filters
  const filters = parseFilters(params);
  
  // 3. Fetch data via server action
  const { products, totalCount } = await getAllProducts(filters);
  
  // 4. Render with client components
  return (
    <FilterProvider>
      <FiltersClient />
      <ProductGrid products={products} />
    </FilterProvider>
  );
}
```

### Client Component Patterns

#### **Filter System**

**Architecture**:
- `FiltersClient.tsx` → Desktop sidebar wrapper
- `Filters.tsx` → Reusable filter UI (desktop + mobile)
- `MobileFiltersWrapper.tsx` → Context provider for mobile drawer
- `ActiveFilters.tsx` → Display active filter chips

**Key Features**:
- URL-based state (no client state for filters)
- Collapsible filter groups
- Multi-select checkboxes
- Mobile drawer with overlay
- "Clear All" functionality

**Filter Configuration**:
```typescript
const FILTER_GROUPS = [
  {
    key: "gender",
    label: "Gender",
    options: [
      { label: "Men", value: "men" },
      { label: "Women", value: "women" },
      // ...
    ],
  },
  // size, color, priceRange...
];
```

#### **Sort Component**

**Features**:
- Dropdown with sort options
- URL synchronization
- Resets pagination on change

**Options**:
```typescript
const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: High-Low", value: "price_desc" },
  { label: "Price: Low-High", value: "price_asc" },
];
```

### Query Utilities

**Location**: `/src/lib/utils/query.ts`

**Functions**:
```typescript
// Parse URL params to filters object
parseFilters(searchParams): ProductFilters

// Build query string from filters
buildQueryString(filters): string

// Toggle array param (add/remove)
toggleArrayParam(currentParams, key, value): string

// Update single param
updateQueryParam(currentParams, key, value): string

// Remove param
removeQueryParam(currentParams, key, value?): string

// Check if filter is selected
isFilterSelected(filters, key, value): boolean

// Get active filter count
getActiveFilterCount(filters): number
```

---

## 🎨 Styling System

### Design Tokens

**Location**: `/src/app/globals.css`

```css
@theme {
  /* Colors */
  --color-dark-900: #111111;
  --color-dark-700: #757575;
  --color-dark-500: #aaaaaa;
  --color-light-100: #ffffff;
  --color-light-200: #f5f5f5;
  --color-light-300: #e5e5e5;
  --color-green: #007d48;
  --color-red: #d33918;
  --color-orange: #d37918;

  /* Typography */
  --font-jost: "Jost", sans-serif;
  
  --text-heading-1: 72px;
  --text-heading-2: 56px;
  --text-heading-3: 24px;
  --text-lead: 20px;
  --text-body: 16px;
  --text-body-medium: 16px;
  --text-caption: 14px;
  --text-footnote: 12px;
}
```

### Tailwind Usage

**Utility Classes**:
```tsx
// Typography
className="text-heading-3 font-medium"
className="text-body text-dark-700"

// Colors
className="bg-light-200 text-dark-900"
className="border-light-300"

// Layout
className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12"
```

### Responsive Patterns

```tsx
// Mobile-first approach
className="flex flex-col lg:flex-row"
className="hidden lg:block"
className="lg:hidden"

// Grid layouts
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
```

---

## 🧩 Reusable Components

### Product Card

**Location**: `/src/components/Card.tsx`

**Props**:
```typescript
interface CardProps {
  title: string;
  category: string;
  price: string;
  imageUrl: string;
  colors?: string | null;
  badge?: { label: string; tone: "orange" | "green" | "red" } | null;
}
```

**Features**:
- Aspect-square image container
- Hover scale effect
- Badge overlay (optional)
- Responsive typography
- Fallback for missing images

### Navbar

**Location**: `/src/components/Navbar.tsx`

**Features**:
- Sticky header
- Logo + navigation links
- Search bar
- User menu / Auth buttons
- Mobile hamburger menu
- Cart icon with count

### Footer

**Location**: `/src/components/Footer.tsx`

**Sections**:
- Multi-column link groups
- Social media icons
- Copyright notice
- Newsletter signup (optional)

### Auth Form

**Location**: `/src/components/AuthForm.tsx`

**Features**:
- Email/password fields
- Client-side validation
- Error handling
- Loading states
- Social provider buttons

---

## 📐 Key Patterns & Conventions

### File Naming
- **Components**: PascalCase (`Card.tsx`, `Navbar.tsx`)
- **Utilities**: camelCase (`query.ts`, `auth.ts`)
- **Server Actions**: camelCase (`product.ts`)
- **Routes**: kebab-case folders (`sign-in/`, `products/`)

### Import Aliases
```typescript
import { db } from "@/lib/db";
import { Card } from "@/components";
```

### Server vs Client Components
- **Server**: Default for pages, data fetching
- **Client**: Use `"use client"` for:
  - Event handlers
  - State management
  - Browser APIs
  - Context providers

### Type Safety
- Use Drizzle's `$inferSelect` and `$inferInsert`
- Export types from schema files
- Use Zod for validation

### Error Handling
```typescript
try {
  const data = await serverAction();
} catch (error) {
  console.error("Error:", error);
  // Show user-friendly message
}
```

---

## 🚀 Quick Start for New Project

### 1. Backend Setup (Reuse Existing)

**Copy these files/folders**:
```
src/lib/db/
  ├── schema/          # All schema files
  ├── index.ts         # DB connection
  └── seed.ts          # Seeding logic

src/lib/actions/
  └── product.ts       # Server actions

src/lib/utils/
  └── query.ts         # Query utilities

drizzle.config.ts
reset-db.ts
```

**Modify for new domain**:
- Update product names in seed data
- Adjust filter options (e.g., age groups instead of genders)
- Add domain-specific fields (e.g., `ageRange`, `material`)

### 2. Frontend Customization

**Update branding**:
- Change color tokens in `globals.css`
- Update logo in `Navbar.tsx`
- Modify footer links
- Update metadata in `layout.tsx`

**Adapt components**:
- Keep `Card.tsx` structure, update styling
- Modify filter labels in `Filters.tsx`
- Update category/gender labels to match domain

**Create new pages**:
```
src/app/(root)/
  ├── page.tsx              # Homepage (hero, featured products)
  ├── products/page.tsx     # Product listing
  ├── product/[id]/page.tsx # Product detail (new)
  └── cart/page.tsx         # Cart (new)
```

### 3. Environment Setup

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
```

### 4. Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx src/lib/db/seed.ts"
  }
}
```

### 5. Image Configuration

**Update `next.config.ts`**:
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "your-cdn.com" },
      { protocol: "https", hostname: "placehold.co" }, // For dev
    ],
  },
};
```

---

## 📝 Frontend-Only Changes Checklist

When creating a new project with the same backend:

- [ ] Update `globals.css` color tokens and typography
- [ ] Replace logo and branding assets
- [ ] Modify `Navbar.tsx` navigation links
- [ ] Update `Footer.tsx` content
- [ ] Customize `Card.tsx` styling (keep structure)
- [ ] Update filter labels in `Filters.tsx` (e.g., "Age Group" instead of "Gender")
- [ ] Modify `ActiveFilters.tsx` label mappings
- [ ] Update homepage hero section
- [ ] Create product detail page (`/product/[id]`)
- [ ] Adjust metadata (title, description, favicon)
- [ ] Update seed data product names and categories
- [ ] Configure image domains in `next.config.ts`
- [ ] Test responsive design on mobile/tablet
- [ ] Verify all filters work with new taxonomy

---

## 🎯 Summary

This architecture provides:
- **Scalable database schema** with proper relations
- **Optimized server actions** for data fetching
- **URL-based filtering** with no client state
- **Responsive component library**
- **Type-safe patterns** throughout
- **Easy customization** for new domains

**For a toy store**, you would:
1. Keep all backend files unchanged
2. Update filter options (age groups, toy types, materials)
3. Customize branding and styling
4. Modify product seed data
5. Adjust component labels and copy

The core architecture remains the same, ensuring consistency and maintainability across projects.
