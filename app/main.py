# ============================================================
# ENTERPRISE HR AI
# FastAPI Backend
# ============================================================

from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ============================================================
# APP CONFIGURATION
# ============================================================

app = FastAPI(
    title="Enterprise HR AI",
    description="Workforce Intelligence & Upskilling Platform",
    version="1.0.0"
)


# ============================================================
# CORS — REACT FRONTEND
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

DATA_PATH = PROJECT_ROOT / "data"
RAW_PATH = DATA_PATH / "raw"
EDA_PATH = DATA_PATH / "eda_outputs"
PREDICTIONS_PATH = DATA_PATH / "predictions"
MODEL_PATH = PROJECT_ROOT / "models"


# ============================================================
# FILE PATHS
# ============================================================

EMPLOYEE_FILE = RAW_PATH / "employee_attrition.csv"

EMPLOYEE_INTELLIGENCE_FILE = (
    PREDICTIONS_PATH / "employee_intelligence_final.csv"
)

ENGAGEMENT_FILE = (
    EDA_PATH / "department_engagement_intelligence.csv"
)

ROLE_FILE = (
    EDA_PATH / "job_role_intelligence.csv"
)

OCCUPATION_FILE = (
    EDA_PATH / "occupation_intelligence.csv"
)

SKILL_FILE = (
    EDA_PATH / "role_skill_intelligence.csv"
)

SKILL_SUMMARY_FILE = (
    EDA_PATH / "role_skill_summary.csv"
)

ORGANIZATION_SKILL_FILE = (
    EDA_PATH / "organization_skill_intelligence.csv"
)

RECOMMENDATION_FILE = (
    EDA_PATH / "upskilling_recommendations.csv"
)

MODEL_FILE = (
    MODEL_PATH / "best_attrition_model.joblib"
)

METRICS_FILE = (
    MODEL_PATH / "best_model_metrics.csv"
)


# ============================================================
# GLOBAL DATA OBJECTS
# ============================================================

employee_df = None
employee_intelligence_df = None
engagement_df = None
role_df = None
occupation_df = None
skill_df = None
skill_summary_df = None
organization_skill_df = None
recommendation_df = None
model = None
model_metrics_df = None


# ============================================================
# SAFE CSV LOADER
# ============================================================

def load_csv(path: Path):
    """
    Load CSV if it exists.
    Returns an empty DataFrame if the file is missing.
    """

    if not path.exists():
        print(f"WARNING: File not found -> {path}")
        return pd.DataFrame()

    try:
        df = pd.read_csv(path)
        print(f"Loaded: {path.name} -> {df.shape}")
        return df

    except Exception as e:
        print(f"ERROR loading {path.name}: {e}")
        return pd.DataFrame()


# ============================================================
# LOAD PROJECT DATA
# ============================================================

def load_project_data():

    global employee_df
    global employee_intelligence_df
    global engagement_df
    global role_df
    global occupation_df
    global skill_df
    global skill_summary_df
    global organization_skill_df
    global recommendation_df
    global model
    global model_metrics_df

    print("=" * 70)
    print("LOADING ENTERPRISE HR AI DATA")
    print("=" * 70)

    employee_df = load_csv(
        EMPLOYEE_FILE
    )

    employee_intelligence_df = load_csv(
        EMPLOYEE_INTELLIGENCE_FILE
    )

    engagement_df = load_csv(
        ENGAGEMENT_FILE
    )

    role_df = load_csv(
        ROLE_FILE
    )

    occupation_df = load_csv(
        OCCUPATION_FILE
    )

    skill_df = load_csv(
        SKILL_FILE
    )

    skill_summary_df = load_csv(
        SKILL_SUMMARY_FILE
    )

    organization_skill_df = load_csv(
        ORGANIZATION_SKILL_FILE
    )

    recommendation_df = load_csv(
        RECOMMENDATION_FILE
    )

    # --------------------------------------------------------
    # MODEL
    # --------------------------------------------------------

    if MODEL_FILE.exists():

        try:
            model = joblib.load(MODEL_FILE)
            print(
                f"Loaded model: {MODEL_FILE.name}"
            )

        except Exception as e:

            print(
                f"ERROR loading model: {e}"
            )

            model = None

    else:

        print(
            f"WARNING: Model not found -> {MODEL_FILE}"
        )

    # --------------------------------------------------------
    # METRICS
    # --------------------------------------------------------

    model_metrics_df = load_csv(
        METRICS_FILE
    )

    print("=" * 70)
    print("DATA LOADING COMPLETE")
    print("=" * 70)


