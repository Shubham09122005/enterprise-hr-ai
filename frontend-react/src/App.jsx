import { NavLink, Routes, Route } from 'react-router-dom'
import './App.css'

import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import RiskAnalysis from './pages/RiskAnalysis'
import SkillIntelligence from './pages/SkillIntelligence'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">AI</div>
          <div>
            <h2>Enterprise</h2>
            <span>HR Intelligence</span>
          </div>
        </div>

        <nav>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            ▦ Dashboard
          </NavLink>

          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            👥 Employees
          </NavLink>

          <NavLink
            to="/risk-analysis"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            ⚠ Risk Analysis
          </NavLink>

          <NavLink
            to="/skills"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            🧠 Skill Intelligence
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            📊 Analytics
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            ⚙ Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot"></div>
          AI Engine Online
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/risk-analysis" element={<RiskAnalysis />} />
          <Route path="/skills" element={<SkillIntelligence />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App