# TaskFlow - Full-Stack Trello Clone

> **Software Engineer Intern - Technical Assignment**  
> A production-ready, full-stack Trello-like task management application built with **Next.js (App Router)**, **Express.js**, and **MongoDB**.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack & Rationale](#-technology-stack--rationale)
3. [Core Features & Role-Based Permissions](#-core-features--role-based-permissions)
4. [Architecture & Project Structure](#-architecture--project-structure)
5. [Pre-Seeded Login Credentials](#-pre-seeded-login-credentials)
6. [Local Setup & Installation](#-local-setup--installation)
7. [Environment Variables](#-environment-variables)
8. [RESTful API Documentation](#-restful-api-documentation)
9. [Deployment Information](#-deployment-information)

---

## 📌 Project Overview

TaskFlow is an intuitive, collaborative task management platform that implements a 3-column Kanban board (**To Do**, **Doing**, **Done**) with persistent HTML5 drag-and-drop mechanics, role-based access controls, interactive task comments, and real-time activity audit logging.

The system strictly enforces separation of concerns:
- **Backend (`/backend`)**: A secure RESTful API built on Express.js and Mongoose with JWT authentication and granular role validation.
- **Frontend (`/frontend`)**: A responsive client application built on Next.js 15, React 19, and Tailwind CSS.

---

## 🛠 Technology Stack & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15 (App Router)** + **React 19** | Fast SSR/SSG rendering, modular routing, modern React hooks, and optimized static asset delivery. |
| **Styling** | **Tailwind CSS** + **Lucide Icons** | Utility-first responsive design, consistent design tokens, and lightweight icons. |
| **Backend** | **Node.js** + **Express.js** | Lightweight, high-throughput REST API with robust middleware pipelines. |
| **Database** | **MongoDB** + **Mongoose ODM** | Flexible document modeling for tasks with embedded comments, activity logs, and ObjectId relations. |
| **Auth & Security** | **JWT (jsonwebtoken)** + **Bcrypt.js** | Stateless authentication tokens with industry-standard password hashing (10 salt rounds). |

---

## 🔐 Core Features & Role-Based Permissions

### 1. Distinct User Roles
* **Normal User (`user`)**:
  - Register and log in.
  - Create new tasks (unassigned or assigned to themselves).
  - **Self-Claim Only**: Can only assign eligible unassigned tasks to **themselves**. Cannot reassign tasks between other users.
  - Manage their own tasks (edit title/description, change status, move across columns).
  - View discussions and add/delete their own comments.
* **Administrator (`admin`)**:
  - Created exclusively via **Database Seeding (`npm run seed`)** rather than open registration.
  - View all tasks across the entire team on the Kanban board.
  - Complete control over task assignments (assign, reassign between any users, or unassign).
  - Dedicated **Admin User Management Dashboard (`/admin`)** to promote/demote user roles and delete accounts.

### 2. Task Management & Columns
- **3 Status Columns**: Exactly **To Do**, **Doing**, **Done**.
- **Task Schema**: `title`, `description`, `status`, `priority` (`low`, `medium`, `high`), `dueDate`, `creator`, `assignedUser`, `comments`, `activities`, and `timestamps`.
- **Drag-and-Drop Persistence**: Smooth dragging between columns with immediate MongoDB persistence.

### 3. Collaboration & Audit Trail
- **Card Discussions**: Team comments with author badges, relative timestamps, and author deletion rights.
- **Automated Activity Log**: Automatic chronological audit history tracking who created, moved, assigned, edited, or commented on each task.

---

## 📁 Architecture & Project Structure

```text
taskflow/
├── backend/                  # Express.js REST API
│   ├── config/
│   │   └── db.js             # MongoDB connection with error recovery
│   ├── controllers/
│   │   ├── authController.js # Register, login, getMe
│   │   ├── taskController.js # CRUD, status transition, assignment rules, comments
│   │   └── userController.js # User list, role management, user deletion
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT verification & session validation
│   │   └── adminMiddleware.js# 403 Forbidden role gate for admin actions
│   ├── models/
│   │   ├── Task.js           # Task schema (embedded comments & activities)
│   │   └── User.js           # User schema (name, email, password, role)
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth
│   │   ├── taskRoutes.js     # /api/tasks
│   │   └── userRoutes.js     # /api/users
│   ├── scripts/
│   │   ├── seed.js           # Database seeder (Admin + Users + Tasks)
│   │   └── testEndpoints.js  # Automated endpoint test suite
│   ├── .env                  # Backend environment configuration
│   └── server.js             # Application entry point (Port 5001)
│
├── frontend/                 # Next.js App Router Application
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/        # Login page
│   │   │   └── register/     # Registration page
│   │   ├── admin/            # Admin User Management page
│   │   ├── board/            # Interactive Kanban Board
│   │   ├── globals.css       # Tailwind CSS directives
│   │   ├── layout.jsx        # Root layout with AuthProvider & Navbar
│   │   └── page.jsx          # Landing page & smart redirector
│   ├── components/
│   │   ├── Navbar.jsx        # Global navigation with role badges
│   │   ├── TaskCard.jsx      # Kanban task card with claim button & comment badge
│   │   ├── TaskDetailModal.jsx # Full discussion thread & activity history modal
│   │   └── TaskModal.jsx     # Create & edit task dialog
│   ├── context/
│   │   └── AuthContext.jsx   # Global JWT auth state & profile hydration
│   ├── lib/
│   │   └── api.js            # Axios client with Bearer token interceptor
│   └── .env.local            # Frontend environment configuration
│
└── README.md
```

---

## 🔑 Pre-Seeded Login Credentials

Run `npm run seed` in the `backend/` folder to populate the database with these default accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@taskflow.com` | `Admin@123456` | Full system access, reassign any task, view all tasks, user management. |
| **Normal User 1** | `john@taskflow.com` | `User@123456` | Standard user, create tasks, claim unassigned tasks, manage own tasks. |
| **Normal User 2** | `jane@taskflow.com` | `User@123456` | Standard user, create tasks, claim unassigned tasks, manage own tasks. |

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **MongoDB**: Local MongoDB service running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/aliafrash/TaskFlow-Trello-Clone.git
cd TaskFlow-Trello-Clone
```

---

### Step 2: Configure & Start Backend
```bash
cd backend
npm install

# Run database seeder to create Admin and sample tasks
npm run seed

# Run automated tests
npm test

# Start backend development server (Runs on port 5001)
npm run dev
```

---

### Step 3: Configure & Start Frontend
```bash
cd ../frontend
npm install

# Start frontend development server (Runs on port 3000)
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=your_super_secret_random_jwt_key_here
JWT_EXPIRES_IN=7d
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## 📡 RESTful API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new normal user account.
- `POST /api/auth/login` - Authenticate and receive a JWT token.
- `GET /api/auth/me` - *(Protected)* Get the current authenticated user profile.

### Tasks (`/api/tasks`)
- `GET /api/tasks` - *(Protected)* Get list of tasks (filtered by user role).
- `POST /api/tasks` - *(Protected)* Create a new task.
- `GET /api/tasks/:id` - *(Protected)* Get single task details.
- `PUT /api/tasks/:id` - *(Protected)* Update task details.
- `PATCH /api/tasks/:id/status` - *(Protected)* Move task between columns (`todo`, `doing`, `done`).
- `PATCH /api/tasks/:id/assign` - *(Protected)* Assign task (Normal users: claim only; Admin: reassign).
- `DELETE /api/tasks/:id` - *(Protected)* Delete task (Creator or Admin).
- `POST /api/tasks/:id/comments` - *(Protected)* Add comment to task.
- `DELETE /api/tasks/:id/comments/:commentId` - *(Protected)* Delete comment (Author or Admin).

### Users (`/api/users`)
- `GET /api/users` - *(Protected)* List all team members (for task assignment).
- `GET /api/users/:id` - *(Protected)* Get user profile by ID.
- `PATCH /api/users/:id/role` - *(Admin Only)* Update a user's role (`user` / `admin`).
- `DELETE /api/users/:id` - *(Admin Only)* Delete a user account.

---

## 🌐 Deployment Information

### Recommended Deployment Platforms:
1. **Frontend**: Deploy on [Vercel](https://vercel.com) by pointing to the `frontend/` directory with `NEXT_PUBLIC_API_URL` environment variable pointing to the deployed backend URL.
2. **Backend**: Deploy on [Render](https://render.com) or [Railway](https://railway.app) by setting root directory to `backend/` and providing `MONGO_URI`, `JWT_SECRET`, and `PORT`.
3. **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with IP whitelist set to allow all incoming connections (`0.0.0.0/0`).

---

## 📄 License
This project is open-sourced under the MIT License.
