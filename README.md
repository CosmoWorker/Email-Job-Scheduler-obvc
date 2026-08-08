<div align="center">

  <h1>OBVC Email Scheduler</h1>

  <p>
    A full-stack email scheduling application.
  </p>

  <p>
    <a href="https://react.dev/">
      <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge" alt="React" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge" alt="Node.js" />
    </a>
    <a href="https://bullmq.io/">
      <img src="https://img.shields.io/badge/Queue-BullMQ-FF3366?style=for-the-badge" alt="BullMQ" />
    </a>
    <a href="https://redis.io/">
      <img src="https://img.shields.io/badge/Cache-Redis-DC382D?style=for-the-badge" alt="Redis" />
    </a>
    <a href="https://postgresql.org/">
      <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge" alt="PostgreSQL" />
    </a>
    <a href="https://docker.com/">
      <img src="https://img.shields.io/badge/Infra-Docker-2496ED?style=for-the-badge" alt="Docker" />
    </a>
  </p>

</div>

<hr />

## Table of Contents
**1. [Technical Architecture](#1-technical-architecture)<br>
2. [Features](#2-features)<br>
3. [Local Setup](#3-local-setup)<br>
4. [How it Works](#4-how-it-works)<br>**

---

## 1. Technical Architecture

```mermaid
flowchart TD
    UI["Frontend\nReact UI"] -- "POST /jobs/schedule" --> API["Backend API\nExpress"]
    API -- "Save email job" --> DB[("PostgreSQL\n(Drizzle ORM)")]
    API -- "Enqueue with delay" --> Redis[("Redis\nBullMQ")]
    
    Redis -- "Consume job\n(Rate limited)" --> Worker["Worker Node\n(BullMQ)"]
    
    Worker -- "Check sender hourly quota" --> Redis
    Worker -- "Update status (sent/failed)" --> DB
    Worker -- "Send email" --> SMTP["SMTP Server\n(Nodemailer)"]

    style UI fill:#3b82f6,color:#fff,stroke:#2563eb,stroke-width:2px
    style API fill:#10b981,color:#fff,stroke:#059669,stroke-width:2px
    style DB fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:2px
    style Redis fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px
    style Worker fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:2px
    style SMTP fill:#64748b,color:#fff,stroke:#475569,stroke-width:2px
```

## 2. Features

- **Email Scheduling:** Compose emails and pick exact dates/times for them to be sent in future.
- **Global Rate Limiting:** Enforces a minimum delay (e.g., 2 seconds) between every sent email across the system.
- **Hourly Quotas:** It tracks & limits how many emails a specific sender can dispatch per hour (e.g., 200/hr max).
- **Background Processing:** A service based worker architecture ensures that the API calls are fast while heavy email sending happens in the background.
- **Dockerized Environment:** The entire stack (Frontend, Backend API, Worker, Redis, Postgres) is orchestrated via Docker Compose for easy local development and testing.

## 3. Local Setup

### Prerequisites
- Docker and Docker Compose
- Node.js (v24+) & pnpm (for local development/tooling)

### Environment Variables
The project uses a `.env` file for configuration. Copy the provided `.env.example` to get started:

```bash
cp .env.example .env
```

This configuration file controls several key areas of the application:
- **Database & Cache:** `DATABASE_URL` and `REDIS_URL` used by the API and Worker to connect to the backing services.
- **SMTP Credentials:** `ETHEREAL_*` variables where you place your mock SMTP credentials generated from [Ethereal Email](https://ethereal.email) to safely test sending.
- **Rate Limiters:** Adjust `MIN_DELAY_MS` (delay between consecutive emails) and `MAX_EMAILS_PER_HOUR` (hourly quota per sender) to control the throughput of the background worker.

### Start the Stack
Bring up the all the services using Docker Compose. This spins up the Postgres database, Redis, backend API, frontend React app, and the background worker.

```bash
docker compose up --build
```

### Push Database Schema
Once the containers are running and healthy, open a new terminal tab and apply the database schema so the tables are created in Postgres:

```bash
docker compose exec backend pnpm run db:push
```

### Access the Application
- **Frontend UI:** Navigate to `http://localhost:5173`
- **Backend API:** Running on `http://localhost:3000`

## 4. How it Works

### How Scheduling Works
When an email is scheduled via the frontend, the backend computes the delay in milliseconds (`scheduledTime - currentTime`). The job is then inserted into BullMQ with this `delay` parameter. BullMQ holds onto the job in Redis until the delay expires, after which the Worker picks it up for processing.

### Persistence on Restart
The system makes sure no emails are lost during crashes or restarts:
1. **PostgreSQL Data Volume:** All email metadata, recipient info, and statuses (`scheduled`, `sent`, `failed`) are stored in Postgres, backed by a persistent Docker named volume (`local_postgres_data`).
2. **BullMQ State:** Jobs in the queue are managed by Redis. If the Node.js worker crashes or is restarted, it will automatically reconnect to Redis and resume processing exactly where it left off, including following the active rate limits.

### Rate Limiting & Concurrency
Rate limiting is handled at two distinct layers inside the Worker:
1. **Per-Email Delay (BullMQ Limiter):** The worker uses BullMQ's native `limiter: { max: 1, duration: MIN_DELAY_MS }` configuration. This makes sure that regardless of how many emails are queued, the worker pauses for `MIN_DELAY_MS` between each email send.
2. **Hourly Sender Limits (Redis Keys):** Before sending, the worker increments a Redis key tied to the sender and the current hour (e.g., `sender:123:2024-08-08T15`). If the count exceeds `MAX_EMAILS_PER_HOUR`, the worker aborts the send and automatically re-enqueues the job to be processed at the start of the next hour.
3. **Concurrency:** Configured via `WORKER_CONCURRENCY`, determining how many jobs the worker will process simultaneously/concurrently.