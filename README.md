# BatterySense

### Production-Grade Windows Battery & Hardware Monitoring Application

**BatterySense** is a real-time hardware telemetry and battery analyzer built specifically for Windows. Unlike mock dashboards, BatterySense extracts **authentic low-level hardware metrics** directly from the Windows OS via **PSUtil**, **Windows Management Instrumentation (WMI)**, and controlled OS interfaces, exposing them through a local FastAPI agent and rendering them in a dark-mode React dashboard.

---

## 🌟 Architecture: Netlify Frontend + Local Hardware Agent

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        WINDOWS MACHINE                                 │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               FastAPI Local Monitoring Agent                     │  │
│  │                   Bound strictly to 127.0.0.1                    │  │
│  │                                                                  │  │
│  │   Battery  │  CPU  │  RAM  │  Disk  │  GPU  │  System  │  Power   │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│                        REST API & WebSocket Stream                     │
│                        http://127.0.0.1:8000                           │
│                                    │                                   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ (Private Network Access)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   React Dashboard (Vite + TypeScript)                  │
│                                                                        │
│   • Hosted on Netlify (or run locally on http://localhost:5173)        │
│   • Communicates with http://127.0.0.1:8000                            │
│   • Shows graceful "Agent Offline" status if agent is not running      │
│   • 100% Client-side telemetry rendering & local SQLite persistence    │
└────────────────────────────────────────────────────────────────────────┘
```

* **Frontend (Netlify)**: Modern React/TypeScript SPA with Framer Motion, Recharts, and 3D CSS battery visualization.
* **Backend (Local Windows PC)**: Lightweight Python agent accessing low-level hardware sensors on `127.0.0.1:8000`. No hardware metrics or system identifiers ever leave your machine.

---

## 🚀 Quick Start (Running the Application)

### 1. Start the Local Windows Monitoring Agent
In PowerShell or Command Prompt:
```powershell
cd backend
pip install -r requirements.txt
python run.py
```
*Or simply double-click `start_backend.bat` in the project root.*
The agent will start on `http://127.0.0.1:8000`.

### 2. Launch the Frontend
You have two options:
* **Option A (Deployed on Netlify)**: Open your Netlify production URL in your browser. It automatically detects and connects to your local agent at `http://127.0.0.1:8000`.
* **Option B (Run locally)**:
  ```powershell
  cd frontend
  npm install
  npm run dev
  ```
  *Or double-click `start_frontend.bat` / `start_all.bat`.*

---

## ⚙️ Environment Configuration

### Frontend (`frontend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8000` | Address of the local Windows monitoring agent |
| `VITE_WS_URL` | `ws://127.0.0.1:8000/ws/telemetry` | WebSocket stream for real-time telemetry |

### Backend (`backend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `HOST` | `127.0.0.1` | Local loopback binding |
| `PORT` | `8000` | Local port |
| `DATA_RETENTION_HOURS` | `24` | Historical telemetry database retention window |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Allowed CORS origins (Netlify `*.netlify.app` supported via regex) |

---

## ☁️ Netlify Deployment Guide

The repository includes `netlify.toml` preconfigured for single-click deployment:

1. Push this repository to **GitHub**:
   ```bash
   git add .
   git commit -m "Production release"
   git push origin main
   ```
2. In **Netlify**:
   - Click **Add new site** > **Import an existing project** > **GitHub**.
   - Select the **BatterySense** repository.
   - Netlify will automatically detect:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
3. Click **Deploy BatterySense**.
4. Every subsequent `git push origin main` triggers an automatic continuous deployment.

---

## 🧪 Testing & Verification

### Run Backend Unit Tests
```powershell
cd backend
python -m pytest app/tests/ -v
```
Verifies battery health/wear algorithms, boundary clamping, unavailable sensor handling, and API endpoints (9 passed).

### Run Frontend Production Build
```powershell
cd frontend
npm run build
```
Type-checks TypeScript and compiles Vite bundles into `frontend/dist/`.

---

## 🔒 Security & Privacy

* **Strict Localhost Binding**: The hardware agent binds exclusively to `127.0.0.1` and does not accept external network connections.
* **No Telemetry Uplink**: Hardware serials, capacities, and performance data are processed entirely in memory and local SQLite (`batterysense.db`).
* **Safe Private Network Access**: Communication occurs directly between your browser and loopback `127.0.0.1`.

---

## 📄 License
MIT License.
