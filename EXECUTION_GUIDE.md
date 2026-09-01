# ENTERPRISE HR AI — STEP-BY-STEP EXECUTION GUIDE

## Table of Contents
1. [Initial Setup (15 minutes)](#initial-setup)
2. [Day 1: Data Foundation (2-3 hours)](#day-1-data-foundation)
3. [Day 2: Machine Learning (3-4 hours)](#day-2-machine-learning)
4. [Day 3: Workforce Intelligence (2-3 hours)](#day-3-workforce-intelligence)
5. [Day 4: Application (2-3 hours)](#day-4-application)
6. [Running the Final Product](#running-the-final-product)
7. [Docker Deployment](#docker-deployment)

---

## INITIAL SETUP

### Step 1: Create Project Structure

```bash
# Create main directory
mkdir enterprise_hr_ai
cd enterprise_hr_ai

# Create subdirectories
mkdir -p data/{raw,processed,predictions} \
         notebooks \
         app/{api,services,ml,validation,utils} \
         frontend \
         models/v1 \
         tests \
         docs \
         docker \
         logs

# Create files
touch requirements.txt \
      .env \
      .gitignore \
      README.md

# Verify structure
tree -L 2  # or: ls -R
```

### Step 2: Copy Your Data Files

```bash
# Copy CSV files to data/raw/
# You should have exactly these 5 files:

cp /path/to/employee_attrition.csv data/raw/
cp /path/to/Employee_Performance_Dataset.csv data/raw/hr_performance_engagement.csv
cp /path/to/occupation_data.csv data/raw/
cp /path/to/essential_skills.csv data/raw/
cp /path/to/software_skills.csv data/raw/

# Verify all files are there
ls -lah data/raw/
# Should show: 5 CSV files with total ~8MB
```

### Step 3: Set Up Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# On Linux/Mac:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate

# Verify activation (should show (venv) in prompt)
which python  # or: where python (Windows)

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Expected output:
# Successfully installed pip-XX.XX wheel-XX.XX setuptools-XX.XX
```

### Step 4: Install Dependencies

```bash
# Copy requirements.txt content from the provided file
# (provided separately) or:

pip install -r requirements.txt

# This installs:
# - Data: pandas, numpy, scipy
# - ML: scikit-learn, xgboost, shap
# - API: fastapi, uvicorn, pydantic
# - Frontend: streamlit, plotly
# - Utils: requests, python-dotenv, jupyter

# Verify installation
python -c "import pandas, numpy, fastapi, streamlit, sklearn; print('✓ All libraries installed')"
```

### Step 5: Create Environment File

```bash
# Create .env file
cat > .env << 'EOF'
# Data Paths
DATA_PATH=data/raw
PROCESSED_DATA_PATH=data/processed
MODEL_PATH=models
LOG_PATH=logs

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# ML Configuration
ATTRITION_RISK_THRESHOLD_HIGH=0.7
ATTRITION_RISK_THRESHOLD_MEDIUM=0.4
TEST_SIZE=0.2
RANDOM_STATE=42

# Model Versioning
CURRENT_MODEL_VERSION=v1.0
EOF

# Verify
cat .env
```

### Step 6: Start Jupyter

```bash
# Start Jupyter notebook server
jupyter notebook

# Should open browser at http://localhost:8888
# If not, check console for URL

# Keep this terminal open for notebooks
```

---

## DAY 1: DATA FOUNDATION

### Goal: Understand data structure, validate, clean, and establish relationships

**⏱️ Estimated Time: 2-3 hours**

### Notebook 01: Data Understanding

In Jupyter browser at `http://localhost:8888`:

```python
# Navigate to notebooks/ folder
# Open 01_data_understanding.ipynb

# This notebook:
# 1. Loads all 5 CSV files
# 2. Checks shape, columns, data types
# 3. Identifies missing values
# 4. Finds join keys (ID columns)
# 5. Checks target variable balance

# Expected output:
# ✓ Summary table showing:
#   - Employee Attrition: ~1,470 rows
#   - HR Performance: ~1,470 rows  
#   - Occupations: ~9 rows
#   - Essential Skills: ~400+ rows
#   - Software Skills: ~1,500+ rows
#
# ✓ Visualization: data_overview.png
# ✓ Report: data_understanding_report.txt
```

**Key Steps:**
1. Run all cells from top to bottom
2. Check for any errors or warnings
3. Review the generated report
4. Take note of the join keys (usually EmployeeID, OccupationID)

### Notebook 02: Data Validation

```python
# Open 02_data_validation.ipynb

# This notebook:
# 1. Defines valid ranges for each column
# 2. Checks for invalid values
# 3. Tests uniqueness constraints
# 4. Validates categories

# Expected output:
# ✓ Validation report showing:
#   - Age: 18-100 (valid)
#   - Income: > 0 (valid)
#   - EmployeeID: unique (valid)
#   - Attrition: Yes/No only (valid)
#
# ✓ validation_report.txt
# ✓ Any data quality issues flagged
```

**What to check:**
- No assertion errors
- All validations pass
- Issues documented in report

### Notebook 03: Data Cleaning

```python
# Open 03_data_cleaning.ipynb

# This notebook:
# 1. Fills missing values
# 2. Fixes data types
# 3. Standardizes column names
# 4. Removes duplicates
# 5. Saves cleaned CSVs

# Expected output:
# ✓ data/processed/employee_attrition_processed.csv
# ✓ data/processed/engagement_processed.csv
# ✓ data/processed/occupation_master.csv
# ✓ data/processed/essential_skills_processed.csv
# ✓ data/processed/software_skills_processed.csv
#
# ✓ cleaning_report.txt showing rows affected

# Verify
import os
print(os.listdir('data/processed/'))
# Should show 5 files
```

### Notebook 04: Data Relationships

```python
# Open 04_data_relationships.ipynb

# This notebook:
# 1. Tests merging tables on join keys
# 2. Creates relationship documentation
# 3. Builds master dataset

# Expected output:
# ✓ docs/data_relationships.md
# ✓ Confirmation of one-to-one and one-to-many relationships
# ✓ Sample merged data showing structure

# Example:
# EmployeeID 101 (Attrition) 
#   ↓ joins on EmployeeID
# (Performance/Engagement)
#   ↓ joins on JobRole  
# (Occupation Master)
#   ↓ joins on OccupationID
# (Essential + Software Skills)
```

### ✓ Day 1 Complete When:

```
☑ data/processed/ has 5 clean CSVs
☑ No errors in any notebook
☑ data_understanding_report.txt created
☑ validation_report.txt created
☑ cleaning_report.txt created
☑ docs/data_relationships.md created
```

**Checkpoint:** You understand your data completely and can join tables correctly

---

## DAY 2: MACHINE LEARNING

### Goal: Build, compare, and explain ML model for attrition prediction

**⏱️ Estimated Time: 3-4 hours**

### Notebook 05: Feature Engineering

```python
# Open 05_feature_engineering.ipynb

# This notebook:
# 1. Creates features from raw columns
# 2. Handles missing values
# 3. Encodes categorical variables
# 4. Scales numerical features
# 5. Creates training matrix (X) and target (y)

# Expected output:
# ✓ X_train shape: (1,176, 24)  # 24 features
# ✓ X_test shape: (294, 24)
# ✓ y_train value_counts: {No: ~950, Yes: ~226}
# ✓ y_test value_counts: {No: ~238, Yes: ~56}
#
# Sample features:
#   - Age
#   - MonthlyIncome
#   - YearsAtCompany
#   - (and 21 others after engineering)
```

### Notebook 06: Baseline Model

```python
# Open 06_baseline_model.ipynb

# This notebook:
# 1. Trains Logistic Regression (simple baseline)
# 2. Makes predictions
# 3. Evaluates on test set
# 4. Calculates metrics

# Expected output:
# ✓ ROC-AUC: ~0.78-0.82
# ✓ Precision: ~0.72
# ✓ Recall: ~0.68
# ✓ F1: ~0.70
#
# This is your benchmark to beat with more complex models
```

### Notebook 07: Model Comparison

```python
# Open 07_model_comparison.ipynb

# This notebook:
# 1. Trains Random Forest
# 2. Trains XGBoost
# 3. Compares all 3 models side-by-side
# 4. Selects best performer

# Expected output:
# ✓ Comparison table:
#
#   Model              | ROC-AUC | Precision | Recall |  F1
#   ─────────────────────────────────────────────────────────
#   Logistic Regression|  0.80   |    0.72   |  0.68  | 0.70
#   Random Forest      |  0.86   |    0.79   |  0.74  | 0.76
#   XGBoost            |  0.89   |    0.82   |  0.78  | 0.80  ← BEST
#
# ✓ Winner: XGBoost
```

### Notebook 08: SHAP Explainability

```python
# Open 08_model_explainability.ipynb

# This notebook:
# 1. Generates SHAP values for model
# 2. Creates global importance plot
# 3. Creates local (per-employee) explanations
# 4. Interprets results

# Expected output:
# ✓ SHAP summary plot showing:
#   Top 5 features driving attrition:
#   1. OverTime (works overtime = higher risk)
#   2. JobSatisfaction (low satisfaction = higher risk)
#   3. MonthlyIncome (low income = higher risk)
#   4. WorkLifeBalance (poor balance = higher risk)
#   5. YearsAtCompany (recent hires = higher risk)
#
# ✓ Force plots for individual employees
# ✓ SHAP plots saved as PNG files
```

### Notebook 09: Model Versioning

```python
# Open 09_model_versioning.ipynb

# This notebook:
# 1. Saves best model to models/v1/
# 2. Creates metadata file
# 3. Saves feature scaler
# 4. Documents model version

# Expected output:
# ✓ models/v1/attrition_pipeline.joblib (model file)
# ✓ models/v1/metadata.json (performance metrics)
# ✓ models/scaler.joblib (feature scaler)
#
# metadata.json content:
# {
#   "model_name": "Attrition Prediction Model",
#   "version": "v1.0",
#   "algorithm": "XGBoost",
#   "training_date": "2026-08-27",
#   "roc_auc": 0.89,
#   "precision": 0.82,
#   "recall": 0.78,
#   "f1_score": 0.80
# }
#
# Verify:
ls -la models/v1/
# Should show: .joblib file + metadata.json
```

### ✓ Day 2 Complete When:

```
☑ Feature matrix created successfully
☑ Baseline model trained and evaluated
☑ All 3 models compared (XGBoost wins)
☑ SHAP explanations generated
☑ models/v1/attrition_pipeline.joblib exists
☑ models/v1/metadata.json created
☑ SHAP plots saved
```

**Checkpoint:** You have a trained, explained, and versioned ML model ready for deployment

---

## DAY 3: WORKFORCE INTELLIGENCE

### Goal: Calculate skill gaps and build employee intelligence layer

**⏱️ Estimated Time: 2-3 hours**

### Notebooks 10-16: Sequential Execution

```python
# Run each notebook in order

# 10_engagement_intelligence.ipynb
#   ↓ Output: Engagement scores by department
#   
# 11_role_intelligence.ipynb
#   ↓ Output: Clean role master table
#
# 12_employee_skills.ipynb
#   ↓ Output: Employee current skills mapping
#
# 13_skill_gap_engine.ipynb
#   ↓ Output: Per-employee skill gaps
#   
# 14_organization_skill_gap.ipynb
#   ↓ Output: Organization-wide critical gaps
#
# 15_recommendation_engine.ipynb
#   ↓ Output: Personalized training recommendations
#
# 16_employee_intelligence.ipynb
#   ↓ Output: MASTER TABLE with everything
```

### Expected Final Output (Notebook 16)

```python
# data/processed/employee_intelligence.csv

# Columns:
# EmployeeID | Department | Attrition_Prob | Risk_Level | Engagement | 
# JobRole | Skill_Gaps | Recommendations | Model_Version

# Example row:
# 101 | IT | 0.81 | HIGH | 62 |
# Data Analyst | MLOps,Docker | Learn MLOps,Docker | v1.0

# This single CSV contains ALL business intelligence needed
# Ready for API and Dashboard

# Check output:
df = pd.read_csv('data/processed/employee_intelligence.csv')
print(df.shape)  # Should be (~1470, 9)
print(df.head())  # Verify structure
```

### ✓ Day 3 Complete When:

```
☑ All 7 notebooks (10-16) executed
☑ data/processed/employee_intelligence.csv created
☑ CSV has all required columns
☑ No null values in key columns
☑ Attrition probabilities range 0-1
☑ Risk levels assigned correctly
☑ Skill gaps populated for each employee
☑ Recommendations generated for each employee
```

**Checkpoint:** You have a complete employee intelligence dataset ready for productionization

---

## DAY 4: APPLICATION

### Goal: Build API and Dashboard from notebooks

**⏱️ Estimated Time: 2-3 hours**

### Step 1: Create FastAPI Application

**File: `app/main.py`**

```bash
# Create app/main.py with provided code (see app_main.py)
# Key components:
# - EmployeeInput schema (Pydantic)
# - AttritionPrediction response
# - /predict/attrition endpoint
# - /dashboard/* endpoints
# - /employees/{id} endpoint
# - Logging configuration

# Test the main file exists:
ls -la app/main.py
# Should be ~400 lines
```

### Step 2: Create Streamlit Dashboard

**File: `frontend/dashboard.py`**

```bash
# Create frontend/dashboard.py with provided code (see frontend_dashboard.py)
# Key components:
# - KPI cards (total, high risk, engagement)
# - Attrition chart by department
# - Skill gaps visualization
# - Recommendations table
# - Employee lookup (sidebar)
# - Prediction tool (sidebar)

# Test the file exists:
ls -la frontend/dashboard.py
# Should be ~500 lines
```

### Step 3: Create Supporting Modules

```bash
# Create app/validation/schemas.py
# - Pydantic models for validation

# Create app/utils/config.py
# - Load environment variables

# Create app/utils/logger.py
# - Setup logging configuration

# Create app/ml/model_loader.py
# - Load trained model from models/v1/

# Create app/services/attrition_service.py
# - Business logic for predictions

# Create app/services/skill_gap_service.py
# - Skill gap calculations
```

### Step 4: Start the Application

**Terminal 1: FastAPI Backend**

```bash
# Navigate to app directory
cd app

# Start the server
python main.py

# Expected output:
# ======================================================
# Enterprise HR AI Platform Starting
# ======================================================
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
# ======================================================

# The server is now running
# Ctrl+C to stop
```

**Terminal 2: Streamlit Dashboard (keep Terminal 1 running)**

```bash
# In new terminal, in project root
streamlit run frontend/dashboard.py

# Expected output:
# 
#   You can now view your Streamlit app in your browser.
#
#   Local URL: http://localhost:8501
#   Network URL: http://192.168.x.x:8501
#
# Press Ctrl+C to stop
```

**Terminal 3: View Logs (optional)**

```bash
# In new terminal
tail -f logs/app.log

# Shows real-time application events
```

### Step 5: Test the Application

**In your browser:**

```
1. Open http://localhost:8000/docs
   ✓ See Swagger UI with all endpoints
   ✓ Try out /health endpoint
   ✓ Try out /predict/attrition with sample data

2. Open http://localhost:8501
   ✓ See dashboard loading
   ✓ Check KPI cards show data
   ✓ See charts rendering
   ✓ Test employee lookup in sidebar
   ✓ Test prediction tool

3. Open http://localhost:8000/redoc
   ✓ See ReDoc API documentation
```

### Example API Test (curl)

```bash
# Test health check
curl http://localhost:8000/health

# Test prediction
curl -X POST http://localhost:8000/predict/attrition \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": 101,
    "age": 35,
    "monthly_income": 5000,
    "years_at_company": 3,
    "job_satisfaction": 3,
    "work_life_balance": 2,
    "over_time": true,
    "department": "IT",
    "job_role": "Data Analyst"
  }'

# Expected response:
# {
#   "employee_id": 101,
#   "attrition_probability": 0.815,
#   "risk_level": "HIGH",
#   "model_version": "v1.0",
#   "timestamp": "2026-08-27T10:30:00.000Z"
# }
```

### ✓ Day 4 Complete When:

```
☑ app/main.py created and runs without errors
☑ frontend/dashboard.py created and loads
☑ http://localhost:8000/docs accessible
☑ http://localhost:8501 accessible
☑ /health endpoint returns 200
☑ /predict/attrition endpoint works
☑ Dashboard shows KPI cards and charts
☑ Employee lookup works in sidebar
☑ Prediction tool generates predictions
☑ logs/app.log shows events
```

**Checkpoint:** You have a complete, production-ready application!

---

## RUNNING THE FINAL PRODUCT

### Option A: Local Development (Recommended for first time)

```bash
# Terminal 1: FastAPI
cd enterprise_hr_ai/app
python main.py

# Terminal 2: Streamlit (in project root)
cd enterprise_hr_ai
streamlit run frontend/dashboard.py

# Open browser:
# - Dashboard: http://localhost:8501
# - API Docs: http://localhost:8000/docs
# - API ReDoc: http://localhost:8000/redoc

# When done, Ctrl+C in both terminals
```

### Option B: Docker (Production-ready)

```bash
# Build and start containers
cd docker
docker-compose up -d

# Verify running
docker-compose ps
# Should show: api (healthy), frontend (running)

# View logs
docker-compose logs -f api
docker-compose logs -f frontend

# Access same URLs
# - Dashboard: http://localhost:8501
# - API: http://localhost:8000

# Stop
docker-compose down
```

### Option C: Using Gunicorn (Production)

```bash
# Terminal 1: Production API
cd enterprise_hr_ai/app
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000

# Terminal 2: Streamlit
cd enterprise_hr_ai
streamlit run frontend/dashboard.py
```

---

## DOCKER DEPLOYMENT

### Prerequisites

```bash
# Check Docker installed
docker --version
# Should show: Docker version XX.XX.XX

# Check Docker Compose installed
docker-compose --version
# Should show: docker-compose version XX.XX.XX
```

### Build Images

```bash
# Navigate to docker directory
cd docker

# Build both images
docker-compose build

# This creates:
# - hr-ai-api:latest
# - hr-ai-frontend:latest

# Takes ~5 minutes first time
```

### Run Containers

```bash
# Start in background
docker-compose up -d

# Check status
docker-compose ps
# Should show both containers as "running" or with health status

# Check logs
docker-compose logs -f
# or for specific service:
docker-compose logs -f api
```

### Verify Services

```bash
# Test API
curl http://localhost:8000/health

# Test Dashboard
curl http://localhost:8501

# Open in browser:
# - API: http://localhost:8000/docs
# - Dashboard: http://localhost:8501
```

### Stop Services

```bash
# Stop containers but keep images
docker-compose stop

# Remove containers (keeps images)
docker-compose down

# Remove everything including images
docker-compose down --volumes
```

### Troubleshooting Docker

```bash
# Check if ports are available
lsof -i :8000
lsof -i :8501

# View container logs
docker logs hr-ai-api
docker logs hr-ai-frontend

# Enter container shell
docker exec -it hr-ai-api bash

# Rebuild images (useful if code changed)
docker-compose build --no-cache

# Restart services
docker-compose restart
```

---

## COMMON COMMANDS REFERENCE

```bash
# DATA PROCESSING
jupyter notebook                  # Start Jupyter
python -m pytest tests/           # Run tests

# API COMMANDS
python app/main.py                # Start dev API
gunicorn main:app --bind 0.0.0.0:8000  # Production

# DASHBOARD
streamlit run frontend/dashboard.py  # Start dashboard
streamlit cache clear             # Clear cache

# DOCKER
docker-compose up -d              # Start services
docker-compose logs -f            # View logs
docker-compose down               # Stop services

# UTILITIES
pip install -r requirements.txt   # Install deps
source venv/bin/activate          # Activate venv (Linux/Mac)
venv\Scripts\activate             # Activate venv (Windows)
```

---

## EXPECTED TIMINGS

| Phase | Time | What You're Doing |
|-------|------|-------------------|
| Setup | 15 min | Create structure, install deps |
| Day 1 | 2-3 hrs | Understand & clean data |
| Day 2 | 3-4 hrs | Train & compare models |
| Day 3 | 2-3 hrs | Calculate skill gaps |
| Day 4 | 2-3 hrs | Build API & dashboard |
| **Total MVP** | **9-13 hrs** | **Complete working platform** |

---

## SUCCESS CHECKLIST

### After Setup
```
☑ Project structure created
☑ Virtual environment active
☑ All dependencies installed
☑ Data files in data/raw/
☑ .env file created
☑ Jupyter running
```

### After Day 1
```
☑ All notebooks 01-04 executed
☑ 5 processed CSVs created
☑ No errors in validation
☑ Relationships documented
```

### After Day 2
```
☑ Notebooks 05-09 executed
☑ Model saved in models/v1/
☑ ROC-AUC >= 0.88
☑ SHAP plots generated
☑ metadata.json created
```

### After Day 3
```
☑ Notebooks 10-16 executed
☑ employee_intelligence.csv created
☑ All columns populated
☑ No null values in key fields
```

### After Day 4
```
☑ app/main.py running without errors
☑ frontend/dashboard.py loads
☑ http://localhost:8000/health returns 200
☑ http://localhost:8501 displays dashboard
☑ Can make predictions via API
☑ Can lookup employees on dashboard
☑ logs/app.log has entries
☑ logs/predictions.log has entries
```

### Docker Deployment
```
☑ docker-compose up -d successful
☑ docker-compose ps shows healthy containers
☑ Both services accessible on expected ports
☑ API and Dashboard communicate
```

---

## IF SOMETHING GOES WRONG

### Data Issues

```bash
# Verify data files
ls -lah data/raw/
# Should show 5 files with ~8MB total

# Check data in Python
python3 << 'EOF'
import pandas as pd
df = pd.read_csv('data/raw/employee_attrition.csv')
print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print(f"Nulls: {df.isnull().sum().sum()}")
EOF

# If damaged, restore from originals
rm data/processed/*
rm data/raw/*.csv
# Re-copy files
```

### Import Errors

```bash
# Reinstall requirements
pip install --upgrade -r requirements.txt --force-reinstall

# Check specific package
python -c "import pandas; print(pandas.__version__)"

# If still failing, try:
pip install pandas numpy scikit-learn --upgrade
```

### Port Conflicts

```bash
# Check what's using port 8000
lsof -i :8000

# Kill process if needed
kill -9 <PID>

# Or use different port
python app/main.py --port 8001
```

### API Won't Start

```bash
# Check syntax
python -m py_compile app/main.py

# Check dependencies in main.py
python -c "from app.main import app; print('OK')"

# Start with debug output
python -u app/main.py  # -u for unbuffered output
```

### Dashboard Won't Load

```bash
# Clear cache
streamlit cache clear

# Start with debug
streamlit run frontend/dashboard.py --logger.level=debug

# Check API is running
curl http://localhost:8000/health
```

### Model Not Found

```bash
# Verify model saved
ls -la models/v1/
# Should show: attrition_pipeline.joblib + metadata.json

# If missing, run 09_model_versioning.ipynb
# Make sure it completes without errors
```

---

## NEXT STEPS AFTER MVP

Once everything is working:

1. **Run Tests**
   ```bash
   pytest tests/ -v
   pytest tests/ --cov=app
   ```

2. **Deploy to Cloud**
   - AWS EC2 / ECS
   - Google Cloud Run
   - Azure App Service

3. **Setup Monitoring**
   - Data drift monitoring
   - Model performance tracking
   - Application health monitoring

4. **Setup Retraining**
   - Automated model updates
   - Performance-triggered retraining
   - Scheduled retraining

5. **Add Features**
   - User authentication
   - Historical tracking
   - Batch predictions
   - Export/reporting

---

**You're now ready to build Enterprise HR AI!** 🚀

Start with **INITIAL SETUP** section and follow through in order.

Good luck! 🎯
