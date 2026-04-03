# SWE40006_noteAppProject
# 📝 NoteFlow — DevOps Pipeline Project

> A full-stack web-based noting application built and deployed through a Level 1 DevOps CI/CD pipeline using GitHub, GitHub Actions, and Docker.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started — Run from Scratch](#getting-started--run-from-scratch)
- [Daily Usage](#daily-usage)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Pipeline Architecture](#pipeline-architecture)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

NoteFlow is a CRUD web application that allows users to create, read, update, and delete personal notes. It serves as the practical application deployed through a 4-stage DevOps pipeline:

| Stage | Tool | Role |
|-------|------|------|
| 1 — Code Repository | GitHub | Source code version control |
| 2 — CI / Build | GitHub Actions | Automated build & Docker image creation |
| 3 — Test | GitHub Actions | Automated unit & API tests |
| 4 — Production | Docker Container | Live running application |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Container | Docker |
| CI/CD | GitHub Actions |
| Repository | GitHub |

---

## Prerequisites

Make sure you have the following installed before starting:

| Tool | Download | Check |
|------|----------|-------|
| **Node.js** (LTS) | [nodejs.org](https://nodejs.org/en/download) | `node --version` |
| **Git** | [git-scm.com](https://git-scm.com/download/win) | `git --version` |
| **Docker Desktop** | [docker.com](https://docs.docker.com/desktop/install/windows-install/) | `docker --version` |
| **VS Code** | [code.visualstudio.com](https://code.visualstudio.com/) | — |

> ⚠️ On Windows, make sure Node.js is added to PATH during installation.

---

## Getting Started — Run from Scratch

Follow these steps **once** to set up the project on a new machine.

### Step 1 — Clone the Repository

Open PowerShell or Git Bash:

```bash
git clone https://github.com/YOUR_USERNAME/SWE40006_noteAppProject.git
cd SWE40006_noteAppProject
```

### Step 2 — Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 3 — Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 4 — Start Docker Desktop

- Search **Docker Desktop** in the Windows Start menu and open it
- Wait until the whale 🐳 icon in the taskbar is **steady** (not animating)
- This means Docker is ready

### Step 5 — Build and Run with Docker

```bash
docker compose up --build
```

> The first build takes **5–10 minutes** as it compiles dependencies and builds the React app.
> Subsequent runs are much faster.

### Step 6 — Open the App

Once you see:
```
✔ Container swe40006_noteappproject-noteflow-1  Started
```

Open your browser and go to:
```
http://localhost:5000
```

NoteFlow is now live! ✅

---

## Daily Usage

Once the project is set up, your daily workflow is:

### Start the app
```bash
# 1. Open Docker Desktop and wait for it to be ready
# 2. In the project folder:
docker compose up
```

### Stop the app
```bash
# Press Ctrl+C in the terminal, then:
docker compose down
```

### After making code changes
```bash
docker compose up --build
```

> ⚠️ Never run `npm start` and `docker compose up` at the same time — they both use port 5000.

---

## Running Tests

Tests run on the backend API using **Jest** and **Supertest**.

```bash
cd backend
npm test
```

Expected output:
```
PASS tests/notes.test.js
  Notes API
    ✓ GET /health returns OK
    ✓ POST /api/notes creates a note
    ✓ GET /api/notes returns list
    ✓ PUT /api/notes/:id updates a note
    ✓ DELETE /api/notes/:id deletes a note
    ✓ POST /api/notes returns 400 if fields missing

Tests: 6 passed, 6 total
```

---

## Project Structure

```
SWE40006_noteAppProject/
├── .github/
│   └── workflows/
│       └── pipeline.yml        # GitHub Actions CI/CD pipeline
├── backend/
│   ├── routes/
│   │   └── notes.js            # API route handlers
│   ├── tests/
│   │   └── notes.test.js       # Automated test suite
│   ├── data/                   # SQLite database (auto-created)
│   ├── database.js             # Database connection & schema
│   ├── server.js               # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   └── App.css             # Styles
│   └── package.json
├── .dockerignore
├── .gitignore
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Docker build instructions
└── README.md
```

---

## Pipeline Architecture

```
Developer pushes code to GitHub
            │
            ▼
┌─────────────────────┐
│  Stage 1            │
│  Code Repository    │  ← GitHub stores code & triggers pipeline
│  (GitHub)           │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Stage 2            │
│  CI / Build Server  │  ← GitHub Actions builds Docker image
│  (GitHub Actions)   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Stage 3            │
│  Test Server        │  ← Jest runs all automated tests
│  (GitHub Actions)   │
└────────┬────────────┘
         │  (only if all tests pass)
         ▼
┌─────────────────────┐
│  Stage 4            │
│  Production Server  │  ← Docker container serves live app
│  (Docker)           │
└─────────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Register new user and set auth cookie |
| POST | `/api/auth/login` | Login user and set auth cookie |
| POST | `/api/auth/logout` | Logout user and clear auth cookie |
| GET | `/api/auth/me` | Get currently authenticated user |
| GET | `/api/notes` | Get all notes |
| GET | `/api/notes/:id` | Get a single note |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

---

## Troubleshooting

### `npm` is not recognized
Node.js is not in your PATH. Reinstall Node.js from [nodejs.org](https://nodejs.org) and make sure **"Add to PATH"** is ticked during installation. Then restart VS Code.

### Port 5000 already in use
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill it using the PID shown
taskkill /PID <PID_NUMBER> /F
```

### Docker not starting
- Make sure Docker Desktop is open and the whale icon is steady
- Try restarting Docker Desktop
- Run `net stop winnat && net start winnat` if ports are stuck

### Container keeps restarting
```bash
# Full clean rebuild
docker compose down
docker system prune -a -f
docker volume rm swe40006_noteappproject_noteflow_data
docker compose build --no-cache
docker compose up
```

### Tests failing locally
```bash
cd backend
rm -rf node_modules
npm install
npm test
```

---

## License

This project is developed for academic purposes — SWE40006 Software Deployment and Evolution.
