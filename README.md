# Full-Stack Application

This is a full-stack application with React frontend and Node.js/Express backend.

## Project Structure

```
.
├── frontend/          # React frontend application
│   ├── src/          # Source files
│   ├── package.json  # Frontend dependencies
│   └── tsconfig.json # TypeScript configuration
│
└── backend/          # Node.js/Express backend
    ├── src/          # Source files
    ├── package.json  # Backend dependencies
    └── tsconfig.json # TypeScript configuration
```

## Prerequisites

- Node.js (v16 or higher)
- Yarn (v1.22.22)

## Getting Started

### Initial Setup

1. Install Yarn using the official installer:
   - Windows: Download and run the installer from https://classic.yarnpkg.com/latest.msi
   - macOS: `brew install yarn`
   - Linux: Follow instructions at https://classic.yarnpkg.com/en/docs/install/#debian-stable

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn start
   ```
   The frontend will be available at http://localhost:3000

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Create a `.env` file in the backend directory with the following content:

   ```
   PORT=3001
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```
   The backend will be available at http://localhost:3001

## Development

- Frontend runs on port 3000
- Backend runs on port 3001
- The backend API is configured to accept requests from the frontend through CORS

## Project Rules

1. Use yarn instead of npm for package management
2. Only comment on code functionality, not implementation details
3. Backend imports should use CommonJS require syntax: `const n = require("")`

## Yarn Commands

### Frontend

- `yarn start`: Start development server
- `yarn build`: Build for production
- `yarn test`: Run tests
- `yarn eject`: Eject from Create React App

### Backend

- `yarn dev`: Start development server with hot reload
- `yarn start`: Start production server
- `yarn build`: Build TypeScript files
- `yarn test`: Run tests

## Note on Yarn Configuration

Each part of the application (frontend and backend) has its own independent Yarn configuration:

- Frontend: `frontend/.yarnrc.yml`
- Backend: `backend/.yarnrc.yml`

This allows for:

- Independent dependency management
- Separate yarn.lock files
- Isolated node_modules directories
