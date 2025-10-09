# Overview

This is a **Vehicle Management System** designed to manage vehicle inventory and storefront operations across multiple stores.

# Recent Changes

**October 9, 2025** - Phase 16: Text Contrast & Modern Design Enhancement ✅
- **Critical Readability Fix**: Replaced ALL CSS variable text colors (`--text-primary`, `--text-secondary`) with explicit high-contrast Tailwind colors for perfect readability
- **WCAG AA Compliance**: Achieved 4.5:1 minimum contrast ratio in both light and dark modes across all components
- **Text Color Standardization**: Primary text now uses `text-gray-900 dark:text-gray-100`, secondary text uses `text-gray-600 dark:text-gray-400`
- **Dark Mode Backgrounds**: Fixed critical white-on-white text issue by adding proper dark backgrounds (`dark:bg-gray-950/900/800/700`) to all containers
- **Backdrop-filter Fix**: Added `dark:supports-[backdrop-filter]:bg-gray-900/75` to sticky toolbar for proper dark mode translucency
- **Modern Design Polish**: Applied elegant shadows (`hover:shadow-xl`), smooth 300ms transitions, improved typography hierarchy, and generous spacing (p-6, gap-4)
- **Components Updated**: render-cards.tsx (GridCards, InfoCards, TableView), vitrine/page.tsx, estoque/EstoqueCliente.tsx
- **Visual Hierarchy**: Price highlighting with `text-xl font-bold text-purple-600 dark:text-purple-400`, uppercase labels with tracking-wide, proper font weights throughout
- **Architect Validated**: Full approval after 3 correction rounds - zero contrast issues remaining in both themes

**October 9, 2025** - Phase 15: Design System Color Standardization ✅
- **Complete UI Color Audit**: Systematically removed all violet/purple backgrounds from components (cards, modals, hovers, badges, navigation)
- **Jungle Green Removal**: Eliminated jungle-green color tokens from design system (globals.css, theme providers, config files) - did not contrast well with purple theme
- **White/Gray Backgrounds**: All components now use white/gray backgrounds with purple reserved exclusively for primary buttons, borders, text accents, and icons
- **Component Updates**: Fixed 15+ components including Button (outline/ghost variants), Badge (default/info variants), Sidebar, ThemeSelector, ThemeToggle, TemaSection, Navbar, RenderTables hovers, and RenderCards
- **Neutral Palette**: Button secondary changed from jungle-green to zinc-600/700; Badge success to standard green-50/700; Badge info to blue-50/700
- **Dark Mode Consistency**: All dark mode backgrounds switched from purple-dark to zinc-700/800 for better contrast
- **Architect Validated**: Full approval after multiple iterations ensuring ZERO purple backgrounds remain outside sanctioned accents

**October 9, 2025** - Phase 14: ModeloTableModal Integration ✅
- **ModeloTableModal Component**: Created comprehensive modal with RenderTables in edit mode for managing vehicle models
- **8 Editable Columns**: marca, nome, combustivel (6 types), tipo_cambio (4 types), motor, lugares, portas, carroceria (8 types)
- **Inline Editing**: Click-to-edit cells with inputs/selects, real-time updates via salvarConfiguracao
- **Modal Creation Form**: Secondary modal with complete form for creating new models with all fields
- **Auto-Selection**: Using refetchQueries with await ensures newly created models are immediately available and auto-selected in vehicle form
- **CRUD Operations**: Create, inline update, and delete with confirmation; integrated with React Query cache management
- **UI Integration**: Replaced QuickAddModal with ModeloTableModal for Modelo in /criar page; características and locais remain with QuickAddModal
- **Cache Fix**: Critical fix using refetchQueries instead of invalidateQueries for synchronous data availability

**October 9, 2025** - Phase 12: Modern UI & UX Polish ✅
- **Section Icons**: Added lucide-react icons to all sections (Car, Settings, MapPin, List, FileText) with flex layout
- **Card Shadows**: Replaced plain borders with shadow-sm + border-gray-100, hover:shadow-md transitions for depth
- **Visual Hierarchy**: Improved typography (text-xs labels, h-11 inputs) and spacing for better readability
- **Smart Placeholders**: Added helpful examples in ALL fields (placa, chassi, cor, anos, preços, documentação)
- **Plate Validation**: Implemented real-time validation with visual feedback (green/red borders) for both legacy (ABC-1234) and Mercosul (ABC1D23) formats, with auto-uppercase
- **Color Autocomplete**: Added datalist with 10 common vehicle colors (Branco, Preto, Prata, Vermelho, etc.)
- **Enhanced Inputs**: Numeric fields with proper step values (hodômetro: 1000, preço: 100) and sensible min/max ranges
- **Clear Feedback**: Required fields show red asterisk + "(obrigatório)" text, improved hover/focus states with ring-2 and transitions
- **Professional Polish**: Smooth transitions (duration-150), consistent spacing, mobile-responsive design maintained

**October 9, 2025** - Phase 11: UX Enhancements - Floating Buttons & Inline Creation ✅
- **Floating Action Buttons**: Transformed Save/Cancel buttons into fixed bottom-right floating action buttons (position fixed, z-50, shadow-2xl)
- **QuickAddModal Component**: Created reusable modal for inline item creation with dynamic fields (text, select), validation, loading states, and error handling
- **Inline Model Creation**: Added "+" button next to Model select to create new models (marca, nome) directly from the form
- **Inline Feature Creation**: Added "Adicionar" button in Features section to create new características without leaving the page
- **Inline Location Creation**: Added "+" button next to Location select to create new locais with optional store association
- **Auto-Selection**: Implemented refetchQueries with await to ensure newly created items are immediately selected/added to form
- **Visual Feedback**: Success messages display created item names with 3-second auto-dismiss
- **Cache Management**: Fixed cache invalidation bug using refetchQueries instead of invalidateQueries for synchronous updates

**October 9, 2025** - Phase 10: Architecture Corrections & UI Improvements ✅
- **Page /criar Restored**: Recreated full form page for complete vehicle creation workflow (previously deleted by mistake)
- **Navigation Fixed**: Removed VeiculoFormModal from Estoque page, restored link to /criar for creation
- **RenderTables Click Fixed**: Corrected onClick propagation - now properly navigates to /estoque/[id] detail pages
- **UI Color Update**: Changed all component backgrounds from green to white for better contrast with purple theme
- **Architecture Clarification**: Pop-ups/modals support both simple inline creation (QuickAddModal) and comprehensive table management (ModeloTableModal with RenderTables); dedicated pages remain for full CRUD workflows

**October 9, 2025** - Phase 9: Complete System Refactoring ✅
- **RenderTables Component**: Created with Canva/Notion-style inline editing, virtualization (10-row window + infinite scroll), column resizing, header sorting (accessor/comparator support), and row actions
- **useEstoqueStore**: Zustand store for persistent state (filters working; scroll/sort/widths pending future implementation)
- **Estoque Page**: Integrated RenderTables, removed cards view (table-only mode)
- **Critical Fixes**: Virtualization spacer rows, numeric field sorting with accessor functions
- **Page Unification**: Merged /estoque/[id] and /editar/[id] into single page with edit mode toggle, fixed data sync bug
- **Architecture Cleanup**: Deleted /editar folder (merged into unified detail page)

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