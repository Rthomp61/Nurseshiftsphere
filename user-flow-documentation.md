# ShiftGenie User Flow Documentation

## Overview
ShiftGenie provides role-based user experiences for healthcare shift management with distinct workflows for nurses and coordinators. The platform uses a glass-morphism design with mobile-first responsive layouts.

## Authentication Flow

### Initial Login Process
1. **Landing Page** (`/`)
   - User arrives at landing page with glass-morphism hero section
   - Click "Get Started" or "Login" button
   - Redirected to `/api/login` (Replit OAuth)

2. **Authentication & Role Assignment**
   - Replit OpenID Connect handles authentication
   - User profile created/updated in database
   - Role toggle slider allows switching between 'nurse' and 'coordinator'
   - Session established with PostgreSQL storage

3. **Dashboard Redirect**
   - Nurse role → Nurse Dashboard
   - Coordinator role → Coordinator Dashboard

---

## Nurse User Flow

### Primary Dashboard Experience
**Entry Point:** Nurse Dashboard (`/`)

#### Top Section - Performance Stats
- **Weekly Earnings**: Real-time calculation with animation
- **Hours Worked**: Current week total with progress indicators
- **Shifts Claimed**: Count with achievement badges
- **Rating**: 5-star display with average rating

#### Main Content Area - Available Shifts
1. **Browse Available Shifts**
   - Grid layout showing shift cards with specialty badges
   - Each card displays:
     - Shift title with specialty (OR, NICU, L&D, etc.)
     - Date, time, and duration
     - Location and facility
     - Pay rate with bonus indicators
     - Travel time alerts
     - Early claim incentives

2. **Shift Filtering & Search**
   - Filter by specialty, location, pay rate
   - Date range selection
   - Distance from preferred locations
   - Bonus pay availability

3. **Claim Shift Process**
   - Click "Claim Shift" button on desired shift
   - Modal opens with shift details confirmation
   - One-click claiming with conflict detection
   - Real-time updates prevent double-booking
   - Success notification with next steps

#### Right Sidebar - Personal Management

##### My Upcoming Shifts Section
- **View Claimed Shifts**: List of confirmed shifts
- **Shift Details**: Date, time, location, pay rate
- **Total Earnings**: Calculated per shift
- **Status Indicators**: Confirmed, pending, completed

##### Quick Actions Section
1. **Update Availability**
   - Modal with weekly calendar grid
   - Set preferred days/times
   - Blackout date management
   - Save preferences for smart matching

2. **Set Preferred Locations**
   - Modal with location selection
   - Distance preferences (within X miles)
   - Facility type preferences
   - Travel time considerations

3. **View Completed Shifts**
   - Historical shift records
   - Performance ratings received
   - Total earnings tracking
   - Export functionality

4. **View Earnings Report** (1099 Features)
   - Quarterly earnings breakdown
   - Tax-ready export (CSV, PDF)
   - Expense tracking categories
   - Mileage calculation tools

##### Achievements Section
- **Perfect Week**: All scheduled shifts completed
- **Night Owl**: Completed 10+ night shifts
- **Specialty Expert**: 25+ shifts in specific specialty
- **Travel Champion**: Worked at 5+ different facilities

### Nurse Mobile Experience
- **Bottom Navigation**: Quick access to key sections
- **Swipe Actions**: Claim shifts with swipe gestures
- **Push Notifications**: New shift alerts, claim confirmations
- **Offline Mode**: View claimed shifts without internet

---

## Coordinator User Flow

### Primary Dashboard Experience
**Entry Point:** Coordinator Dashboard (`/`)

#### Top Section - Management Stats
- **Active Shifts**: Currently posted and available
- **Fill Rate**: Percentage of shifts successfully filled
- **Average Response Time**: How quickly shifts get claimed
- **Coordinator Rating**: Feedback from nurses

#### Main Content Area - Shift Management

##### Posted Shifts Overview
1. **View All Posted Shifts**
   - Grid layout of coordinator's shifts
   - Status indicators: Open, Filled, In Progress, Completed
   - Quick actions per shift

