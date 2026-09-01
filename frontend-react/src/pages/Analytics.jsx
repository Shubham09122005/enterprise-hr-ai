import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8000'

function getField(row, names) {
  if (!row || typeof row !== 'object') return ''

  for (const name of names) {
    if (
      Object.prototype.hasOwnProperty.call(row, name) &&
      row[name] !== null &&
      row[name] !== undefined
    ) {
      return row[name]
    }
  }

  const normalize = (value) =>
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')

  const normalizedKeys = Object.keys(row).reduce(
    (result, key) => {
      result[normalize(key)] = key
      return result
    },
    {}
  )

  for (const name of names) {
    const actualKey = normalizedKeys[normalize(name)]

    if (
      actualKey &&
      row[actualKey] !== null &&
      row[actualKey] !== undefined
    ) {
      return row[actualKey]
    }
  }

  return ''
}

function toRows(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (!data || typeof data !== 'object') {
    return []
  }

  if (Array.isArray(data.data)) {
    return data.data
  }

  if (Array.isArray(data.results)) {
    return data.results
  }

  if (Array.isArray(data.items)) {
    return data.items
  }

  return Object.entries(data)
    .filter(
      ([key, value]) =>
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    )
    .map(([key, value]) => ({
      ...value,
      Department: value.Department || key,
    }))
}

