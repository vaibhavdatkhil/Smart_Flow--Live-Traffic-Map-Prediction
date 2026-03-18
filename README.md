SmartFlow AI – Traffic Prediction System
Overview

SmartFlow AI is a traffic prediction and visualization system developed to analyze traffic patterns and predict congestion levels at different road junctions.

The system uses a Random Forest Machine Learning model trained on a Kaggle traffic dataset to predict whether traffic will be Low, Medium, or High at a specific time and location.

The project also provides a web dashboard where users can view traffic predictions, analytics, and historical data.

Features

Traffic prediction using Machine Learning

Interactive traffic dashboard

Traffic map showing different junctions

Analytics graphs for traffic patterns

Admin panel for logs and statistics

Real-time updates using API

Technologies Used

Frontend

Next.js

React

Tailwind CSS

Chart.js / Recharts

Backend

Python

FastAPI

Machine Learning

Scikit-learn

Pandas

NumPy

Random Forest Classifier

Machine Learning Model

The system uses a Random Forest classifier trained on traffic data.

Input features

Hour

Day

Month

Junction

Weekend indicator

Output

Traffic level: Low / Medium / High

The dataset was split into 80% training and 20% testing data.

Project Structure
smartflow-project
│
├── SmartFlow_Dashboard.html
├── README.md
│
├── backend
│   ├── app.py
│   ├── train_model.py
│   ├── requirements.txt
│   ├── model
│   │   ├── traffic_model.pkl
│   │   └── stats.json
│   └── dataset
│       └── traffic.csv
│
└── frontend
    ├── pages
    │   ├── index.tsx
    │   ├── map.tsx
    │   ├── dashboard.tsx
    │   └── admin.tsx
    ├── components
    ├── styles
    └── package.json
How to Run the Project
1. Run Backend
cd backend
pip install -r requirements.txt
python train_model.py
uvicorn app:app --reload

Backend will start on

http://localhost:8000
2. Run Frontend
cd frontend
npm install
npm run dev

Frontend will run on

http://localhost:3000
Dataset

The model is trained using the Traffic Prediction Dataset from Kaggle.

Dataset fields include:

DateTime

Junction

Vehicles

ID

Future Improvements

Integration with live traffic APIs

More advanced ML models

Mobile application for real-time monitoring

Improved map visualization
