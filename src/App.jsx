import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'

const USERS_URL = 'https://jsonplaceholder.typicode.com/users'

function Initials({ name }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return <span className="avatar" aria-hidden="true">{initials}</span>
}

function Dashboard() {
  const [employees, setEmployees] = useState([])
  const [status, setStatus] = useState('loading')
  const [query, setQuery] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadEmployees() {
      setStatus('loading')
      try {
        const response = await fetch(USERS_URL, { signal: controller.signal })
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error('Unexpected response')
        setEmployees(data)
        setStatus('success')
      } catch (error) {
        if (error.name !== 'AbortError') setStatus('error')
      }
    }

    loadEmployees()
    return () => controller.abort()
  }, [reloadKey])

  const visibleEmployees = employees.filter(({ id, name, email }) =>
    `${id} ${name} ${email}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <main className="container page-content">
      <div className="heading-row">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Employee dashboard</h1>
          <p className="page-subtitle">A simple view of your people directory.</p>
        </div>
        <Link className="btn btn-primary add-button" to="/employee-form">
          <span aria-hidden="true">＋</span> Employee form
        </Link>
      </div>

      <section className="summary-card" aria-label="Directory summary">
        <div className="summary-icon" aria-hidden="true">♧</div>
        <div>
          <div className="summary-label">TOTAL EMPLOYEES</div>
          <div className="summary-count">{status === 'success' ? employees.length : '—'}</div>
          <div className="summary-note">From JSONPlaceholder users API</div>
        </div>
      </section>

      <section className="directory-card" aria-labelledby="directory-title">
        <div className="directory-header">
          <div>
            <h2 id="directory-title">Employee directory</h2>
            <p>Names and email addresses of all employees.</p>
          </div>
          <label className="search-box">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <span className="visually-hidden">Search employees</span>
            <input
              type="search"
              placeholder="Search employees..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {status === 'loading' && <div className="state-message" role="status">Loading employees…</div>}
        {status === 'error' && (
          <div className="state-message" role="alert">
            <p>We couldn’t load the employee directory. Check your connection and try again.</p>
            <button className="btn btn-outline-primary" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
          </div>
        )}
        {status === 'success' && (
          <div className="table-responsive">
            <table className="table employee-table mb-0">
              <thead>
                <tr><th scope="col">ID</th><th scope="col">NAME</th><th scope="col">EMAIL</th></tr>
              </thead>
              <tbody>
                {visibleEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="id-cell">#{String(employee.id).padStart(2, '0')}</td>
                    <td><div className="name-cell"><Initials name={employee.name} /><span>{employee.name}</span></div></td>
                    <td><a href={`mailto:${employee.email}`}>{employee.email}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleEmployees.length === 0 && <div className="state-message">No employees match your search.</div>}
          </div>
        )}
        {status === 'success' && (
          <div className="directory-footer">Showing {visibleEmployees.length} of {employees.length} employees</div>
        )}
      </section>
    </main>
  )
}

function EmployeeForm() {
  const [values, setValues] = useState({ name: '', designation: '', location: '', salary: '' })

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function resetForm() {
    setValues({ name: '', designation: '', location: '', salary: '' })
  }

  return (
    <main className="container page-content form-page">
      <p className="eyebrow">EMPLOYEE DETAILS</p>
      <h1>Employee form</h1>
      <p className="page-subtitle">Enter employee information below.</p>

      <section className="form-card" aria-labelledby="form-title">
        <div className="form-card-header">
          <div className="form-icon" aria-hidden="true">✎</div>
          <div>
            <h2 id="form-title">Employee information</h2>
            <p>Fill in the details for an employee.</p>
          </div>
        </div>
        <form onSubmit={(event) => event.preventDefault()}>
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label" htmlFor="name">Name</label>
              <input className="form-control" id="name" name="name" type="text" placeholder="e.g. Jane Cooper" autoComplete="name" value={values.name} onChange={updateField} />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="designation">Designation</label>
              <input className="form-control" id="designation" name="designation" type="text" placeholder="e.g. Product Designer" value={values.designation} onChange={updateField} />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="location">Location</label>
              <input className="form-control" id="location" name="location" type="text" placeholder="e.g. New York" value={values.location} onChange={updateField} />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="salary">Salary</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input className="form-control" id="salary" name="salary" type="number" min="0" step="0.01" placeholder="e.g. 65000" inputMode="decimal" value={values.salary} onChange={updateField} />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <p>This form is for display only. Information is not submitted or saved.</p>
            <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>Clear form</button>
          </div>
        </form>
      </section>
      <Link className="back-link" to="/">← Back to dashboard</Link>
    </main>
  )
}

export default function App() {
  return (
    <>
      <header className="site-header">
        <nav className="container navbar navbar-expand-sm" aria-label="Main navigation">
          <Link className="navbar-brand" to="/"><span className="brand-mark" aria-hidden="true">E</span><span>Employee<span className="brand-accent">Hub</span></span></Link>
          <div className="nav-links">
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end to="/">Home</NavLink>
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/employee-form">Employee form</NavLink>
          </div>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employee-form" element={<EmployeeForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
