import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import TargetsPage from './pages/TargetsPage'
import ScansPage from './pages/ScansPage'
import ScanDetailPage from './pages/ScanDetailPage'
import ScanExecutionPage from './pages/ScanExecutionPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/targets" element={<TargetsPage />} />
                <Route path="/scans" element={<ScansPage />} />
                <Route path="/scans/:scanId" element={<ScanDetailPage />} />
                <Route path="/scan/execute" element={<ScanExecutionPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App