# ENTERPRISE HR AI — COMPLETE PROJECT GUIDE

## PROJECT OVERVIEW
**Goal:** Build an HR system that predicts attrition, tracks engagement, finds skill gaps, and recommends upskilling.

**Four Working Days:**
- Day 1: Data Foundation
- Day 2: Machine Learning
- Day 3: Workforce Intelligence  
- Day 4: Application (API + Dashboard)

---

## FOLDER STRUCTURE (Copy This Exactly)

```
enterprise_hr_ai/
│
├── data/
│   ├── raw/                          # Raw CSV files (untouched)
│   │   ├── employee_attrition.csv
│   │   ├── hr_performance_engagement.csv
│   │   ├── occupation_data.csv
│   │   ├── essential_skills.csv
│   │   └── software_skills.csv
│   ├── processed/                    # Cleaned versions (generated)
│   ├── predictions/                  # Prediction logs
│   └── external/                     # External reference data
│
├── notebooks/                        # Jupyter notebooks (Day 1-4)
│   ├── 01_data_understanding.ipynb
│   ├── 02_data_validation.ipynb
│   ├── 03_data_cleaning.ipynb
│   ├── 04_data_relationships.ipynb
│   ├── 05_feature_engineering.ipynb
│   ├── 06_baseline_model.ipynb
│   ├── 07_model_comparison.ipynb
│   ├── 08_model_explainability.ipynb
│   ├── 09_model_versioning.ipynb
│   ├── 10_engagement_intelligence.ipynb
│   ├── 11_role_intelligence.ipynb
│   ├── 12_employee_skills.ipynb
│   ├── 13_skill_gap_engine.ipynb
│   ├── 14_organization_skill_gap.ipynb
│   ├── 15_recommendation_engine.ipynb
│   └── 16_employee_intelligence.ipynb
│
├── app/                              # Production application code
│   ├── main.py                       # FastAPI entry point
│   ├── api/
│   │   ├── __init__.py
│   │   ├── attrition.py
│   │   ├── skills.py
│   │   └── dashboard.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── attrition_service.py
│   │   ├── engagement_service.py
│   │   ├── skill_gap_service.py
│   │   └── recommendation_service.py
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── model_loader.py
│   │   └── predictor.py
│   ├── validation/
│   │   ├── __init__.py
│   │   └── schemas.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── logger.py
│   │   └── data_loader.py
│   └── database/
│       └── queries.py
│
├── models/                           # Trained models + metadata
│   ├── v1/
│   │   ├── attrition_pipeline.joblib
│   │   └── metadata.json
│   └── scaler.joblib
│
├── frontend/                         # Streamlit dashboard
│   ├── dashboard.py
│   ├── pages/
│   │   ├── attrition.py
│   │   ├── skills.py
│   │   └── engagement.py
│   └── config.py
│
├── tests/
│   ├── __init__.py
│   ├── test_attrition.py
│   ├── test_validation.py
│   └── test_recommendations.py
│
├── docs/
│   ├── data_relationships.md
│   ├── architecture.md
│   └── api_documentation.md
│
├── logs/                             # Application logs
│   ├── app.log
│   └── predictions.log
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── requirements.txt                  # Python dependencies
├── .env.example                      # Environment variables template
├── .gitignore
├── README.md
└── setup.py
```

---

## STEP 1: SETUP YOUR ENVIRONMENT

### 1.1 Create Project Directory
```bash
mkdir enterprise_hr_ai
cd enterprise_hr_ai
```

### 1.2 Copy Your CSV Files
Place your CSV files in `data/raw/`:
```bash
mkdir -p data/raw data/processed data/predictions logs
```

**IMPORTANT FILE MAPPING** (Your files → Expected names):
- `employee_attrition.csv` → data/raw/employee_attrition.csv
- `Employee_Performance_Dataset.csv` → data/raw/hr_performance_engagement.csv
- `occupation_data.csv` → data/raw/occupation_data.csv
- `essential_skills.csv` → data/raw/essential_skills.csv
- `software_skills.csv` → data/raw/software_skills.csv

