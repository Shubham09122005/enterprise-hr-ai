"""
Streamlit Dashboard for Enterprise HR AI Platform
Display attrition predictions, skill gaps, and recommendations
"""

import streamlit as st
import pandas as pd
import numpy as np
import requests
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import json

# Page configuration
st.set_page_config(
    page_title="HR AI Platform",
    page_icon="👥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .metric-card {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .high-risk {
        color: #d32f2f;
        font-weight: bold;
    }
    .medium-risk {
        color: #f57c00;
        font-weight: bold;
    }
    .low-risk {
        color: #388e3c;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# API Configuration
API_BASE_URL = "http://localhost:8000"

# Session state
if "api_connected" not in st.session_state:
    st.session_state.api_connected = False

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

@st.cache_data(ttl=300)  # Cache for 5 minutes
def fetch_dashboard_summary():
    """Fetch dashboard KPIs"""
    try:
        response = requests.get(f"{API_BASE_URL}/dashboard/summary", timeout=5)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

@st.cache_data(ttl=300)
def fetch_attrition_by_department():
    """Fetch attrition by department"""
    try:
        response = requests.get(f"{API_BASE_URL}/dashboard/attrition-by-department", timeout=5)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

@st.cache_data(ttl=300)
def fetch_skill_gaps():
    """Fetch skill gaps"""
    try:
        response = requests.get(f"{API_BASE_URL}/dashboard/skill-gaps", timeout=5)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

@st.cache_data(ttl=300)
def fetch_recommendations():
    """Fetch recommendations"""
    try:
        response = requests.get(f"{API_BASE_URL}/dashboard/recommendations", timeout=5)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

def fetch_employee(employee_id: int):
    """Fetch single employee record"""
    try:
        response = requests.get(f"{API_BASE_URL}/employees/{employee_id}", timeout=5)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

def predict_attrition(employee_data: dict):
    """Make attrition prediction"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/predict/attrition",
            json=employee_data,
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        st.error(f"Prediction error: {str(e)}")
    return None

def get_risk_color(risk_level: str) -> str:
    """Get color based on risk level"""
    if risk_level == "HIGH":
        return "#d32f2f"  # Red
    elif risk_level == "MEDIUM":
        return "#f57c00"  # Orange
    else:
        return "#388e3c"  # Green

# ============================================================================
# HEADER
# ============================================================================

st.markdown("# 👥 AI WORKFORCE INTELLIGENCE PLATFORM")
st.markdown("**Predict attrition • Identify skill gaps • Recommend upskilling**")

# Connection status
col1, col2, col3 = st.columns([2, 1, 1])
with col1:
    st.markdown("---")
with col2:
    if st.button("🔄 Refresh Data"):
        st.cache_data.clear()
        st.rerun()
with col3:
    try:
        health = requests.get(f"{API_BASE_URL}/health", timeout=2)
        if health.status_code == 200:
            st.success("✅ API Connected")
            st.session_state.api_connected = True
        else:
            st.error("❌ API Error")
            st.session_state.api_connected = False
    except:
        st.error("❌ API Offline")
        st.session_state.api_connected = False

# ============================================================================
# DASHBOARD KPI CARDS
# ============================================================================

st.markdown("## Key Metrics")

summary = fetch_dashboard_summary()
if summary:
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "Total Employees",
            f"{summary['total_employees']:,}",
            delta="Active workforce"
        )
    
    with col2:
        st.metric(
            "🔴 High Risk",
            f"{summary['high_risk_employees']}",
            delta=f"{(summary['high_risk_employees']/summary['total_employees']*100):.1f}%",
            delta_color="inverse"
        )
    
    with col3:
        st.metric(
            "🟠 Medium Risk",
            f"{summary['medium_risk_employees']}",
            delta=f"{(summary['medium_risk_employees']/summary['total_employees']*100):.1f}%",
            delta_color="off"
        )
    
    with col4:
        st.metric(
            "📊 Avg Engagement",
            f"{summary['average_engagement']:.1f}%",
            delta="Satisfaction score"
        )
else:
    st.error("Unable to load dashboard data. Make sure the API is running.")
    st.stop()

# ============================================================================
# ATTRITION RISK BY DEPARTMENT
# ============================================================================

st.markdown("## Attrition Risk by Department")

dept_data = fetch_attrition_by_department()
if dept_data:
    # Prepare data for chart
    dept_list = []
    for dept, risks in dept_data["data"].items():
        total = risks["high_risk"] + risks["medium_risk"] + risks["low_risk"]
        dept_list.append({
            "Department": dept,
            "High Risk": risks["high_risk"],
            "Medium Risk": risks["medium_risk"],
            "Low Risk": risks["low_risk"],
            "Total": total
        })
    
    df_dept = pd.DataFrame(dept_list)
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        # Stacked bar chart
        fig_dept = go.Figure(data=[
            go.Bar(name='High Risk', x=df_dept['Department'], y=df_dept['High Risk'], marker_color='#d32f2f'),
            go.Bar(name='Medium Risk', x=df_dept['Department'], y=df_dept['Medium Risk'], marker_color='#f57c00'),
            go.Bar(name='Low Risk', x=df_dept['Department'], y=df_dept['Low Risk'], marker_color='#388e3c'),
        ])
        
        fig_dept.update_layout(
            barmode='stack',
            title='Risk Distribution',
            xaxis_title='Department',
            yaxis_title='Number of Employees',
            height=400,
            hovermode='x unified'
        )
        
        st.plotly_chart(fig_dept, use_container_width=True)
    
    with col2:
        st.subheader("Risk Summary")
        for _, row in df_dept.iterrows():
            with st.container():
                st.write(f"**{row['Department']}**")
                high_pct = row['High Risk'] / row['Total'] * 100
                st.write(f"High Risk: {row['High Risk']} ({high_pct:.1f}%)")
                st.divider()

# ============================================================================
# SKILL GAPS
# ============================================================================

st.markdown("## Critical Organization Skill Gaps")

skill_gaps = fetch_skill_gaps()
if skill_gaps:
    col1, col2 = st.columns([2, 1])
    
    with col1:
        # Prepare data
        gaps_list = []
        for gap in skill_gaps:
            gaps_list.append({
                "Skill": gap["skill"],
                "Missing": gap["employees_missing"],
                "Severity": gap["severity"]
            })
        
        df_gaps = pd.DataFrame(gaps_list)
        
        # Horizontal bar chart
        fig_gaps = px.bar(
            df_gaps,
            x='Missing',
            y='Skill',
            orientation='h',
            color='Severity',
            color_discrete_map={
                'HIGH': '#d32f2f',
                'MEDIUM': '#f57c00',
                'LOW': '#388e3c'
            },
            title='Employees Missing Key Skills',
            labels={'Missing': 'Number of Employees'},
            height=400
        )
        
        fig_gaps.update_layout(yaxis_autorange="reversed")
        st.plotly_chart(fig_gaps, use_container_width=True)
    
    with col2:
        st.subheader("Training Recommendations")
        for gap in skill_gaps[:3]:  # Top 3
            with st.container():
                severity_color = get_risk_color(gap["severity"])
                st.markdown(f"<div style='color: {severity_color}'>**{gap['skill']}** ({gap['severity']})</div>", unsafe_allow_html=True)
                st.write(f"*{gap['employees_missing']} employees need training*")
                st.caption(gap['recommended_training'])
                st.divider()

# ============================================================================
# UPSKILLING RECOMMENDATIONS
# ============================================================================

st.markdown("## Top Upskilling Recommendations")

recommendations = fetch_recommendations()
if recommendations:
    df_rec = pd.DataFrame(recommendations)
    
    # Display as table with status indicators
    for _, rec in df_rec.iterrows():
        col1, col2, col3 = st.columns([1, 3, 1])
        
        with col1:
            st.markdown(f"**Employee {rec['employee_id']}**")
        
        with col2:
            st.write(f"**{rec['recommended_training']}**")
            st.caption(f"Missing: {rec['missing_skill']} | Duration: {rec['estimated_duration_weeks']}w")
        
        with col3:
            priority_color = get_risk_color(rec['priority'])
            st.markdown(f"<div style='color: {priority_color}; text-align: right'>{rec['priority']}</div>", unsafe_allow_html=True)
        
        st.divider()

# ============================================================================
# SIDEBAR - EMPLOYEE LOOKUP
# ============================================================================

with st.sidebar:
    st.markdown("## 🔍 Employee Lookup")
    
    lookup_employee_id = st.number_input(
        "Enter Employee ID",
        min_value=1,
        step=1,
        key="emp_id_input"
    )
    
    if st.button("Search Employee", use_container_width=True, key="search_btn"):
        employee = fetch_employee(int(lookup_employee_id))
        
        if employee:
            st.markdown("---")
            st.subheader(f"Employee {employee['employee_id']}")
            
            # Risk indicator
            risk_color = get_risk_color(employee['risk_level'])
            st.markdown(
                f"<div style='font-size: 18px; color: {risk_color}'>"
                f"**{employee['risk_level']} RISK**</div>",
                unsafe_allow_html=True
            )
            
            # Key metrics
            col1, col2 = st.columns(2)
            with col1:
                st.metric(
                    "Attrition Risk",
                    f"{employee['attrition_probability']:.1%}"
                )
            with col2:
                st.metric(
                    "Engagement",
                    f"{employee['engagement_score']:.0f}%"
                )
            
            # Details
            st.write(f"**Department:** {employee['department']}")
            st.write(f"**Role:** {employee['job_role']}")
            
            # Skill gaps
            st.subheader("Skill Gaps")
            for gap in employee['skill_gaps']:
                st.write(f"• {gap}")
            
            # Recommendations
            st.subheader("Recommendations")
            for rec in employee['recommendations']:
                st.write(f"→ {rec}")
        
        else:
            st.error(f"Employee {lookup_employee_id} not found")

# ============================================================================
# SIDEBAR - PREDICTION TOOL
# ============================================================================

with st.sidebar:
    st.markdown("---")
    st.markdown("## 🎯 Make Prediction")
    
    with st.form("prediction_form"):
        st.write("Enter employee details:")
        
        emp_id = st.number_input("Employee ID", min_value=1)
        age = st.slider("Age", 18, 70, 35)
        income = st.number_input("Monthly Income ($)", min_value=1000, value=5000)
        years = st.slider("Years at Company", 0, 30, 3)
        satisfaction = st.select_slider("Job Satisfaction", options=[1, 2, 3, 4], value=3)
        work_life = st.select_slider("Work-Life Balance", options=[1, 2, 3, 4], value=3)
        overtime = st.checkbox("Works Overtime?")
        department = st.selectbox("Department", ["IT", "HR", "Sales", "Finance", "Operations"])
        job_role = st.text_input("Job Role", value="Data Analyst")
        
        submitted = st.form_submit_button("Predict Attrition", use_container_width=True)
        
        if submitted:
            employee_data = {
                "employee_id": int(emp_id),
                "age": int(age),
                "monthly_income": float(income),
                "years_at_company": int(years),
                "job_satisfaction": int(satisfaction),
                "work_life_balance": int(work_life),
                "over_time": overtime,
                "department": department,
                "job_role": job_role
            }
            
            prediction = predict_attrition(employee_data)
            
            if prediction:
                risk_color = get_risk_color(prediction['risk_level'])
                st.markdown("---")
                st.markdown(f"<div style='color: {risk_color}; font-size: 20px'>"
                          f"**{prediction['risk_level']} RISK**</div>",
                          unsafe_allow_html=True)
                st.metric(
                    "Attrition Probability",
                    f"{prediction['attrition_probability']:.1%}",
                    delta=f"Model: {prediction['model_version']}"
                )

# ============================================================================
# FOOTER
# ============================================================================

st.markdown("---")
st.markdown("""
<div style='text-align: center; color: gray; font-size: 12px'>
    <p>Enterprise HR AI Platform | v1.0.0</p>
    <p>Last updated: {}</p>
</div>
""".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S")), unsafe_allow_html=True)
