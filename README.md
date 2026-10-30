# 🚦 AI Traffic Analytics for Helmet & Seatbelt Violation Detection

[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/Backend-Flask%20REST%20API-green.svg)](https://flask.palletsprojects.com/)
[![Computer Vision](https://img.shields.io/badge/Vision-YOLO%20%7C%20ByteTrack%20%7C%20OCR-orange.svg)](https://ultralytics.com/)

An AI-based Traffic Violation Analytics System designed to analyze traffic videos and identify road safety violations. The system detects motorcycle helmet violations and car seatbelt violations, tracks vehicles using ByteTrack, recognizes vehicle registration numbers using OCR, and generates photographic evidence for detected violations.

The system also provides a web dashboard to view violation records, review evidence, and monitor traffic violation statistics.

---

## 📚 Project Documentation

Detailed documentation for understanding and using the project is available in the `docs/` folder.

- **System Architecture Guide:** `docs/ARCHITECTURE.md` – Explains the system architecture, components, and processing workflow.
- **AI & Computer Vision Algorithms:** `docs/ALGORITHMS_AND_MODELS.md` – Explains the AI models, detection algorithms, tracking, and OCR.
- **User Guide:** `docs/USER_GUIDE.md` – Provides project setup instructions, application usage, and troubleshooting information.

---

## 📑 Core Features

| Module | Description |
|---|---|
| Vehicle and Person Detection | Uses YOLO models to detect vehicles and persons in traffic videos. |
| Helmet Detection | Identifies riders wearing helmets and riders without helmets. |
| Helmet Classification | Supports full-face, half-face, and no-helmet classification where the trained model supports these classes. |
| Seatbelt Detection | Identifies persons wearing and not wearing seatbelts using an AI-based detection model. |
| Vehicle Tracking | Uses ByteTrack to maintain vehicle tracking IDs across video frames. |
| License Plate Recognition | Uses OCR to recognize vehicle registration numbers. |
| Violation Verification | Uses multiple video frames to reduce false detections and duplicate records. |
| Evidence Generation | Generates evidence images containing the traffic scene and relevant violation details. |
| Web Dashboard | Displays violation records, evidence, and analytics. |
| Database Management | Stores violation information and related records. |

---

## 🏛️ System Architecture

```text
             [ Traffic Video Input ]
                       |
                       ▼
             [ OpenCV Frame Extraction ]
                       |
                       ▼
              [ YOLO Object Detection ]
                       |
                       ▼
                [ ByteTrack Tracking ]
                       |
                       ▼
              [ Violation Detection ]
                       |
             ┌─────────┴─────────┐
             ▼                   ▼
      [ Helmet Detection ] [ Seatbelt Detection ]
             |                   |
             └─────────┬─────────┘
                       |
                       ▼
             [ Violation Verification ]
                       |
                       ▼
             [ Number Plate Detection ]
                       |
                       ▼
                 [ OCR Processing ]
                       |
                       ▼
              [ Evidence Generation ]
                       |
                       ▼
                [ MySQL Database ]
                       |
                       ▼
                [ Flask Backend ]
                       |
                       ▼
                [ Web Dashboard ]
```

---

## 🚀 How to Run the Project

### Option 1: Local Python Environment

**1. Navigate to the project folder**

```bash
cd AI-Traffic-Analytics
```

**2. Create and activate a virtual environment**

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Linux / macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

**3. Install the required dependencies**

```bash
pip install -r requirements.txt
```

**4. Initialize the database**

Run the database initialization command if it is available in your project:

```bash
python scripts/init_db.py
```

**5. Start the application**

```bash
python run_server.py
```

Open the application in your browser at:

`http://localhost:5000`

---

## 🎥 Video Processing

The system accepts traffic video files for processing.

The processing workflow is:

1. Upload a traffic video through the web application.
2. OpenCV extracts frames from the uploaded video.
3. YOLO detects vehicles, persons, helmets, and seatbelts.
4. ByteTrack tracks detected vehicles across frames.
5. The violation detection module identifies possible helmet and seatbelt violations.
6. The verification module checks detections to reduce false positives.
7. OCR extracts the vehicle registration number.
8. Evidence images are generated.
9. Violation details are stored in the database.
10. The dashboard displays the violation information.

---

## 🔌 API Reference

The following endpoints describe the API structure documented for the project.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/violations/` | Retrieves violation records. |
| GET | `/api/violations/<id>` | Retrieves a particular violation record. |
| PATCH | `/api/violations/<id>/status` | Updates violation verification status. |
| GET | `/api/analytics/summary` | Retrieves violation summary statistics. |
| GET | `/api/analytics/timeline` | Retrieves violation trends over time. |
| POST | `/api/video/upload` | Uploads a traffic video. |
| POST | `/api/video/process` | Starts video processing. |
| GET | `/api/video/stream` | Provides a processed video stream, if enabled. |
| GET | `/api/system/health` | Checks application health. |

---

## 📂 Project Structure

```text
AI-Traffic-Analytics/
│
├── ai_engine/
│   ├── core/
│   ├── detectors/
│   ├── evidence/
│   ├── weights/
│   └── pipeline.py
│
├── backend/
│   ├── app/
│   ├── storage/
│   └── config.py
│
├── frontend/
│   ├── index.html
│   ├── violations.html
│   ├── analytics.html
│   └── assets/
│
├── docker/
├── scripts/
├── run_server.py
├── run_pipeline.py
├── requirements.txt
└── README.md
```

---

## 🧪 Testing and Debugging

- **Unit Testing:** Individual modules such as vehicle detection, helmet detection, seatbelt detection, and OCR are tested separately.
- **Integration Testing:** Checks the connection between the AI processing module, Flask backend, database, and frontend.
- **Video Testing:** Different traffic videos are used to evaluate the detection and tracking performance.
- **Database Testing:** Verifies that violation details, vehicle numbers, timestamps, locations, and evidence paths are stored correctly.
- **Debugging:** Errors in detection, video processing, API communication, and database operations are identified and corrected.
- **Performance Testing:** Evaluates processing speed and detection performance using traffic videos.

---

## 🎓 Academic Project Highlights

1. **AI-Based Detection:** Uses YOLO models to identify helmet and seatbelt violations from traffic videos.
2. **Vehicle Tracking:** Uses ByteTrack to track vehicles across consecutive frames.
3. **Number Plate Recognition:** Uses OCR to recognize vehicle registration numbers.
4. **Violation Verification:** Uses frame-based verification to reduce false detections and duplicate records.
5. **Evidence Generation:** Saves visual evidence of detected violations.
6. **Database Integration:** Maintains violation records for future reference.
7. **Web Dashboard:** Provides an interface to view and manage traffic violation information.

---

## 🎯 Project Objective

The main objective of this project is to develop an AI-based traffic analytics system that automatically detects helmet and seatbelt violations from traffic videos, recognizes vehicle registration numbers, generates evidence, and stores violation details in a database.

The system aims to support traffic monitoring, improve road safety, and reduce manual effort in identifying traffic rule violations.

---

## 👩‍💻 Project Team

**Project:** AI Traffic Analytics for Helmet & Seatbelt Violation Detection

**Domain:** Artificial Intelligence and Computer Vision

**Technologies:** Python, YOLO, OpenCV, ByteTrack, OCR, Flask, MySQL, HTML, CSS, and JavaScript.
