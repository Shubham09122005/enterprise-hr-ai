import { useEffect, useState } from 'react'

const API_URL = 'https://enterprise-hr-ai-5eva.onrender.com'

// Safely read a field even if backend changes
// spaces / underscores / capitalization.
function getField(row, possibleNames) {
  if (!row || typeof row !== 'object') return ''

  // Exact match first
  for (const name of possibleNames) {
    if (
      Object.prototype.hasOwnProperty.call(row, name) &&
      row[name] !== null &&
      row[name] !== undefined
    ) {
      return row[name]
    }
  }

  // Normalized match
  const normalize = (value) =>
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')

  const normalizedKeys = Object.keys(row).reduce((acc, key) => {
    acc[normalize(key)] = key
    return acc
  }, {})

  for (const name of possibleNames) {
    const normalizedName = normalize(name)
    const actualKey = normalizedKeys[normalizedName]

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

function SkillIntelligence() {
  const [skills, setSkills] = useState([])
  const [softwareSkills, setSoftwareSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/dashboard/skill-gaps`).then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load skill gaps')
        }
        return res.json()
      }),

      fetch(`${API_URL}/dashboard/role-skills`).then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load role skills')
        }
        return res.json()
      }),
    ])
      .then(([skillData, roleSkillData]) => {
        setSkills(
          Array.isArray(skillData)
            ? skillData
            : skillData?.data || skillData?.skills || []
        )

        setSoftwareSkills(
          Array.isArray(roleSkillData)
            ? roleSkillData
            : roleSkillData?.data || roleSkillData?.skills || []
        )

        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Unable to load skill intelligence data')
        setLoading(false)
      })
  }, [])

  // HIGH PRIORITY
  const highPriority = skills.filter((skill) => {
    const priority = String(
      getField(skill, [
        'Priority',
        'priority',
        'Severity',
        'severity',
      ])
    ).toUpperCase()

    return priority === 'HIGH'
  })

  // MEDIUM PRIORITY
  const mediumPriority = skills.filter((skill) => {
    const priority = String(
      getField(skill, [
        'Priority',
        'priority',
        'Severity',
        'severity',
      ])
    ).toUpperCase()

    return priority === 'MEDIUM'
  })

  if (loading) {
    return (
      <div className="page-container">
        <h1>Skill Intelligence</h1>
        <p>Loading skill intelligence...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>Skill Intelligence</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="page-container">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            WORKFORCE CAPABILITY
          </p>

          <h1>Skill Intelligence</h1>

          <p className="page-subtitle">
            Understand organization-wide skill demand and
            identify priority areas for workforce development.
          </p>
        </div>

        <div className="employee-count">
          {skills.length} Skill Priorities
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-label">
            SKILL PRIORITIES
          </div>

          <div className="stat-value">
            {skills.length}
          </div>

          <div className="stat-footer">
            Identified across workforce roles
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            HIGH PRIORITY
          </div>

          <div className="stat-value">
            {highPriority.length}
          </div>

          <div className="stat-footer">
            Requires immediate attention
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            MEDIUM PRIORITY
          </div>

          <div className="stat-value">
            {mediumPriority.length}
          </div>

          <div className="stat-footer">
            Development opportunities
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            SOFTWARE SKILLS
          </div>

          <div className="stat-value">
            {softwareSkills.length}
          </div>

          <div className="stat-footer">
            Technology requirements
          </div>
        </div>

      </div>

      {/* ORGANIZATION SKILL INTELLIGENCE */}

      <div className="panel">

        <div className="panel-header">

          <div>
            <p className="panel-label">
              ORGANIZATION INTELLIGENCE
            </p>

            <h2>Critical Skill Priorities</h2>
          </div>

          <span className="panel-tag">
            LIVE DATA
          </span>

        </div>

        <div className="employee-table-card">

          <table className="employee-table">

            <thead>
              <tr>
                <th>Skill</th>
                <th>Roles Requiring Skill</th>
                <th>Priority</th>
                <th>Recommended Training</th>
              </tr>
            </thead>

            <tbody>

              {skills.map((skill, index) => {

                const skillName = getField(skill, [
                  'Element Name',
                  'element_name',
                  'ElementName',
                  'Skill',
                  'skill',
                ])

                const roleCount = getField(skill, [
                  'Role_Count',
                  'role_count',
                  'Role Count',
                  'roleCount',
                  'Employees Missing',
                  'employees_missing',
                ])

                const priority = String(
                  getField(skill, [
                    'Priority',
                    'priority',
                    'Severity',
                    'severity',
                  ]) || 'LOW'
                ).toUpperCase()

                const recommendation = getField(skill, [
                  'Recommendation',
                  'recommendation',
                  'Recommended Training',
                  'recommended_training',
                ])

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
                      {Number(roleCount || 0).toLocaleString()}
                    </td>

                    <td>
                      <span
                        className={`skill-severity ${priority.toLowerCase()}`}
                      >
                        {priority}
                      </span>
                    </td>

                    <td>
                      {recommendation || '-'}
                    </td>

                  </tr>
                )
              })}

            </tbody>

          </table>

          {skills.length === 0 && (
            <div className="no-results">
              No organization skill priorities available.
            </div>
          )}

        </div>

      </div>

      {/* ROLE / SOFTWARE SKILLS */}

      <div
        className="panel"
        style={{ marginTop: '20px' }}
      >

        <div className="panel-header">

          <div>
            <p className="panel-label">
              TECHNOLOGY INTELLIGENCE
            </p>

            <h2>Role Skill Requirements</h2>
          </div>

          <span className="panel-tag">
            O*NET DATA
          </span>

        </div>

        <div className="employee-table-card">

          <table className="employee-table">

            <thead>
              <tr>
                <th>Role / Occupation</th>
                <th>Skill</th>
                <th>Technology</th>
                <th>In Demand</th>
              </tr>
            </thead>

            <tbody>

              {softwareSkills
                .slice(0, 50)
                .map((skill, index) => {

                  const title = getField(skill, [
                    'Title',
                    'title',
                  ])

                  const elementName = getField(skill, [
                    'Element Name',
                    'element_name',
                    'ElementName',
                  ])

                  const hotTechnology = getField(skill, [
                    'Hot Technology',
                    'hot_technology',
                    'HotTechnology',
                  ])

                  const inDemand = getField(skill, [
                    'In Demand',
                    'in_demand',
                    'InDemand',
                  ])

                  const occupationCode = getField(skill, [
                    'O*NET-SOC Code',
                    'ONET-SOC Code',
                    'onet_soc_code',
                  ])

                  return (
                    <tr
                      key={`${occupationCode || 'skill'}-${index}`}
                    >

                      <td>
                        {title || '-'}
                      </td>

                      <td>
                        {elementName || '-'}
                      </td>

                      <td>
                        {String(hotTechnology).toUpperCase() === 'Y'
                          ? 'Yes'
                          : 'No'}
                      </td>

                      <td>
                        {String(inDemand).toUpperCase() === 'Y'
                          ? 'Yes'
                          : 'No'}
                      </td>

                    </tr>
                  )
                })}

            </tbody>

          </table>

          {softwareSkills.length === 0 && (
            <div className="no-results">
              No role skill data available.
            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default SkillIntelligence