### 1.3 Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 1.4 Install Dependencies
Create `requirements.txt`:
```
pandas==1.5.3
numpy==1.24.3
scikit-learn==1.3.0
xgboost==2.0.0
shap==0.42.0
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
streamlit==1.28.1
jupyter==1.0.0
matplotlib==3.8.0
seaborn==0.13.0
python-dotenv==1.0.0
joblib==1.3.2
requests==2.31.0
pytest==7.4.3
```

Then install:
```bash
pip install -r requirements.txt
```

---

## STEP 2: DAY 1 — DATA FOUNDATION

### Execute in this exact order:
1. Run `01_data_understanding.ipynb`
2. Run `02_data_validation.ipynb`
3. Run `03_data_cleaning.ipynb`
4. Run `04_data_relationships.ipynb`

**Output:** Clean CSVs in `data/processed/`

---

## STEP 3: DAY 2 — MACHINE LEARNING

### Execute in this exact order:
1. Run `05_feature_engineering.ipynb` → Creates feature matrix
2. Run `06_baseline_model.ipynb` → Logistic Regression baseline
3. Run `07_model_comparison.ipynb` → Random Forest vs XGBoost
4. Run `08_model_explainability.ipynb` → SHAP analysis
5. Run `09_model_versioning.ipynb` → Save best model to `models/v1/`

**Output:** Best model saved in `models/` with metadata

---

## STEP 4: DAY 3 — WORKFORCE INTELLIGENCE

### Execute in this exact order:
1. Run `10_engagement_intelligence.ipynb`
2. Run `11_role_intelligence.ipynb`
3. Run `12_employee_skills.ipynb`
4. Run `13_skill_gap_engine.ipynb`
5. Run `14_organization_skill_gap.ipynb`
6. Run `15_recommendation_engine.ipynb`
7. Run `16_employee_intelligence.ipynb`

**Output:** Master employee intelligence table with all predictions & recommendations

---

## STEP 5: DAY 4 — APPLICATION

### 5.1 Start FastAPI Backend
```bash
cd app
python main.py
# or
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

**API Endpoints:**
```
POST   /predict/attrition           # Single employee prediction
GET    /dashboard/summary            # KPI cards
GET    /dashboard/attrition-risk    # Risk distribution
GET    /dashboard/skill-gaps        # Organization gaps
GET    /dashboard/recommendations   # Upskilling recommendations
GET    /employees/{employee_id}     # Full employee record
GET    /health                       # Health check
```

### 5.2 Start Streamlit Dashboard (In separate terminal)
```bash
streamlit run frontend/dashboard.py
# Opens on http://localhost:8501
```

---

## HOW TO RUN THE ENTIRE PROJECT (End-to-End)

### Option A: Full Local Run (Development)
```bash
# Terminal 1: FastAPI Backend
cd enterprise_hr_ai/app
python main.py

# Terminal 2: Streamlit Frontend
cd enterprise_hr_ai
streamlit run frontend/dashboard.py

# Terminal 3: View logs (optional)
tail -f logs/app.log
```

Then open your browser:
- API Docs: http://localhost:8000/docs
- Dashboard: http://localhost:8501

### Option B: Docker (Production)
```bash
cd docker
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f
```

Access:
- API: http://localhost:8000
- Dashboard: http://localhost:8501

### Option C: Just Run Notebooks (Data Analysis Only)
```bash
jupyter notebook notebooks/
# Open each notebook from 01 to 16 and run cells sequentially
```

---

## KEY CONFIGURATION FILES

### `.env` (Create this file)
```
DATA_PATH=../data/raw
PROCESSED_DATA_PATH=../data/processed
MODEL_PATH=../models
LOG_PATH=../logs
PREDICTION_LOG_PATH=../logs/predictions.log

# FastAPI Config
API_PORT=8000
API_HOST=0.0.0.0
DEBUG=True

