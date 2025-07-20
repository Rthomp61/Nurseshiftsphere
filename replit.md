# ShiftGenie - Healthcare Shift Management System

## Overview

ShiftGenie is a modern healthcare shift management application built with a full-stack TypeScript architecture. The system enables nurses to discover and claim available shifts while providing coordinators with tools to post and manage shift opportunities. The application features a glass-morphism design with real-time updates and smart matching capabilities.

## Recent Changes (July 2025)

- Fixed critical bug in claimed shifts display - shifts now properly appear in nurse's upcoming shifts section
- Resolved query URL construction issues that prevented proper API communication
- Added comprehensive test data with sample shifts for both nurse and coordinator workflows
- Fixed TypeScript compilation errors and module import paths
- Implemented proper role-based dashboard navigation with glass-morphism design

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom glass-morphism design
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit OpenID Connect (OIDC) integration

### Database Architecture
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/updates on login
- **Role-Based Access**: Support for 'nurse' and 'coordinator' roles

### Shift Management
- **Shift Creation**: Coordinators can create shifts with detailed requirements
- **Shift Discovery**: Nurses can browse and filter available shifts
- **Claiming System**: Real-time shift claiming with conflict prevention
- **Status Tracking**: Comprehensive shift status management (open, claimed, completed)

### User Interface
- **Design System**: Custom glass-morphism theme with Tailwind CSS
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component Library**: Radix UI primitives with custom styling
- **State Management**: React Query for optimistic updates and caching

### Data Models
- **Users**: Profile management with role-based permissions
- **Shifts**: Detailed shift information with scheduling and requirements
- **Applications**: Shift application tracking and management
- **Availability**: Nurse availability scheduling system

## Data Flow

### Authentication Flow
1. User initiates login through Replit OAuth
2. Server validates OAuth tokens and creates/updates user record
3. Session established with PostgreSQL storage
4. Client receives authenticated user data

### Shift Management Flow
1. Coordinators create shifts through protected endpoints
2. Shifts stored in database with full metadata
3. Nurses query available shifts with filtering options
4. Real-time updates through React Query invalidation
5. Claiming process includes conflict detection and resolution

### State Synchronization
- React Query handles client-side caching and synchronization
- Optimistic updates for improved user experience
- Automatic refetching on window focus and network reconnection
- Error handling with retry logic and user feedback

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection and pooling
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **express**: Server framework with middleware support

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code
- **vite**: Frontend development and build tooling
- **drizzle-kit**: Database schema management

### Authentication & Security
- **openid-client**: OIDC authentication handling
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Server**: TSX for hot-reloading TypeScript execution
- **Client**: Vite dev server with HMR support
- **Database**: Environment-based PostgreSQL connection
- **Session Storage**: Development-friendly session configuration

### Production Build
- **Server**: ESBuild compilation to single JavaScript bundle
- **Client**: Vite production build with optimization
- **Static Assets**: Served through Express static middleware
- **Environment**: NODE_ENV-based configuration switching

### Configuration Management
- **Database**: DATABASE_URL environment variable
- **Sessions**: SESSION_SECRET for cookie signing
- **OAuth**: REPL_ID and ISSUER_URL for authentication
- **Security**: HTTPS-only cookies in production

### Scalability Considerations
- **Database**: Connection pooling for concurrent requests
- **Sessions**: PostgreSQL storage for horizontal scaling
- **Static Assets**: Optimized builds with asset hashing
- **API**: Stateless design for load balancing compatibility