# ============================================================
# LOAD DATA WHEN APPLICATION STARTS
# ============================================================

load_project_data()


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {
        "message": "Enterprise HR AI API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "employee_data_loaded": not employee_df.empty,
        "employee_intelligence_loaded": not employee_intelligence_df.empty,
        "model_loaded": model is not None
    }


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

@app.get("/dashboard/summary")
def dashboard_summary():

    if employee_intelligence_df.empty:
        raise HTTPException(
            status_code=503,
            detail="Employee intelligence data is unavailable."
        )

    total_employees = len(
        employee_intelligence_df
    )

    high_risk = int(
        (
            employee_intelligence_df["Risk"]
            .astype(str)
            .str.upper()
            == "HIGH"
        ).sum()
    )

    medium_risk = int(
        (
            employee_intelligence_df["Risk"]
            .astype(str)
            .str.upper()
            == "MEDIUM"
        ).sum()
    )

    low_risk = int(
        (
            employee_intelligence_df["Risk"]
            .astype(str)
            .str.upper()
            == "LOW"
        ).sum()
    )

    if "Engagement" in employee_intelligence_df.columns:

        average_engagement = float(
            pd.to_numeric(
                employee_intelligence_df["Engagement"],
                errors="coerce"
            ).mean()
        )

    else:

        average_engagement = None

    return {
        "total_employees": total_employees,
        "high_risk_employees": high_risk,
        "medium_risk_employees": medium_risk,
        "low_risk_employees": low_risk,
        "average_engagement": average_engagement
    }


# ============================================================
# ATTRITION BY DEPARTMENT
# ============================================================

@app.get("/dashboard/attrition-by-department")
def attrition_by_department():

    if employee_intelligence_df.empty:
        raise HTTPException(
            status_code=503,
            detail="Employee intelligence data is unavailable."
        )

    result = (
        employee_intelligence_df
        .groupby("Department")
        .agg(
            employee_count=("Employee_ID", "count"),
            average_attrition_probability=(
                "Attrition_Prob",
                "mean"
            ),
            high_risk_count=(
                "Risk",
                lambda x: (
                    x.astype(str).str.upper() == "HIGH"
                ).sum()
            )
        )
        .reset_index()
    )

    result["average_attrition_probability"] = (
        result["average_attrition_probability"]
        .round(4)
    )

    return result.to_dict(
        orient="records"
    )


# ============================================================
# EMPLOYEE LIST
# ============================================================

@app.get("/employees")
def get_employees(
    search: Optional[str] = Query(
        default=None
    ),
    department: Optional[str] = Query(
        default=None
    ),
    risk: Optional[str] = Query(
        default=None
    )
):

    if employee_intelligence_df.empty:
        raise HTTPException(
            status_code=503,
            detail="Employee intelligence data is unavailable."
        )

    df = employee_intelligence_df.copy()

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    if search:

        search_lower = search.lower()

        search_columns = [
            "Employee_ID",
            "Department",
            "Role"
        ]

        mask = pd.Series(
            False,
            index=df.index
        )

        for column in search_columns:

            if column in df.columns:

                mask = (
                    mask
                    | df[column]
                    .astype(str)
                    .str.lower()
                    .str.contains(
                        search_lower,
                        na=False
                    )
                )

        df = df[mask]

    # --------------------------------------------------------
    # DEPARTMENT FILTER
    # --------------------------------------------------------

    if department:

        df = df[
            df["Department"]
            .astype(str)
            .str.lower()
            == department.lower()
        ]

    # --------------------------------------------------------
    # RISK FILTER
    # --------------------------------------------------------

    if risk:

        df = df[
            df["Risk"]
            .astype(str)
            .str.upper()
            == risk.upper()
        ]

    return df.replace(
        {np.nan: None}
    ).to_dict(
        orient="records"
    )


