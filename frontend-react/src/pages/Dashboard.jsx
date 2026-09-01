import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8000'

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [departmentRisk, setDepartmentRisk] = useState([])
  const [skillGaps, setSkillGaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
useEffect(() => {
  Promise.all([
    fetch(`${API_URL}/dashboard/summary`).then((response) => {
      if (!response.ok) throw new Error('Failed to load summary')
      return response.json()
    }),

    fetch(`${API_URL}/dashboard/attrition-by-department`).then((response) => {
      if (!response.ok) throw new Error('Failed to load department risk')
      return response.json()
    }),

    fetch(`${API_URL}/dashboard/skill-gaps`).then((response) => {
      if (!response.ok) throw new Error('Failed to load skill gaps')
      return response.json()
    }),
  ])
    .then(([summaryData, departmentData, skillData]) => {
      setSummary(summaryData)

      const departmentRows = Array.isArray(departmentData)
        ? departmentData
        : Array.isArray(departmentData?.data)
          ? departmentData.data
          : Object.entries(departmentData?.data || {}).map(
              ([department, values]) => ({
                Department: department,
                ...values,
              })
            )

      setDepartmentRisk(departmentRows)

      const skillRows = Array.isArray(skillData)
        ? skillData
        : skillData?.data || []

      setSkillGaps(skillRows)

      setLoading(false)
    })
    .catch((err) => {
      console.error(err)
      setError('Unable to connect to the HR AI backend')
      setLoading(false)
    })
}, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-orb"></div>
        <h1>Loading Enterprise HR AI...</h1>
        <p>Connecting to workforce intelligence engine</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-screen">
        <h1>Connection Error</h1>
        <p>{error}</p>
        <p className="small-text">
          Make sure the FastAPI backend is running on port 8000.
        </p>
      </div>
    )
  }

  const total = Number(summary?.total_employees || 0)
  const high = Number(summary?.high_risk_employees || 0)
  const medium = Number(summary?.medium_risk_employees || 0)
  const low = Number(summary?.low_risk_employees || 0)

  const calculatedMedium =
    medium || Math.max(total - high - low, 0)

  const riskRate = total > 0
    ? ((high / total) * 100).toFixed(1)
    : '0.0'

  const engagement = Number(summary?.average_engagement || 0)

  const criticalSkills = skillGaps
  .filter((skill) => {
    const priority =
      skill?.severity ||
      skill?.Severity ||
      skill?.Priority ||
      skill?.priority

    return String(priority).toUpperCase() === 'HIGH'
  })
  .slice(0, 6)

  const getField = (row, fields, fallback = '-') => {
    for (const field of fields) {
      if (
        row?.[field] !== undefined &&
        row?.[field] !== null &&
        row?.[field] !== ''
      ) {
        return row[field]
      }
    }
    return fallback
  }

  const getDepartmentName = (row) =>
    getField(row, [
      'Department',
      'department',
      'Dept',
      'dept',
    ])

