import type {
  BootstrapAdministratorFormState,
  BootstrapAdministratorFormValidation,
} from "@/pages/BootstrapAdministratorPage/bootstrapAdministratorTypes";

export const emptyBootstrapAdministratorForm: BootstrapAdministratorFormState = {
  username: "",
  email: "",
  displayName: "",
  password: "",
  confirmPassword: "",
  bootstrapSecret: "",
};

const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,64}$/u;

export function getBootstrapAdministratorFormValidation(
  form: BootstrapAdministratorFormState,
): BootstrapAdministratorFormValidation {
  const passwordsMatch = form.password === form.confirmPassword;
  const canSubmit =
    USERNAME_PATTERN.test(form.username.trim()) &&
    form.email.trim().length > 0 &&
    form.displayName.trim().length > 0 &&
    form.displayName.trim().length <= 120 &&
    form.password.length >= 15 &&
    form.password.length <= 128 &&
    passwordsMatch &&
    form.bootstrapSecret.trim().length > 0;

  return { passwordsMatch, canSubmit };
}
