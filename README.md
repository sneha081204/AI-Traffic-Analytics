# 🚦 AI Traffic Analytics for Helmet & Seatbelt Violation Detection

[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/Backend-Flask%20REST%20API-green.svg)](https://flask.palletsprojects.com/)
[![Computer Vision](https://img.shields.io/badge/Vision-YOLO%20%7C%20ByteTrack%20%7C%20OCR-orange.svg)](https://ultralytics.com/)
[![Docker Ready](https://img.shields.io/badge/Deployment-Docker%20%7C%20Nginx-blueviolet.svg)](https://www.docker.com/)

An **industry-standard, enterprise-grade AI Traffic Violation Analytics System** designed for automated Intelligent Transportation Systems (ITS). The system analyzes traffic videos to detect **Motorcycle Helmet Violations** (No Helmet, Invalid Helmet) and **Car Seatbelt Violations**, tracks vehicles using **ByteTrack**, recognizes license plates via **OCR**, enforces the **strict 1-ticket-per-vehicle rule**, and produces **multi-panel composite photographic evidence** with an interactive web dashboard.

---

## 📚 Complete Beginner & Developer Guides

Detailed, intuitive documentation designed for beginners and evaluators is located in the [`docs/`](./docs) folder:

- 🏛️ **[System Architecture Guide (docs/ARCHITECTURE.md)](./docs/ARCHITECTURE.md)**: Explains the entire system using simple analogies (the Restaurant Model), visual diagrams, layer breakdowns, and a complete directory map.
- 🔬 **[AI & Computer Vision Algorithms (docs/ALGORITHMS_AND_MODELS.md)](./docs/ALGORITHMS_AND_MODELS.md)**: Explains how Computer Vision works, Gemini 1.5 Multimodal AI, Indian license plate normalization (single-line & stacked plates), and Motor Vehicles Act statutory penalties.
- 📖 **[Beginner's User & Operations Guide (docs/USER_GUIDE.md)](./docs/USER_GUIDE.md)**: Step-by-step setup instructions, prerequisite checks, local & Docker launch, guided tours of Police & Department portals, and FAQ troubleshooting.

---

## 📑 Core Capabilities & Document Compliance

| Requirement / Module | Implementation Detail |
| :--- | :--- |
| **Vehicle & Person Detection** | YOLOv8/YOLOv11 for high-precision detection of cars, motorcycles, and persons. |
| **Multi-Object Tracking** | **ByteTrack Tracker** ensures persistent Track IDs across video frames. |
| **Rider & Helmet Association** | Associates helmet detection strictly with the rider on the motorcycle. Filters background noise. |
| **Helmet Classification** | Differentiates between **Full-face**, **Half-face**, **No helmet**, and **Invalid/improper helmet**. |
| **Advanced Seatbelt Detection** | AI-based diagonal continuity & orientation analyzer on driver torso (distinguishes belts from clothing folds). |
| **One-Ticket-Per-Vehicle** | **Temporal Voting Validator** debounces frames to prevent duplicate violation tickets. |
| **License Plate OCR** | Automatic license plate localization and alphanumeric character recognition. |
| **Evidence Generation** | Composite snapshot containing the scene frame, zoomed violation crop, plate crop, and watermark banner. |
| **Architecture** | **Decoupled Client-Server**: Standalone Web Client + Flask REST API + AI Vision Pipeline. |

---

## 🏛️ System Architecture

```
                                  [ Traffic Video Stream / MP4 ]
                                                 │
                                                 ▼
                                     [ OpenCV Video Stream ]
                                                 │
                                                 ▼
                                     [ YOLO Object Detector ]
                                                 │
                                                 ▼
                                     [ ByteTrack MOT Tracker ]
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
             [ Motorcycle Pipeline ]                               [ Car Pipeline ]
          - Rider-Motorcycle Association                     - Windshield / Driver ROI
          - Head Region Crop & Analysis                      - Torso Diagonal Filter
          - Full / Half / None Helmet                        - Seatbelt Continuity Check
                        │                                                 │
                        └────────────────────────┬────────────────────────┘
                                                 │
                                                 ▼
                                   [ Temporal Debounce Engine ]
                                 (Confirms 1 ticket per Track ID)
                                                 │
                                                 ▼
                                      [ License Plate & OCR ]
                                                 │
                                                 ▼
                                    [ Evidence Image Builder ]
                                                 │
                                                 ▼
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
           [ SQLite / SQLAlchemy DB ]                        [ Flask REST API Server ]
                        │                                                 │
                        └────────────────────────┬────────────────────────┘
                                                 │
                                                 ▼
                                     [ Decoupled Web Dashboard ]
```

---

## 🚀 How to Run the Project

### Option 1: Local Python Environment (Quickstart)

#### 1. Clone & Navigate to the Project
```bash
cd AI-Traffic-Analytics
```

#### 2. Create and Activate Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Initialize Database & Generate Sample Video Clip
```bash
python scripts/init_db.py
python scripts/generate_sample_video.py
```

#### 5. Launch the Web Application
```bash
python run_server.py
```
Open your browser at: **[http://localhost:5000](http://localhost:5000)**

---

### Option 2: Run via CLI (Offline Batch Processing)

To process a custom traffic video directly from the command line:
```bash
python run_pipeline.py --video path/to/your/video.mp4 --location "Sector 4 - Traffic Junction A"
```

---

### 🐳 Option 3: Run with Docker & Docker Compose (Production Standard)

The repository includes a multi-container Docker setup with Nginx reverse-proxy and Python backend:

#### 1. Build and Run Multi-Container Services
```bash
docker compose up --build
```

#### 2. Run in Background (Detached Mode)
```bash
docker compose up -d --build
```

#### 3. Access Services
- **Web UI & Dashboard:** [http://localhost](http://localhost) (Port 80)
- **Backend REST API:** [http://localhost:5000/api/system/health](http://localhost:5000/api/system/health)

#### 4. Stop Containers
```bash
docker compose down
```

#### 5. View Real-time Container Logs
```bash
docker compose logs -f
```

---

## 🔌 API Reference Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/violations/` | Query paginated violation records with filters |
| `GET` | `/api/violations/<id>` | Fetch detailed violation record |
| `PATCH` | `/api/violations/<id>/status` | Update review status (Confirmed / Dismissed) |
| `GET` | `/api/analytics/summary` | KPI counters for dashboard |
| `GET` | `/api/analytics/timeline` | Historical date/time aggregated violation trends |
| `POST` | `/api/video/upload` | Upload MP4/AVI traffic video file |
| `POST` | `/api/video/process` | Trigger AI pipeline on video |
| `GET` | `/api/video/stream` | Live multipart MJPEG video stream with bounding boxes |
| `GET` | `/api/system/health` | System health check and storage diagnostics |

---

## 📂 Project Structure Tree

```
AI-Traffic-Analytics/
├── ai_engine/                             # 🧠 AI Computer Vision Service
│   ├── core/                              # ByteTrack, IoU math, Temporal debounce
│   ├── detectors/                         # YOLO, Helmet analyzer, Seatbelt analyzer, OCR
│   ├── evidence/                          # Composite evidence generator with watermark
│   ├── weights/                           # Model weights repository
│   └── pipeline.py                        # Master AI Pipeline orchestrator
│
├── backend/                               # ⚙️ REST API & Database Service (Flask)
│   ├── app/                               # Application factory, API Blueprints, Models
│   ├── storage/                           # SQLite DB, evidence snapshots, uploads
│   └── config.py                          # Environment & path configs
│
├── frontend/                              # 💻 Decoupled Web Client (Nginx/SPA)
│   ├── index.html                         # Real-time traffic monitor & live feed
│   ├── violations.html                    # Searchable audit table & evidence modal
│   ├── analytics.html                     # Visual violation charts (Chart.js)
│   └── assets/                            # Modular CSS & JavaScript controllers
│
├── docker/                                # 🐳 Production Docker & Nginx configurations
├── scripts/                               # 🛠️ Database init & synthetic video generator
├── run_server.py                          # Entry point for backend web app
├── run_pipeline.py                        # CLI entry point for AI processing
└── requirements.txt                       # Locked Python dependencies
```

---

## 🎓 Academic Presentation Tips
1. **Highlight the Temporal Validator:** Explain to evaluators how multi-frame temporal voting prevents false positives and ensures strictly one e-Challan per vehicle.
2. **Demonstrate Evidence Generation:** Show the generated composite evidence image with the full-scene snapshot, zoom crops, and OCR plate output.
3. **Showcase Clean Separation:** Demonstrate how the frontend communicates with the backend via REST APIs and live streaming.