function Analytics() {
  const [summary, setSummary] = useState({})
  const [engagement, setEngagement] = useState([])
  const [roles, setRoles] = useState([])
  const [skills, setSkills] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/dashboard/summary`).then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load workforce summary')
        }

        return res.json()
      }),

      fetch(`${API_URL}/dashboard/engagement`).then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load engagement analytics')
        }

        return res.json()
      }),

      fetch(`${API_URL}/dashboard/roles`).then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load role analytics')
        }

        return res.json()
      }),

      fetch(`${API_URL}/dashboard/skill-gaps`).then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load skill analytics')
        }

        return res.json()
      }),
    ])
      .then(
        ([
          summaryData,
          engagementData,
          roleData,
          skillData,
        ]) => {
          setSummary(summaryData || {})

          setEngagement(toRows(engagementData))

          setRoles(toRows(roleData))

          setSkills(toRows(skillData))

          setLoading(false)
        }
      )
      .catch((err) => {
        console.error(err)
        setError('Unable to load workforce analytics')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="page-container">
        <h1>Analytics</h1>
        <p>Loading workforce analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>Analytics</h1>

        <p>{error}</p>

        <p className="small-text">
          Make sure the FastAPI backend is running on port 8000.
        </p>
      </div>
    )
  }

  const totalEmployees = Number(
    getField(summary, [
      'total_employees',
      'Total_Employees',
    ]) || 0
  )

  const averageEngagement = Number(
    getField(summary, [
      'average_engagement',
      'Average_Engagement',
    ]) || 0
  )

  const departmentCount = engagement.length

  const roleCount = roles.length

  const highPrioritySkills = skills.filter(
    (skill) =>
      String(
        getField(skill, [
          'Priority',
          'priority',
          'Severity',
          'severity',
        ])
      ).toUpperCase() === 'HIGH'
  ).length

  return (
    <div className="page-container">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <p className="page-eyebrow">
            WORKFORCE ANALYTICS
          </p>

          <h1>Analytics</h1>

          <p className="page-subtitle">
            Explore workforce engagement, role intelligence
            and capability priorities across the organization.
          </p>
        </div>

        <div className="employee-count">
          {totalEmployees.toLocaleString()} Employees Analyzed
        </div>

      </div>

      {/* SUMMARY */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-label">
            AVERAGE ENGAGEMENT
          </div>

          <div className="stat-value">
            {averageEngagement.toFixed(1)}
            <span className="unit">%</span>
          </div>

          <div className="stat-footer">
            Organization-wide engagement index
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-label">
            DEPARTMENTS ANALYZED
          </div>

          <div className="stat-value">
            {departmentCount}
          </div>

          <div className="stat-footer">
            Department engagement coverage
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-label">
            ROLES ANALYZED
          </div>

          <div className="stat-value">
            {roleCount}
          </div>

          <div className="stat-footer">
            Workforce role intelligence
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-label">
            HIGH PRIORITY SKILLS
          </div>

          <div className="stat-value">
            {highPrioritySkills}
          </div>

          <div className="stat-footer">
            Capability development priorities
          </div>

        </div>

      </div>

      {/* ENGAGEMENT INTELLIGENCE */}

      <div className="panel">

        <div className="panel-header">

          <div>
            <p className="panel-label">
              ENGAGEMENT INTELLIGENCE
            </p>

            <h2>Department Engagement</h2>
          </div>

          <span className="panel-tag">
            LIVE DATA
          </span>

        </div>

        <div className="employee-table-card">

          <table className="employee-table">

            <thead>
              <tr>
                <th>Department</th>
                <th>Engagement Index</th>
                <th>Engagement Level</th>
              </tr>
            </thead>

            <tbody>

              {engagement.map((row, index) => {

                const department = getField(row, [
                  'Department',
                  'department',
                ])

                const engagementIndex = Number(
                  getField(row, [
                    'Engagement_Index',
                    'engagement_index',
                    'Engagement Index',
                    'Average_Engagement',
                    'average_engagement',
                  ]) || 0
                )

                const engagementLevel =
                  getField(row, [
                    'Engagement_Level',
                    'engagement_level',
                    'Engagement Level',
                  ]) || '-'

                return (
                  <tr
                    key={`${department}-${index}`}
                  >

                    <td>
                      <strong>
                        {department || '-'}
                      </strong>
                    </td>

                    <td>
                      {engagementIndex.toFixed(1)}
                    </td>

                    <td>
                      {engagementLevel}
                    </td>

                  </tr>
                )
              })}

            </tbody>

          </table>

          {engagement.length === 0 && (
            <div className="no-results">
              No engagement analytics available.
            </div>
          )}

        </div>

      </div>

      {/* ROLE INTELLIGENCE */}

      <div
        className="panel"
        style={{ marginTop: '20px' }}
      >

        <div className="panel-header">

          <div>
            <p className="panel-label">
              ROLE INTELLIGENCE
            </p>

            <h2>Workforce Role Analysis</h2>
          </div>

          <span className="panel-tag">
            ROLE DATA
          </span>

        </div>

        <div className="employee-table-card">

          <table className="employee-table">

            <thead>
              <tr>
                <th>Department</th>
                <th>Job Role</th>
                <th>Employees</th>
                <th>Performance</th>
                <th>KPI</th>
              </tr>
            </thead>

            <tbody>

              {roles
                .slice(0, 30)
                .map((row, index) => {

                  const department = getField(row, [
                    'Department',
                    'department',
                  ])

                  const jobRole = getField(row, [
                    'Job Role',
                    'Job_Role',
                    'job_role',
                    'Role',
                    'role',
                  ])

                  const employees = Number(
                    getField(row, [
                      'Employee_Count',
                      'employee_count',
                      'Employee Count',
                      'Count',
                      'count',
                    ]) || 0
                  )

                  const performance = Number(
                    getField(row, [
                      'Avg_Performance_Score',
                      'average_performance_score',
                      'Average Performance Score',
                      'Performance Score',
                    ]) || 0
                  )

                  const kpi = Number(
                    getField(row, [
                      'Avg_KPI_Score',
                      'average_kpi_score',
                      'Average KPI Score',
                      'KPI Score',
                    ]) || 0
                  )

                  return (
                    <tr
                      key={`${jobRole || 'role'}-${index}`}
                    >

                      <td>
                        {department || '-'}
                      </td>

                      <td>
                        <strong>
                          {jobRole || '-'}
                        </strong>
                      </td>

                      <td>
                        {employees.toLocaleString()}
                      </td>

                      <td>
                        {performance
                          ? performance.toFixed(1)
                          : '-'}
                      </td>

                      <td>
                        {kpi
                          ? kpi.toFixed(1)
                          : '-'}
                      </td>

                    </tr>
                  )
                })}

            </tbody>

          </table>

          {roles.length === 0 && (
            <div className="no-results">
              No role intelligence available.
            </div>
          )}

        </div>

      </div>

      {/* CAPABILITY PRIORITIES */}

      <div
        className="panel"
        style={{ marginTop: '20px' }}
      >

        <div className="panel-header">

          <div>
            <p className="panel-label">
              CAPABILITY INTELLIGENCE
            </p>

            <h2>Priority Skills & Development Areas</h2>
          </div>

          <span className="panel-tag">
            AI INSIGHTS
          </span>

        </div>

        <div className="employee-table-card">

          <table className="employee-table">

            <thead>
              <tr>
                <th>Skill</th>
                <th>Roles Requiring Skill</th>
                <th>Priority</th>
                <th>Recommended Development</th>
              </tr>
            </thead>

            <tbody>

              {skills
                .slice(0, 30)
                .map((skill, index) => {

                  const skillName = getField(skill, [
                    'Element Name',
                    'element_name',
                    'Skill',
                    'skill',
                  ])

                  const roleCount = Number(
                    getField(skill, [
                      'Role_Count',
                      'role_count',
                      'Role Count',
                    ]) || 0
                  )

                  const priority =
                    String(
                      getField(skill, [
                        'Priority',
                        'priority',
                        'Severity',
                        'severity',
                      ]) || 'LOW'
                    ).toUpperCase()

                  const recommendation =
                    getField(skill, [
                      'Recommendation',
                      'recommendation',
                      'Recommended Training',
                      'recommended_training',
                    ]) || '-'

                  return (
                    <tr
                      key={`${skillName || 'skill'}-${index}`}
                    >

                      <td>
                        <strong>
                          {skillName || '-'}
                        </strong>
                      </td>

                      <td>
                        {roleCount.toLocaleString()}
                      </td>

                      <td>
                        {priority}
                      </td>

                      <td>
                        {recommendation}
                      </td>

                    </tr>
                  )
                })}

            </tbody>

          </table>

          {skills.length === 0 && (
            <div className="no-results">
              No capability intelligence available.
            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default Analytics