import { KeySquareIcon, Moon, SunIcon } from "lucide-react"
import { useLayoutEffect, useState } from "react"

interface HeaderProps {
  LogOut: () => void;
}

export default function Header({ LogOut }: HeaderProps) {
  const [isDark, setIsDark] = useState(false)

  const handleSubmit = () => {
    
    LogOut()
  }

  useLayoutEffect(() => {
    // Usa useLayoutEffect para garantir que a classe 'dark' entra antes da renderização
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    console.log('Theme changed:', isDark ? 'Dark' : 'Light')
  }, [isDark])
  return (
    <header className="w-full flex flex-row justify-between transition-colors duration-300 bg-white text-black dark:bg-zinc-800 dark:text-white border-b-2 border-sky-300 p-4">
      <div className=" flex gap-2 text-2xl justify-center items-center">
        <KeySquareIcon size={24}/> 
        <span>License</span>
      </div>
      <div className="flex gap-8 items-center">
        <button onClick={() => setIsDark(!isDark)}>
          {isDark ? <SunIcon /> : <Moon />}
        </button>
        <button onClick={handleSubmit}>
          Sair
        </button>
      </div>
    </header>
  )
}