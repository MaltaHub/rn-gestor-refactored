# Overview

This is a **Vehicle Management System** (Gestor de Veículos) built with **Next.js 15**, designed to manage vehicle inventory and storefront operations. The application allows users to track vehicles across multiple stores, manage vehicle details, photos, documentation status, and publish vehicles to various sales platforms. It's structured as a Progressive Web App (PWA) with offline capabilities.

The system supports multi-store operations with role-based access control, where users belong to companies (empresas) and can manage vehicles across different physical locations (lojas). The application emphasizes real-time collaboration and provides both grid and table views for vehicle browsing.

# Recent Changes

**October 8, 2025** - Vitrine Page Refactoring with RenderCards Component
- Created flexible RenderCards component with configurable props (mode: popup/inline, focusMode, domain: vitrine/estoque)
- Refactored Vitrine page to use RenderCards, eliminating duplicate rendering functions (renderGridCards, renderInfoCards, renderTabela)
- Applied Magic Purple theme to all Vitrine components (filters, search bar, buttons, badges)
- Unified card rendering logic across different view modes (cards-photo, cards-info, table)
- Component supports future expansion to Estoque page with same rendering logic

**October 8, 2025** - Magic Purple Theme Implementation
- Implemented complete color theme: Roxo Mágico (Magic Purple) + Branco Delicado (Delicate White) + Verde Selva (Jungle Green)
- Created comprehensive CSS variable system for centralized color management
- All colors meet WCAG AA contrast standards (≥4.5:1) in light and dark modes
- Eliminated hardcoded Tailwind colors - 100% CSS variable usage
- Applied magical gradient effects to logo and active navigation states
- Updated all components (Button, Badge, Card, Input, Sidebar) with new theme

**October 8, 2025** - UI/UX Modernization
- Created comprehensive design system with reusable UI components (Button, Card, Input, Badge, Modal, EmptyState, Skeleton)
- Implemented modern sidebar navigation with collapsible/expandable functionality
- Added mobile-responsive navigation with overlay and hamburger menu
- Improved accessibility with proper ARIA labels and keyboard navigation support
- Restructured layouts: separate layouts for app pages vs authentication pages
- Root page now redirects to /vitrine for better UX

**October 8, 2025** - Migrated from Vercel to Replit
- Configured Next.js dev and production servers to bind to port 5000 and 0.0.0.0 for Replit compatibility
- Set up Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) in Replit Secrets
- Configured development workflow with npm and Turbopack
- Set up deployment configuration for autoscale production deployment
- Verified production build completes successfully

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: Next.js 15 with App Router and React 19
- Uses Server Components by default with Client Components (`"use client"`) for interactivity
- Turbopack enabled for faster development and builds
- TypeScript for type safety across the entire codebase

**State Management**:
- **Zustand** for client-side global state (store selection persistence)
- **TanStack React Query** for server state management and caching
- LocalStorage persistence for user preferences (view modes, filters, selected store)

**UI Patterns**:
- Responsive design with mobile-first approach
- Modern sidebar navigation with icon-based menu and active state highlighting
- Reusable design system with Button, Card, Input, Badge, Modal components
- Theme system with automatic dark/light mode based on time of day (18:00-06:00)
- Drag-and-drop photo gallery using @dnd-kit for reordering images
- Progressive Web App with service worker for offline support
- Accessible components with ARIA labels and keyboard navigation

**Styling**: Tailwind CSS v4 with custom theme variables for dynamic theming

**Key Design Decisions**:
- Component library pattern with consistent variants (primary, secondary, outline, ghost, danger)
- Adapters pattern to transform database entities into UI-friendly formats
- Custom hooks for data fetching that encapsulate query logic
- Separation of concerns between services (API calls), hooks (data management), and components (presentation)
- Global logout event system to coordinate auth state across the app
- Layout composition: separate layouts for app vs auth pages

## Backend Architecture

**Database**: Supabase (PostgreSQL) with Row Level Security
- Custom RPC functions for complex operations (`rpc_veiculos`, `rpc_configuracoes`)
- Relational data model with foreign key constraints
- Pivot tables for many-to-many relationships (vehicles ↔ characteristics)

**Authentication**: Supabase Auth with session management
- JWT-based authentication
- Custom auth guard components for protected routes
- Global 401 handling with automatic logout coordination

**Data Access Patterns**:
- Service layer abstracts Supabase client calls
- RPC endpoints for multi-step operations (create vehicle with characteristics)
- Generic `listar_tabela` function for simple CRUD operations
- Query key factories for organized cache invalidation

**Key Architectural Decisions**:
- SSR-friendly Supabase client with custom fetch wrapper for 401 handling
- Adapter pattern transforms database rows into domain models with computed fields
- Diff calculation for characteristic updates (add/remove arrays instead of full replacement)
- Centralized logout event bus prevents race conditions during sign-out

## Data Model

**Core Entities**:
- **Veículos** (Vehicles): Main inventory items with specs, condition, and status
- **Lojas** (Stores): Physical locations where vehicles are displayed
- **Veiculos_Loja**: Junction table tracking which vehicles are in which stores with pricing
- **Modelos** (Models): Vehicle model specifications (brand, engine, transmission, etc.)
- **Caracteristicas** (Characteristics): Features/options (many-to-many with vehicles)
- **Locais** (Locations): Storage locations for inventory management
- **Membros_Empresa** (Company Members): User-to-company relationships with roles
- **Anuncios** (Listings): Published advertisements on external platforms

**File Storage**:
- Vehicle photos stored in Supabase Storage bucket `fotos_veiculos_loja`
- Metadata table `fotos_metadados` tracks photo order, cover image, and relationships
- Public URLs for image delivery with Next.js Image optimization

**Business Logic**:
- Vehicle state machine: available → reserved → sold/returned/restricted
- Documentation workflow tracking (pending → in_progress → completed)
- Price management at store level (same vehicle, different prices per store)

# External Dependencies

## Third-Party Services

**Supabase** (Backend as a Service):
- PostgreSQL database with real-time subscriptions
- Authentication and user management
- Storage for vehicle photos
- Row Level Security policies for multi-tenant isolation

**Replit** (Deployment Platform):
- Current hosting environment
- Autoscale deployment for stateless web apps
- Configured for port 5000 with 0.0.0.0 host binding

## Key Libraries

**Data & State**:
- `@tanstack/react-query` (v5.90.2): Server state management with automatic caching and refetching
- `zustand` (v5.0.8): Lightweight state management for client-side state
- `@supabase/supabase-js` (v2.58.0): Database client
- `@supabase/ssr` (v0.5.1): Server-side rendering utilities

**UI & Interaction**:
- `@dnd-kit/core` & `@dnd-kit/sortable`: Drag-and-drop functionality for photo reordering
- `lucide-react` (v0.544.0): Icon library
- `next-pwa` (v5.6.0): Progressive Web App support with Workbox

**Developer Experience**:
- `tailwindcss` (v4): Utility-first CSS framework
- `typescript` (v5): Type safety
- `eslint` & `eslint-config-next`: Code quality

## API Integration Patterns

**Database Access**:
- Direct Supabase client calls for simple queries
- RPC functions for complex multi-table operations
- Automatic query invalidation via React Query keys

**Image Handling**:
- Public URLs for browser-accessible images
- Signed URLs for private bucket access (configurable)
- Optimized delivery through Next.js Image component

**Real-time Capabilities**:
- Supabase subscriptions available but not currently implemented
- Polling-based updates via React Query's refetch intervals