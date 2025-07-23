import { KeySquareIcon, Lock, Mail } from "lucide-react"
import { useNavigate } from "react-router-dom";


interface SignInProps {
  onLogin: () => void;
}

export default function SignIn({onLogin}: SignInProps){

  const navigate = useNavigate()
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Aqui você faria a autenticação real
    onLogin()
    navigate("/dashboard") // redireciona após login
  }

  const handleRegister = () => {
    navigate("/cadastro") // redireciona para a página de cadastro
  }

  return (
    <div className="flex items-center justify-center h-screen bg-white text-black dark:bg-zinc-900 dark:text-white">
    <div className=" flex flex-col  justify-center items-center transition-colors duration-300 bg-white text-black dark:bg-zinc-800 dark:text-white border-2 min-w-96 w-96 p-8  border-sky-300 rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700" >
      <KeySquareIcon size={64} className="mb-4" />
      <h1 className="text-4xl font-bold">License</h1>
      <h2 className="mt-8 text-2xl">Bem vindo!</h2>
      <label className="font-light mt-2">Não tem uma conta? <a href="#"  className="text-sky-500 underline hover:text-sky-600 transition-colors" onClick={handleRegister}>Cadastre-se aqui.</a> </label>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center gap-4 mt-8 w-full max-w-md"
      >
        <label className="flex items-center gap-2 border-2 border-sky-300 p-2 rounded-md w-full transition-colors focus-within:border-sky-500 focus-within:bg-sky-50 dark:focus-within:bg-zinc-800">
          <Mail className="w-5 h-5 text-sky-500" />
          <div className="flex flex-row items-center gap-2 w-full">
            <span className="text-sm text-gray-600 dark:text-gray-300">Email:</span>
            <input
              type="email"
              name="email"
              className="bg-transparent outline-none border-none text-black dark:text-white placeholder:text-gray-400 w-full"
              placeholder="Digite seu e-mail"
            />
          </div>
        </label>

        <label className="flex items-center gap-2 border-2 border-sky-300 p-2 rounded-md w-full transition-colors focus-within:border-sky-500 focus-within:bg-sky-50 dark:focus-within:bg-zinc-800">
          <Lock className="w-5 h-5 text-sky-500" />
          <div className="flex flex-row items-center gap-2 w-full">
            <span className="text-sm text-gray-600 dark:text-gray-300">Senha:</span>
            <input
              type="password"
              name="password"
              className="bg-transparent outline-none border-none text-black dark:text-white placeholder:text-gray-400 w-full"
              placeholder="Digite sua senha"
            />
          </div>
        </label>

        <button className="bg-sky-500 text-white p-2 rounded-md w-full hover:bg-sky-600 transition cursor-pointer">
          Login
        </button>
      </form>


    </div>
    </div>
  )
}