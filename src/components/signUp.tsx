import { KeySquareIcon, Mail, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PasswordField from "./PasswordField";
import PasswordRequirements, { ConfirmPasswordFeedback } from "./PasswordRequirements";
import api from "../services/api";
import { isValidPassword, PASSWORD_MIN_LENGTH, PASSWORD_VALIDATION_ERROR_MESSAGE } from "../utils/passwordValidation";

export default function SignUp() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activePasswordField, setActivePasswordField] = useState<
    "password" | "confirm" | null
  >(null);

  const handleConfirmFocus = () => {
    setConfirmPassword("");
    setActivePasswordField("confirm");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword) {
      setConfirmPassword("");
    }
  };
  const showPasswordRequirements =
    password.length > 0 &&
    activePasswordField !== "confirm" &&
    confirmPassword.length === 0;

  const showConfirmFeedback =
    password.length > 0 &&
    (activePasswordField === "confirm" || confirmPassword.length > 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);

    const nome = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();

    if (!isValidPassword(password)) {
      toast.error(PASSWORD_VALIDATION_ERROR_MESSAGE, { closeButton: true });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.", { closeButton: true });
      return;
    }

    const payload = {
      nome,
      email,
      senha: password,
    };

    try {
      await api.post("/cadastrar-usuario", payload);

      toast.success(
        "Cadastro realizado com sucesso! Entre em contato com a equipe de CVE para ativar sua conta.",
        { closeButton: true },
      );
      navigate("/login");
      form.reset();
      setPassword("");
      setConfirmPassword("");
      setActivePasswordField(null);
    } catch (err: unknown) {
      const errorData = (err as {
        response?: {
          data?: {
            mensagem?: string;
            message?: string;
            erro?: string;
            error?: string;
          };
        };
      })?.response?.data;

      const apiMsg =
        errorData?.mensagem ??
        errorData?.erro ??
        errorData?.message ??
        errorData?.error;

      const msg =
        apiMsg === "Erro ao cadastrar usuário"
          ? "Não foi possível cadastrar. Este e-mail pode já estar em uso — tente fazer login ou entre em contato com a equipe de CVE."
          : apiMsg ?? "Falha ao cadastrar. Verifique os dados e tente novamente.";

      toast.error(msg, { closeButton: true });
    }
  };

  const handleLogin = () => navigate("/login");

  return (
    <div className="flex items-center justify-center min-h-screen py-8 bg-white text-black dark:bg-zinc-900 dark:text-white">
      <div className="flex flex-col justify-center items-center transition-colors duration-300 bg-white text-black dark:bg-zinc-800 dark:text-white border-2 min-w-96 w-96 p-8 border-sky-300 rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700">
        <KeySquareIcon size={64} className="mb-4" />
        <h1 className="text-4xl font-bold">License</h1>
        <h2 className="mt-8 text-2xl">Crie sua conta</h2>

        <label className="font-light mt-2">
          Já possui uma conta?{" "}
          <button
            type="button"
            onClick={handleLogin}
            className="text-sky-500 underline hover:text-sky-600 transition-colors"
          >
            Entrar
          </button>
        </label>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center gap-4 mt-8 w-full max-w-md"
        >
          <label className="flex items-center gap-2 border-2 border-sky-300 p-2 rounded-md w-full transition-colors focus-within:border-sky-500 focus-within:bg-sky-50 dark:focus-within:bg-zinc-800">
            <User className="w-5 h-5 text-sky-500" />
            <div className="flex flex-row items-center gap-2 w-full">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Nome:
              </span>
              <input
                type="text"
                name="name"
                className="bg-transparent outline-none border-none text-black dark:text-white placeholder:text-gray-400 w-full"
                placeholder="Digite seu nome completo"
                required
              />
            </div>
          </label>

          <label className="flex items-center gap-2 border-2 border-sky-300 p-2 rounded-md w-full transition-colors focus-within:border-sky-500 focus-within:bg-sky-50 dark:focus-within:bg-zinc-800">
            <Mail className="w-5 h-5 text-sky-500" />
            <div className="flex flex-row items-center gap-2 w-full">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Email:
              </span>
              <input
                type="email"
                name="email"
                className="bg-transparent outline-none border-none text-black dark:text-white placeholder:text-gray-400 w-full"
                placeholder="Digite seu e-mail"
                required
              />
            </div>
          </label>

          <div className="w-full">
            <PasswordField
              name="password"
              label="Senha:"
              placeholder="Crie uma senha"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setActivePasswordField("password")}
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
            />
            {showPasswordRequirements && (
              <PasswordRequirements password={password} />
            )}
          </div>

          <div className="w-full">
            <PasswordField
              name="confirmPassword"
              label="Confirmar:"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              onFocus={handleConfirmFocus}
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
            />
            <ConfirmPasswordFeedback
              password={password}
              confirmPassword={confirmPassword}
              visible={showConfirmFeedback}
            />
          </div>

          <button
            type="submit"
            className="bg-sky-500 text-white p-2 rounded-md w-full hover:bg-sky-600 transition cursor-pointer"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
