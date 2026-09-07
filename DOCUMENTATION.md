# Winners Chapel International ICT Group (ICTG) Events & Announcements Portal
## Technical & Architectural Documentation

---

## 1. Executive Summary & Purpose

The **ICTG Events & Announcements Portal** is an enterprise web application engineered for the **Winners Chapel International Information & Communication Technology Group (ICTG)**. 

The application fulfills two primary roles:
1. **Public Member Hub**: An intuitive, responsive public portal enabling church members and unit volunteers to browse scheduled services, technical workshops, rehearsals, and conferences; download calendar reminders (`.ics` and Google Calendar); read official directives and ministry circulars; and save items locally.
2. **Administrative Control Console**: A secure, role-gated administration console (`/admin`) allowing authorized coordinators to schedule events, publish bulletins, upload cover media, manage administrator accounts, and maintain an audit log of author attributions.

---

## 2. Project Architecture & Directory Structure

The project is structured as a decoupled monorepo containing an Express.js REST API (`backend`) and a Vite-powered React single-page application (`frontend`).

```
ictg-events-portal/
├── backend/                         # Node.js Express REST API backend
│   ├── config/
│   │   └── db.js                    # Mongoose MongoDB connection & configuration
│   ├── controllers/
│   │   ├── announcementController.js# Announcement CRUD logic + author tracking
│   │   └── eventController.js       # Event CRUD logic + author tracking
│   ├── middleware/
│   │   ├── asyncHandler.js          # Promise-based wrapper eliminating try/catch blocks
│   │   ├── auth.js                  # JWT token verification + RBAC role enforcement
│   │   ├── errorHandler.js          # Centralized JSON error responder
│   │   └── notFound.js              # Catch-all 404 handler
│   ├── models/
│   │   ├── Admin.js                 # Admin user schema, password hashing, and role enum
│   │   ├── Announcement.js          # Circular schema with priority, pinning, and author metadata
│   │   └── Event.js                 # Event schema with categories, dates, cover image, and metadata
│   ├── routes/
│   │   ├── announcementRoutes.js    # Routes for /api/announcements (public read, role-gated write)
│   │   ├── authRoutes.js            # Routes for /api/admin (login, profile, user management)
│   │   └── eventRoutes.js           # Routes for /api/events (public read, role-gated write)
│   ├── seed/
│   │   └── seed.js                  # Database seeder with sample events, notices, and Super Admin
│   ├── utils/
│   │   └── queryHelpers.js          # Pagination and text search query builders
│   ├── package.json                 # Backend dependencies & script definitions
│   └── server.js                    # Express application entry point & middleware setup
│
├── frontend/                        # React 18 Single Page Application (SPA)
│   ├── public/                      # Static web assets
│   ├── src/
│   │   ├── api/                     # Axios API clients & endpoint abstraction
│   │   │   ├── client.js            # Base Axios instance with Bearer token interceptor
│   │   │   ├── events.js            # Event API endpoints & category constants
│   │   │   └── announcements.js     # Announcement API endpoints & category constants
│   │   ├── components/              # Reusable UI presentation & container components
│   │   │   ├── AnnouncementCard.jsx # Bulletin card with reading time and priority badges
│   │   │   ├── BookmarksDrawer.jsx  # Slide-over drawer displaying locally saved items
│   │   │   ├── CategoryFilter.jsx   # Pill filter component for category selection
│   │   │   ├── EmptyState.jsx       # Fallback UI for empty query results
│   │   │   ├── ErrorState.jsx       # UI for failed API calls with retry trigger
│   │   │   ├── EventCalendarView.jsx# Interactive monthly calendar view with event popups
│   │   │   ├── EventCard.jsx        # Dual-variant (Grid / List) event card with calendar tile
│   │   │   ├── Footer.jsx           # Global Obsidian Black footer with author attribution
│   │   │   ├── LoadingState.jsx     # Skeleton loading state
│   │   │   ├── Navbar.jsx           # Obsidian Black navigation bar with mobile toggle
│   │   │   ├── SearchBar.jsx        # Debounced search input
│   │   │   └── SectionHeader.jsx    # Standardized section heading
│   │   ├── context/                 # Global React Context providers
│   │   │   ├── BookmarksContext.jsx # LocalStorage-backed state for saved events/notices
│   │   │   └── ToastContext.jsx     # High-contrast notification provider
│   │   ├── hooks/
│   │   └── useFetch.js          # Declarative data fetching hook with loading/error states
│   │   ├── pages/                   # Application route views
│   │   │   ├── About.jsx            # Mission, leadership, and unit directory
│   │   │   ├── Admin.jsx            # High-density admin console, forms, user management
│   │   │   ├── AnnouncementDetail.jsx# Full bulletin view with print and share options
│   │   │   ├── Announcements.jsx    # Bulletin directory with search and spotlight item
│   │   │   ├── EventDetail.jsx      # Event detail page with hero cover, countdown, RSVP
│   │   │   ├── Events.jsx           # Event directory with Grid/List/Calendar mode switcher
│   │   │   ├── Home.jsx             # Landing page with Next Event countdown and notices
│   │   │   └── NotFound.jsx         # 404 page
│   │   ├── utils/
│   │   │   ├── calendarHelpers.js   # RFC 5545 iCalendar (.ics) and Google Calendar generators
│   │   │   └── formatDate.js        # Date parsing, relative time calculation, and date parts
│   │   ├── App.jsx                  # Main router config and layout wrapper
│   │   ├── index.css                # Tailwind CSS imports and global styling
│   │   └── main.jsx                 # React root mount
│   ├── index.html                   # HTML template
│   ├── tailwind.config.js           # Tailwind configuration (color palette, typography)
│   ├── vite.config.js               # Vite bundler configuration
│   └── package.json                 # Frontend dependencies & build scripts
│
├── DOCUMENTATION.md                 # Technical project documentation (this document)
└── README.md                        # Quickstart and setup guide
```

