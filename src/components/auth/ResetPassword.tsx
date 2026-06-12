import { KeyRound, Loader } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import AuthCard from "./AuthCard";
import PasswordField from "../PasswordField";
import PasswordRequirements, { ConfirmPasswordFeedback } from "../PasswordRequirements";
import {
  getApiErrorMessage,
  isNetworkError,
  redefinirSenha,
} from "../../services/authApi";
import {
  isValidPassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_VALIDATION_ERROR_MESSAGE,
} from "../../utils/passwordValidation";

function InvalidTokenView() {
  return (
    <AuthCard title="Link inválido">
      <div className="mt-8 w-full space-y-4 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Este link de redefinição é inválido ou expirou. Os links são válidos por 60 minutos e
          podem ser usados apenas uma vez.
        </p>
        <Link
          to="/auth/forgot-password"
          className="inline-flex items-center justify-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-md w-full hover:bg-sky-600 transition"
        >
          Solicitar novo link
        </Link>
        <Link to="/login" className="block text-sm text-sky-500 underline hover:text-sky-600">
          Voltar ao login
        </Link>
      </div>
    </AuthCard>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activePasswordField, setActivePasswordField] = useState<
    "password" | "confirm" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  if (!token) {
    return <InvalidTokenView />;
  }

  const handleConfirmFocus = () => {
    setConfirmPassword("");
    setActivePasswordField("confirm");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword) {
      setConfirmPassword("");
    }
    setTokenError(null);
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
    setTokenError(null);

    if (!isValidPassword(password)) {
      toast.error(PASSWORD_VALIDATION_ERROR_MESSAGE, { closeButton: true });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.", { closeButton: true });
      return;
    }

    setLoading(true);
    try {
      const response = await redefinirSenha(token, password);
      navigate("/login", {
        replace: true,
        state: {
          message: response.mensagem ?? "Senha redefinida com sucesso. Faça login com sua nova senha.",
        },
      });
    } catch (err: unknown) {
      const apiMsg = getApiErrorMessage(err, "Erro ao redefinir senha. Tente novamente.");
      const isTokenIssue =
        apiMsg.toLowerCase().includes("token inválido") ||
        apiMsg.toLowerCase().includes("token invalido") ||
        apiMsg.toLowerCase().includes("expirado");

      if (isTokenIssue) {
        setTokenError(apiMsg);
      } else if (isNetworkError(err)) {
        toast.error(
          "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
          { closeButton: true },
        );
      } else if (apiMsg.includes("Mínimo 8 caracteres")) {
        toast.error(PASSWORD_VALIDATION_ERROR_MESSAGE, { closeButton: true });
      } else {
        toast.error(apiMsg, { closeButton: true });
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <AuthCard title="Não foi possível redefinir">
        <div className="mt-8 w-full space-y-4 text-center">
          <p
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {tokenError}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Solicite um novo link de recuperação para continuar.
          </p>
          <Link
            to="/auth/forgot-password"
            className="inline-flex items-center justify-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-md w-full hover:bg-sky-600 transition"
          >
            Solicitar novo link
          </Link>
          <Link to="/login" className="block text-sm text-sky-500 underline hover:text-sky-600">
            Voltar ao login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Nova senha"
      subtitle={
        <>
          Crie uma nova senha para sua conta.{" "}
          <Link to="/login" className="text-sky-500 underline hover:text-sky-600">
            Voltar ao login
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center gap-4 mt-8 w-full"
        noValidate
      >
        <div className="w-full">
          <PasswordField
            name="password"
            label="Senha:"
            placeholder="Nova senha"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setActivePasswordField("password")}
            minLength={PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
          />
          {showPasswordRequirements && <PasswordRequirements password={password} />}
        </div>

        <div className="w-full">
          <PasswordField
            name="confirmPassword"
            label="Confirmar:"
            placeholder="Confirme a nova senha"
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
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-sky-500 text-white p-2 rounded-md w-full hover:bg-sky-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="animate-spin w-5 h-5" aria-hidden />
          ) : (
            <>
              <KeyRound size={16} aria-hidden />
              Redefinir senha
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
