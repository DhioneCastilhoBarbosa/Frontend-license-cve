import { Loader, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthCard from "./AuthCard";
import {
  GENERIC_RECOVERY_SUCCESS_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
  solicitarRecuperacaoSenha,
} from "../../services/authApi";

const COOLDOWN_SECONDS = 120;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cooldown > 0) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Informe seu e-mail.");
      return;
    }

    setLoading(true);
    try {
      await solicitarRecuperacaoSenha(trimmedEmail);
      setSubmitted(true);
      setCooldown(COOLDOWN_SECONDS);
      toast.success(GENERIC_RECOVERY_SUCCESS_MESSAGE, { closeButton: true });
    } catch (err: unknown) {
      const msg = isNetworkError(err)
        ? "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
        : getApiErrorMessage(err, "Não foi possível processar sua solicitação. Tente novamente.");

      toast.error(msg, { closeButton: true });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || cooldown > 0;

  return (
    <AuthCard
      title="Recuperar senha"
      subtitle="Informe o e-mail da sua conta. Enviaremos instruções se ele estiver cadastrado."
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center gap-4 mt-8 w-full"
        noValidate
      >
        {submitted && (
          <p
            className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
            role="status"
          >
            {GENERIC_RECOVERY_SUCCESS_MESSAGE}
          </p>
        )}

        <label className="flex items-center gap-2 border-2 border-sky-300 p-2 rounded-md w-full transition-colors focus-within:border-sky-500 focus-within:bg-sky-50 dark:focus-within:bg-zinc-800">
          <Mail className="w-5 h-5 text-sky-500 shrink-0" />
          <div className="flex flex-row items-center gap-2 w-full min-w-0">
            <span className="text-sm text-gray-600 dark:text-gray-300 shrink-0">Email:</span>
            <input
              type="email"
              name="email"
              required
              aria-label="E-mail"
              aria-invalid={false}
              className="bg-transparent outline-none border-none text-black dark:text-white placeholder:text-gray-400 w-full min-w-0"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={isDisabled}
          className="flex items-center justify-center gap-2 bg-sky-500 text-white p-2 rounded-md w-full hover:bg-sky-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="animate-spin w-5 h-5" aria-hidden />
          ) : cooldown > 0 ? (
            `Aguarde ${cooldown}s para reenviar`
          ) : (
            "Enviar instruções"
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-sm text-sky-500 underline hover:text-sky-600 cursor-pointer"
        >
          Voltar ao login
        </button>
      </form>
    </AuthCard>
  );
}
