# Overview

This is a **Vehicle Management System** designed to manage vehicle inventory and storefront operations across multiple stores. Built with **Next.js 15**, it allows users to track vehicles, manage details, photos, documentation, and publish to sales platforms. It functions as a Progressive Web App (PWA) with offline capabilities, supporting multi-store operations with role-based access control and real-time collaboration. The system aims to streamline vehicle management and sales processes for dealerships, offering a modern, responsive UI focused on readability and user experience.

# Recent Changes

**October 9, 2025** - Share Images Feature in Vitrine Detail Page ✅
- **ShareImagesButton Component**: New component with dropdown menu for image sharing
- **Download All Images**: Sequential download of all vehicle photos with proper naming (vehicleName_foto_N.jpg)
- **WhatsApp Sharing**: Share all photo URLs via WhatsApp with formatted message including vehicle name
- **UX Features**: Loading feedback during download, menu closes on outside click or action completion, error handling
- **Integration**: Button positioned in Vitrine detail page header, only visible when photos exist
- **Design System**: Uses Button and Card components, full dark mode support with purple/gray theme
- **Architect Validated**: Approved - clean implementation, meets requirements, good UX

**October 9, 2025** - Complete State Persistence Implementation ✅
- **Vitrine Store Created**: New `useVitrineStore` (Zustand + persist) manages all Vitrine page state
- **State Persistence**: Filters, sorting, view mode, scroll position, and UI visibility all persist across page reloads
- **Estoque Migration**: EstoqueCliente migrated from local useState to existing useEstoqueStore for complete persistence
- **Controlled Components**: RenderTables and RenderCards now support controlled props (initialSort, onSortChange, initialScroll, onScrollChange, initialColumnWidths, onColumnWidthChange)
- **Backward Compatibility**: Components work as controlled or uncontrolled - no breaking changes
- **Storage Keys**: 
  - Estoque: `estoque:state` (filters, viewConfig with scrollPosition/sortKey/sortDirection/columnWidths)
  - Vitrine: `vitrine:state` (filters with searchTerm/estadoFiltro/caracteristicaFiltro/prices/visibility, viewConfig with viewMode/ordenacao/scrollPosition)
- **Performance**: Debounced scroll tracking (300ms) prevents excessive localStorage writes
- **SSR-Safe**: createJSONStorage with browser checks prevents hydration mismatches
- **Architect Validated**: Approved - clean architecture, no regressions, meets all objectives

**October 9, 2025** - Type Safety Build Fixes ✅
- **Badge Component Corrections**: Fixed invalid Badge variants ('primary'/'outline' → 'info'/'default' per component spec)
- **Badge Props Cleanup**: Removed unsupported `leftIcon` prop from Badge components (Badge only accepts variant, size, className, children)
- **RenderTables Type Casts**: Added proper type assertions for generic Record<string, unknown> constraint in RenderTables component
- **Null Safety**: Fixed dataEntradaFormatada type conversion (null → undefined) for VehicleInfo component compatibility
- **Build Status**: ✅ Production build successful - all TypeScript/ESLint errors resolved
- **Files Updated**: EstoqueCliente.tsx, vitrine/[id]/page.tsx
- **Result**: Clean build with zero errors, application fully functional

**October 9, 2025** - Phase 19: Vitrine Detail Page Refactoring ✅
- **Complete Modularization**: Refactored 1021-line monolithic page into 8 modular, reusable components
- **New Components Created**:
  - `VehicleGallery`: Photo gallery with touch/swipe support, prefetch, dark mode
  - `PhotoLightbox`: Fullscreen photo viewer with keyboard navigation (arrows, ESC) and gestures
  - `VehicleInfo`, `PriceInfo`, `CharacteristicsInfo`: Info cards using design system
  - `QuickActions`: Unified actions component with inline forms, validation, feedback
  - `Alert`: Reusable alert component (success/error/info/warning) with dark mode
- **Design System Integration**: All components use Card, Button, Input, Badge from design system
- **Color Updates**: Changed blue/zinc → purple/gray for system consistency
- **Dark Mode**: Complete dark mode support across all new components with WCAG AA compliance
- **UX Improvements**: Consistent shadows (300ms transitions), focus states, responsive design
- **Code Quality**: Page reduced from 1021 to ~250 lines, improved maintainability and reusability
- **Architecture**: Clean separation of concerns, proper state management, cache invalidation preserved
- **Architect Validated**: Approved - all functionality preserved, no regressions, excellent modularization

