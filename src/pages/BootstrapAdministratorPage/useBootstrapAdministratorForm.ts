import { useState } from 'react';

import { bootstrapAdministrator } from '@/api/authApi';
import { ApiError } from '@/api/fetch';
import type {
    BootstrapAdministratorFormField,
    BootstrapAdministratorFormState,
} from '@/pages/BootstrapAdministratorPage/bootstrapAdministratorTypes';
import {
    emptyBootstrapAdministratorForm,
    getBootstrapAdministratorFormValidation,
} from '@/pages/BootstrapAdministratorPage/bootstrapAdministratorValidation';

type Options = Readonly<{ onBootstrapUnavailable: () => void }>;

export function useBootstrapAdministratorForm({ onBootstrapUnavailable }: Options) {
    const [form, setForm] = useState<BootstrapAdministratorFormState>(emptyBootstrapAdministratorForm);
    const [pending, setPending] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const { passwordsMatch, canSubmit } = getBootstrapAdministratorFormValidation(form);

    function updateForm(field: BootstrapAdministratorFormField, value: string): void {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function submit(): Promise<void> {
        if (!canSubmit || pending) {
            return;
        }

        setPending(true);
        setErrorMessage(undefined);

        try {
            await bootstrapAdministrator({
                username: form.username.trim(),
                email: form.email.trim().toLowerCase(),
                displayName: form.displayName.trim(),
                password: form.password,
                bootstrapSecret: form.bootstrapSecret.trim(),
            });
            setSubmitted(true);
        } catch (error) {
            if (error instanceof ApiError && error.status === 409) {
                onBootstrapUnavailable();
                return;
            }

            setErrorMessage(
                error instanceof ApiError && error.status === 429 ?
                    'Too many registration attempts. Wait before trying again.'
                :   'Initial Administrator registration could not be completed. Check the bootstrap secret and form values.',
            );
        } finally {
            setPending(false);
        }
    }

    return { form, pending, submitted, errorMessage, passwordsMatch, canSubmit, updateForm, submit };
}
