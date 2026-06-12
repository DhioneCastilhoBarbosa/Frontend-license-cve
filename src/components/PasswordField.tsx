import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

interface PasswordFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
}

export default function PasswordField({
  name,
  label = "Senha:",
  placeholder = "Digite sua senha",
  value,
  onChange,
  onFocus,
  onBlur,
  required = true,
  minLength,
  pattern,
  autoComplete,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const isControlled = value !== undefined && onChange !== undefined;

  return (
    <label className="flex items-center gap-2 border-2 border-sky-300 p-2 rounded-md w-full transition-colors focus-within:border-sky-500 focus-within:bg-sky-50 dark:focus-within:bg-zinc-800">
      <Lock className="w-5 h-5 text-sky-500 shrink-0" />
      <div className="flex flex-row items-center gap-2 w-full min-w-0">
        <span className="text-sm text-gray-600 dark:text-gray-300 shrink-0">
          {label}
        </span>
        <input
          type={visible ? "text" : "password"}
          name={name}
          className="bg-transparent outline-none border-none text-black dark:text-white placeholder:text-gray-400 w-full min-w-0"
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          onFocus={onFocus}
          onBlur={onBlur}
          {...(isControlled
            ? { value, onChange: (e) => onChange(e.target.value) }
            : {})}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="p-1 rounded hover:bg-sky-100 dark:hover:bg-zinc-700 cursor-pointer shrink-0"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="w-4 h-4 text-gray-500" />
          ) : (
            <Eye className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>
    </label>
  );
}
