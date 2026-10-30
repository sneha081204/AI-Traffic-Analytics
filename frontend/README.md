# 💻 AI Traffic Analytics - React Frontend Client

A decoupled **React 18 + Vite** Single Page Application (SPA) providing real-time traffic monitoring, CCTV junction management, automated e-Challan generation, and statistical visual analytics.

---

## 🏗️ Structure Overview

```
frontend/
├── src/
│   ├── components/                     # Reusable UI & Layout Components
│   │   ├── common/                     # Button, Input, Modal, Table, Loader
│   │   ├── layout/                     # Header, Sidebar, Footer
│   │   └── charts/                     # TrafficChart, VehicleChart, AnalyticsChart
│   ├── pages/                          # Dashboard, Traffic, Cameras, Analytics, Login
│   ├── services/                       # API client (trafficService, authService, etc.)
│   ├── config/                         # API endpoints & React Router paths
│   ├── routes/                         # AppRoutes.jsx
│   ├── context/                        # AuthContext, AppContext
│   ├── hooks/                          # useAuth, useFetch, usePagination
│   └── utils/                          # formatters, constants, helpers
```

---

## 🚀 Running the Frontend

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. (The dev server automatically proxies `/api` requests to your Python backend on port `5000`).

---

### 3. Build for Production
```bash
npm run build
```
The compiled production bundle will be output to `frontend/dist/`.
