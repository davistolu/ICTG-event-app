# Winners Chapel ICT Group (ICTG) Events & Announcements Portal

A SIMPLE and I repeat very SIMPLE, Events and Announcements Portal for ICTG. As you proceed with this, may you remain ever blessed😌.

---

## Key Features

### 1. Public Member Experience
- **Interactive Home Spotlight**: Real-time live countdown timer to the next upcoming service or convention, spotlight priority bulletin, and technical unit showcases.
- **Events Directory & Timetable**:
  - Filter by category (*Service*, *Conference*, *Training*, *Youth*, *Outreach*, *Other*).
  - Timeframe tabs (*Upcoming*, *Past*, *All*).
  - Authentic square calendar date tiles with red month header bars and clean day numbers.
  - Interactive monthly calendar view with date selection.
  - One-click Google Calendar sync and Apple / Outlook `.ics` file download.
  - Interactive RSVP confirmation toggle.
- **Official Bulletins & Circulars**:
  - Filter by category (*General*, *Ministry*, *Youth*, *Finance*, *ICT*, *Other*).
  - Priority markers (*Urgent Notice*, *Pinned*).
  - Estimated reading time and search across bulletin titles and bodies.
  - Print-ready format and copyable share links.
- **Bookmarks & Saved Drawer**:
  - Persistent localStorage-backed drawer to save favorite events and notices for quick offline access.
- **Privacy First**: Public-facing cards and detail pages display organizing units/departments (e.g. *Software & Systems*, *Audio / Visual Broadcast*) rather than individual administrator names.

### 2. Administrative Control Console
- **Direct Link Access**: Completely unlinked from public navigation for enhanced security. Accessible exclusively via the direct route (`/admin`).
- **High-Density Enterprise Suite**:
  - **Overview**: Real-time telemetry, active circulars, scheduled events, and operational API status.
  - **Manage Events**: Full search, category filter, instant 1-click *Featured* toggle, Edit Modal, and Delete confirmations.
  - **Manage Bulletins**: Search, category filter, instant 1-click *Pin* toggle, Edit Modal, and Delete confirmations.
  - **Cover Media & Artwork**: Support for local device uploads (base64 Data URLs) and remote CDN URLs with live preview.
  - **Author Attribution**: Admin dashboard records and displays the specific administrator (`Posted by: [Name] ([Department])`) who scheduled or published each item.
  - **Team Access Management**: Multi-admin registration, 3-tier role assignment, profile editing, and password reset.

