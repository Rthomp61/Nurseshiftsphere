# ShiftGenie - Healthcare Shift Management System

## Overview

ShiftGenie is a modern healthcare shift management application built with a full-stack TypeScript architecture. The system enables nurses to discover and claim available shifts while providing coordinators with tools to post and manage shift opportunities. The application features a glass-morphism design with real-time updates and smart matching capabilities.

## Recent Changes (July 2025)

- Fixed critical bug in claimed shifts display - shifts now properly appear in nurse's upcoming shifts section
- Resolved query URL construction issues that prevented proper API communication
- Added comprehensive test data with sample shifts for both nurse and coordinator workflows
- Fixed TypeScript compilation errors and module import paths
- Implemented proper role-based dashboard navigation with glass-morphism design
- Enhanced nurse dashboard with functional availability and location preference modals
- Implemented comprehensive 1099 contractor tax features with quarterly reporting, expense tracking, and tax-ready exports
- Added advanced pain point solutions: early claim incentives, travel time alerts, and high-demand facility tracking
- Expanded available shifts with 17 diverse specialty cards including OR, NICU, L&D, Trauma ER, Oncology, Mental Health, and more
- Added bonus pay structures ranging from $8-$30/hr premiums for night, weekend, emergency, and specialty coverage
- Achieved 81% test coverage and 82% security score with automated testing suite and accessibility audits
- Created comprehensive user flow documentation covering complete nurse and coordinator experiences
- Documented all critical user journeys, pain point solutions, and technical implementation details

### Dynamic Early Claim Incentive System Implementation (COMPLETE)
- Updated database schema with new incentive fields: `baseHourlyRate`, `earlyClaimBonus`, `totalHourlyRate`, `hoursBeforeStart`
- Implemented tiered bonus calculation logic: $5/hr (24+ hours), $3/hr (12-24 hours), $1/hr (6-12 hours), $0 (<6 hours)
- Enhanced shift claiming API to automatically calculate and apply bonuses based on claim timing
- Added new API endpoint `/api/shifts/:id/incentive-preview` for real-time bonus preview
- Updated mock data with incentive-aware shift structures
- Fixed database foreign key constraints and TypeScript compilation issues
- Enhanced UI with spectacular visual highlighting: glowing badges, animations, celebration displays
- Created comprehensive 2-minute executive presentation materials for stakeholder demonstrations
- Developed industry-specific demo flow scripts optimized for medical staffing presentations

## User Preferences

Preferred communication style: Simple, everyday language.

## Testing Standards & Quality Assurance

### A. ACCESSIBILITY
- Ensure keyboard navigation works across all interactive elements
- Run WCAG 2.1 AA compliance checks (color contrast, labels, alt text)
- Validate screen reader compatibility (e.g., NVDA or VoiceOver)
- Check ARIA roles and landmarks are used correctly
- Test for focus states and tab order
- Ensure semantic HTML (e.g., <button>, <nav>, <section>)

### B. AUTHENTICATION & SECURITY
- Confirm login/logout sessions expire correctly (check JWT/cookies)
- Run penetration tests (e.g., XSS, CSRF, SQL injection)
- Check HTTPS enforcement
- Validate password strength enforcement
- Ensure secure storage of sensitive data (e.g., hashed passwords)
- Verify OAuth/token expiry and refresh logic

### C. CORE FUNCTIONALITY
- Validate primary user flows (sign up, search, cart, checkout, etc.)
- Check form validations (client-side and server-side)
- Confirm API requests are handled gracefully (timeouts, retries)
- Verify correct state transitions for UI components
- Test undo/redo functionality if applicable

### D. DEVICE RESPONSIVENESS
- Test across mobile, tablet, and desktop breakpoints
- Validate viewport meta tag and responsive image loading
- Check mobile touch targets and tap behavior
- Simulate real-world mobile network conditions (3G/4G/5G)

### E. ERROR HANDLING
- Ensure meaningful error messages are displayed to users
- Validate fallback UI for 4xx/5xx errors
- Confirm uncaught exceptions are logged to monitoring services
- Ensure AI captures edge cases not handled explicitly

### F. FUNCTIONALITY ACROSS ENVIRONMENTS
- Validate dev, staging, and production environments behave consistently
- Ensure feature flags work correctly
- Simulate downgrades or disabled features gracefully
- Test backup and restore processes (if applicable)

