import { useEffect, useMemo, useState } from 'react'

const API_URL = 'http://localhost:8000'

function RiskAnalysis() {
  const [summary, setSummary] = useState(null)
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/dashboard/summary`).then((r) => {
        if (!r.ok) throw new Error('Failed to load summary')
        return r.json()
      }),

      fetch(`${API_URL}/dashboard/attrition-by-department`).then((r) => {
        if (!r.ok) throw new Error('Failed to load department risk')
        return r.json()
      }),

      fetch(`${API_URL}/employees`).then((r) => {
        if (!r.ok) throw new Error('Failed to load employees')
        return r.json()
      }),
    ])
      .then(([summaryData, departmentData, employeeData]) => {
        setSummary(summaryData)

        const departmentRows = Array.isArray(departmentData)
          ? departmentData
          : departmentData?.data || []

        const employeeRows = Array.isArray(employeeData)
          ? employeeData
          : employeeData?.employees || employeeData?.data || []

        setDepartments(departmentRows)
        setEmployees(employeeRows)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Unable to load risk intelligence')
        setLoading(false)
      })
  }, [])

  const total = Number(summary?.total_employees || 0)
  const high = Number(summary?.high_risk_employees || 0)
  const medium = Number(summary?.medium_risk_employees || 0)
  const low = Number(summary?.low_risk_employees || 0)

  const highPct = total ? (high / total) * 100 : 0
  const mediumPct = total ? (medium / total) * 100 : 0
  const lowPct = total ? (low / total) * 100 : 0

  const getEmployeeField = (employee, fields, fallback = '-') => {
    for (const field of fields) {
      if (
        employee?.[field] !== undefined &&
        employee?.[field] !== null &&
        employee?.[field] !== ''
      ) {
        return employee[field]
      }
    }

    return fallback
  }

  const getDepartmentRisk = (row) => {
    const probability = Number(row?.average_attrition_probability)

    if (!Number.isNaN(probability)) {
      return probability * 100
    }

    return 0
  }

  const sortedDepartments = useMemo(() => {
    return [...departments].sort(
      (a, b) => getDepartmentRisk(b) - getDepartmentRisk(a)
    )
  }, [departments])

  const maxDepartmentRisk = Math.max(
    ...sortedDepartments.map(getDepartmentRisk),
    1
  )

  const highRiskEmployees = useMemo(() => {
    return employees
      .filter((employee) => {
        const risk = String(
          getEmployeeField(employee, [
            'Risk',
            'risk',
            'Risk_Level',
            'risk_level',
          ])
        ).toUpperCase()

        return risk === 'HIGH'
      })
      .slice(0, 10)
  }, [employees])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-orb"></div>
        <h1>Loading Risk Intelligence...</h1>
        <p>Analyzing workforce attrition risk</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-screen">
        <h1>Risk Analysis</h1>
        <p>{error}</p>
        <p className="small-text">
          Make sure the FastAPI backend is running on port 8000.
        </p>
      </div>
    )
  }

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <header className="topbar">
        <div>
          <p className="eyebrow">ATTRITION INTELLIGENCE</p>
          <h1>Risk Analysis</h1>
          <p className="subtitle">
            Identify workforce attrition exposure and prioritize employees
            requiring attention.
          </p>
        </div>

        <div className="topbar-actions">
          <div className="live-badge">
            <span className="pulse"></span>
            LIVE MODEL
          </div>
        </div>
      </header>

      {/* KPI */}

      <section className="stats-grid">

        <div className="stat-card danger">
          <div className="stat-label">HIGH RISK</div>
          <div className="stat-value">
            {high.toLocaleString()}
          </div>
          <div className="stat-footer">
            {highPct.toFixed(1)}% of workforce
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-label">MEDIUM RISK</div>
          <div className="stat-value">
            {medium.toLocaleString()}
          </div>
          <div className="stat-footer">
            {mediumPct.toFixed(1)}% of workforce
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-label">LOW RISK</div>
          <div className="stat-value">
            {low.toLocaleString()}
          </div>
          <div className="stat-footer">
            {lowPct.toFixed(1)}% of workforce
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">TOTAL ANALYZED</div>
          <div className="stat-value">
            {total.toLocaleString()}
          </div>
          <div className="stat-footer">
            Employees evaluated by model
          </div>
        </div>

      </section>

      {/* CHARTS */}

      <section className="risk-analysis-grid">

        {/* DONUT */}

        <div className="panel risk-chart-panel">
          <div className="panel-header">
            <div>
              <p className="panel-label">WORKFORCE RISK</p>
              <h2>Risk Distribution</h2>
            </div>

            <span className="panel-tag">MODEL OUTPUT</span>
          </div>

          <div className="risk-chart-area">

            <div
              className="risk-donut"
              style={{
                background: `conic-gradient(
                  #ef4444 0 ${highPct}%,
                  #f59e0b ${highPct}% ${highPct + mediumPct}%,
                  #3b82f6 ${highPct + mediumPct}% 100%
                )`,
              }}
            >
              <div className="risk-donut-inner">
                <strong>{highPct.toFixed(1)}%</strong>
                <span>High Risk</span>
              </div>
            </div>

            <div className="risk-legend">

              <div>
                <span className="legend-dot red"></span>
                <span>High Risk</span>
                <strong>{high}</strong>
              </div>

              <div>
                <span className="legend-dot yellow"></span>
                <span>Medium Risk</span>
                <strong>{medium}</strong>
              </div>

              <div>
                <span className="legend-dot blue"></span>
                <span>Low Risk</span>
                <strong>{low}</strong>
              </div>

            </div>

          </div>
        </div>

        {/* DEPARTMENT */}

        <div className="panel risk-chart-panel">
          <div className="panel-header">
            <div>
              <p className="panel-label">ORGANIZATIONAL RISK</p>
              <h2>Department Exposure</h2>
            </div>

            <span className="panel-tag">DEPARTMENTS</span>
          </div>

          <div className="risk-department-list">

            {sortedDepartments.map((department, index) => {
              const risk = getDepartmentRisk(department)
              const width = (risk / maxDepartmentRisk) * 100

              return (
                <div className="risk-department-row" key={index}>

                  <div className="risk-department-top">
                    <span>
                      {department.Department || '-'}
                    </span>

                    <strong>
                      {risk.toFixed(1)}%
                    </strong>
                  </div>

                  <div className="risk-department-bar">
                    <span style={{ width: `${width}%` }}></span>
                  </div>

                </div>
              )
            })}

          </div>
        </div>

      </section>

      {/* HIGH RISK TABLE */}

      <section className="panel risk-table-panel">

        <div className="panel-header">
          <div>
            <p className="panel-label">PRIORITY WORKFORCE</p>
            <h2>High Risk Employees</h2>
          </div>

          <span className="panel-tag red-tag">
            {high} HIGH RISK
          </span>
        </div>

        <div className="table-scroll">

          <table className="enterprise-table">

            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Attrition Probability</th>
                <th>Risk</th>
              </tr>
            </thead>

            <tbody>

              {highRiskEmployees.map((employee, index) => {

                const probability = Number(
                  getEmployeeField(employee, [
                    'Attrition_Prob',
                    'Attrition Probability',
                    'attrition_probability',
                    'AttritionProb',
                  ], 0)
                )

                const probabilityPercent =
                  probability <= 1
                    ? probability * 100
                    : probability

                return (
                  <tr key={index}>

                    <td>
                      <div className="employee-table-name">
                        <div className="mini-avatar">
                          E
                        </div>

                        Employee #
                        {getEmployeeField(employee, [
                          'Employee_ID',
                          'employee_id',
                          'EmployeeNumber',
                        ])}
                      </div>
                    </td>

                    <td>
                      {getEmployeeField(employee, [
                        'Department',
                        'Dept',
                        'department',
                      ])}
                    </td>

                    <td>
                      {getEmployeeField(employee, [
                        'Role',
                        'JobRole',
                        'job_role',
                      ])}
                    </td>

                    <td>
                      <div className="probability-cell">
                        <div className="probability-bar">
                          <span
                            style={{
                              width: `${Math.min(
                                probabilityPercent,
                                100
                              )}%`,
                            }}
                          ></span>
                        </div>

                        <strong>
                          {probabilityPercent.toFixed(1)}%
                        </strong>
                      </div>
                    </td>

                    <td>
                      <span className="risk-pill high">
                        HIGH
                      </span>
                    </td>

                  </tr>
                )
              })}

            </tbody>

          </table>

          {highRiskEmployees.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>No high-risk employee records returned</h3>
              <p>
                The model currently has no employee records classified
                as high risk in this response.
              </p>
            </div>
          )}

        </div>

      </section>

    </div>
  )
}

export default RiskAnalysis