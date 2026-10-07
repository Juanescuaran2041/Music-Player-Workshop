export type PasswordRule = {
  label: string;
  test: (password: string) => boolean;
};

// Shared by the sign-up form (live checklist) and the server action, so a
// request that skips the browser is still rejected.
export const passwordRules: PasswordRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "A number", test: (p) => /\d/.test(p) },
  { label: "A symbol, like ! or #", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// Returns the first rule the password breaks, or null when it is strong
export function checkPassword(password: string): string | null {
  const broken = passwordRules.find((rule) => !rule.test(password));
  return broken ? `Password needs: ${broken.label.toLowerCase()}` : null;
}