# ML Config
ATTRITION_RISK_THRESHOLD_HIGH=0.7
ATTRITION_RISK_THRESHOLD_MEDIUM=0.4
TEST_SIZE=0.2
RANDOM_STATE=42
```

### `pyproject.toml` (Build config)
```toml
[project]
name = "enterprise-hr-ai"
version = "1.0.0"
description = "HR AI Platform for Attrition Prediction & Upskilling"

[build-system]
requires = ["setuptools>=45", "wheel"]
build-backend = "setuptools.build_meta"
```

---

## QUICK START (5 Minutes)

If you just want to see it working:

```bash
# 1. Navigate to project
cd enterprise_hr_ai

# 2. Install dependencies (first time only)
pip install -r requirements.txt

# 3. Copy your data files
cp /path/to/your/csvs data/raw/

# 4. Run data processing
python notebooks/run_all_notebooks.py

# 5. Start API
python app/main.py &

# 6. Start Dashboard
streamlit run frontend/dashboard.py
```

---

## EXPECTED OUTPUTS AT EACH STAGE

### After Day 1 (Data Foundation)
```
✓ data/processed/employee_attrition_processed.csv
✓ data/processed/engagement_processed.csv
✓ data/processed/occupation_master.csv
✓ data/processed/essential_skills_processed.csv
✓ data/processed/software_skills_processed.csv
```

### After Day 2 (ML)
```
✓ models/v1/attrition_pipeline.joblib
✓ models/v1/metadata.json
✓ models/scaler.joblib
✓ SHAP explanations (plots saved)
```

### After Day 3 (Intelligence)
```
✓ data/processed/employee_intelligence.csv
  Columns: EmployeeID, Department, Attrition_Prob, Risk_Level, 
           EngagementScore, JobRole, Skill_Gaps, Recommendation
```

### After Day 4 (App)
```
✓ API running at http://localhost:8000
✓ Dashboard running at http://localhost:8501
✓ logs/app.log (application events)
✓ logs/predictions.log (all predictions made)
```

---

## TROUBLESHOOTING

### "ModuleNotFoundError: No module named 'pandas'"
```bash
pip install --upgrade -r requirements.txt
```

### "Connection refused" on API
```bash
# Check if port 8000 is already in use
lsof -i :8000
# Kill process using that port and restart
```

### "Data file not found"
```bash
# Ensure your CSVs are in data/raw/ with exact names:
ls -la data/raw/
# Should show all 5 files
```

### Streamlit won't start
```bash
# Clear cache and restart
streamlit run --logger.level=debug frontend/dashboard.py
```

---

## NEXT STEPS (Enterprise Hardening)

Once Days 1-4 work end-to-end:

1. **Docker** (Step 24) - Containerize backend & frontend
2. **Data Drift Monitoring** (Step 25) - Track model degradation
3. **Model Performance Monitoring** (Step 26) - Compare predictions to actuals
4. **Retraining Strategy** (Step 27) - Automatic model updates
5. **Documentation** (Step 28) - API docs, architecture diagrams
6. **Deployment** (Step 29) - Push to production (AWS, GCP, etc.)

---

## FILE NAMING CONVENTION

All files follow this pattern:
- Notebooks: `NN_description.ipynb` (01, 02, 03...)
- Models: `models/v{version}/`
- Data: `data/{raw|processed}/`
- Code: `app/{module_name}/{file_name}.py`
- Tests: `tests/test_{module_name}.py`

---

## ESTIMATED TIMELINE

| Phase | Duration | Output |
|-------|----------|--------|
| Day 1: Data | 2-3 hours | Clean CSVs + relationship docs |
| Day 2: ML | 3-4 hours | Trained model + SHAP analysis |
| Day 3: Intelligence | 2-3 hours | Employee intelligence table |
| Day 4: App | 2-3 hours | API + Streamlit dashboard |
| **Total** | **9-13 hours** | **Full working platform** |

---

## SUPPORT & DEBUGGING

For any step:
1. Check the corresponding notebook's output
2. Review logs: `tail -f logs/app.log`
3. Test API: http://localhost:8000/docs (Swagger UI)
4. Check data: `python -c "import pandas as pd; print(pd.read_csv('data/processed/employee_attrition_processed.csv').head())"`

