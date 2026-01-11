# Limited Edition Sneaker Drop (Full Stack Assessment)

A high-concurrency e-commerce application designed to handle flash sales ("drops") with real-time inventory updates.

**Live Demo:** [https://sneaker-drop-frontend.vercel.app](https://sneaker-drop-frontend.vercel.app)

---

## 🚀 Features

*   **Real-time Inventory:** Stock updates instantly across all connected clients.
*   **Concurrency Handling:** Uses Database Transactions (Sequelize Managed Transactions) to prevent overselling (`race conditions`).
*   **Reservation System:** 60-second hold on items before purchase.
*   **Dockerized:** Fully containerized environment for easy setup.
*   **Cloud Ready:** Deployed on Vercel (Frontend & Backend) + NeonDB (Postgres).

---

## 🛠 Tech Stack

*   **Frontend:** React, Vite, TailwindCSS
*   **Backend:** Node.js, Express, Sequelize ORM
*   **Database:** PostgreSQL (NeonDB for Prod, Local Postgres for Dev)
*   **Real-time:** Socket.io (Dual-mode: WebSocket + Polling)

---

## ⚙️ Architecture & Design Decisions

### 1. Real-Time Strategy (WebSockets vs. Serverless)
This application runs on **Vercel**, which uses a Serverless architecture. Serverless functions are stateless and ephemeral, meaning they cannot maintain persistent WebSocket connections.

*   **Solution:** We implemented a **Hybrid Real-Time Strategy**.
    *   **In Development (Local/Docker):** The app uses standard **WebSockets** for maximum performance.
    *   **In Production (Vercel):** The app automatically switches to **Long-Polling** and includes a fail-safe data fetching interval. This ensures 100% reliability on serverless infrastructure without needing expensive external message brokers (like Redis).

### 2. Database Concurrency
To meet the assessment requirement of handling simultaneous requests, the backend uses **Sequelize Transactions** with `isolationLevel: SERIALIZABLE` during the reservation process. This ensures that if two users click "Reserve" at the exact same millisecond, only one transaction succeeds, preventing negative stock.

---

## 📦 How to Run

### Option A: Docker (Recommended)
The easiest way to run the full stack (Frontend + Backend + Database).

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/Asaduzzaman285/sneaker-drop-assessment.git
    cd sneaker-drop-assessment
    ```

2.  **Run Docker Compose:**
    ```bash
    docker-compose up --build
    ```

3.  **Access the App:**
    *   Frontend: [http://localhost:5173](http://localhost:5173)
    *   Backend: `http://localhost:4000`
    *   Database (GUI): `postgres://root:root@localhost:5433/sneaker_drop`

> **Note:** Docker Database uses port **5433** to avoid conflicts with any local Postgres you might have running.

### Option B: Local Manual Setup

1.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Create .env file with DATABASE_URL=postgres://user:pass@localhost:5432/sneaker_drop
    npm run dev
    ```

2.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## ⚠️ Engineering Challenges & My Solutions

This project simulates a high-traffic, real-time inventory system. I faced several non-trivial engineering challenges while building it. Here is how I solved them:

### 1️⃣ Preventing Overselling Under High Concurrency
*   **The Problem:** I realized that if multiple users attempted to reserve the last unit simultaneously, a simple application-level check (`if stock > 0`) creates a race condition, leading to overselling.
*   **My Solution:** I implemented **Database Transactions** with Sequelize. Crucially, I applied **Row-Level Locking** (`lock: t.LOCK.UPDATE`) on the specific drop entry during reservation. This ensures that once a transaction starts reading the stock, no other transaction can modify it until the first one completes.
*   **The Outcome:** The database is the single source of truth. Even if 100 requests hit the server at once, only one reservation succeeds.

### 2️⃣ Managing Temporary Reservations
*   **The Problem:** I needed to handle the scenario where users reserve an item but never complete the payment. I couldn't allow stock to remain locked indefinitely.
*   **My Solution:** I introduced a Reservation Lifecycle where every reservation has a `expires_at` timestamp (60 seconds). I wrote a background worker that periodically scans for expired reservations, marks them as `EXPIRED`, and atomically restores the stock to the main pool.
*   **The Outcome:** The inventory "heals" itself without human intervention, identifying dead locks and freeing up stock for other buyers.

### 3️⃣ Real-Time Synchronization
*   **The Problem:** Standard HTTP polling is inefficient for a flash-sale app where seconds matter. I needed all users to see stock changes instantly.
*   **My Solution:** I integrated **Socket.IO**. I configured the backend to emit domain events like `stock_update` and `purchase_completed`. On the frontend, I connected these consumers to the React state.
*   **The Outcome:** The application state is synchronized across all clients in milliseconds.

### 4️⃣ Deployment & Architecture (Vercel vs Docker)
*   **The Problem:** I faced a specific constraint with Vercel's serverless environment—it kills WebSocket connections because the functions are ephemeral.
*   **My Solution:** I designed a **Hybrid Architecture**:
    *   **On Local/Docker:** I use full **WebSockets** for maximum performance.
    *   **On Vercel:** I implemented a **Long-Polling Fallback** strategy. I also added a "heartbeat" intervals to the frontend to ensure data consistency even if the socket connection drops.
*   **The Outcome:** The app is robust. It takes advantage of modern persistent connections where possible (Docker) but remains 100% reliable on serverless infrastructure (Vercel).

### 5️⃣ Modeling Reservation vs Purchase
*   **The Problem:** Treating a reservation as just a "pending purchase" led to confusing logic regarding expiration and analytics.
*   **My Solution:** I chose to model them as **Separate Entities**. `Reservation` is a temporary lock mechanism; `Purchase` is a permanent financial record.
*   **The Outcome:** This separation enabled clean business logic. For example, the "Recent Activity" feed only listens to `Purchase` events, keeping the noise of abandoned reservations out of the UI.

---

## Database Schema

The system uses the following core tables:

### drops
- `id` (PK)
- `name`
- `total_stock`
- `available_stock`
- `created_at`

### reservations
- `id` (PK)
- `drop_id` (FK → drops.id)
- `user_id`
- `status` (ACTIVE | EXPIRED | COMPLETED)
- `expires_at`
- `created_at`

### purchases
- `id` (PK)
- `drop_id` (FK → drops.id)
- `user_id`
- `created_at`

### Schema Setup
- In **Docker**, tables are auto-created via Sequelize `sync()`.
- In **Local/Production**, Sequelize handles schema initialization automatically on server start.

## Demo

[Watch the demo on YouTube](https://www.youtube.com/watch?v=Eod_INae4IA)