# ============================================================
# SINGLE EMPLOYEE
# ============================================================

@app.get("/employees/{employee_id}")
def get_employee(
    employee_id: str
):

    if employee_intelligence_df.empty:
        raise HTTPException(
            status_code=503,
            detail="Employee intelligence data is unavailable."
        )

    df = employee_intelligence_df.copy()

    match = df[
        df["Employee_ID"]
        .astype(str)
        == str(employee_id)
    ]

    if match.empty:

        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    return match.iloc[0].replace(
        {np.nan: None}
    ).to_dict()


# ============================================================
# DEPARTMENT ENGAGEMENT
# ============================================================

@app.get("/dashboard/engagement")
def dashboard_engagement():

    if engagement_df.empty:

        raise HTTPException(
            status_code=503,
            detail="Engagement intelligence data unavailable."
        )

    return engagement_df.replace(
        {np.nan: None}
    ).to_dict(
        orient="records"
    )


# ============================================================
# ROLE INTELLIGENCE
# ============================================================

@app.get("/dashboard/roles")
def dashboard_roles():

    if role_df.empty:

        raise HTTPException(
            status_code=503,
            detail="Role intelligence data unavailable."
        )

    return role_df.replace(
        {np.nan: None}
    ).to_dict(
        orient="records"
    )


# ============================================================
# ORGANIZATION SKILL GAPS
# ============================================================

@app.get("/dashboard/skill-gaps")
def dashboard_skill_gaps():

    if organization_skill_df.empty:

        raise HTTPException(
            status_code=503,
            detail="Organization skill intelligence unavailable."
        )

    return organization_skill_df.replace(
        {np.nan: None}
    ).to_dict(
        orient="records"
    )


# ============================================================
# ROLE SKILL REQUIREMENTS
# ============================================================

@app.get("/dashboard/role-skills")
def dashboard_role_skills(
    occupation: Optional[str] = Query(
        default=None
    )
):

    if skill_df.empty:

        raise HTTPException(
            status_code=503,
            detail="Role skill intelligence unavailable."
        )

    df = skill_df.copy()

    if occupation:

        search_text = occupation.lower()

        df = df[
            df["Title"]
            .astype(str)
            .str.lower()
            .str.contains(
                search_text,
                na=False
            )
        ]

    return df.replace(
        {np.nan: None}
    ).to_dict(
        orient="records"
    )


# ============================================================
# UPSKILLING RECOMMENDATIONS
# ============================================================

@app.get("/dashboard/recommendations")
def dashboard_recommendations():

    if recommendation_df.empty:

        raise HTTPException(
            status_code=503,
            detail="Recommendation data unavailable."
        )

    return recommendation_df.replace(
        {np.nan: None}
    ).to_dict(
        orient="records"
    )


# ============================================================
# EMPLOYEE INTELLIGENCE
# ============================================================

@app.get("/dashboard/employee-intelligence")
def employee_intelligence():

    if employee_intelligence_df.empty:

        raise HTTPException(
            status_code=503,
            detail="Employee intelligence unavailable."
        )

    return employee_intelligence_df.replace(
        {np.nan: None}
    ).to_dict(
        orient="records"
    )


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/model/info")
def model_info():

    if model is None:

        raise HTTPException(
            status_code=503,
            detail="Attrition model is unavailable."
        )

    response = {
        "model_name": "Attrition Prediction Model",
        "algorithm": "Logistic Regression",
        "version": "v1.0"
    }

    if not model_metrics_df.empty:

        row = model_metrics_df.iloc[0]

        response.update({
            "precision": float(
                row["Precision"]
            ),
            "recall": float(
                row["Recall"]
            ),
            "f1_score": float(
                row["F1"]
            ),
            "roc_auc": float(
                row["ROC-AUC"]
            )
        })

    return response


# ============================================================
# ATTRITION PREDICTION REQUEST
# ============================================================

