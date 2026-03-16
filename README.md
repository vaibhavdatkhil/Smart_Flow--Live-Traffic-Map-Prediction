# SmartFlow AI — Traffic Prediction Smart City System

![SmartFlow Banner](https://via.placeholder.com/1200x400/030712/00d4ff?text=SMARTFLOW+AI)

## 🚦 Overview

A production-grade AI-powered traffic prediction and smart city management dashboard built with Next.js 14, FastAPI, and RandomForest ML — trained on the Kaggle traffic dataset.

**Live Demo:** Open `SmartFlow_Dashboard.html` in any browser — no server required!

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Prediction | RandomForest model with 89.1% accuracy |
| 🗺️ Traffic Map | Interactive SVG map with real-time junction markers |
| 📊 Dashboard | Animated smart city analytics with Chart.js |
| 🔴 Traffic Light | Animated prediction display (Low/Medium/High) |
| ⚡ Real-time | WebSocket + polling updates every 3-5 seconds |
| 📋 Admin Panel | Logs, stats, alerts, feature importance |

---

## 🛠️ Tech Stack

```
Frontend:  Next.js 14 + React 18 + Tailwind CSS + Framer Motion + Recharts
Backend:   Python FastAPI + scikit-learn + pandas + numpy
ML Model:  RandomForest Classifier (100 estimators, max_depth=10)
Dataset:   Kaggle Traffic Prediction Dataset (5,000 records)
Charts:    Chart.js 4 + Recharts 2
Fonts:     Rajdhani (display) + Exo 2 (body) + JetBrains Mono (code)
```

---

## 🚀 Quick Start

### Option 1: HTML Demo (No Installation)
Simply open `SmartFlow_Dashboard.html` in your browser for a full demo.

### Option 2: Full Stack Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python train_model.py       # Train the ML model
uvicorn app:app --reload    # Start API on localhost:8000
```

**Frontend:**
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev                 # Start on localhost:3000
```

---

## 📁 Project Structure

```
smartflow-project/
├── 📄 SmartFlow_Dashboard.html     ← Complete standalone demo
├── 📄 README.md
├── backend/
│   ├── app.py                      ← FastAPI server (all endpoints)
│   ├── train_model.py              ← ML model training script
│   ├── requirements.txt            ← Python dependencies
│   ├── model/
│   │   ├── traffic_model.pkl       ← Trained RandomForest model
│   │   └── stats.json              ← Dataset statistics
│   └── dataset/
│       └── traffic.csv             ← Kaggle dataset (place here)
└── frontend/
    ├── pages/
    │   ├── index.tsx               ← Home / Prediction page
    │   ├── map.tsx                 ← Live traffic map
    │   ├── dashboard.tsx           ← Analytics dashboard
    │   └── admin.tsx               ← Admin panel
    ├── components/
    │   ├── Navbar.tsx
    │   ├── TrafficLight.tsx
    │   └── StatCard.tsx
    ├── styles/globals.css
    ├── package.json
    ├── tailwind.config.js
    └── next.config.js
```

---

## 🧠 ML Model Details

- **Algorithm:** Random Forest Classifier
- **Features:** Hour, Day, Month, Junction, IsWeekend (5 features)
- **Target:** Traffic Level (Low / Medium / High)
- **Dataset:** 5,000 records, 4 junctions
- **Train/Test Split:** 80/20
- **Accuracy:** 89.1%

### Feature Importance
| Feature | Importance |
|---------|-----------|
| Hour | 38% |
| Junction | 26% |
| Month | 18% |
| Day | 12% |
| IsWeekend | 6% |

---

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/predict` | GET | Predict traffic level |
| `/traffic-live` | GET | Real-time junction data |
| `/traffic-history` | GET | Historical traffic data |
| `/analytics` | GET | City analytics data |
| `/stats` | GET | Model/dataset statistics |
| `/alerts` | GET | Active traffic alerts |
| `/prediction-logs` | GET | Prediction history |
| `/ws/traffic` | WebSocket | Live stream (3s interval) |

Full API docs available at: `http://localhost:8000/docs`

---

## 📊 Dataset

Place the Kaggle traffic dataset as `backend/dataset/traffic.csv`

**Columns:** `DateTime, Junction, Vehicles, ID`

**Source:** [Kaggle Traffic Prediction Dataset](https://www.kaggle.com/datasets/fedesoriano/traffic-prediction-dataset)

---

## 📄 Report

See `SmartFlow_AI_Traffic_Prediction_Report.docx` for the complete project report including:
- Abstract, Introduction, Dataset Description
- Data Preprocessing & Feature Engineering
- ML Model Architecture & Results
- System Architecture & API Documentation
- Frontend Design & Animation System
- Conclusions & Future Scope

---

*Built with ❤️ for Smart City traffic management*
