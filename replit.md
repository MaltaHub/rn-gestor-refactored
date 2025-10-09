# Overview

This is a **Vehicle Management System** designed to manage vehicle inventory and storefront operations across multiple stores.

# Recent Changes

**October 9, 2025** - Phase 9: Complete System Refactoring ✅
- **RenderTables Component**: Created with Canva/Notion-style inline editing, virtualization (10-row window + infinite scroll), column resizing, header sorting (accessor/comparator support), and row actions
- **useEstoqueStore**: Zustand store for persistent state (filters, scroll, column widths)
- **Estoque Page**: Integrated RenderTables, removed cards view (table-only mode)
- **Critical Fixes**: Virtualization spacer rows, numeric field sorting with accessor functions
- **Page Unification**: Merged /estoque/[id] and /editar/[id] into single page with edit mode toggle, fixed data sync bug
- **Modal Creation**: Refactored /criar to VeiculoFormModal popup, integrated into Estoque page
- **Architecture Cleanup**: Deleted /editar and /criar folders, streamlined navigation
- All changes architect-reviewed and approved

**October 9, 2025** - Phase 7: Estoque Page UI Refactoring ✅
- Migrated Estoque page to use Design System components (Button, Input, Badge, Card)
- Refactored header with text-3xl title, Badge for vehicle count, Button with Plus icon
- Converted navigation tabs to Badge components with conditional variant and hover effects
- Migrated search/filter inputs to Input component with icons
- Refactored all buttons using Button component with appropriate variants and icons
- Updated vehicle cards to use Card compound components with design tokens
- Migrated table action links to Button component with asChild support
- Applied CSS variables throughout for consistent theming
- Implemented mobile-first responsive design with breakpoints

**October 9, 2025** - Phase 6: Vitrine Page UI Refactoring ✅
- Migrated Vitrine page to use Design System components
- Enhanced Button component with leftIcon/rightIcon alias support
- Fixed critical bug: Dynamic paddingTop to prevent search bar overlay
- Applied design tokens and CSS variables throughout

Built with **Next.js 15**, it allows users to track vehicles, manage details, photos, documentation, and publish to sales platforms. It functions as a Progressive Web App (PWA) with offline capabilities, supporting multi-store operations with role-based access control and real-time collaboration. The system aims to streamline vehicle management and sales processes for dealerships.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: Next.js 15 with App Router (React 19), using Server Components by default and Client Components for interactivity. Turbopack is enabled for faster builds, and TypeScript ensures type safety.

**State Management**: Utilizes Zustand for client-side global state, TanStack React Query for server state management and caching, and a ThemeContext for global theme state with localStorage persistence. A centralized configuration system manages all application constants.

**Architecture Patterns**: Implements a Repository Pattern for data access abstraction, a Service Layer for business logic, and a comprehensive RBAC (Role-Based Access Control) system with 5 user roles. It features centralized error handling and clear separation of concerns.

**UI Patterns**: Features responsive design with a mobile-first approach, a modern sidebar navigation, and a reusable design system (Button, Card, Input, Badge, Modal). It includes a dynamic theme system, a drag-and-drop photo gallery, and PWA support with accessibility features.

**Styling**: Tailwind CSS v4 is used with custom CSS variables and a dynamic theme system that supports light, dark, auto (time-based), and custom color themes, with user preferences persisted in localStorage.

**Key Design Decisions**: Focuses on a component library pattern with consistent variants, an adapters pattern for data transformation, custom hooks for data fetching, and a strong separation of concerns. It includes a global logout event system, distinct layouts for app and authentication pages, and a centralized configuration system.

## Backend Architecture

**Database**: Supabase (PostgreSQL) with Row Level Security (RLS) and custom RPC functions for complex operations.

**Authentication**: Supabase Auth handles JWT-based authentication, with custom auth guards for protected routes and global 401 handling.

**Data Access Patterns**: A service layer abstracts Supabase client calls, using RPC endpoints for multi-step operations and generic functions for CRUD. Query key factories are used for organized cache invalidation.

**Key Architectural Decisions**: Emphasizes SSR-friendly Supabase client, an adapter pattern for domain models, and diff calculation for efficient characteristic updates. A centralized logout event bus prevents race conditions.

## Data Model

**Core Entities**: Includes `Veículos` (Vehicles), `Lojas` (Stores), `Veiculos_Loja` (junction table for vehicles in stores), `Modelos` (Models), `Caracteristicas` (Features), `Locais` (Storage locations), `Membros_Empresa` (Company Members with roles), and `Anuncios` (Listings).

**File Storage**: Vehicle photos are stored in a Supabase Storage bucket (`fotos_veiculos_loja`), with metadata tracking order and cover images.

**Business Logic**: Manages a vehicle state machine (available → reserved → sold/returned/restricted), documentation workflow, and store-level price management.

# External Dependencies

## Third-Party Services

**Supabase**: Provides PostgreSQL database, authentication, user management, storage for vehicle photos, and Row Level Security.

**Replit**: The current hosting environment, configured for autoscale deployment.

## Key Libraries

**Data & State**:
- `@tanstack/react-query`: Server state management.
- `zustand`: Client-side state management.
- `@supabase/supabase-js`, `@supabase/ssr`: Supabase client and SSR utilities.

**UI & Interaction**:
- `@dnd-kit/core`, `@dnd-kit/sortable`: Drag-and-drop.
- `lucide-react`: Icon library.
- `next-pwa`: Progressive Web App support.

**Developer Experience**:
- `tailwindcss`: Utility-first CSS framework.
- `typescript`: Type safety.
- `eslint`, `eslint-config-next`: Code quality tools.

## API Integration Patterns

**Database Access**: Direct Supabase client calls and RPC functions are used, with automatic query invalidation via React Query keys.

**Image Handling**: Utilizes public URLs for images and optimized delivery through Next.js Image component.

**Real-time Capabilities**: While Supabase subscriptions are available, current updates are polling-based via React Query.