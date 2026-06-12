export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_REQUIREMENTS_LIST: PasswordRequirement[] = [
  {
    id: "length",
    label: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (p) => p.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "Uma letra maiúscula",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "Uma letra minúscula",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "Um número",
    test: (p) => /\d/.test(p),
  },
  {
    id: "special",
    label: "Um caractere especial",
    test: (p) => /[^A-Za-z\d]/.test(p),
  },
];

export const PASSWORD_VALIDATION_ERROR_MESSAGE =
  "Mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.";

export function isValidPassword(password: string): boolean {
  return PASSWORD_REQUIREMENTS_LIST.every((req) => req.test(password));
}

export function getPasswordRequirementStatus(password: string) {
  return PASSWORD_REQUIREMENTS_LIST.map((req) => ({
    ...req,
    met: req.test(password),
  }));
}
