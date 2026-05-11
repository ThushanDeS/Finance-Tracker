# Finance Tracker - Commit Guide (15 Commits)

Follow these commits in order to build the project incrementally. Each commit is atomic and easy to understand.

---

## Commit 1: Initial Project Setup
**Message:** `init: Initialize React + Node.js project structure`

**Description:** Set up the basic project structure with React (Vite) frontend and Express backend.

**Files:**
- `backend/package.json`
- `backend/server.js` (basic server setup)
- `frontend/package.json`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx` (basic component)
- `README.md` (initial)

**Commands:**
```bash
git add backend/package.json backend/server.js frontend/package.json frontend/src/main.jsx frontend/src/App.jsx README.md
git commit -m "init: Initialize React + Node.js project structure"
```

---

## Commit 2: Database Configuration and Models
**Message:** `feat: Add MongoDB connection and core data models`

**Description:** Set up MongoDB connection config and create User, Category, Transaction, and Budget models.

**Files:**
- `backend/config/db.js`
- `backend/models/User.js`
- `backend/models/Category.js`
- `backend/models/Transaction.js`
- `backend/models/Budget.js`
- `.env.example`

**Commands:**
```bash
git add backend/config/db.js backend/models/ .env.example
git commit -m "feat: Add MongoDB connection and core data models"
```

---

## Commit 3: User Authentication - Backend
**Message:** `feat: Implement JWT authentication with register and login endpoints`

**Description:** Add JWT-based authentication, bcrypt password hashing, and auth middleware.

**Files:**
- `backend/middleware/auth.js`
- `backend/routes/auth.js`
- `backend/config/db.js` (updated with user model connection)
- `.env.example` (add JWT_SECRET)

**Commands:**
```bash
git add backend/middleware/auth.js backend/routes/auth.js
git commit -m "feat: Implement JWT authentication with register and login endpoints"
```

---

## Commit 4: Category Management API
**Message:** `feat: Add category CRUD operations with duplicate prevention`

**Description:** Create category endpoints with unique name validation per user to prevent duplicates.

**Files:**
- `backend/routes/categories.js`
- `backend/models/Category.js` (updated with unique index)

**Commands:**
```bash
git add backend/routes/categories.js backend/models/Category.js
git commit -m "feat: Add category CRUD operations with duplicate prevention"
```

---

## Commit 5: Transaction Management API
**Message:** `feat: Implement transaction CRUD with filtering by date and category`

**Description:** Add comprehensive transaction endpoints with date range and category filtering.

**Files:**
- `backend/routes/transactions.js`
- `backend/models/Transaction.js` (updated)

**Commands:**
```bash
git add backend/routes/transactions.js backend/models/Transaction.js
git commit -m "feat: Implement transaction CRUD with filtering by date and category"
```

---

## Commit 6: Budget Tracking API
**Message:** `feat: Add budget management with monthly progress tracking`

**Description:** Create budget endpoints with real-time spending calculation for monthly budgets.

**Files:**
- `backend/routes/budgets.js`
- `backend/models/Budget.js` (updated)

**Commands:**
```bash
git add backend/routes/budgets.js backend/models/Budget.js
git commit -m "feat: Add budget management with monthly progress tracking"
```

---

## Commit 7: Basic Frontend Structure
**Message:** `feat: Set up React components structure with routing`

**Description:** Initialize React Router, basic layout, and authentication context.

**Files:**
- `frontend/src/App.jsx` (with routing)
- `frontend/src/components/Navbar.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/App.css`
- `frontend/src/index.css`

**Commands:**
```bash
git add frontend/src/App.jsx frontend/src/components/ frontend/src/context/ frontend/src/pages/ frontend/src/*.css
git commit -m "feat: Set up React components structure with routing"
```

---

## Commit 8: Authentication UI Pages
**Message:** `feat: Implement login and registration pages`

**Description:** Create user-friendly login/register forms with form validation and error handling.

**Files:**
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/api/api.js` (Axios setup with JWT interceptor)

**Commands:**
```bash
git add frontend/src/pages/Login.jsx frontend/src/pages/Register.jsx frontend/src/api/api.js
git commit -m "feat: Implement login and registration pages"
```

---

## Commit 9: Category Management UI
**Message:** `feat: Add categories page with inline editing and duplicate blocking`

**Description:** Create categories UI with inline edit, delete, and duplicate name prevention alerts.

**Files:**
- `frontend/src/pages/Categories.jsx`

**Commands:**
```bash
git add frontend/src/pages/Categories.jsx
git commit -m "feat: Add categories page with inline editing and duplicate blocking"
```

---

## Commit 10: Transaction Management UI
**Message:** `feat: Implement transactions page with filtering and date selection`

**Description:** Create transactions UI with date range picker, category filter, and transaction list.

**Files:**
- `frontend/src/pages/Transactions.jsx`

**Commands:**
```bash
git add frontend/src/pages/Transactions.jsx
git commit -m "feat: Implement transactions page with filtering and date selection"
```

---

## Commit 11: Budget Tracking UI
**Message:** `feat: Add budgets page with progress indicators`

**Description:** Create budgets management UI with visual progress bars for spending limits.

**Files:**
- `frontend/src/pages/Budgets.jsx`

**Commands:**
```bash
git add frontend/src/pages/Budgets.jsx
git commit -m "feat: Add budgets page with progress indicators"
```

---

## Commit 12: Dashboard with Charts
**Message:** `feat: Create dashboard with spending overview and financial insights`

**Description:** Build dashboard with Recharts visualizations showing income/expense breakdown and trends.

**Files:**
- `frontend/src/pages/Dashboard.jsx` (updated with charts)
- `frontend/src/pages/Profile.jsx`

**Commands:**
```bash
git add frontend/src/pages/Dashboard.jsx frontend/src/pages/Profile.jsx
git commit -m "feat: Create dashboard with spending overview and financial insights"
```

---

## Commit 13: Budget Notifications System
**Message:** `feat: Add real-time budget overspend notifications in navbar`

**Description:** Implement notification bell in navbar showing budget alerts when spending exceeds limits with auto-refresh.

**Files:**
- `frontend/src/components/Navbar.jsx` (updated with notification bell)
- `frontend/src/api/api.js` (updated with response interceptor)
- `frontend/src/index.css` (updated with scrollbar fix)

**Commands:**
```bash
git add frontend/src/components/Navbar.jsx frontend/src/api/api.js frontend/src/index.css
git commit -m "feat: Add real-time budget overspend notifications in navbar"
```

---

## Commit 14: Recurring Transactions Feature
**Message:** `feat: Implement recurring transactions with Weekly/Monthly/Yearly automation`

**Description:** Add recurring transaction model, scheduler service, API endpoints, and UI page for managing recurring rules.

**Files:**
- `backend/models/RecurringTransaction.js`
- `backend/services/recurringScheduler.js`
- `backend/services/recurringUtils.js`
- `backend/routes/recurringTransactions.js`
- `frontend/src/pages/RecurringTransactions.jsx`
- `frontend/src/App.jsx` (add recurring route)

**Commands:**
```bash
git add backend/models/RecurringTransaction.js backend/services/ backend/routes/recurringTransactions.js frontend/src/pages/RecurringTransactions.jsx frontend/src/App.jsx
git commit -m "feat: Implement recurring transactions with Weekly/Monthly/Yearly automation"
```

---

## Commit 15: API Documentation with Swagger UI
**Message:** `docs: Add Swagger UI documentation for all API endpoints`

**Description:** Integrate Swagger/OpenAPI documentation for complete API visibility and testing.

**Files:**
- `backend/config/swagger.js` (updated with recurring endpoints)
- `backend/routes/recurringTransactions.js` (add JSDoc comments)
- `backend/server.js` (swagger setup already in place)
- `README.md` (add API docs section)

**Commands:**
```bash
git add backend/config/swagger.js backend/routes/recurringTransactions.js README.md
git commit -m "docs: Add Swagger UI documentation for all API endpoints"
```

---

## Optional: Add Tests
**Message:** `test: Add backend and frontend test suites`

**Files:**
- `backend/tests/`
- `frontend/src/tests/`

**Commands:**
```bash
git add backend/tests/ frontend/src/tests/
git commit -m "test: Add backend and frontend test suites"
```

---

## How to Create the Repository

1. **Initialize Git:**
```bash
cd C:\1\Finance Tracker
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

2. **Create .gitignore:**
```bash
# Create .gitignore file (add node_modules, .env, etc.)
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "dist/" >> .gitignore
echo ".DS_Store" >> .gitignore
echo "*.log" >> .gitignore

git add .gitignore
git commit -m "chore: Add .gitignore"
```

3. **Follow the 15 commits above in order**

4. **Push to GitHub:**
```bash
git branch -M main
git remote add origin https://github.com/your-username/finance-tracker.git
git push -u origin main
```

---

## Tips
- Each commit should be small and focused on one feature/fix
- Test each commit locally before moving to the next
- Use `git log --oneline` to see your commit history
- If you make a mistake, use `git reset --soft HEAD~1` to undo the last commit and keep changes
