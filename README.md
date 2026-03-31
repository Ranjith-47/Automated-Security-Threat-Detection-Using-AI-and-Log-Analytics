# AI-Powered Network Intrusion Detection System (IDS)

A full-stack machine learning project for detecting and classifying network attacks using XGBoost, FastAPI, and a modern React dashboard.

---

## Overview

This project builds an intelligent Intrusion Detection System (IDS) that analyzes network traffic data and identifies potential security threats.

It performs:

- **Binary Classification** → Detects whether traffic is _Normal_ or _Attack_
- **Multi-Class Classification** → Identifies the _type of attack_ (DDoS, PortScan, Bot, etc.)

The system includes:

- Machine Learning models (XGBoost)
- FastAPI backend for prediction
- React frontend dashboard for visualization

---

## Features

- Detect malicious network activity in real-time
- Upload CSV files for batch prediction
- Fast API using FastAPI
- Visual dashboard with attack summaries
- High accuracy (~99%) with cross-validation
- Two-stage prediction pipeline:

- Binary → Multi-class

---

## Project Architecture

```text
User (Frontend)
        ↓
React Dashboard (Lovable UI)
        ↓
FastAPI Backend
        ↓
ML Models (XGBoost)
        ↓
Prediction Results
```

---

## Project Structure

```text
project/
│
├── frontend/             # React App (Lovable generated UI)
├── backend/              # FastAPI backend
│   ├── app.py
│   └── requirements.txt
│
├── models/
│   ├── binary/           # Binary classification model
│   └── multiclass/       # Multi-class model
│
├── dataset/              # (Not included in repo)
├── README.md
└── .gitignore
```

---

## Tech Stack

### Machine Learning

- XGBoost
- Scikit-learn
- Pandas, NumPy

### Backend

- FastAPI
- Uvicorn

### Frontend

- React (Lovable)
- Axios
- Chart libraries (for visualization)

---

## Models Used

### Binary Classification Model

- Predicts: **Attack vs Normal**
- Algorithm: XGBoost
- Accuracy: ~99.7%

---

### Multi-Class Classification Model

- Predicts attack types:
  - DDoS
  - DoS (Hulk, GoldenEye, etc.)
  - PortScan
  - Bot
  - Web Attacks (XSS, SQL Injection)

- Accuracy: ~99.1%

---

## Dataset

- Network traffic dataset with 79 features
- Includes both normal and attack traffic
- Preprocessed and cleaned (duplicates removed)

Dataset is not included in this repository due to size.

---

## How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ids-project.git
cd ids-project
```

---

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Run server:

```bash
uvicorn app:app --reload
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

### 4. Access Application

- Frontend → http://localhost:3000
- Backend API → http://localhost:8000/docs

---

## 🔌 API Endpoints

### 🔹 Batch Prediction

```http
POST /predict/batch
```

Upload a CSV file and get predictions.

---

### 🔹 Single Prediction

```http
POST /predict/single
```

Send JSON input for single prediction.

---

## Sample Output

```json
{
  "total": 1000,
  "attacks": 230,
  "normal": 770,
  "attack_breakdown": {
    "DDOS": 100,
    "PORTSCAN": 50
  }
}
```

---

## Limitations

- Imbalanced dataset (rare attacks like Heartbleed have fewer samples)
- Model performance may vary on unseen real-world data

---

## Future Enhancements

- Real-time packet capture integration
- Model retraining pipeline
- Deployment on cloud (AWS/GCP)
- SHAP-based explainability
- Authentication & user management

---

## Author

- Developed as part of an AI/ML academic project
- Focused on cybersecurity and intelligent threat detection

---

## Acknowledgements

- CICIDS dataset (or your dataset source)
- Open-source ML libraries

---

## License

This project is for educational purposes.
