export type BootstrapAdministratorFormState = Readonly<{
    username: string;
    email: string;
    displayName: string;
    password: string;
    confirmPassword: string;
    bootstrapSecret: string;
}>;

export type BootstrapAdministratorFormField = keyof BootstrapAdministratorFormState;

export type BootstrapAdministratorFormValidation = Readonly<{ passwordsMatch: boolean; canSubmit: boolean }>;
