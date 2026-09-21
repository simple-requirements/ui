import { z } from 'zod';

export const projectDialogSchema = z.object({ name: z.string().trim().min(1, 'Project name is required.') });
export type ProjectDialogSubmitData = z.infer<typeof projectDialogSchema>;

export function getProjectName(formData: FormData): string {
    const value = formData.get('name');
    return typeof value === 'string' ? value : '';
}

export function getProjectDialogErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'The project could not be saved.';
}
