import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { getPasswordRequirementStatus } from "../utils/passwordValidation";

interface RequirementItemProps {
  met: boolean;
  failed: boolean;
  label: string;
}

function RequirementItem({ met, failed, label }: RequirementItemProps) {
  return (
    <li
      className={`flex items-center gap-2 text-xs transition-colors ${
        met
          ? "text-emerald-600 dark:text-emerald-400"
          : failed
            ? "text-zinc-500 dark:text-zinc-400"
            : "text-zinc-400 dark:text-zinc-500"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
          met
            ? "bg-emerald-100 dark:bg-emerald-950/50"
            : failed
              ? "bg-zinc-200 dark:bg-zinc-800"
              : "bg-zinc-100 dark:bg-zinc-800/80"
        }`}
      >
        {met ? (
          <Check size={10} strokeWidth={3} />
        ) : failed ? (
          <X size={10} strokeWidth={3} />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        )}
      </span>
      {label}
    </li>
  );
}

function RequirementsList({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-2 space-y-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/50 px-3 py-2.5">
      {children}
    </ul>
  );
}

interface PasswordRequirementsProps {
  password: string;
}

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
  if (password.length === 0) return null;

  const requirements = getPasswordRequirementStatus(password);

  return (
    <RequirementsList>
      {requirements.map((req) => (
        <RequirementItem
          key={req.id}
          met={req.met}
          failed={!req.met}
          label={req.label}
        />
      ))}
    </RequirementsList>
  );
}

interface ConfirmPasswordFeedbackProps {
  password: string;
  confirmPassword: string;
  visible: boolean;
}

export function ConfirmPasswordFeedback({
  password,
  confirmPassword,
  visible,
}: ConfirmPasswordFeedbackProps) {
  if (!visible || password.length === 0) return null;

  const requirements = getPasswordRequirementStatus(password);
  const hasConfirmText = confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword;

  return (
    <RequirementsList>
      {requirements.map((req) => (
        <RequirementItem
          key={req.id}
          met={req.met}
          failed={!req.met}
          label={req.label}
        />
      ))}
      <RequirementItem
        met={hasConfirmText && passwordsMatch}
        failed={hasConfirmText && !passwordsMatch}
        label={
          hasConfirmText
            ? passwordsMatch
              ? "As senhas são iguais"
              : "As senhas não são iguais"
            : "Confirme se as senhas são iguais"
        }
      />
    </RequirementsList>
  );
}