2. **Shift Status Management**
   - **Open Shifts**: Awaiting nurse claims
   - **Filled Shifts**: Confirmed with assigned nurse
   - **In Progress**: Currently active shifts
   - **Completed**: Finished shifts awaiting review

##### Create New Shift Process
1. **Click "Create New Shift" Button**
   - Modal opens with comprehensive form

2. **Shift Details Form**
   - **Basic Info**: Title, description, specialty type
   - **Scheduling**: Date, start time, end time, duration
   - **Location**: Facility, department, specific unit
   - **Requirements**: Experience level, certifications needed
   - **Compensation**: Base pay rate, bonus structures
   - **Special Notes**: Parking info, dress code, contacts

3. **Advanced Settings**
   - **Early Claim Incentives**: Extra pay for quick responses
   - **Travel Allowances**: Mileage or travel stipends
   - **Emergency Priority**: Mark as high-demand/urgent
   - **Nurse Preferences**: Request specific nurses

4. **Publish Shift**
   - Review all details
   - Set publication time (immediate or scheduled)
   - Confirm and post to available shifts board

#### Right Sidebar - Coordinator Tools

##### Quick Actions
1. **Bulk Shift Creation**
   - Template-based shift posting
   - Recurring shift schedules
   - Copy from previous shifts

2. **Nurse Management**
   - View nurse profiles and ratings
   - Send direct shift invitations
   - Manage preferred nurse lists

3. **Reports & Analytics**
   - Fill rate trends
   - Popular shift types
   - Nurse feedback summaries
   - Cost analysis reports

##### Facility Management
- **Department Settings**: Configure unit-specific requirements
- **Rate Management**: Set pay scales by specialty
- **Notification Preferences**: Alert settings for shift status changes

---

## Shared Features & Interactions

### Real-Time Updates
- **Live Shift Status**: Automatic updates when shifts are claimed
- **Notification System**: Toast notifications for important events
- **Session Persistence**: Maintains state across page refreshes

### Mobile Responsive Design
- **Breakpoint Adaptation**: Layout adjusts for mobile, tablet, desktop
- **Touch-Optimized**: Large tap targets, swipe gestures
- **Progressive Web App**: Installable on mobile devices

### Error Handling & Edge Cases
- **Network Issues**: Graceful offline fallbacks
- **Conflict Resolution**: Prevents double-booking with real-time checks
- **Session Expiry**: Automatic re-authentication flow
- **Data Validation**: Client and server-side form validation

---

## Critical User Journeys

### High-Priority Nurse Journey
1. **Login** → **Browse Emergency Shifts** → **Quick Claim** → **Confirmation**
2. **Dashboard** → **Update Availability** → **Receive Smart Matches** → **Claim Preferred Shifts**

### High-Priority Coordinator Journey
1. **Login** → **Create Urgent Shift** → **Set Premium Pay** → **Publish Immediately**
2. **Dashboard** → **Monitor Fill Rates** → **Send Direct Invitations** → **Confirm Coverage**

### Pain Point Solutions
- **Last-Minute Staffing**: Emergency shift flags with premium pay
- **Travel Concerns**: Distance alerts and travel time calculations
- **Income Optimization**: Bonus pay visibility and earnings tracking
- **Compliance**: 1099 tax reporting and expense management

---

## Technical User Flow Details

### Authentication State Management
- **Session Storage**: PostgreSQL-backed with 7-day expiry
- **Role Switching**: Immediate UI updates without page refresh
- **Token Refresh**: Automatic renewal before expiration

### Data Flow Architecture
1. **User Action** → **React Query Mutation** → **API Endpoint**
2. **Database Update** → **Response** → **Cache Invalidation**
3. **UI Update** → **Optimistic Updates** → **Success/Error Handling**

### Performance Optimizations
- **React Query Caching**: Reduces API calls
- **Optimistic Updates**: Immediate UI feedback
- **Code Splitting**: Faster initial load times
- **Image Optimization**: Lazy loading for better performance

This user flow documentation covers the complete experience for both user types, ensuring smooth navigation and efficient task completion within the ShiftGenie healthcare shift management platform.