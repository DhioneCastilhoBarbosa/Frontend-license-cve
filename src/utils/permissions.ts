import type { NivelAcesso } from "../types/user";

export function canWrite(nivelAcesso: string): boolean {
  return nivelAcesso === "admin" || nivelAcesso === "superAdmin";
}

export function canAccessUsers(nivelAcesso: string): boolean {
  return nivelAcesso === "superAdmin";
}

export function getNivelAcessoLabel(nivel: NivelAcesso | string): string {
  switch (nivel) {
    case "superAdmin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "visualizador":
      return "Visualizador";
    case "pendente":
      return "Pendente";
    default:
      return nivel;
  }
}
