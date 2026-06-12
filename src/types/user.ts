export type NivelAcesso = "visualizador" | "admin" | "superAdmin";

export type NivelAcessoApi = NivelAcesso | "pendente" | (string & {});

export interface UserRecord {
  id: number;
  nome: string;
  email: string;
  nivel_acesso: NivelAcessoApi;
  created_at: string;
}

export const NIVEL_ACESSO_OPTIONS: { value: NivelAcesso; label: string }[] = [
  { value: "visualizador", label: "Visualizador" },
  { value: "admin", label: "Admin" },
  { value: "superAdmin", label: "Super Admin" },
];

export function isNivelAcessoEditavel(
  nivel: string | null | undefined,
): nivel is NivelAcesso {
  return NIVEL_ACESSO_OPTIONS.some((option) => option.value === nivel);
}

export function getNivelAcessoInicialParaEdicao(
  nivel: string | null | undefined,
): NivelAcesso | "" {
  return isNivelAcessoEditavel(nivel) ? nivel : "";
}