---

## 3. Technologies Used

### Frontend Stack
- **React 18**: Component-based user interface with hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useContext`).
- **Vite 5**: Rapid build tool and development server providing Instant HMR (Hot Module Replacement) and optimized production bundles.
- **Tailwind CSS 3**: Utility-first styling framework customized for a strict **Obsidian Black (`slate-950`)** and **Signature Red (`#DC2626`)** aesthetic.
- **React Router DOM v6**: Declarative client-side routing with parameter handling (`useParams`) and programmatic navigation.
- **Axios**: Promise-based HTTP client equipped with request interceptors for automated JWT injection.
- **Lucide React**: Clean, lightweight icon suite for all user interface symbols.

### Backend Stack
- **Node.js & Express.js (ES Modules)**: Lightweight, asynchronous runtime powering the RESTful API service.
- **MongoDB & Mongoose 8**: Document database with strict schema modeling, validations, timestamps, and indexes.
- **JSON Web Tokens (`jsonwebtoken`)**: Stateless authentication mechanism using signed JWT tokens.
- **Bcrypt (`bcryptjs`)**: Cryptographic salt-and-hash algorithm for admin password security.
- **Express Middleware Suite**:
  - `cors`: Cross-Origin Resource Sharing whitelist configuration.
  - `express-mongo-sanitize`: Sanitization of request inputs against NoSQL query injection.
  - `dotenv`: Environment variable management.

---

## 4. Key Technical Decisions

### 4.1. Stateless JWT Authentication with 3-Tier RBAC
- **Decision**: Authenticate administrators via stateless signed JSON Web Tokens (JWT) stored in browser `localStorage` and sent via `Authorization: Bearer <token>` headers.
- **Role Hierarchy**:
  - **Super Admin**: Unrestricted privileges (create, edit, delete, invite all admin roles, manage system accounts).
  - **Admin**: Full content management (create, edit, delete) and delegation rights (can add/manage *Admins* and *Editors*).
  - **Editor**: Content publishing and editing privileges without deletion or team administration rights.
- **Implementation**: Enforced through reusable backend middleware:
  - `protect`: Verifies token signature and attaches the active `Admin` document to `req.admin`.
  - `requireRole(...allowedRoles)`: Gates sensitive endpoints (e.g. `DELETE /api/events/:id` or `POST /api/admin/users`).

### 4.2. Embedded Author Attribution Snapshots
- **Decision**: When an administrator creates an event or notice, store an immutable snapshot of their profile (`id`, `username`, `name`, `role`, `department`) directly within the `createdBy` subdocument of the record.
- **Rationale**: Avoids costly database `$lookup` joins on frequently queried public listings while preserving historical author records even if an admin account is modified or removed.

### 4.3. Privacy-Preserving Public Projection
- **Decision**: Public-facing cards and detail pages only display the organizing department or unit (e.g. *AV & Broadcast*, *Software & Systems*), keeping individual administrator names visible only within the authenticated `/admin` control console.
- **Rationale**: Protects administrative privacy from public scraping while maintaining internal accountability and auditability.

### 4.4. Payload Expansion for Device Media Uploads
- **Decision**: Configured Express body parser limits to `15mb` (`express.json({ limit: "15mb" })`) and added browser-side `FileReader` Data URL conversion in conjunction with standard URL support.
- **Rationale**: Allows administrators to upload artwork directly from local devices without requiring external S3 bucket setup, while still supporting external CDN URLs (e.g. Unsplash).

### 4.5. Universal Calendar Interoperability
- **Decision**: Implemented client-side calendar generator utilities (`calendarHelpers.js`):
  - Google Calendar direct URL generator with URL-encoded date ranges and descriptions.
  - RFC 5545 compliant `.ics` iCalendar file generator with dynamic Blob creation and download trigger for Apple Calendar, Microsoft Outlook, and mobile calendar apps.

### 4.6. Local-First Bookmarks & Offline Drawer
- **Decision**: Integrated `BookmarksContext.jsx` backed by browser `localStorage`.
- **Rationale**: Church members can bookmark events and circulars instantly without requiring user account registration or network round-trips.

---

## 5. Key UI/UX & Design Decisions