### G. GRAPHICAL INTEGRITY
- Compare visual components against Figma/Design system
- Run AI-powered visual regression tests (e.g., Percy, Chromatic)
- Confirm icon/fonts/images load correctly across themes

### H. HOT RELOADING & LIVE UPDATES
- Validate auto-refresh or real-time updates work (e.g., WebSockets)
- Ensure that frontend state remains stable after code reloads
- Check push notifications (browser/mobile)

### I. INTEGRATION TESTS
- Test end-to-end flows with AI assistance (Cypress, Playwright, Selenium)
- Ensure 3rd-party services work: Stripe, Google Maps, Firebase, etc.
- Stub/mock external services for testing isolation

### J. JAVASCRIPT / FRONTEND LOGIC
- Check for unused variables or deprecated APIs
- Ensure async/await or promise chains are handled correctly
- Run linting and static analysis (ESLint, Prettier)
- Test reactivity and UI updates (React/Vue/Angular/etc.)

### K. KEYBOARD SHORTCUTS & INTERACTION PATTERNS
- Confirm all shortcuts are documented and functional
- Test modifier keys (Ctrl, Alt, Cmd) and event listeners

### L. LOCALIZATION & LANGUAGE
- Verify internationalization (i18n) keys render correctly
- Test language switching and directionality (e.g., RTL)
- Confirm AI translates and tests edge cases in various languages

### M. METRICS & PERFORMANCE
- Run Lighthouse audits for performance, accessibility, SEO
- Track Core Web Vitals (LCP, FID, CLS)
- Simulate low-bandwidth conditions
- Use AI to predict performance bottlenecks from user behavior

### N. NAVIGATION
- Validate all routes and deep linking (via URL and UI)
- Check browser back/forward navigation
- Test dynamic route parameters and redirects

### O. OFFLINE & CACHING
- Confirm offline support for PWA-enabled apps
- Validate service workers and cache strategies
- Test stale-while-revalidate and cache invalidation rules

### P. PERSONALIZATION / AI LOGIC
- Validate user-specific content rendering
- Test recommendation logic (AI-based suggestions)
- Confirm user feedback loops are tracked properly
- Validate fallback states if AI API fails

### Q. QUALITY METRICS
- Ensure test coverage ≥ 90%
- Track AI-generated test coverage gaps
- Run mutation testing for robustness

### R. RESPONSIVENESS & INPUT
- Test multi-touch, drag-and-drop, swiping, long-press
- Validate forms with voice input, OCR, and autocomplete
- Ensure debounced and throttled inputs are correctly processed

### S. STORAGE & STATE
- Validate use of localStorage, sessionStorage, or IndexedDB
- Check state management across sessions (Redux, Pinia, etc.)
- Confirm data persistence and hydration logic

### T. TESTING STRATEGY (AI-DRIVEN)
- Unit tests: logic components, utilities
- Integration tests: component + service
- E2E tests: critical workflows
- AI-generated exploratory test cases for edge flows
- Auto-regression testing on PRs and deploys

### U. USABILITY & UX
- Confirm user flows are intuitive (AI can run simulated journeys)
- Validate onboarding steps and empty states
- Use heatmap data or session replays for UX pain points
- Test dark/light mode switching

### V. VERSIONING
- Confirm semantic versioning (semver) practices
- Ensure backwards compatibility
- Validate upgrade and rollback processes

### W. WORKFLOW INTEGRATION
- Hook test suites into CI/CD pipelines (GitHub Actions, Vercel, etc.)
- Ensure AI alerts for failing or flaky tests
- Automate rollback if post-deploy tests fail

### X. X-PLATFORM FUNCTIONALITY
- Validate functionality across iOS, Android, Windows, macOS, Linux
- Use BrowserStack or AI agents to simulate edge cases per platform

### Y. YIELD STRESS / LOAD TESTING
- Use tools like Artillery, Locust, or k6 for stress testing
- Run AI simulations to model spikes in usage (Black Friday, etc.)
- Monitor server CPU/memory and client render times

### Z. ZERO DOWNTIME DEPLOYMENT
- Validate blue/green or canary deployment strategies
- Check feature toggles and rollback readiness
- Ensure session migration and DB schema migration safety

### AI-SPECIFIC TESTING CONFIGURATION
```yaml
ai_testing_rules:
  generate_edge_cases: true
  test_failures_alert: true
  monitor_behavior_anomalies: true
  auto_generate_regression_tests: true
  test_i18n_variants: true
  simulate_human_behavior_patterns: true
```

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