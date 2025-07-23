import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Header from './components/header'
import SignIn from './components/singin'
import SignUp from './components/signUp' // supondo que existe
import Dashboard from './components/dashboard/dashboard'
import PrivateRoute from './routes/privateRoutes'
import { Toaster} from 'sonner'

import './global.css'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const authenticated = localStorage.getItem('authenticated')
    const expires = localStorage.getItem('expires_at')

    const now = Date.now()
    const expiration = expires ? parseInt(expires, 10) : 0

    if (authenticated === 'true' && expiration > now) {
      setIsAuthenticated(true)
    } else {
      localStorage.removeItem('authenticated')
      localStorage.removeItem('expires_at')
      setIsAuthenticated(false)
    }
  }, [])

  const handleLogin = () => {
    const expiresAt = Date.now() + 60 * 60 * 1000 // 60 minutos
    localStorage.setItem('authenticated', 'true')
    localStorage.setItem('expires_at', expiresAt.toString())
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('authenticated')
    localStorage.removeItem('expires_at')
    setIsAuthenticated(false)
  }

  return (
    <>
    <Router>
      <div className="h-screen flex flex-col bg-white text-black dark:bg-zinc-900 dark:text-white overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<SignIn onLogin={handleLogin} />} />

          <Route path="/cadastro" element={<SignUp/>} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <>
                  <header className="w-full">
                    <Header LogOut={handleLogout} />
                  </header>
                  <main className="flex-1 h-screen overflow-auto">
                    <Dashboard />
                  </main>
                </>
              </PrivateRoute>
            }
          />

          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
     <Toaster richColors position="top-right" />
  </>
  )
}
