# KSEB Dam Water Level Monitoring System

A full-stack web application for monitoring dam water levels.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MySQL

## Setup Instructions

### Backend
```bash
cd backend
npm install
# Create .env file with your credentials
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
Create a `.env` file in the backend folder:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dam_monitoring
JWT_SECRET=your_secret
```