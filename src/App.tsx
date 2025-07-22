import { useEffect, useState } from 'react'
import Header from './components/header'
import SignIn from './components/singin'
import './global.css'
import Dashboard from './components/dashboard/dashboard'

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

  const handleLogin = () =>{
    const expiresAt = Date.now() +60 * 60 * 1000 // 60 minutos
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
  <div className="h-screen flex flex-col bg-white text-black dark:bg-zinc-900 dark:text-white overflow-hidden">
    {!isAuthenticated ? (
      <main className="flex-1 flex items-center justify-center">
        <SignIn onLogin={handleLogin} />
      </main>
    ) : (
      <>
        {/* Header fixo no topo */}
        <header className="w-full">
          <Header LogOut={handleLogout} />
        </header>

        {/* Conteúdo ocupa o restante da tela com rolagem interna controlada */}
        <main className="flex-1 h-screen overflow-auto">
          <Dashboard />
        </main>
      </>
    )}
  </div>
)

}
