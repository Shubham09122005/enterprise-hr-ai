import { useEffect, useState } from 'react'

const API_URL = 'https://enterprise-hr-ai-5eva.onrender.com'

function Settings() {
  const [health, setHealth] = useState(null)
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/health`).then((res) => res.json()),
      fetch(`${API_URL}/model/info`).then((res) => res.json()),
    ])
      .then(([healthData, modelData]) => {
        setHealth(healthData)
        setModel(modelData)
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <header className="topbar">
        <div>
          <p className="eyebrow">SYSTEM CONFIGURATION</p>
          <h1>Settings</h1>
          <p className="subtitle">
            Monitor platform configuration, AI model status and system health.
          </p>
        </div>

        <div className="topbar-actions">
          <div className="live-badge">
            <span className="pulse"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      <section className="settings-grid">

        {/* System Status */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <p className="settings-label">SYSTEM</p>
              <h2>System Status</h2>
            </div>

            <span className="settings-status">
              {health ? 'ONLINE' : 'CHECKING'}
            </span>
          </div>

          <div className="settings-list">
            <div className="settings-row">
              <span>Backend API</span>
              <strong>
                {health ? 'Connected' : 'Checking...'}
              </strong>
            </div>

            <div className="settings-row">
              <span>API Server</span>
              <strong>FastAPI</strong>
            </div>

            <div className="settings-row">
              <span>Frontend</span>
              <strong>React + Vite</strong>
            </div>

            <div className="settings-row">
              <span>Data Mode</span>
              <strong>Real Dataset</strong>
            </div>
          </div>
        </div>

        {/* AI Model */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <p className="settings-label">ARTIFICIAL INTELLIGENCE</p>
              <h2>Attrition Model</h2>
            </div>

            <span className="settings-status model">
              ACTIVE
            </span>
          </div>

          <div className="settings-list">
            <div className="settings-row">
              <span>Model</span>
              <strong>
                {loading
                  ? 'Loading...'
                  : model?.model_name || 'Logistic Regression'}
              </strong>
            </div>

            <div className="settings-row">
              <span>Version</span>
              <strong>
                {loading
                  ? 'Loading...'
                  : model?.version || model?.model_version || 'v1.0'}
              </strong>
            </div>

            <div className="settings-row">
              <span>ROC-AUC</span>
              <strong>
                {loading
                  ? 'Loading...'
                  : model?.roc_auc
                    ? Number(model.roc_auc).toFixed(4)
                    : '0.8182'}
              </strong>
            </div>

            <div className="settings-row">
              <span>Explainability</span>
              <strong>Coefficient Based</strong>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <p className="settings-label">DATA PLATFORM</p>
              <h2>Data Sources</h2>
            </div>

            <span className="settings-status">
              CONNECTED
            </span>
          </div>

          <div className="settings-list">
            <div className="settings-row">
              <span>Employee Attrition</span>
              <strong>1470 Records</strong>
            </div>

            <div className="settings-row">
              <span>HR Performance</span>
              <strong>5000 Records</strong>
            </div>

            <div className="settings-row">
              <span>Occupation Data</span>
              <strong>1016 Records</strong>
            </div>

            <div className="settings-row">
              <span>Skill Intelligence</span>
              <strong>Active</strong>
            </div>
          </div>
        </div>

        {/* Platform Information */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <p className="settings-label">PLATFORM</p>
              <h2>Application Information</h2>
            </div>

            <span className="settings-status info">
              v1.0
            </span>
          </div>

          <div className="settings-list">
            <div className="settings-row">
              <span>Application</span>
              <strong>Enterprise HR AI</strong>
            </div>

            <div className="settings-row">
              <span>Module</span>
              <strong>Workforce Intelligence</strong>
            </div>

            <div className="settings-row">
              <span>Environment</span>
              <strong>Local Development</strong>
            </div>

            <div className="settings-row">
              <span>AI Engine</span>
              <strong>Online</strong>
            </div>
          </div>
        </div>

      </section>

      {/* Data Scope Notice */}
      <section className="settings-notice">
        <div className="notice-icon">i</div>

        <div>
          <h3>Data & Intelligence Scope</h3>
          <p>
            This platform uses the project's actual HR, engagement,
            occupation and skills datasets. Employee-level current skill
            gaps are not calculated because current employee skill data
            is not present in the source datasets.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Settings