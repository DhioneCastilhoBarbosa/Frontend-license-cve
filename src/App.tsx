import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'

import SignIn from './components/singin'
import SignUp from './components/signUp'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import PasswordResetTokenRedirect from './components/auth/PasswordResetTokenRedirect'
import Dashboard from './components/dashboard/dashboard'
import AppLayout from './components/layout/AppLayout'
import type { AppPage } from './components/layout/Sidebar'
import UsersPage from './components/users/Users'

import { Toaster} from 'sonner'
import { useTheme } from './hooks/useTheme'

import './global.css'
import Key from './components/keys/key'
import RequestKey from './components/requestKey'
import TermosDeUso from './components/termosDeUso'
import PrivateRoute from './routes/PrivateRoute'
import { canAccessUsers } from './utils/permissions'


export default function App() {
   const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activePage, setActivePage] = useState<AppPage>('dashboard')
  const [userEmail, setUserEmail] = useState('')
  const [userNome, setUserNome] = useState('')
  const [nivelAcesso, setNivelAcesso] = useState('')
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const authenticated = localStorage.getItem('authenticated')
    const expires = localStorage.getItem('expires_at')
    const now = Date.now()
    const expiration = expires ? parseInt(expires, 10) : 0

    if (authenticated === 'true' && expiration > now) {
      setIsAuthenticated(true)
      setUserEmail(localStorage.getItem('user_email') ?? '')
      setUserNome(localStorage.getItem('user_nome') ?? '')
      setNivelAcesso(localStorage.getItem('nivel_acesso') ?? '')
    } else {
      localStorage.removeItem('authenticated')
      localStorage.removeItem('expires_at')
      localStorage.removeItem('token')
      localStorage.removeItem('user_email')
      localStorage.removeItem('user_nome')
      localStorage.removeItem('nivel_acesso')
    }

    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    const expiresAt = Date.now() + 60 * 60 * 1000
    localStorage.setItem('authenticated', 'true')
    localStorage.setItem('expires_at', expiresAt.toString())
    setUserEmail(localStorage.getItem('user_email') ?? '')
    setUserNome(localStorage.getItem('user_nome') ?? '')
    setNivelAcesso(localStorage.getItem('nivel_acesso') ?? '')
    setIsAuthenticated(true)
  }

  const handleNavigate = (page: AppPage) => {
    if (page === 'users' && !canAccessUsers(nivelAcesso)) {
      return
    }
    setActivePage(page)
  }

  const handleLogout = () => {
    localStorage.removeItem('authenticated')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_nome')
    localStorage.removeItem('nivel_acesso')
    setActivePage('dashboard')
    setIsAuthenticated(false)
    setUserNome('')
    setNivelAcesso('')
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    if (activePage === 'users' && !canAccessUsers(nivelAcesso)) {
      setActivePage('dashboard')
    }
  }, [activePage, nivelAcesso])

  const renderPage = () => {
    switch (activePage) {
      case 'key':
        return <Key canWrite={nivelAcesso !== 'visualizador'} />
      case 'users':
        return canAccessUsers(nivelAcesso) ? <UsersPage /> : <Dashboard canWrite={nivelAcesso !== 'visualizador'} />
      default:
        return <Dashboard canWrite={nivelAcesso !== 'visualizador'} />
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-black dark:text-white">
        Carregando...
      </div>
    )
  }

  return (
    <>
        <PasswordResetTokenRedirect />
        <div className="h-screen flex flex-col bg-white text-black dark:bg-zinc-900 dark:text-white overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/solicitar-chave" replace />} />

            <Route path="/solicitar-chave" element={<RequestKey />} />
            <Route path="/termos-de-uso" element={<TermosDeUso />} />
            <Route path="/login" element={<SignIn onLogin={handleLogin} />} />
            <Route path="/cadastro" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <AppLayout
                    activePage={activePage}
                    isDark={isDark}
                    userEmail={userEmail}
                    userNome={userNome}
                    nivelAcesso={nivelAcesso}
                    onNavigate={handleNavigate}
                    onToggleTheme={toggleTheme}
                    onLogout={handleLogout}
                  >
                    {renderPage()}
                  </AppLayout>
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/solicitar-chave" replace />} />
          </Routes>

        </div>
      
      <Toaster richColors position="top-right" />
    </>
  )
}
