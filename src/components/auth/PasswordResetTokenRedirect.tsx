import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Se a URL contiver ?token= (ex.: link do e-mail apontando para outra rota),
 * redireciona para /auth/reset-password preservando o token.
 */
export default function PasswordResetTokenRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token")?.trim();
    if (!token || location.pathname === "/auth/reset-password") return;

    navigate(
      `/auth/reset-password?token=${encodeURIComponent(token)}`,
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

  return null;
}