> For in-depth architectural and technical design details, see [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## Role-Based Access Control (RBAC)

The portal enforces a secure 3-tier Role-Based Access Control policy:

| Role | Create & Publish | Edit Content | Delete Records | Add Admins | Appoint Roles / Remove Accounts |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Super Admin** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Can invite any role | ✅ Full privileges & deletion rights |
| **Admin** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Can invite *Admin* & *Editor* | ✅ Can manage/delete *Editors* |
| **Editor** | ✅ Full Access | ✅ Full Access | ❌ Restricted (Delete blocked) | ❌ Restricted (Read-only) | ❌ Restricted |

---



## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router v6, Lucide React, Axios |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB with Mongoose ODM |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt password hashing, Mongo-Sanitize, CORS protection |

---

## Project Architecture

```
ictg-events-portal/
├── backend/
│   ├── config/db.js                 # MongoDB connection & configuration
│   ├── controllers/
│   │   ├── announcementController.js# Announcement CRUD logic + author tracking
│   │   └── eventController.js       # Event CRUD logic + author tracking
│   ├── middleware/
│   │   ├── auth.js                  # JWT validation + requireRole(role) RBAC engine
│   │   ├── asyncHandler.js          # Async wrapper for route handlers
│   │   ├── errorHandler.js          # Centralized error handler
│   │   └── notFound.js              # 404 handler
│   ├── models/
│   │   ├── Admin.js                 # Admin model (name, email, role, department, passwordHash)
│   │   ├── Announcement.js          # Announcement schema + createdBy author metadata
│   │   └── Event.js                 # Event schema + createdBy author metadata
│   ├── routes/
│   │   ├── authRoutes.js            # Auth login & /api/admin/users management
│   │   ├── announcementRoutes.js    # Announcement routes with RBAC delete protection
│   │   └── eventRoutes.js           # Event routes with RBAC delete protection
│   ├── seed/seed.js                 # Database seeder with sample data & Super Admin
│   └── server.js                    # Express application entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/                     # Axios API clients (events, announcements, client.js)
│   │   ├── components/              # Navbar, Footer, EventCard, AnnouncementCard, BookmarksDrawer, etc.
│   │   ├── context/                 # BookmarksContext, ToastContext
│   │   ├── hooks/                   # useFetch custom data hook
│   │   ├── pages/                   # Home, Events, Announcements, EventDetail, AnnouncementDetail, Admin
│   │   ├── utils/                   # Calendar helpers (.ics & Google Cal), date formatters
│   │   ├── App.jsx                  # Application routing
│   │   └── main.jsx                 # React root mount
│   ├── tailwind.config.js           # Tailwind color & font configuration
│   └── vite.config.js               # Vite build configuration
```

---

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (Local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
```

Configure your `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ictg-events
JWT_SECRET=your_secure_jwt_secret_key_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
CLIENT_ORIGIN=http://localhost:5173
```

Seed initial events, bulletins, and Super Admin account:
```bash
npm run seed
```

Start the backend API server:
```bash
npm run dev
```
*(Server will start on `http://localhost:5000`)*

---

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
```

Configure your `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```
*(Frontend portal will be live at `http://localhost:5173`)*

---

## Admin Access Instructions

To ensure public simplicity and administrative security, no public buttons link to the administrative console. 

1. Open your browser and navigate directly to:
   ```
   http://localhost:5173/admin
   ```
2. Log in using your seeded administrative credentials:
   - **Username**: `admin`
   - **Password**: `password`
3. Once authenticated, administrators can:
   - Add additional administrators and editors (*Admin Team tab*).
   - Edit, delete, and publish events and circulars.
   - Monitor real-time portal statistics.

---

## API Specification

### Base URL: `/api`

| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/admin/login` | Public | Authenticates admin and issues JWT token |
| **GET** | `/admin/me` | Authenticated | Gets currently logged-in admin profile |
| **GET** | `/admin/users` | Authenticated | Lists all registered administrators |
| **POST** | `/admin/users` | Super Admin, Admin | Creates a new administrator/editor account |
| **PUT** | `/admin/users/:id` | Super Admin, Admin, Self | Updates admin profile or resets password |
| **DELETE**| `/admin/users/:id` | Super Admin, Admin | Removes administrator account |
| **GET** | `/events` | Public | List events with `search`, `category`, `timeframe`, `page`, `limit` |
| **GET** | `/events/featured` | Public | Homepage featured events |
| **GET** | `/events/:id` | Public | Single event detail |
| **POST** | `/events` | Authenticated | Create event (stores author metadata) |
| **PUT** | `/events/:id` | Authenticated | Update event |
| **DELETE**| `/events/:id` | Super Admin, Admin | Delete event |
| **GET** | `/announcements` | Public | List bulletins with `search`, `category`, `includeExpired`, `page`, `limit` |
| **GET** | `/announcements/recent` | Public | Homepage recent bulletins |
| **GET** | `/announcements/:id` | Public | Single announcement detail |
| **POST** | `/announcements` | Authenticated | Create announcement (stores author metadata) |
| **PUT** | `/announcements/:id` | Authenticated | Update announcement |
| **DELETE**| `/announcements/:id` | Super Admin, Admin | Delete announcement |

---

## License

Created for Winners Chapel International ICT Group by Toluuu. All rights reserved.