### 5.1. Obsidian Black & Signature Red Palette
- **Palette**: Strict color system utilizing **Obsidian Black (`bg-slate-950`)**, **Crisp White (`bg-white`)**, and **Signature Red (`text-red-600` / `#DC2626`)**.
- **Execution**: Navbar and Footer feature deep black backgrounds (`slate-950`) with slate-400 navigation links and red accent states, providing an authoritative, modern feel.

### 5.2. Elimination of Generic "AI Template" Patterns
- **Decision**: Completely removed floating pink pill badges, bubbly card stacks, and generic filler subtitles from the public pages and admin console.
- **Execution**: Replaced with clean typographic hierarchy (crisp overlines, uppercase tracking, subtle borders), structured metric strips, and high-density tabular list panels inspired by modern developer tooling (e.g., Linear, GitHub, Stripe).

### 5.3. Multi-Mode Event Exploration
- **Grid View**: High-impact vertical cards with cover image hero banners and calendar date blocks.
- **List View**: Compact horizontal cards with left-aligned image thumbnails and metadata summary.
- **Calendar View**: Full monthly interactive grid allowing members to click specific calendar days to view that date's schedule.

---

## 6. Database Models

### Event Schema (`backend/models/Event.js`)
```javascript
{
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { 
    type: String, 
    enum: ["Service", "Conference", "Outreach", "Training", "Youth", "Other"],
    default: "Other" 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, default: "Winners Chapel", maxlength: 160 },
  imageUrl: { type: String, default: "" },
  isFeatured: { type: Boolean, default: false },
  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    username: String,
    name: String,
    role: String,
    department: String
  }
}
```

### Announcement Schema (`backend/models/Announcement.js`)
```javascript
{
  title: { type: String, required: true, trim: true, maxlength: 140 },
  body: { type: String, required: true, trim: true, maxlength: 4000 },
  category: { 
    type: String, 
    enum: ["General", "Ministry", "Youth", "Finance", "ICT", "Other"],
    default: "General" 
  },
  priority: { type: String, enum: ["Normal", "High"], default: "Normal" },
  isPinned: { type: Boolean, default: false },
  publishDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    username: String,
    name: String,
    role: String,
    department: String
  }
}
```

### Admin Schema (`backend/models/Admin.js`)
```javascript
{
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  role: { type: String, enum: ["Super Admin", "Admin", "Editor"], default: "Admin" },
  department: { type: String, default: "ICT Group", trim: true }
}
```

---

## 7. REST API Endpoints

### Authentication & Admin (`/api/admin`)
- `POST /api/admin/login` - Authenticates user credentials and returns signed JWT token.
- `GET /api/admin/me` - Returns profile of the authenticated administrator.
- `GET /api/admin/users` - Lists all registered administrative accounts (*Authenticated*).
- `POST /api/admin/users` - Creates a new administrator/editor account (*Super Admin / Admin*).
- `PUT /api/admin/users/:id` - Updates admin details or resets password (*Super Admin / Admin / Self*).
- `DELETE /api/admin/users/:id` - Deletes administrator account (*Super Admin / Admin*).

### Events (`/api/events`)
- `GET /api/events` - Lists events with filtering (`search`, `category`, `timeframe`, `page`, `limit`).
- `GET /api/events/featured` - Returns featured upcoming events for the homepage.
- `GET /api/events/:id` - Returns single event details.
- `POST /api/events` - Creates a new event (*Authenticated*).
- `PUT /api/events/:id` - Updates an existing event (*Authenticated*).
- `DELETE /api/events/:id` - Deletes an event (*Super Admin / Admin*).

### Announcements (`/api/announcements`)
- `GET /api/announcements` - Lists circulars with filtering (`search`, `category`, `includeExpired`, `page`, `limit`).
- `GET /api/announcements/recent` - Returns recent bulletins for the homepage.
- `GET /api/announcements/:id` - Returns single announcement details.
- `POST /api/announcements` - Publishes a new bulletin (*Authenticated*).
- `PUT /api/announcements/:id` - Updates an existing bulletin (*Authenticated*).
- `DELETE /api/announcements/:id` - Deletes a bulletin (*Super Admin / Admin*).

---

## 8. Summary of System Roles

| Capability | Public Member | Editor | Admin | Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse Public Events & Notices | ✅ | ✅ | ✅ | ✅ |
| Download `.ics` / Sync Google Cal | ✅ | ✅ | ✅ | ✅ |
| Bookmark Items to Drawer | ✅ | ✅ | ✅ | ✅ |
| Access Admin Console (`/admin`) | ❌ | ✅ | ✅ | ✅ |
| Schedule Events & Publish Notices | ❌ | ✅ | ✅ | ✅ |
| Edit Existing Content | ❌ | ✅ | ✅ | ✅ |
| Delete Events & Notices | ❌ | ❌ | ✅ | ✅ |
| Register New Admin Accounts | ❌ | ❌ | ✅ (*Admin/Editor*) | ✅ (*Any Role*) |
| Manage / Delete Admin Accounts | ❌ | ❌ | ✅ (*Editors only*) | ✅ (*All accounts*) |
