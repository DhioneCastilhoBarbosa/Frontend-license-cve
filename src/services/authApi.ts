import api from "./api";

export const GENERIC_RECOVERY_SUCCESS_MESSAGE =
  "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.";

export async function solicitarRecuperacaoSenha(email: string) {
  const response = await api.post("/solicitar-recuperacao-senha", { email });
  return response.data as { mensagem?: string };
}

export async function redefinirSenha(token: string, senha: string) {
  const response = await api.post("/redefinir-senha", { token, senha });
  return response.data as { mensagem?: string };
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== "object" || !("response" in err)) {
    return fallback;
  }

  const data = (err as { response?: { data?: { erro?: string; mensagem?: string } } })
    .response?.data;

  return data?.erro ?? data?.mensagem ?? fallback;
}

export function isNetworkError(err: unknown): boolean {
  return (
    !!err &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: string }).code === "ERR_NETWORK"
  );
}
