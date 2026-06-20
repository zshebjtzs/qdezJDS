<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4-42b883?logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Node.js-22.14-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</p>

# qdezJDS2026 – Qingdao No.2 Middle School Mechatronics Society Website

> Full-stack club management platform · User auth · Internal/Public Forum · Department-based File Cloud

**Language:** [中文](./README.md) | [English](./README.en.md)

---

## 📖 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Configuration](#installation--configuration)
  - [Start Development Servers](#start-development-servers)
- [Default Accounts & Registration](#default-accounts--registration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Introduction

A full‑stack website tailored for the Qingdao No.2 High School Mechatronics Society, combining **public promotion, internal communication, and resource sharing**.  
Powered by **Vue 3 + Node.js + MySQL**, the platform includes:

- User system with JWT authentication and three roles (internal members, external visitors, admins)
- Dual forum: internal board (members only) and public board (everyone can browse, posting after login)
- Cloud drive: private storage and department‑shared spaces (upload restricted to own department, cross‑department download)
- Admin panel for full‑site permission management

Development follows a **Vibecoding** approach, assisted by the `deepseek-v4pro` API for code generation, and integrates battle‑tested open‑source components such as Vditor for stable rendering.

---

## Features

| Module | Sub‑features |
| --- | --- |
| **User System** | Registration (admin‑created via API), login, JWT authentication; custom avatar/cover image (cropping and upload); profile (contact info, bio, theme color); password change (strength validation); username change cooldown (3 days), former usernames displayed; purple name for admins, red for moderators; last active time auto‑recorded |
| **Forum** | Multi‑category (internal/public sections, department affairs); post sorting by time and popularity (server‑side pagination); Markdown + LaTeX editing and rendering (Vditor + KaTeX); tree‑structured comments/replies (max 2 levels, @mentions, nested indentation); paginated comments/replies; post permissions (allow browse/comment); admin/mod management (delete posts, modify permissions, board‑specific mute); user mute/unmute (global or board‑level); deduplicated post view counts |
| **Cloud Drive** | Private/public storage; department‑shared spaces; upload, download, delete; Chinese filename handling; file search (client‑side); paginated lists |
| **Admin Console** | User management (search, ban/unban, grant/revoke moderator); board‑specific mute control; ban durations (1h/1d/3d/7d/30d or permanent) |
| **General** | Responsive layout; pagination component; global CSS design tokens; security (Helmet, parameterized queries, DOMPurify, XSS protection); user directory; terms of use / privacy policy; auto‑logout on token expiry and ban interception |

---

## Tech Stack

### Frontend

| Category      | Technology                                   |
| ------------- | -------------------------------------------- |
| Core Framework| Vue 3 (Composition API)                      |
| Build Tool    | Vite                                         |
| State Management | Pinia                                     |
| Router        | Vue Router (with navigation guards)          |
| HTTP Client   | Axios                                        |
| UI Styling    | Custom CSS (no third‑party UI framework)     |
| Markdown      | Vditor + KaTeX (forum post rendering)        |

### Backend

| Category      | Technology                                   |
| ------------- | -------------------------------------------- |
| Runtime       | Node.js v22.19+                              |
| Web Framework | Express                                      |
| Database      | MySQL 8.0 + `mysql2/promise`                 |
| Authentication| JWT + bcryptjs                               |
| File Upload   | Multer                                       |
| Logging       | Morgan                                       |
| Security      | Helmet, CORS                                 |

---

## Project Structure

```
qdezJDS/
├── index.html                 # Vue app entry HTML, defines mount point #app
├── package.json               # Frontend npm dependencies & scripts
├── vite.config.js             # Vite build config (path aliases, API proxy)
├── .env.development           # Dev environment variables
├── .env.production            # Prod environment variables
├── .gitignore                 # Git ignore rules
├── src/                       # Frontend source
│   ├── api/                   # Axios request modules (auth, forum, cloud, user, etc.)
│   ├── assets/                # Static assets (images, default avatar, legal docs, etc.)
│   ├── components/            # Reusable components
│   │   ├── admin/             # Admin console components
│   │   ├── cloud/             # Cloud drive sub-components (private/public)
│   │   ├── common/            # Common components (paginator, etc.)
│   │   ├── forum/             # Forum core components (post list, detail, editor)
│   │   ├── layout/            # Layout components (navbar, footer, user profile)
│   │   ├── legal/             # Legal text display components
│   │   └── publicHome/        # Public homepage sub-components (about, activities)
│   ├── markdown/              # Markdown editor & safe rendering (Vditor, KaTeX)
│   ├── router/                # Vue Router config & navigation guards
│   ├── stores/                # Pinia stores (user, cloud, etc.)
│   ├── styles/                # Global styles (CSS variables, base classes, cloud public styles)
│   ├── utils/                 # Utilities (sort, search, password validation, etc.)
│   ├── views/                 # Page components (Home, Login, Forum, Cloud, 404)
│   ├── App.vue                # Root component, dynamic layout
│   └── main.js                # App entry, registers Pinia & Router
├── server/                    # Backend source
│   ├── app.js                 # Express app entry (middleware, route mounting, server start)
│   ├── config/                # Config files (database pool, path helpers)
│   ├── controllers/           # Controllers (auth, forum, cloud, user, admin, etc.)
│   ├── services/              # Service layer (database query wrappers)
│   ├── middlewares/           # Middleware (JWT auth, error handler, file upload, last active updater)
│   ├── routes/                # Route definitions (auth, forum, cloud, user, admin)
│   ├── utils/                 # Utilities (JWT, bcrypt, pagination, encoding, etc.)
│   ├── db/                    # Database init scripts (sample SQL)
│   ├── uploads/               # File storage (avatars, covers, cloud files)
│   └── .env                   # Backend environment variables (not committed)
└── (other config files)
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22.19 (24.x recommended)
- **MySQL** ≥ 8.0
- **npm** or pnpm

### Installation & Configuration

1. **Clone the repository**

   ```bash
   git clone https://github.com/zshebjtzs/qdezJDS.git
   cd qdezJDS
   ```

2. **Install dependencies**

   ```bash
   # Frontend (root directory)
   npm install

   # Backend
   cd ./server
   npm install
   ```

3. **Configure the database**

   - Create a MySQL database, e.g. `qdez_JDS_db`, with `utf8mb4` charset.
   - Import the schema (includes default board data):

     ```bash
     mysql -u root -p qdez_JDS_db < server/db/init.sql
     ```

     > This script creates all business tables (users, posts, comments, replies, ban records, etc.) and inserts 10 default forum boards.

   - Create a `.env` file inside the `server/` directory (use `.env.example` as template) and fill in your credentials:

     ```env
     PORT=3001
     JWT_SECRET=your_super_secret_key_please_change
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_db_password
     DB_NAME=qdez_JDS_db
     ```

     > ⚠️ Change `JWT_SECRET` and `DB_PASSWORD` to strong, random values.

### Start Development Servers

Run both the backend and frontend:

```bash
# Terminal 1: start backend (inside server/ directory)
node app.js

# Terminal 2: start frontend dev server (project root)
npm run dev
```

Visit `http://localhost:5173` in your browser. The Vite dev server proxies API requests to the backend at `http://localhost:3001`.

---

## Default Accounts & Registration

There is **no public registration page**. Accounts must be created by an admin using one of the following methods:

### Option 1: REST Client (Recommended)

A `test-api.http` file is provided in the repository root (compatible with VS Code REST Client extension). Example request:

```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "department": "art",
  "role": "admin"
}
```

### Option 2: Direct Database Insert

Manually insert a row into the `users` table, ensuring the password is hashed with `bcrypt`.

### Pre‑configured Test Accounts (if the init script includes seed data)

| Username    | Password   | Department | Role       |
| ----------- | ---------- | ---------- | ---------- |
| `testuser1` | `123456`   | `art`      | `internal` |
| `admin`     | `admin123` | `art`      | `admin`    |

> ⚠️ Remove or change these default accounts before deploying to production.

---

## API Documentation

### Authentication

| Method | Endpoint              | Description                           | Permission    |
| ------ | --------------------- | ------------------------------------- | ------------- |
| POST   | `/api/auth/register`  | Register a new user                   | Public (admin intended) |
| POST   | `/api/auth/login`     | Login, returns JWT and user info      | Public        |

### User

| Method | Endpoint                  | Description                              | Permission     |
| ------ | ------------------------- | ---------------------------------------- | -------------- |
| GET    | `/api/user/:uid`          | View other user's public info            | Authenticated  |
| GET    | `/api/user/me/profile`    | Get own full profile                     | Authenticated  |
| PATCH  | `/api/user/me/username`   | Change username (3‑day cooldown)         | Authenticated  |
| PATCH  | `/api/user/me/password`   | Change password (requires old password)  | Authenticated  |
| PATCH  | `/api/user/me/profile`    | Update profile details                   | Authenticated  |
| POST   | `/api/user/me/avatar`     | Upload avatar                            | Authenticated  |
| POST   | `/api/user/me/cover`      | Upload cover image                       | Authenticated  |
| GET    | `/api/user/me/bans`       | Get own ban status                       | Authenticated  |

### Forum

For the full list of category, post, comment, and reply endpoints, please refer to `test-api.http` or inspect the Express routes at runtime.  
Key endpoints:

- Category list: `GET /api/forum/categories`
- Post list (paginated): `GET /api/forum/:slug/posts`
- Post detail: `GET /api/forum/:slug/posts/:postId`
- Create post: `POST /api/forum/:slug/posts`
- Comment list (paginated): `GET /api/forum/:slug/posts/:postId/comments`
- Create comment: `POST /api/forum/:slug/posts/:postId/comments`
- Reply list (paginated): `GET /api/forum/comments/:commentId/replies`
- Create reply: `POST /api/forum/comments/:commentId/replies`

### Admin

| Method | Endpoint                | Description                         | Permission  |
| ------ | ----------------------- | ----------------------------------- | ----------- |
| GET    | `/api/admin/users`      | User list (search, paginated)       | Admin       |
| GET    | `/api/admin/categories` | Category list                       | Admin       |
| POST   | `/api/admin/ban`        | Ban a user or board                 | Admin       |
| POST   | `/api/admin/unban`      | Unban a user                        | Admin       |
| POST   | `/api/admin/grant-mod`  | Grant moderator role                | Admin       |
| POST   | `/api/admin/revoke-mod` | Revoke moderator role               | Admin       |

---

## Database Schema

Core business tables have been significantly upgraded, including:

- **users**: Now includes UID, avatar, cover image, bio, contact info, theme color, password cooldown, last active timestamp, etc.
- **posts**: Added category reference, view count, reply/browse permission fields.
- **comments**: First‑level comments on posts.
- **replies**: Replies to comments, support nested threading (via `parent_reply_id`).
- **bans**: Ban records supporting post, cloud, and account ban types with expiry durations.
- **moderators**: Moderator assignment records.
- **post_views**: View records for deduplicated counting.
- **files**: Cloud drive file metadata.

Full SQL schema is available at `server/db/init.sql` .

---

## Deployment

### Production Build

1. **Build the frontend**

   ```bash
   npm run build
   ```

   Output is generated in the `dist/` folder.

2. **Backend deployment**

   - Ensure `.env` contains production‑grade credentials (strong JWT secret, HTTPS, etc.).
   - Use a process manager like `pm2`:

     ```bash
     npm install -g pm2
     pm2 start server/app.js --name qdez-backend
     ```

3. **Static file serving**

   Serve the `dist/` directory with a web server like Nginx, and configure a reverse proxy to forward `/api` requests to the backend.

### Recommended Environment Variables (Production)

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=production_grade_secret_key
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=qdez_JDS_db
```

> Always enable HTTPS and configure secure cookie flags.

---

## Security Notes

- **JWT secret**: Must be a long, random string (at least 32 characters).
- **Database credentials**: Stored exclusively in `.env`; never commit them.
- **HTTPS**: Enforce in production to protect tokens in transit.
- **File uploads**: Restrict file types and sizes, validate on the server to prevent malicious files.
- **Permissions**: Double‑guard sensitive endpoints with both frontend navigation guards and backend middleware.
- **Dependencies**: Regularly update to patch vulnerabilities.

---

## Contributing

Contributions are welcome! Please follow this workflow:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

All contributions are licensed under the MIT License.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

© 2026 Qingdao No.2 High School Mechatronics Society

---

## Acknowledgements

- Outstanding open‑source projects: Vue, Express, MySQL, Vditor, and many others.
- Architecture inspired by mature full‑stack templates on GitHub.
- Development efficiency boosted by the `deepseek-v4pro` API.