class AttritionRequest(BaseModel):

    Age: float
    OverTime: str
    JobSatisfaction: float
    MonthlyIncome: float
    YearsAtCompany: float
    WorkLifeBalance: float
    TotalWorkingYears: float
    YearsInCurrentRole: float
    YearsSinceLastPromotion: float
    YearsWithCurrManager: float
    JobLevel: float
    JobInvolvement: float
    EnvironmentSatisfaction: float
    RelationshipSatisfaction: float
    DistanceFromHome: float
    NumCompaniesWorked: float
    PercentSalaryHike: float
    StockOptionLevel: float
    TrainingTimesLastYear: float
    BusinessTravel: str
    Department: str
    EducationField: str
    JobRole: str
    MaritalStatus: str
    Gender: str


# ============================================================
# ATTRITION PREDICTION
# ============================================================

@app.post("/predict/attrition")
def predict_attrition(
    request: AttritionRequest
):

    if model is None:

        raise HTTPException(
            status_code=503,
            detail="Attrition model is unavailable."
        )

    data = request.model_dump()

    # --------------------------------------------------------
    # ENGINEERED FEATURES
    # --------------------------------------------------------

    data["IncomePerYearExperience"] = (
        (
            data["MonthlyIncome"] * 12
        )
        / max(
            data["TotalWorkingYears"],
            1
        )
    )

    data["CompanyTenureRatio"] = (
        data["YearsAtCompany"]
        / max(
            data["TotalWorkingYears"],
            1
        )
    )

    data["PromotionWaitRatio"] = (
        data["YearsSinceLastPromotion"]
        / max(
            data["YearsAtCompany"],
            1
        )
    )

    data["OverallSatisfactionScore"] = (
        data["EnvironmentSatisfaction"]
        + data["JobSatisfaction"]
        + data["RelationshipSatisfaction"]
        + data["WorkLifeBalance"]
    ) / 4

    data["CareerStabilityScore"] = (
        data["YearsAtCompany"]
        + data["YearsInCurrentRole"]
        + data["YearsWithCurrManager"]
    ) / 3

    # --------------------------------------------------------
    # EXACT MODEL FEATURE ORDER
    # --------------------------------------------------------

    feature_columns = [
        "Age",
        "OverTime",
        "JobSatisfaction",
        "MonthlyIncome",
        "YearsAtCompany",
        "WorkLifeBalance",
        "TotalWorkingYears",
        "YearsInCurrentRole",
        "YearsSinceLastPromotion",
        "YearsWithCurrManager",
        "JobLevel",
        "JobInvolvement",
        "EnvironmentSatisfaction",
        "RelationshipSatisfaction",
        "DistanceFromHome",
        "NumCompaniesWorked",
        "PercentSalaryHike",
        "StockOptionLevel",
        "TrainingTimesLastYear",
        "BusinessTravel",
        "Department",
        "EducationField",
        "JobRole",
        "MaritalStatus",
        "Gender",
        "IncomePerYearExperience",
        "CompanyTenureRatio",
        "PromotionWaitRatio",
        "OverallSatisfactionScore",
        "CareerStabilityScore"
    ]

    input_df = pd.DataFrame(
        [data]
    )[feature_columns]

    # --------------------------------------------------------
    # PREDICTION
    # --------------------------------------------------------

    probability = float(
        model.predict_proba(
            input_df
        )[0][1]
    )

    prediction = int(
        probability >= 0.50
    )

    if probability >= 0.70:
        risk = "HIGH"

    elif probability >= 0.40:
        risk = "MEDIUM"

    else:
        risk = "LOW"

    return {
        "attrition_probability": round(
            probability,
            4
        ),
        "predicted_attrition": prediction,
        "risk_level": risk
    }


# ============================================================
# APPLICATION STARTUP MESSAGE
# ============================================================

print("\n" + "=" * 70)
print("ENTERPRISE HR AI API READY")
print("=" * 70)
print(f"Project Root: {PROJECT_ROOT}")
print(f"Employees: {len(employee_df)}")
print(
    f"Employee Intelligence: "
    f"{len(employee_intelligence_df)}"
)
print(
    f"Model Loaded: "
    f"{model is not None}"
)
print("=" * 70)