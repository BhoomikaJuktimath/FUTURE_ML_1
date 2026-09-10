# ForecastIQ — Sales & Demand Forecasting System

ForecastIQ is a production-grade, full-stack machine learning web application designed for sales and demand forecasting using business historical sales data. Built with React, TypeScript, Tailwind CSS, Recharts, FastAPI, and Scikit-Learn, ForecastIQ provides automated data cleaning, strict time-series feature engineering, machine learning model training, dynamic performance benchmarks, recursive multi-step forecasting, and actionable executive business intelligence.

---

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Solution Architecture](#solution-architecture)
3. [Key Features](#key-features)
4. [Technology Stack](#technology-stack)
5. [Dataset & Dynamic Ingestion](#dataset--dynamic-ingestion)
6. [Machine Learning Methodology](#machine-learning-methodology)
   - [Data Preprocessing](#data-preprocessing)
   - [Time-Series Feature Engineering](#time-series-feature-engineering)
   - [Chronological Train/Test Split](#chronological-traintest-split)
   - [Algorithms: Naive Baseline vs. Random Forest](#algorithms-naive-baseline-vs-random-forest)
   - [Evaluation Metrics & Error Analysis](#evaluation-metrics--error-analysis)
   - [Recursive Autoregressive Forecasting](#recursive-autoregressive-forecasting)
7. [Business Applications & Intelligence](#business-applications--intelligence)
8. [Project Structure](#project-structure)
9. [Installation & Setup](#installation--setup)
10. [Running the Application](#running-the-application)
11. [Testing](#testing)
12. [Limitations & Future Improvements](#limitations--future-improvements)

---

## Problem Statement

Businesses frequently face significant financial losses due to inaccurate sales demand estimates:
- **Overstocking**: Excessive holding costs, tied-up working capital, and stock obsolescence during low-demand periods.
- **Stockouts**: Lost revenue, customer dissatisfaction, and unfulfilled demand during high-demand spikes.
- **Suboptimal Resource Planning**: Misaligned labor scheduling, cash flow volatility, and inefficient inventory reordering.

ForecastIQ solves these challenges by transforming raw historical transaction records into accurate machine learning predictions and actionable operational guidance.

---

## Solution Architecture

```
                                  ForecastIQ Architecture
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND (React + Vite)                                │
│   Dashboard | Data Hub | Forecast View | Model Metrics | Business Insights | Data Audit  │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │ REST API (Axios / Proxy)
┌────────────────────────────────────────────▼────────────────────────────────────────────┐
│                                  BACKEND (FastAPI + Python)                             │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Routers: /health | /data | /model | /forecast | /business-insights              │   │
│   └────────────────────────────────────────┬────────────────────────────────────────┘   │
│                                            │                                            │
│   ┌────────────────────────────────────────▼────────────────────────────────────────┐   │
│   │                           MACHINE LEARNING PIPELINE                              │   │
│   │ 1. Dynamic Column Auto-Detection & Cleaning (NaN, Outliers, Duplicates)         │   │
│   │ 2. Time-Series Feature Engineering (Lags, Rolling Means/Stds, Cyclical Time)    │   │
│   │ 3. Chronological 80/20 Train/Test Split                                         │   │
│   │ 4. Model Training: Naive Baseline (Lag-1) vs. RandomForestRegressor             │   │
│   │ 5. Model Evaluation: MAE, RMSE, R², safe MAPE & Residual Analysis               │   │
│   │ 6. Multi-Step Recursive Forecasting (7, 14, 30, 60, 90 Days)                    │   │
│   │ 7. Executive Business Intelligence Generator (Trend, Volatility, Inventory)     │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

- **Automated Data Cleaning & Quality Audit**: Automatically infers `Date` and `Sales` columns, interpolates missing values, clips negative sales, deduplicates records, and calculates a 0–100 Data Health Score.
- **Strict Leakage-Free Feature Engineering**: Creates time features (year, month, day, day of week, week of year, quarter, weekend indicator, sine/cosine cyclical features) and historical features (lags 1, 7, 14, 30 and rolling 7, 14, 30 day means & standard deviations) using strictly historical data (`shift(1)`).
- **Chronological Model Training**: 80/20 train/test split preserving temporal order. Trains a Naive Baseline model alongside a `RandomForestRegressor`.
- **Dynamic Metric Interpretation**: Computes MAE, RMSE, R², and safe MAPE with plain-language explanations generated dynamically from true calculated values.
- **Recursive Multi-Step Forecasting**: Generates 7, 14, 30, 60, and 90-day future horizons with confidence bounds without relying on future ground truth.
- **Actionable Business Intelligence**: Quantifies forecast trend slope and volatility (Coefficient of Variation) to generate targeted advice for Inventory, Cash Flow, Staffing, Overstock Risk, and Stockout Prevention.
- **Interactive Modern Dashboard**: Dark-mode glassmorphic interface powered by Recharts with interactive timeline graphs and CSV export options.

---

## Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, Axios.
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic v2.
- **Machine Learning**: Pandas, NumPy, Scikit-Learn, Joblib.
- **Testing**: Pytest, FastAPI TestClient.

---

## Machine Learning Methodology

### 1. Data Preprocessing
- Dynamic keyword heuristic and datetime convertibility checks to identify Date and Target Sales columns.
- Aggregates daily transaction totals and reindexes to fill missing calendar days with linear interpolation.
- Calculates descriptive stats (Min, Max, Mean, Median, Std Dev) and logs cleaning actions.

### 2. Time-Series Feature Engineering
- **Time Features**: `year`, `month`, `day`, `day_of_week`, `week_of_year`, `quarter`, `is_weekend`.
- **Cyclical Features**: `sin_month`, `cos_month`, `sin_dow`, `cos_dow`.
- **Lag Features**: `lag_1`, `lag_7`, `lag_14`, `lag_30`.
- **Rolling Features**: `rolling_mean_7`, `rolling_mean_14`, `rolling_mean_30`, `rolling_std_7`, `rolling_std_30` computed on `shift(1)` to eliminate data leakage.

### 3. Chronological Train/Test Split
Data is split sequentially: first 80% for training, final 20% for test evaluation. Random shuffling is strictly prohibited to prevent temporal contamination.

### 4. Models & Evaluation
- **Baseline Model**: Naive forecast (₹$\hat{y}_t = y_{t-1}$).
- **Primary Model**: `RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)`.
| Model Metric | Naive Baseline (Lag-1) | RandomForestRegressor | Improvement |
| :--- | :--- | :--- | :--- |
| **MAE** | **₹194.12** | **₹121.59** | **+37.36% Better** |
| **RMSE** | **₹237.51** | **₹148.69** | **+37.40% Better** |
| **R² Score** | **-0.2517** | **0.5094** | **Explains 50.9% of Variance** |
| **MAPE** | **20.85%** | **12.80%** | **Significant Accuracy Gain** |

### 5. Recursive Future Forecasting
For horizon step $h \in \{1 \dots H\}$:
- Computes time features for future date $t+h$.
- Uses true historical sales for lag dates $\le$ last historical date, or previously predicted sales for future lag dates $\ge$ last historical date.
- Feeds feature vector into the trained Random Forest model.

---

## Business Applications & Intelligence

ForecastIQ translates ML outputs into strategic business decisions:
- **Inventory Replenishment**: Adjusts reorder quantities based on forecasted daily demand (e.g. rising from ₹806.21 to ₹1,135.47/day).

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 1. Clone Repository & Environment Setup
```bash
git clone https://github.com/user/ForecastIQ.git
cd ForecastIQ
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## Running the Application

### Start Backend Server
```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API interactive documentation available at: `http://127.0.0.1:8000/docs`

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
Open browser at: `http://localhost:5173`

---

## Testing

Run the automated backend test suite (testing preprocessing, feature engineering, model training, forecasting, and REST API endpoints):
```bash
cd backend
pytest tests
```

---

## Project Structure

```
ForecastIQ/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point & CORS
│   │   ├── routes/                     # Health, Data, Model, Forecast, Insights
│   │   ├── ml/                         # Preprocessing, Features, Trainer, Evaluator, Forecaster
│   │   ├── models/                     # Pydantic Schemas
│   │   ├── services/                   # Business Insights engine
│   │   └── utils/                      # Data generator & Storage persistence
│   ├── data/                           # Active & Sample datasets
│   ├── saved_models/                   # Persisted .joblib & metadata
│   ├── tests/                          # Pytest suite
│   ├── conftest.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar, Sidebar, KPICard, LoadingOverlay, AlertMessage
│   │   ├── pages/                      # Dashboard, Data, Forecast, Performance, Insights, Quality, About
│   │   ├── services/                   # Axios API service
│   │   ├── types/                      # TypeScript definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── README.md
```
