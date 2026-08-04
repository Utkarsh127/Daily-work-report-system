# Daily Work Report System (WRS)

A production-ready MERN Stack application for employees to log daily work reports and managers to monitor team performance, view analytics, and export CSVs.

## Features

### Employee
- **Dashboard**: Real-time KPI summaries for current week.
- **Submit Report**: Same-day report logging (tasks, hours, status, mood, blockers, notes).
- **Edit/Delete**: Ability to edit or delete today's report.
- **My Reports**: Paginated view of historical reports.
- **Profile**: Update personal information, avatar, and password.

### Manager
- **Dashboard**: High-level KPIs (Total employees, today's reporting rate, avg hours).
- **Employee Management**: CRUD operations for employees (Create, Edit, Deactivate).
- **Weekly & Monthly Reports**: Detailed aggregation views by employee.
- **Analytics**: Recharts visualizations of daily reporting hours and trends.
- **Export**: CSV export for selected reporting periods.

## Architecture
- **Backend (server/)**: MVC structure, MongoDB (Mongoose), Express (Node.js), JSON Web Tokens (localStorage approach), bcryptjs. Rate-limited and validated via express-validator. Open API documented.
- **Frontend (client/)**: React 19, Vite, Tailwind CSS v3, Redux Toolkit, React Router DOM v7. 

## Getting Started

### Backend Setup
1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your MongoDB URI and a JWT secret.
4. Seed the database (creates 1 manager, 3 employees, and sample reports):
   `npm run seed`
5. Start backend:
   `npm run dev` (Runs on `http://localhost:5000`)

### Frontend Setup
1. `cd client`
2. `npm install`
3. Start frontend:
   `npm run dev` (Runs on `http://localhost:5173`)

### Demo Credentials
- **Manager**: `manager@wrs.local` / `Manager@123`
- **Employee**: `alice@wrs.local` / `Employee@123`

## API Documentation
Once the server is running, visit:
`http://localhost:5000/api-docs`

## Scripts
- **Server**:
  - `npm start`: Start production server
  - `npm run dev`: Start nodemon dev server
  - `npm run seed`: Run the database seed script
- **Client**:
  - `npm run dev`: Start Vite dev server
  - `npm run build`: Build for production
  - `npm run preview`: Preview production build
