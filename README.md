# Limited Edition Sneaker Drop

Full-stack application for managing high-traffic limited edition sneaker drops with real-time stock updates and atomic reservations.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL (Sequelize)
- **Real-time**: Socket.io

## Features
- **Real-Time Dashboard**: Live stock counts update instantly across all clients.
- **Atomic Reservations**: Prevents overselling using database transactions and locking.
- **Auto-Expiration**: Reservations expire after 60 seconds, returning stock to the pool.
- **Purchase Flow**: Secure purchase completion for reserved items.
- **Drop Management**: Create new drops via the dashboard.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd sneaker-drop
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your DATABASE_URL
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Architecture
- **Concurrency**: Handled via `LOCK.UPDATE` in Sequelize transactions to ensure atomic stock decrements.
- **Expiration**: A background worker runs every 5 seconds to check for expired reservations and release stock.
- **Real-time**: `Socket.io` broadcasts `stock_update` and `purchase_update` events to all connected clients.

## Deployment
This project is ready for deployment on Vercel (Frontend & Backend) and Neon (Database).