const getDepartmentRisk = (row) => {
  const probability = Number(row?.average_attrition_probability)

  if (Number.isNaN(probability)) {
    return 0
  }

  return probability * 100
}
  const maxDepartmentRisk = Math.max(
    ...departmentRisk.map((row) => getDepartmentRisk(row)),
    1
  )

  return (
    <div className="dashboard-page">

      {/* ================= HEADER ================= */}

      <header className="topbar dashboard-hero">
        <div>
          <div className="hero-kicker">
            <span className="hero-dot"></span>
            ENTERPRISE HR PLATFORM
          </div>

          <h1>Workforce Intelligence Dashboard</h1>

          <p className="subtitle">
            AI-powered workforce analytics, attrition intelligence
            and organizational capability insights.
          </p>
        </div>

        <div className="topbar-actions">
          <div className="live-badge">
            <span className="pulse"></span>
            LIVE DATA
          </div>

          <div className="profile">SM</div>
        </div>
      </header>

      {/* ================= KPI CARDS ================= */}

      <section className="stats-grid dashboard-stats">

        <div className="stat-card premium-stat">
          <div className="stat-top">
            <div className="stat-label">TOTAL WORKFORCE</div>
            <div className="stat-icon blue-icon">◈</div>
          </div>

          <div className="stat-value">
            {total.toLocaleString()}
          </div>

          <div className="stat-footer">
            Employees in workforce database
          </div>
        </div>

        <div className="stat-card danger premium-stat">
          <div className="stat-top">
            <div className="stat-label">HIGH ATTRITION RISK</div>
            <div className="stat-icon red-icon">!</div>
          </div>

          <div className="stat-value">
            {high.toLocaleString()}
          </div>

          <div className="stat-footer risk-footer">
            {riskRate}% of total workforce
          </div>
        </div>

        <div className="stat-card warning premium-stat">
          <div className="stat-top">
            <div className="stat-label">MEDIUM RISK</div>
            <div className="stat-icon yellow-icon">△</div>
          </div>

          <div className="stat-value">
            {calculatedMedium.toLocaleString()}
          </div>

          <div className="stat-footer">
            Employees requiring monitoring
          </div>
        </div>

        <div className="stat-card success premium-stat">
          <div className="stat-top">
            <div className="stat-label">AVG ENGAGEMENT</div>
            <div className="stat-icon green-icon">↗</div>
          </div>

          <div className="stat-value">
            {engagement.toFixed(2)}
            <span className="unit">%</span>
          </div>

          <div className="stat-footer">
            Organization-wide engagement index
          </div>
        </div>

      </section>

      {/* ================= MAIN ANALYTICS ================= */}

      <section className="dashboard-grid">

        {/* RISK DISTRIBUTION */}

        <div className="panel dashboard-panel risk-panel">

          <div className="panel-header">
            <div>
              <p className="panel-label">ATTRITION INTELLIGENCE</p>
              <h2>Workforce Risk Distribution</h2>
            </div>

            <span className="panel-tag">AI MODEL</span>
          </div>

          <div className="risk-dashboard-content">

            <div className="risk-ring">
              <div className="risk-ring-inner">
                <strong>{riskRate}%</strong>
                <span>High Risk</span>
              </div>
            </div>

            <div className="risk-breakdown">

              <div className="risk-breakdown-item">
                <div className="risk-name">
                  <span className="legend-dot red"></span>
                  <span>High Risk</span>
                </div>

                <strong>{high.toLocaleString()}</strong>

                <div className="risk-progress">
                  <span
                    className="risk-progress-high"
                    style={{
                      width: `${total ? (high / total) * 100 : 0}%`,
                    }}
                  ></span>
                </div>
              </div>

              <div className="risk-breakdown-item">
                <div className="risk-name">
                  <span className="legend-dot yellow"></span>
                  <span>Medium Risk</span>
                </div>

                <strong>{calculatedMedium.toLocaleString()}</strong>

                <div className="risk-progress">
                  <span
                    className="risk-progress-medium"
                    style={{
                      width: `${total ? (calculatedMedium / total) * 100 : 0}%`,
                    }}
                  ></span>
                </div>
              </div>

              <div className="risk-breakdown-item">
                <div className="risk-name">
                  <span className="legend-dot blue"></span>
                  <span>Low Risk</span>
                </div>

                <strong>{low.toLocaleString()}</strong>

                <div className="risk-progress">
                  <span
                    className="risk-progress-low"
                    style={{
                      width: `${total ? (low / total) * 100 : 0}%`,
                    }}
                  ></span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* CRITICAL SKILLS */}

        <div className="panel dashboard-panel">

          <div className="panel-header">
            <div>
              <p className="panel-label">WORKFORCE CAPABILITY</p>
              <h2>Critical Skill Priorities</h2>
            </div>

            <span className="panel-tag purple-tag">
              SKILLS
            </span>
          </div>

          <div className="dashboard-skill-list">

            {criticalSkills.length > 0 ? (
              criticalSkills.slice(0, 6).map((skill, index) => (
                <div className="dashboard-skill" key={index}>

                  <div className="dashboard-skill-number">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="dashboard-skill-name">
                    {typeof skill === 'string'
                      ? skill
                      : getField(skill, [
                          'Element_Name',
                          'Element Name',
                          'Skill',
                          'skill',
                        ])}
                  </div>

                  <span className="priority-pill">
                    PRIORITY
                  </span>

                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">✓</div>
                <h3>No critical skills returned</h3>
                <p>
                  Skill intelligence data is available from the
                  Skill Intelligence module.
                </p>
              </div>
            )}

          </div>

        </div>

      </section>

      {/* ================= DEPARTMENT INTELLIGENCE ================= */}

      <section className="panel department-panel">

        <div className="panel-header">
          <div>
            <p className="panel-label">ORGANIZATIONAL INTELLIGENCE</p>
            <h2>Department Attrition Exposure</h2>
          </div>

          <span className="panel-tag">
            DEPARTMENT VIEW
          </span>
        </div>

        <div className="department-list">

          {departmentRisk.length > 0 ? (
            departmentRisk.slice(0, 8).map((row, index) => {
              const department = getDepartmentName(row)
              const risk = getDepartmentRisk(row)

              const percentage = Math.min(
                (risk / maxDepartmentRisk) * 100,
                100
              )

              return (
                <div className="department-row" key={index}>

                  <div className="department-info">
                    <span className="department-rank">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <strong>{department}</strong>
                  </div>

                  <div className="department-bar">
                    <span
                      style={{ width: `${percentage}%` }}
                    ></span>
                  </div>

                  <div className="department-risk-value">
                    {risk.toFixed(1)}%
                  </div>

                </div>
              )
            })
          ) : (
            <div className="empty-state">
              Department risk data unavailable.
            </div>
          )}

        </div>

      </section>

      {/* ================= AI ACTION CENTER ================= */}

      <section className="panel action-panel dashboard-action-panel">

        <div className="panel-header">

          <div>
            <p className="panel-label">DECISION SUPPORT</p>
            <h2>Recommended Actions</h2>
          </div>

          <div className="ai-status">
            <span></span>
            AI ENGINE ONLINE
          </div>

        </div>

        <div className="actions-grid">

          <div className="action-card premium-action">
            <span className="action-number">01</span>

            <div className="action-mini-icon">⚠</div>

            <h3>Review High Risk Employees</h3>

            <p>
              Identify employees with elevated attrition probability
              and prioritize targeted retention strategies.
            </p>

            <div className="action-link">
              Risk Analysis →
            </div>
          </div>

          <div className="action-card premium-action">
            <span className="action-number">02</span>

            <div className="action-mini-icon">✦</div>

            <h3>Close Critical Skill Gaps</h3>

            <p>
              Focus workforce development around high-priority
              organizational skill requirements.
            </p>

            <div className="action-link">
              Skill Intelligence →
            </div>
          </div>

          <div className="action-card premium-action">
            <span className="action-number">03</span>

            <div className="action-mini-icon">↗</div>

            <h3>Improve Workforce Engagement</h3>

            <p>
              Monitor engagement across departments and identify
              areas requiring management attention.
            </p>

            <div className="action-link">
              Analytics →
            </div>
          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="dashboard-footer">

        <div>
          <strong>Enterprise HR AI</strong>
          <span>Workforce Intelligence Platform</span>
        </div>

        <div className="footer-status">
          <span></span>
          Backend Connected
        </div>

        <div>
          Model Version{' '}
          <strong>{summary?.model_version || 'v1.0'}</strong>
        </div>

      </footer>

    </div>
  )
}

export default Dashboard