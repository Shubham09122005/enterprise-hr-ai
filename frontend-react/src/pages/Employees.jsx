import { useEffect, useState } from 'react'

const API_URL = 'https://enterprise-hr-ai-5eva.onrender.com'

function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/employees`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch employees')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Employee API response:', data)

        // Backend can return either:
        // 1. Direct array
        // 2. { employees: [...] }
        const employeeData = Array.isArray(data)
          ? data
          : Array.isArray(data.employees)
            ? data.employees
            : []

        setEmployees(employeeData)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Unable to load employee data')
        setLoading(false)
      })
  }, [])

  const filteredEmployees = employees.filter((employee) => {
    const employeeId = String(
      employee.Employee_ID ?? employee.employee_id ?? ''
    )

    const department = String(
      employee.Department ?? employee.department ?? ''
    ).toLowerCase()

    const jobRole = String(
      employee.Role ?? employee.JobRole ?? employee.job_role ?? ''
    ).toLowerCase()

    const searchText = search.toLowerCase()

    return (
      employeeId.includes(searchText) ||
      department.includes(searchText) ||
      jobRole.includes(searchText)
    )
  })

  if (loading) {
    return (
      <div className="page-container">
        <h1>Employees</h1>
        <p>Loading employee data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>Employees</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">WORKFORCE DATABASE</p>

          <h1>Employees</h1>

          <p className="page-subtitle">
            Explore and analyze your organization's real workforce data.
          </p>
        </div>

        <div className="employee-count">
          {employees.length.toLocaleString()} Employees
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by employee ID, department or job role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="employee-table-card">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Age</th>
              <th>Job Role</th>
              <th>Monthly Income</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.slice(0, 50).map((employee) => {
              const employeeId =
                employee.Employee_ID ?? employee.employee_id

              const department =
                employee.Department ?? employee.department

              const age =
                employee.Age ?? employee.age

              const jobRole =
                employee.Role ??
                employee.JobRole ??
                employee.job_role

              const monthlyIncome =
                employee.Monthly_Income ??
                employee.monthly_income

              return (
                <tr key={employeeId}>
                  <td>
                    <div className="employee-name">
                      <div className="employee-avatar">
                        E
                      </div>

                      Employee #{employeeId}
                    </div>
                  </td>

                  <td>{department || '-'}</td>

                  <td>{age || '-'}</td>

                  <td>{jobRole || '-'}</td>

                  <td>
                    {monthlyIncome !== null &&
                    monthlyIncome !== undefined &&
                    monthlyIncome !== ''
                      ? `$${Number(monthlyIncome).toLocaleString()}`
                      : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="no-results">
            No employees found.
          </div>
        )}
      </div>
    </div>
  )
}

export default Employees