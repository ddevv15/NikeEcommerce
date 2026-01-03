# Nike E-Commerce Platform

A modern, full-stack e-commerce application built with Next.js 16, featuring a complete product catalog, shopping cart, user authentication, and order management system. This project demonstrates best practices in React server components, database optimization, and responsive design.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [Key Features Explained](#key-features-explained)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core E-Commerce Features
- **Product Catalog**: Browse products with advanced filtering and sorting
- **Product Details**: Detailed product pages with image galleries, variants, and reviews
- **Shopping Cart**: Persistent cart with guest and authenticated user support
- **Checkout Process**: Complete checkout flow with order management
- **User Authentication**: Sign up, sign in with email/password and social providers
- **Product Search**: Full-text search across product names and descriptions
- **Responsive Design**: Mobile-first design that works on all devices

### Advanced Features
- **Advanced Filtering**: Filter by gender, size, color, price range, and more
- **URL-Based State**: All filters and sorting are synced with URL parameters
- **Product Variants**: Support for multiple colors, sizes, and pricing variants
- **Product Reviews**: User-generated reviews and ratings
- **Recommended Products**: AI-powered product recommendations
- **Wishlist**: Save favorite products for later
- **Order History**: Track past orders and their status
- **Guest Checkout**: Complete purchases without creating an account

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: [Jost](https://fonts.google.com/specimen/Jost) (Google Fonts)

### Backend
- **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Server Actions**: Next.js Server Actions for API-less data fetching

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Database Migrations**: Drizzle Kit
- **Type Safety**: TypeScript with strict mode

## 📁 Project Structure

```
NikeEcommerce/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (root)/             # Main application routes
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── products/       # Product listing & detail pages
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   └── ...
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── checkout/       # Checkout flow
│   │   │   └── layout.tsx      # Root layout with Navbar/Footer
│   │   ├── api/                # API routes
│   │   │   └── auth/           # Better Auth API
│   │   ├── layout.tsx          # Root HTML layout
│   │   └── globals.css         # Global styles & theme
│   ├── components/             # Reusable React components
│   │   ├── Card.tsx            # Product card component
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── Footer.tsx          # Footer component
│   │   ├── Filters.tsx        # Product filters
│   │   ├── ProductGallery.tsx  # Product image gallery
│   │   ├── CartItem.tsx        # Cart item component
│   │   └── ...
│   ├── lib/
│   │   ├── actions/            # Server actions
│   │   │   ├── product.ts     # Product-related actions
│   │   │   ├── cart.ts        # Cart operations
│   │   │   └── order.ts       # Order management
│   │   ├── auth/               # Authentication setup
│   │   ├── db/                 # Database configuration
│   │   │   ├── schema/        # Drizzle schema definitions
│   │   │   ├── index.ts       # Database connection
│   │   │   └── seed.ts        # Database seeding
│   │   └── utils/              # Utility functions
│   │       └── query.ts       # URL query parameter helpers
│   ├── store/                  # Zustand stores
│   │   └── cart.store.ts      # Cart state management
│   └── scripts/               # Utility scripts
├── public/                     # Static assets
│   ├── shoes/                  # Product images
│   └── ...
├── drizzle/                    # Database migrations
├── docs/                       # Documentation
│   ├── architecture.md        # Architecture documentation
│   └── activity.md            # Development activity log
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── next.config.ts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL database** (recommended: [Neon](https://neon.tech/) for serverless PostgreSQL)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NikeEcommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Variables](#environment-variables))

4. **Set up the database** (see [Database Setup](#database-setup))

5. **Seed the database**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Optional: Social Auth Providers
# BETTER_AUTH_GOOGLE_CLIENT_ID=your-google-client-id
# BETTER_AUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Generating Secrets

For `BETTER_AUTH_SECRET`, generate a secure random string:
```bash
openssl rand -base64 32
```

## 🗄️ Database Setup

### Using Neon (Recommended)

1. Create a free account at [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string to your `.env.local` file

### Local PostgreSQL Setup

1. Install PostgreSQL locally
2. Create a new database:
   ```sql
   CREATE DATABASE nikeecommerce;
   ```
3. Update `DATABASE_URL` in `.env.local`

### Running Migrations

The project uses Drizzle ORM for database migrations:

```bash
# Generate migrations from schema changes
npm run db:generate

# Push schema changes directly (development)
npm run db:push

# Run migrations (production)
npm run db:migrate
```

### Seeding the Database

Populate the database with sample products:

```bash
npm run db:seed
```

This will create:
- Product categories, brands, genders
- Color and size options
- Sample products with variants and images
- Test user accounts (optional)

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate migrations
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database with sample data
```

### Development Workflow

1. **Make schema changes** in `src/lib/db/schema/`
2. **Generate migrations**: `npm run db:generate`
3. **Push changes**: `npm run db:push` (or run migrations in production)
4. **Update server actions** if needed in `src/lib/actions/`
5. **Update components** in `src/components/`
6. **Test locally** at `http://localhost:3000`

### Code Style

- **Components**: PascalCase (`Card.tsx`, `Navbar.tsx`)
- **Utilities**: camelCase (`query.ts`, `auth.ts`)
- **Server Actions**: camelCase (`product.ts`, `cart.ts`)
- **Routes**: kebab-case folders (`sign-in/`, `products/`)

## 🎯 Key Features Explained

### Product Filtering System

The filtering system uses URL-based state management for shareable, bookmarkable filter states:

- **Filter Types**: Gender, Size, Color, Price Range
- **URL Sync**: All filters are reflected in the URL query parameters
- **Server-Side Filtering**: Filters are applied at the database level for performance
- **Mobile Support**: Responsive filter drawer for mobile devices

### Shopping Cart

- **Persistent Storage**: Cart persists across sessions using database storage
- **Guest Support**: Users can add items without signing in
- **User Carts**: Authenticated users have persistent carts
- **Real-time Updates**: Cart updates immediately using Zustand state management

### Product Variants

Products support multiple variants (color, size) with:
- **Dynamic Pricing**: Different prices per variant
- **Stock Management**: Individual stock levels per variant
- **Image Association**: Variant-specific images
- **Default Variant**: Each product has a default variant for quick display

### Server Actions Pattern

All data fetching uses Next.js Server Actions:
- **Type-Safe**: Full TypeScript support
- **Optimized Queries**: Two-step query strategy for performance
- **Error Handling**: Comprehensive error handling and validation
- **No API Routes**: Direct database access without REST endpoints

## 🏗️ Architecture

### Database Schema

The database uses a normalized schema with the following key tables:

- **Products**: Core product information
- **Product Variants**: Color, size, and pricing variants
- **Product Images**: Image URLs with sorting and primary flags
- **Categories**: Hierarchical category structure
- **Brands**: Brand information
- **Filters**: Genders, Colors, Sizes (taxonomy)
- **Carts & Cart Items**: Shopping cart data
- **Orders & Order Items**: Order history
- **Reviews**: Product reviews and ratings
- **Users & Auth**: User accounts and authentication

See `docs/architecture.md` for detailed schema documentation.

### Frontend Architecture

- **Server Components**: Default for pages and data fetching
- **Client Components**: Used for interactivity (`"use client"`)
- **Server Actions**: Data mutations and queries
- **URL State**: Filters and sorting synced with URL
- **Zustand Stores**: Client-side state (cart, UI state)

### Styling System

- **Tailwind CSS v4**: Utility-first CSS framework
- **Custom Theme**: Design tokens in `globals.css`
- **Responsive Design**: Mobile-first approach
- **Component Styling**: Consistent design system

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Set `BETTER_AUTH_URL` to your production URL

4. **Deploy**
   - Vercel will automatically deploy on push
   - Database migrations run on first deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Netlify**: Similar to Vercel setup
- **Railway**: Supports PostgreSQL and Next.js
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

### Production Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Seed initial data (if needed)
- [ ] Configure CORS for API routes
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure CDN for static assets
- [ ] Set up analytics (optional)

## 📚 Additional Documentation

- **Architecture Details**: See `docs/architecture.md` for comprehensive architecture documentation
- **Activity Log**: See `docs/activity.md` for development history

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test on multiple screen sizes
- Ensure accessibility standards

## 📝 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Neon](https://neon.tech/)
- Authentication by [Better Auth](https://www.better-auth.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: This is a demonstration e-commerce platform. For production use, ensure proper security measures, payment gateway integration, and compliance with e-commerce regulations.