**October 9, 2025** - Card Image Edge-to-Edge Fix ✅
- **Problem**: Card images had unwanted spacing/borders from default Card padding
- **Solution**: Added SPACING.none = '0' token and applied padding="none" to Card component
- **Result**: Images now perfectly aligned with card edges (top, left, right) with zero gaps
- **Architecture**: Content padding (p-6) moved to inner div only, Card wrapper has zero padding
- **Architect Validated**: Approved - clean integration with existing tokens, no regressions

**October 9, 2025** - Phase 18: User Profile Page Implementation ✅
- **Profile Page Created**: New `/perfil` route with complete user profile management
- **Profile Service**: Created `src/services/perfil.ts` with functions for getProfile(), updateProfile(), updateEmail(), updatePassword()
- **Secure Password Change**: Implemented proper reauthentication flow - validates current password via signInWithPassword before allowing update
- **Profile Editing**: Form sections for personal information (full name, email, avatar URL) and password change (current, new, confirm)
- **Avatar Preview**: Live preview of avatar image when URL is provided
- **Logout Button**: Added logout button at bottom of profile page with confirmation dialog, red danger styling, and error handling
- **Navigation Updates**: Added "Perfil" link to both sidebar (all authenticated users) and navbar (proprietários)
- **User Icon**: Imported and added User icon from lucide-react for profile navigation
- **Validation**: Password minimum 6 characters, confirmation match check, clear error messages
- **Feedback System**: Success/error alerts with color-coded messages, loading states on buttons
- **Dark Mode Support**: Full theme compatibility consistent with design system
- **Security**: Current password validation prevents unauthorized changes, fresh session created via signInWithPassword
- **Architect Validated**: Approved after security fix for reauthentication flow and logout implementation

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: Next.js 15 with App Router (React 19), using Server Components by default and Client Components for interactivity. Turbopack is enabled, and TypeScript ensures type safety.

**State Management**: Utilizes Zustand for client-side global state, TanStack React Query for server state management and caching, and a ThemeContext for global theme state with localStorage persistence.

**Architecture Patterns**: Implements a Repository Pattern for data access, a Service Layer for business logic, and a comprehensive RBAC (Role-Based Access Control) system with 5 user roles. It features centralized error handling and clear separation of concerns.

**UI Patterns**: Features responsive design with a mobile-first approach, a modern sidebar navigation, and a reusable design system (Button, Card, Input, Badge, Modal). It includes a dynamic theme system, a drag-and-drop photo gallery, and PWA support with accessibility features. The UI prioritizes high-contrast text and modern design elements like shadows and smooth transitions, adhering to WCAG AA compliance.

**Styling**: Tailwind CSS v4 is used with custom CSS variables and a dynamic theme system that supports light, dark, auto (time-based), and custom color themes, with user preferences persisted in localStorage. Color schemes are standardized to neutral backgrounds with purple accents for buttons and interactive elements.

**Key Design Decisions**: Focuses on a component library pattern with consistent variants, an adapters pattern for data transformation, custom hooks for data fetching, and a strong separation of concerns. It includes a global logout event system, distinct layouts for app and authentication pages, and a centralized configuration system. UX enhancements include floating action buttons, inline creation modals with auto-selection, real-time input validation, and smart placeholders.

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
- `@dnd-kit/core`, `@dnd-kit/sortable`: Drag-and-drop functionality.
- `lucide-react`: Icon library.
- `next-pwa`: Progressive Web App support.

**Developer Experience**:
- `tailwindcss`: Utility-first CSS framework.
- `typescript`: Type safety.
- `eslint`, `eslint-config-next`: Code quality tools.

## API Integration Patterns

**Database Access**: Direct Supabase client calls and RPC functions are used, with automatic query invalidation via React Query keys.

**Image Handling**: Utilizes public URLs for images and optimized delivery through Next.js Image component.

**Real-time Capabilities**: Current updates are polling-based via React Query.