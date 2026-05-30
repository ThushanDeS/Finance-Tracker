# Personal Finance & Budget Tracker

A full-stack web application built with React, Node.js, and MongoDB Atlas to track income, expenses, and budgets.

## Features
- **User Authentication:** Secure registration and login with JWT.
- **Transaction Management:** CRUD operations for income and expenses with filtering by date, category, and type.
- **Category Management:** Custom categories for both income and expenses with duplicate name prevention.
- **Budget Tracking:** Set monthly budgets for specific categories and view real-time progress with visual alerts.
- **Budget Notifications:** Real-time alerts in the navbar notification bell when spending exceeds budget limits.
- **Recurring Transactions:** Automate transaction creation with Weekly, Monthly, or Yearly frequency to save time on repetitive entries.
- **Dashboard:** Data-driven insights with charts (Recharts), budget progress indicators, and financial summaries.
- **API Documentation:** Interactive Swagger UI for exploring and testing all API endpoints.

## Tech Stack
- **Frontend:** React, Vite, Recharts, Axios, Lucide-React, Vanilla CSS (Modern Dark Theme).
- **Backend:** Node.js, Express, Mongoose, JWT, Bcrypt, Zod.
- **Database:** MongoDB Atlas.

## Setup Instructions

### 1. Prerequisites
- Node.js installed on your machine.
- A MongoDB Atlas account and connection URI.

### 2. Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `.env` file with your backend credentials:
   ```env
   MONGODB_URI=your_mongodb_atlas_uri_here
   JWT_SECRET=your_secret_key
   PORT=5000
   ```
4. Run the backend:
   ```bash
   npm run dev
   ```

### Credentials
The application does not ship with a shared login. Create your own user account through the registration page or the `/api/auth/register` endpoint, then log in with that email and password.

The backend also needs these environment credentials in `backend/.env`:
- `MONGODB_URI`: your MongoDB Atlas connection string
- `JWT_SECRET`: a strong secret used to sign authentication tokens
- `PORT`: the backend port, usually `5000`

### 3. Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend:
   ```bash
   npm run dev
   ```

### 4. Database Setup
Ensure your MongoDB Atlas cluster is running and your IP address is whitelisted in the Atlas Network Access settings.

## Running the Application

### Start Backend (Production)
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

### Start Backend (Development with Auto-reload)
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## API Documentation

### Swagger UI
Once the backend is running, access the interactive API documentation at:
```
http://localhost:5000/api-docs
```

The Swagger UI allows you to:
- View all available endpoints (Auth, Categories, Transactions, Budgets, Recurring, Reports)
- See request/response schemas with examples
- Test endpoints directly with your JWT token
- Understand authentication requirements

## Features in Detail

### Recurring Transactions
Create recurring transaction rules to automatically generate transactions on a schedule:
- **Frequencies:** Weekly, Monthly, Yearly
- **Auto-Creation:** Transactions are created automatically based on the set frequency
- **Management:** Edit, pause/resume, or delete recurring rules anytime
- **Access:** Navigate to **Recurring Transactions** in the sidebar after login

### Budget Notifications
Stay informed about your spending:
- **Real-time Alerts:** Notification bell in the navbar shows when you've exceeded a budget
- **Visual Indicators:** Red alert badge on the notification icon when overspent
- **Details:** Click the bell to see which categories are over budget
- **Auto-Refresh:** Updates automatically when new transactions are added

## Testing

### Backend Tests
```bash
cd backend
npm test
```

Includes tests for:
- Authentication and JWT validation
- Category duplicate name prevention
- Recurring transaction scheduling logic
- Budget calculations and overspend detection

### Frontend Tests
```bash
cd frontend
npm run test
```

Folder Structure
- `/backend`: Express server, models, routes, and middleware.
- `/frontend`: React application with components, pages, and context.
