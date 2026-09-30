# JanSetu AI (जनसेतू AI)
> **Multilingual Citizen Voice-to-Needs Civic Intelligence & Infrastructure Prioritization Engine**

JanSetu AI is a hackathon prototype that converts multilingual citizen voice and text grievances (in **Marathi**, **Hindi**, and **English**) into structured development needs and produces **100% transparent, explainable infrastructure priorities** for public administration.

---

## 🌟 Key Architecture & Highlights

### 1. Citizen Multilingual Grievance Portal
* **Language Support**: Marathi (मराठी), Hindi (हिंदी), and Indian English.
* **Dual Input Modes**:
  * **Voice Complaint Input**: In-browser Web Audio `MediaRecorder` with real-time waveform visualizer and direct Gemini multimodal audio processing.
  * **Text Complaint Input**: Form with character count and one-click real-world crisis demo prompts.
* **Instant Structured Extraction**: Gemini extracts administrative department category, specific sub-issue, district, taluka/ward, landmark, severity score (1–5 scale), urgency level, and affected demographic into a strict schema.
* **Privacy & Research Transparency**: All demo grievances are clearly tagged with `is_synthetic: true`.

### 2. 100% Deterministic & Transparent Priority Engine
To prevent black-box AI bias or hallucination, **Gemini is strictly prohibited from deciding priority scores**. The score is computed using a deterministic mathematical formula:

$$\text{Priority Score} = 0.35 \times S_{\text{demand}} + 0.25 \times S_{\text{infra\_gap}} + 0.20 \times S_{\text{population}} + 0.10 \times S_{\text{severity}} + 0.10 \times S_{\text{investment\_gap}}$$

| Component | Weight | Source & Normalization |
|---|---|---|
| **Citizen Demand Volume** | **35%** | Volume of registered citizen grievances in the localized cluster relative to benchmark saturation. |
| **Infrastructure Gap** | **25%** | Official district baseline public works deficit rating (e.g., piped water deficit, road condition). |
| **Population Exposure & Vulnerability** | **20%** | Census population scale combined with rural/socio-economic vulnerability index. |
| **Problem Severity** | **10%** | Aggregated average citizen distress rating (1 to 5 scale converted to 0–100). |
| **Historical Capex Gap** | **10%** | Prior 3–5 fiscal years under-investment and budget deficit rating in that sector. |

### 3. Government Intelligence Command Center
* **Interactive Map**: Geographic visualization of Maharashtra with district nodes and color-coded hotspots (Critical $\ge 70$, High $50-69$, Moderate $<50$) featuring pulsing radar rings.
* **KPI Metrics**: Real-time counters for Total Grievances, Active Hotspots, Critical Zones, Districts Monitored, and Primary Demand Sector.
* **1-Click Scenario Switcher**: Instantly load and inspect key crisis scenarios:
  1. *Marathwada Drought & Water Tanker Disruption* (Beed)
  2. *Konkan Coastal Highway Culvert Collapse* (Ratnagiri)
  3. *Vidarbha Agricultural Transformer & Health Center Outage* (Chandrapur)
  4. *Peri-Urban Drainage & Uncollected Waste* (Pune)
* **Explainability Inspector**: Deep-dive card displaying:
  * Full mathematical equation and point breakdown
  * Ground citizen quotes in original Marathi, Hindi, and English
  * Official district baseline stats
  * Gemini executive briefing
  * 3-phase administrative operational plan with assigned agencies and timelines.

---

## 🚀 Running Locally

### Prerequisites
* Python 3.11+
* Node.js 18+ and npm

### 1. Start Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API: `http://127.0.0.1:8000`
* Swagger Interactive Docs: `http://127.0.0.1:8000/docs`

### 2. Start Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev -- -p 3000
```
* Frontend Application: `http://localhost:3000`

---

## 🔒 Configuration & Environment Variables

Create a `.env` file in `backend/`:
```ini
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
DATABASE_URL=sqlite+aiosqlite:///./jansetu.db
```
*(Note: If `GEMINI_API_KEY` is not provided, JanSetu AI automatically operates in an intelligent offline demo mode with keyword heuristics and pre-configured administrative templates, ensuring 100% demo reliability).*

---

## 🧪 Mathematical Verification Test
To verify that the priority calculation formula strictly sums to 100% and maintains mathematical integrity:
```bash
backend\venv\Scripts\python backend/tests/test_priority_engine.py
```
Expected output: `PRIORITY MATH VERIFICATION PASSED`

---

## 📜 Ethical & Governance Disclaimer
**JanSetu AI is a decision-support and assistive prioritization prototype for civic governance.**
All citizen records displayed in this demonstration are synthetic scenarios created for civic technology research and evaluation. The system does not execute automated statutory decisions.
