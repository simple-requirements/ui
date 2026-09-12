import type { AppToastMessage } from '@/stores/toastStore';

const successLife = 3000;
const errorLife = 5000;

export const toastMessages = {
    categorySaved: (key: string, mode: 'create' | 'update'): AppToastMessage => ({
        severity: 'success',
        summary: mode === 'create' ? 'Category created' : 'Category updated',
        detail: `${key} has been ${mode === 'create' ? 'created' : 'updated'}.`,
        life: successLife,
    }),
    categoryKeyCopied: (key: string): AppToastMessage => ({
        severity: 'success',
        summary: 'Category key copied',
        detail: `${key} has been copied to the clipboard.`,
        life: successLife,
    }),
    categoryCannotBeDeleted: (key: string): AppToastMessage => ({
        severity: 'warn',
        summary: 'Category cannot be deleted',
        detail: `${key} still contains requirements. Remove its requirements before deleting the category.`,
        life: errorLife,
    }),
    categoryDeleted: (key: string): AppToastMessage => ({
        severity: 'success',
        summary: 'Category deleted',
        detail: `${key} has been deleted.`,
        life: successLife,
    }),
    categoryDeleteFailed: (key: string): AppToastMessage => ({
        severity: 'error',
        summary: 'Category could not be deleted',
        detail: `${key} could not be deleted.`,
        life: errorLife,
    }),
    requirementSaved: (key: string, mode: 'create' | 'update'): AppToastMessage => ({
        severity: 'success',
        summary: mode === 'create' ? 'Requirement created' : 'Requirement updated',
        detail: `${key} has been ${mode === 'create' ? 'created' : 'updated'}.`,
        life: successLife,
    }),
    requirementKeyCopied: (key: string): AppToastMessage => ({
        severity: 'success',
        summary: 'Requirement key copied',
        detail: `${key} has been copied to the clipboard.`,
        life: successLife,
    }),
    requirementObsolete: (key: string): AppToastMessage => ({
        severity: 'success',
        summary: 'Requirement obsolete',
        detail: `${key} has been marked obsolete.`,
        life: successLife,
    }),
    requirementObsoleteFailed: (detail: string): AppToastMessage => ({
        severity: 'error',
        summary: 'Requirement could not be marked obsolete',
        detail,
        life: errorLife,
    }),
    requirementImplemented: (key: string): AppToastMessage => ({
        severity: 'success',
        summary: 'Requirement implemented',
        detail: `${key} has been marked implemented.`,
        life: successLife,
    }),
    requirementImplementedFailed: (detail: string): AppToastMessage => ({
        severity: 'error',
        summary: 'Requirement could not be marked implemented',
        detail,
        life: errorLife,
    }),
    implementationTicketSaved: (): AppToastMessage => ({
        severity: 'success',
        summary: 'Implementation ticket saved',
        detail: 'The implementation ticket has been saved.',
        life: successLife,
    }),
    implementationTicketDeleted: (): AppToastMessage => ({
        severity: 'success',
        summary: 'Implementation ticket deleted',
        detail: 'The implementation ticket has been deleted.',
        life: successLife,
    }),
    ticketSystemSettingsSaved: (): AppToastMessage => ({
        severity: 'success',
        summary: 'Ticket system settings saved',
        detail: 'The project ticket URL template has been updated.',
        life: successLife,
    }),
    implementationActionFailed: (detail: string): AppToastMessage => ({
        severity: 'error',
        summary: 'Implementation action failed',
        detail,
        life: errorLife,
    }),
    reviewCommentCreated: (): AppToastMessage => ({
        severity: 'success',
        summary: 'Comment created',
        detail: 'The review comment has been created.',
        life: successLife,
    }),
    reviewReplyCreated: (): AppToastMessage => ({
        severity: 'success',
        summary: 'Reply created',
        detail: 'The reply has been added to the review comment.',
        life: successLife,
    }),
    reviewCommentResolved: (): AppToastMessage => ({
        severity: 'success',
        summary: 'Comment resolved',
        detail: 'The review comment has been marked as resolved.',
        life: successLife,
    }),
    requirementRejected: (key: string): AppToastMessage => ({
        severity: 'success',
        summary: 'Requirement rejected',
        detail: `${key} has been rejected.`,
        life: successLife,
    }),
    requirementApproved: (key: string): AppToastMessage => ({
        severity: 'success',
        summary: 'Requirement approved',
        detail: `${key} has been approved.`,
        life: successLife,
    }),
    projectMembershipSaved: (displayName: string): AppToastMessage => ({
        severity: 'success',
        summary: 'Project membership saved',
        detail: `Project roles for ${displayName} have been saved.`,
        life: successLife,
    }),
    projectMembershipRemoved: (displayName: string): AppToastMessage => ({
        severity: 'success',
        summary: 'Project membership removed',
        detail: `${displayName} no longer has a membership in this project.`,
        life: successLife,
    }),
    projectMembershipAdministrationFailed: (): AppToastMessage => ({
        severity: 'error',
        summary: 'Project membership could not be changed',
        detail: 'The project membership change could not be completed.',
        life: errorLife,
    }),
    reviewFailed: (detail: string): AppToastMessage => ({
        severity: 'error',
        summary: 'Review action failed',
        detail,
        life: errorLife,
    }),
} as const;
