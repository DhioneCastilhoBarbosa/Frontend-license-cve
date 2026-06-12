import { KeySquareIcon, Loader, Mail } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PasswordField from "./PasswordField";


interface SignInProps {
  onLogin: () => void;
}

export default function SignIn({onLogin}: SignInProps){

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const state = location.state as { message?: string } | null
    if (state?.message) {
      toast.success(state.message, { closeButton: true })
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])
  
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  try {
    const resposta = await api.post('/login', {
      email: email,
      senha: password,
    });

    const { token, nome, nivel_acesso } = resposta.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_nome', nome ?? '');
    localStorage.setItem('nivel_acesso', nivel_acesso ?? 'visualizador');

    localStorage.setItem('authenticated', 'true');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 60 minutos
    localStorage.setItem('expires_at', expiresAt.toString());

    onLogin();
    navigate('/dashboard');
  } catch (erro: unknown) {
    console.error('Erro ao fazer login', erro);
    toast.error('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
  } finally {
    setLoading(false);
  }
}



  const handleRegister = () => {
    navigate("/cadastro") 
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
            />
          </div>
        </label>

        <PasswordField
          name="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <Link
          to="/auth/forgot-password"
          className="self-end text-sm text-sky-500 underline hover:text-sky-600 transition-colors"
        >
          Esqueci minha senha
        </Link>

        <button 
          disabled={loading}
          className="flex items-center justify-center bg-sky-500 text-white p-2 rounded-md w-full hover:bg-sky-600 transition cursor-pointer">
            {loading ? <Loader className="animate-spin w-5 h-5" /> : 'Login'}
        </button>
      </form>


    </div>
    </div>
  )
}