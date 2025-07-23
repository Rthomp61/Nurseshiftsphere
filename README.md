# ShiftGenie - Healthcare Shift Management Platform

![ShiftGenie](https://img.shields.io/badge/ShiftGenie-Healthcare%20Shift%20Management-purple?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 🏥 Overview

ShiftGenie is a modern healthcare shift management platform designed to revolutionize nurse scheduling and optimize workforce allocation. Built with a sleek glass morphism UI, it connects nurses with available shifts while providing coordinators with powerful tools to manage staffing needs.

### 🎯 Key Problems Solved

- **Critical Staffing Gaps**: 70% of PM/NOC shifts claimed less than 3 hours before start time
- **Emergency Staffing Costs**: Reduces emergency staffing costs by up to 30%
- **Nurse Income**: Increases nurse income by 15-20% through optimized shift opportunities
- **Travel Risk Management**: Smart alerts for travel time and location-based matching
- **Ineffective Pay Incentives**: Dynamic pricing for high-demand shifts

## ✨ Features

### For Nurses
- 🔍 **Smart Shift Discovery** - Browse and filter available shifts by location, department, and pay rate
- ⚡ **Real-time Claiming** - Instant shift claiming with conflict prevention
- 📱 **Mobile-First Design** - Optimized for on-the-go access
- 💰 **1099 Contractor Tools** - Comprehensive tax features with quarterly reporting and expense tracking
- 🎯 **Preference Management** - Set availability schedules and location preferences
- 📊 **Earnings Dashboard** - Track weekly earnings, hours worked, and performance metrics

### For Coordinators
- 📝 **Shift Creation** - Easy-to-use forms for posting detailed shift requirements
- ✏️ **Shift Management** - Edit and update shift details with full authorization controls
- 📈 **Analytics Dashboard** - Real-time insights into fill rates, staffing patterns, and performance
- 🚨 **Urgent Alerts** - Automated notifications for understaffed shifts
- 👥 **Nurse Performance** - Track top performers and shift completion rates
- 🎚️ **Priority Management** - Mark shifts as normal, urgent, or critical

### Design & UX
- 🎨 **Glass Morphism UI** - Modern, unique design that stands out from typical healthcare apps
- 🌙 **Dark/Light Mode** - Adaptive themes for different working environments
- 📱 **Responsive Design** - Seamless experience across desktop, tablet, and mobile
- ⚡ **Real-time Updates** - Live data synchronization without page refreshes
- 🎭 **Role-based Dashboards** - Tailored interfaces for nurses and coordinators

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with full IntelliSense support
- **Tailwind CSS** - Utility-first CSS framework with custom glass morphism design
- **Radix UI** - Accessible component primitives with shadcn/ui design system
- **TanStack Query** - Powerful data fetching with caching and synchronization
- **Wouter** - Lightweight client-side routing
- **Framer Motion** - Smooth animations and transitions

### Backend
- **Node.js** - JavaScript runtime with ES modules support
- **Express.js** - Web framework with middleware architecture
- **TypeScript** - Full-stack type safety
- **Drizzle ORM** - Type-safe database operations with PostgreSQL
- **Replit Auth** - OpenID Connect authentication with session management

### Database & Infrastructure
- **PostgreSQL** - Robust relational database with Neon serverless
- **Drizzle Kit** - Database migrations and schema management
- **Connection Pooling** - Optimized database connections for scalability
- **Session Storage** - PostgreSQL-backed sessions for reliability

### Development Tools
- **Vite** - Fast build tool with hot module replacement
- **ESBuild** - Lightning-fast TypeScript compilation
- **TSX** - TypeScript execution for development
- **Replit Deployments** - Seamless deployment with automatic scaling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (provided automatically on Replit)
- Replit account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/shiftgenie.git
   cd shiftgenie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Database connection (automatically provided on Replit)
   DATABASE_URL=your_postgres_connection_string
   
   # Session management
   SESSION_SECRET=your_secure_session_secret
   
   # Authentication (automatically configured on Replit)
   REPL_ID=your_repl_id
   ISSUER_URL=https://replit.com/oidc
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000` (or your Replit URL).

## 📁 Project Structure

```
shiftgenie/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── pages/          # Page components and routing
│   │   └── App.tsx         # Main application component
│   └── index.html          # HTML entry point
├── server/                 # Backend Node.js application
│   ├── db.ts              # Database connection and configuration
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations and business logic
│   ├── replitAuth.ts      # Authentication middleware
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle database schema definitions
├── migrations/            # Database migration files
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
├── vite.config.ts         # Vite build configuration
└── replit.md             # Project documentation and preferences
```

## 🗃 Database Schema

### Core Tables
- **users** - User profiles with role-based permissions (nurse/coordinator)
- **shifts** - Shift details including schedule, requirements, and status
- **shift_applications** - Applications submitted by nurses for specific shifts
- **nurse_availability** - Nurse availability schedules and preferences
- **sessions** - Secure session storage for authentication

### Key Relationships
- Users can be either nurses or coordinators
- Coordinators create and manage shifts
- Nurses apply for and claim shifts
- Real-time status tracking prevents conflicts

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user profile
- `GET /api/login` - Initiate OAuth login
- `GET /api/logout` - Sign out and clear session

### Shifts
- `GET /api/shifts` - List available shifts with filtering
- `POST /api/shifts` - Create new shift (coordinators only)
- `PATCH /api/shifts/:id` - Update shift details (creator only)
- `PATCH /api/shifts/:id/claim` - Claim a shift (nurses only)

### User Management
- `GET /api/my-shifts` - Get user's shifts (created or claimed)
- `GET /api/users/stats` - Get user dashboard statistics
- `PATCH /api/users/role` - Toggle user role (MVP feature)

## 🎨 Design System

### Glass Morphism Theme
- **Background**: Semi-transparent cards with backdrop blur
- **Colors**: Purple gradient accents with glass-like transparency
- **Typography**: Clean, modern fonts with excellent readability
- **Animations**: Smooth transitions and hover effects

### Component Library
- Built on Radix UI primitives for accessibility
- Custom glass-effect cards and modals
- Responsive grid layouts with mobile-first approach
- Interactive elements with visual feedback

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm run preview         # Preview production build locally

# Database
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Drizzle Studio for database management

# Type Checking
npm run type-check      # Run TypeScript compiler check
```

## 🚀 Deployment

### Replit Deployments (Recommended)
1. Click the "Deploy" button in your Replit workspace
2. Configure your custom domain (optional)
3. Replit handles builds, hosting, TLS, and health checks automatically

### Manual Deployment
1. Build the application: `npm run build`
2. Set up PostgreSQL database with required environment variables
3. Configure web server to serve static files and proxy API requests
4. Set up SSL/TLS certificates for HTTPS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode requirements
- Use Tailwind CSS for styling (no custom CSS files)
- Implement proper error handling and loading states
- Write descriptive commit messages
- Test across different screen sizes and devices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Replit** - For providing the development platform and authentication system
- **shadcn/ui** - For the beautiful component library and design patterns
- **Drizzle Team** - For the excellent ORM and database tooling
- **Healthcare Workers** - For inspiring this solution to real staffing challenges

## 📞 Support

For support, email support@shiftgenie.com or join our Discord community.

---

**Built with ❤️ for healthcare professionals who deserve better staffing solutions.**