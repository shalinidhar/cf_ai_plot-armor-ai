# -- Plot Armor AI -- 
A full-stack story continuity assistant. Use AI to scan your drafts against your "Story Bible" to find plot holes and character contradictions before they reach your readers.

# Project Structure
This is a monorepo containing both the frontend and backend services:

/client: React frontend powered by Vite and styled with Tailwind CSS v4.

/server: Backend API powered by Hono running on Cloudflare Workers.

# Tech Stack
Frontend: React, Vite, Tailwind CSS v4, Lucide React (Icons)

Backend: Hono, Cloudflare Workers, Cloudflare Workflows

AI: Llama 3.3 70B (via Cloudflare Workers AI)

Database: Cloudflare D1 (SQLite)

# Getting Started
1. Prerequisites
Node.js (v18 or higher)

Cloudflare Wrangler (for backend development)

2. Installation
Install dependencies for both the frontend and backend:

Bash
# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd ../server && npm install
3. Local Development
You will need two terminal windows open to run the full stack:

Terminal 1: Frontend (Vite)

Bash
cd client
npm run dev
Runs at: http://localhost:5173

Terminal 2: Backend (Hono/Wrangler)

Bash
cd server
npx wrangler dev
Runs at: http://localhost:8787

# Configuration
Frontend Proxy
The Vite dev server is configured in client/vite.config.ts to proxy all /api requests to the Hono server at 127.0.0.1:8787 to avoid CORS issues during development.

Database (Cloudflare D1)
The backend uses a D1 database for logging. To initialize your local database:

Bash
cd server
npx wrangler d1 execute plot_armor_db --local --command="CREATE TABLE IF NOT EXISTS plot_hole_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, analysis TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
# Deployment
Backend (Workers)
Login to Cloudflare: npx wrangler login

Deploy the worker: cd server && npx wrangler deploy

Frontend (Pages)
Build the project: cd client && npm run build

Deploy to Cloudflare Pages:

Bash
npx wrangler pages deploy dist --project-name plot-armor-ai

