# 📖 AI Traffic Analytics Platform - Beginner's User & Operations Guide

> **👋 Welcome to the Complete User Guide!**  
> Whether you just downloaded this project as a **ZIP file** or cloned it with **Git**, this guide is built to ensure you never get stuck. We cover every single detail from opening your folder, setting up Python and Node.js, configuring the free AI key, running both servers, testing the portals, and fixing any errors.

---

## 📚 Table of Contents
1. [Prerequisites: Check Your Computer First](#1-prerequisites-check-your-computer-first)
2. [Master Walkthrough: After Git Clone or ZIP Extraction](#2-master-walkthrough-after-git-clone-or-zip-extraction)
   - [Phase A: Extracting and Opening the Project (Avoid the Double-Folder Trap!)](#phase-a-extracting-and-opening-the-project-avoid-the-double-folder-trap)
   - [Phase B: Directory Sanity Check (Are You in the Right Place?)](#phase-b-directory-sanity-check-are-you-in-the-right-place)
   - [Phase C: Creating Your Environment File (.env) & Getting a Free Gemini Key](#phase-c-creating-your-environment-file-env--getting-a-free-gemini-key)
   - [Phase D: Setting Up the Python Backend (Virtual Environment & Dependencies)](#phase-d-setting-up-the-python-backend-virtual-environment--dependencies)
   - [Phase E: Setting Up the React Frontend (Node Modules Installation)](#phase-e-setting-up-the-react-frontend-node-modules-installation)
3. [How to Run the Application (Step-by-Step Two-Terminal Method)](#3-how-to-run-the-application-step-by-step-two-terminal-method)
   - [Terminal 1: Start the Backend API (Port 5000)](#terminal-1-start-the-backend-api-port-5000)
   - [Terminal 2: Start the Frontend Web UI (Port 3000)](#terminal-2-start-the-frontend-web-ui-port-3000)
   - [Open Your Browser & Test](#open-your-browser--test)
4. [Alternative: Running with Docker (1-Command Container Launch)](#4-alternative-running-with-docker-1-command-container-launch)
5. [Guided Tour: How to Use the Platform & Test Scans](#5-guided-tour-how-to-use-the-platform--test-scans)
   - [Default Login Credentials](#default-login-credentials)
   - [Tour 1: Field Police Enforcement Portal (Upload & Issue e-Challan)](#tour-1-field-police-enforcement-portal-upload--issue-e-challan)
   - [Tour 2: Municipal Department Command Console (Analytics & Hot-Reload AI Key)](#tour-2-municipal-department-command-console-analytics--hot-reload-ai-key)
6. [Free Cloud Deployment (Render.com)](#6-free-cloud-deployment-rendercom)
7. [Comprehensive Beginner Troubleshooting (Every Error Solved)](#7-comprehensive-beginner-troubleshooting-every-error-solved)

---

## 1. Prerequisites: Check Your Computer First

Before running anything, verify that you have **Python** and **Node.js** installed on your system. Open your terminal (PowerShell or Command Prompt on Windows, Terminal on Mac/Linux) and run these checks:

### 1. Check Python (Version 3.10 or higher required)
```bash
python --version
```
- **Expected Output:** `Python 3.10.x` (or `Python 3.11.x`, `3.12.x`).
- *If you see an error or Python opens Microsoft Store:* Download Python from [python.org/downloads](https://www.python.org/downloads/).  
  > ⚠️ **CRITICAL ON WINDOWS:** During installation, check the box that says **"Add Python to PATH"** at the bottom of the installer window!

### 2. Check Node.js & npm (Version 18 or higher required)
```bash
node -v
npm -v
```
- **Expected Output:** `v18.x.x` or `v20.x.x`, and `npm` version `9.x.x` or `10.x.x`.
- *If not installed:* Download the LTS version from [nodejs.org](https://nodejs.org/).

### 3. Check Git (Optional, only if cloning from GitHub)
```bash
git --version
```
- *If not installed:* Download from [git-scm.com](https://git-scm.com/).

---

## 2. Master Walkthrough: After Git Clone or ZIP Extraction

Follow these steps sequentially from the moment you have the project on your machine.

---

### Phase A: Extracting and Opening the Project (Avoid the Double-Folder Trap!)

#### If you downloaded a ZIP file (e.g. from GitHub or Google Drive):
1. Locate the downloaded file (usually in your `Downloads` folder): `AI-Traffic-Analytics.zip`.
2. Right-click the `.zip` file and select **"Extract All..."** (or use 7-Zip / WinRAR).
3. Choose a clean destination path (for example, `D:\AI-Traffic-Analytics` or `C:\Projects\AI-Traffic-Analytics`).
4. ⚠️ **WATCH OUT FOR THE "DOUBLE-FOLDER TRAP":**  
   Windows often extracts zip files into a nested folder, like:  
   `D:\AI-Traffic-Analytics\AI-Traffic-Analytics-main\...`  
   **Make sure you open the innermost folder that directly contains `backend`, `frontend`, and `requirements.txt`!**

#### If you cloned with Git:
Open your terminal and run:
```bash
git clone https://github.com/your-username/AI-Traffic-Analytics.git
cd AI-Traffic-Analytics
```

#### How to Open in VS Code (Visual Studio Code):
- **Method 1:** Open VS Code ➔ Click **File** ➔ **Open Folder...** ➔ Select your `AI-Traffic-Analytics` folder.
- **Method 2:** In Windows File Explorer, navigate into the project folder, click the address bar at the top, type `cmd`, press **Enter**, and type `code .` to launch VS Code directly in that folder.

---

### Phase B: Directory Sanity Check (Are You in the Right Place?)

In your terminal, navigate into the project root and list the files:

- **On Windows (PowerShell or CMD):**
  ```powershell
  dir
  ```
- **On Mac / Linux:**
  ```bash
  ls
  ```

#### ✅ You MUST see these files and folders:
```
backend/
frontend/
ai_engine/
docs/
requirements.txt
README.md
```
*If you only see another folder called `AI-Traffic-Analytics`, run `cd AI-Traffic-Analytics` to enter the real root directory.*

---

### Phase C: Creating Your Environment File (.env) & Getting a Free Gemini Key

The Artificial Intelligence engine uses Google's Gemini Vision model to detect traffic violations. It requires a free API key.

#### 1. Get your free key in 60 seconds:
1. Open your browser and go to **[Google AI Studio (https://aistudio.google.com/)](https://aistudio.google.com/)**.
2. Sign in with your standard Google / Gmail account.
3. Click the blue button labeled **"Get API key"** (or **"Create API key"**).
4. Copy the generated key. It looks like: `AIzaSyD...`

#### 2. Create or verify the `.env` file:
Look at the root folder of the project. If there is already a `.env` file, open it. If not, create a new file named exactly `.env` (make sure it doesn't have a `.txt` extension!).

Add the following line inside:
```env
GEMINI_API_KEY=AIzaSyYourActualKeyGoesHere
PORT=5000
FLASK_ENV=development
```
Save the file.

> **💡 Good to know:** Even if you skip this step now, the application will still launch! You can also paste your Gemini API key directly into the web dashboard under **Department Portal ➔ Settings** at any time.

---

### Phase D: Setting Up the Python Backend (Virtual Environment & Dependencies)

Open a terminal in the project root (`AI-Traffic-Analytics`).

#### Step D.1: Create a Python Virtual Environment
> A virtual environment (`venv`) is an isolated container for your project's Python libraries, ensuring they do not interfere with other Python software on your computer.

```bash
python -m venv venv
```
*(Wait 5–10 seconds. You will see a new folder named `venv` appear in your project directory).*

---

#### Step D.2: Activate the Virtual Environment

- **On Windows PowerShell:**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(If you get an error saying `execution of scripts is disabled on this system`, run this one-time command first:  
  `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`  
  and then run `.\venv\Scripts\Activate.ps1` again).*

- **On Windows Command Prompt (CMD):**
  ```cmd
  venv\Scripts\activate.bat
  ```

- **On macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```

✅ **Verification:** Once activated, your terminal prompt will display `(venv)` at the beginning:
```powershell
(venv) PS D:\AI-Traffic-Analytics>
```

---

#### Step D.3: Upgrade pip & Install Python Dependencies
With `(venv)` active, run:
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

*(This will install Flask, SQLAlchemy, EasyOCR, Pillow, google-generativeai, and computer vision utilities. This takes about 1 to 2 minutes depending on your internet speed).*

---

### Phase E: Setting Up the React Frontend (Node Modules Installation)

Now, we need to install the frontend packages (React, Vite, Icons, etc.).

1. Navigate into the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies using npm:
   ```bash
   npm install
   ```
   *(Wait 30–60 seconds while npm downloads dependencies into `frontend/node_modules/`).*

3. Return back to the project root:
   ```bash
   cd ..
   ```

---

## 3. How to Run the Application (Step-by-Step Two-Terminal Method)

The application consists of two running processes:
1. **The Backend Server:** Runs on `http://localhost:5000`.
2. **The Frontend Web Client:** Runs on `http://localhost:3000`.

You will run them in **two separate terminal windows**.

---

### Terminal 1: Start the Backend API (Port 5000)

1. Open your first terminal in `AI-Traffic-Analytics`.
2. Activate your virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
3. Run the backend command:
   ```bash
   python -m backend.app.main
   ```

#### ✅ Expected Terminal 1 Output:
```
 * Serving Flask app 'backend.app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 [INFO] Database initialized: SQLite fallback active (database.sqlite)
 [INFO] Gemini AI key loaded successfully
 Press CTRL+C to quit
```
*(Leave this terminal window OPEN and RUNNING. Do not close it!)*

---

### Terminal 2: Start the Frontend Web UI (Port 3000)

1. Open a **second terminal window** (in VS Code: press `Ctrl + Shift + \`` or click the `+` icon in the terminal panel).
2. Navigate into the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

#### ✅ Expected Terminal 2 Output:
```
  VITE v5.4.x  ready in 320 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```
*(Leave this terminal window OPEN and RUNNING as well!)*

---

### Open Your Browser & Test!

Open your favorite web browser (Google Chrome, Microsoft Edge, Firefox, or Brave) and navigate to:

👉 **[http://localhost:3000](http://localhost:3000)**

You will see the **AI Traffic Analytics & Enforcement Hub** landing page with the glowing radar scanner, surveillance character, and portal buttons!

---

## 4. Alternative: Running with Docker (1-Command Container Launch)

If you have **Docker Desktop** installed and running on your computer, you don't need to manually configure Python or Node.js. Docker handles everything automatically in isolated containers.

```bash
# 1. Open terminal in the project root directory:
cd D:\AI-Traffic-Analytics

# 2. Build and launch all services in the background:
docker compose up --build -d

# 3. View live output logs:
docker compose logs -f

# 4. To stop all services whenever you are done:
docker compose down
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 5. Guided Tour: How to Use the Platform & Test Scans

### Default Login Credentials

| Portal Name | Username / Badge ID | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Field Police Portal** | `police` | `police123` | [http://localhost:3000/police/dashboard](http://localhost:3000/police/dashboard) |
| **Department Admin Portal** | `admin` | `admin123` | [http://localhost:3000/department/dashboard](http://localhost:3000/department/dashboard) |

---

### Tour 1: Field Police Enforcement Portal (Upload & Issue e-Challan)

1. On the landing page, click **"Field Police Portal"**.
2. Sign in with username `police` and password `police123`.
3. **Upload a Traffic Photo:**
   - Click the camera upload zone.
   - Select any traffic snapshot (or use the sample images included right in the project root, such as `24kt25n_bengaluru-cop_625x300_20_May_23.webp` or `AI-Camera-Kerala-Police-Seatbelt-Featured.jpg`).
4. **Trigger AI Inspection:**
   - Click the **"Scan & Analyze"** button.
   - The holographic radar animation activates.
   - Within 2–3 seconds, the AI outputs:
     - **Plate Registration:** Extracted number plate (e.g. `KA 02 HV 6226`).
     - **Violation Badges:** Glowing tags showing detected infractions (`NO_HELMET`, `TRIPLE_RIDING`, `NO_SEATBELT`).
     - **MVA Legal Section & Statutory Fine:** The exact statutory penalty according to Indian law.
5. **Issue e-Challan:**
   - Click **"Generate e-Challan"**.
   - An official digital ticket is generated and permanently recorded in the database.

#### ✍️ Manual Violation Entry (Officer On-Site Option)
If an officer witnesses a violation directly on the road or receives a physical complaint without CCTV capture:
1. In the **Field Police Portal**, click the **"Manual Entry"** tab (or click **"+ Manual Entry"** on the Violations page).
2. Enter the **Vehicle Registration Number** (e.g., `KA 05 MN 4821`). The live Indian Number Plate Badge updates in real time.
3. Select the **Vehicle Class** (Two-Wheeler, Car, SUV, Auto-Rickshaw, Bus, Truck).
4. Choose the **Violation Offence** from the 20 statutory Motor Vehicles Act rules. The legal section and statutory fine amount automatically populate!
5. Enter the **Location**, **Observations**, and optionally attach an evidence photo from your phone or device.
6. Click **"Issue & Persist Official e-Challan"**. The system instantly saves the ticket into the central database and updates officer enforcement metrics.

---

### Tour 2: Municipal Department Command Console (Analytics & Hot-Reload AI Key)

1. On the landing page, click **"Department Portal"**.
2. Sign in with username `admin` and password `admin123`.
3. **Audit Traffic Analytics:**
   - Inspect total revenue, peak violation hours, junction heatmaps, and vehicle distribution charts.
4. **Search Historical Challans:**
   - Search by vehicle number plate or filter by violation category.
5. **Update AI Key on the Fly (Hot-Reloading):**
   - Click the **"Settings / AI Configuration"** button.
   - If you ever need to change your Gemini API key, paste it here and click **Save**.
   - The backend hot-syncs the new key into `.env` immediately **without requiring you to restart the Python server!**

---

## 6. Free Cloud Deployment (Render.com)

You can deploy the entire full-stack project to the internet for free on [Render.com](https://render.com):

1. Push your project to your GitHub account (`git push origin main`).
2. Log in to [Render.com](https://render.com).
3. Click **"New +" ➔ "Blueprint"**.
4. Select your GitHub repository.
5. Render detects the root [`render.yaml`](../render.yaml) file automatically:
   - Configures the Python Flask Web Service (Backend).
   - Configures the React Vite Static Site (Frontend).
6. Under Environment Variables in the Render dashboard, add `GEMINI_API_KEY`.
7. Click **Apply**. Within minutes, Render provides a public live URL!

---

## 7. Comprehensive Beginner Troubleshooting (Every Error Solved)

Here are the most common beginner stumbling blocks and their exact solutions:

---

### Error 1: `execution of scripts is disabled on this system` (PowerShell)
- **Why it happens:** Windows PowerShell has a safety policy that blocks `.ps1` scripts by default.
- **The Fix:** Run this command in PowerShell, then activate your venv again:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\venv\Scripts\Activate.ps1
  ```

---

### Error 2: `python` opens the Microsoft Store instead of running
- **Why it happens:** Windows has "App Execution Aliases" enabled that hijack the `python` command if Python was installed without checking "Add Python to PATH".
- **The Fix:**
  1. Open Windows Settings ➔ Search for **"Manage app execution aliases"**.
  2. Turn OFF the toggles for **"App Installer - python.exe"** and **"App Installer - python3.exe"**.
  3. Re-open your terminal and try `python --version` or `py --version`.

---

### Error 3: `ModuleNotFoundError: No module named 'backend'`
- **Why it happens:** You navigated into the `backend/` folder before running `python app/main.py`.
- **The Fix:** Always run from the **project root directory** (`AI-Traffic-Analytics`):
  ```bash
  cd D:\AI-Traffic-Analytics
  python -m backend.app.main
  ```

---

### Error 4: `Error: listen EADDRINUSE: address already in use :::5000`
- **Why it happens:** A previous Python server instance is still running in the background and holding port 5000.
- **The Fix on Windows (PowerShell):**
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```
  Then restart your backend: `python -m backend.app.main`.

---

### Error 5: `npm is not recognized as an internal or external command`
- **Why it happens:** Node.js was not installed, or your terminal was not restarted after installing Node.js.
- **The Fix:** Install the LTS version from [nodejs.org](https://nodejs.org/), close all open terminals, reopen your terminal, and run `npm -v`.

---

### Error 6: Do I need to set up MySQL or run a database server?
- **Answer: NO!**
- The platform includes an **autonomous SQLite fallback**. If MySQL is not detected on your machine, it creates and manages `backend/storage/database.sqlite` automatically with zero setup required.

---

### Error 7: Scan shows `Gemini API key missing or invalid`
- **The Fix:**
  1. Log into the Department Portal (`admin` / `admin123`).
  2. Click **Settings**.
  3. Paste a free key from [Google AI Studio](https://aistudio.google.com/) and click **Save**.
  4. The key takes effect immediately without restarting the server!

---

### Error 8: Frontend displays `Network Error: Unable to reach backend`
- **The Fix:**
  Check **Terminal 1**. Make sure `python -m backend.app.main` is still actively running on port 5000. If Terminal 1 crashed or was closed, restart it.

---

🎉 **You are now completely ready to run, demonstrate, and develop the AI Traffic Analytics Platform!**
