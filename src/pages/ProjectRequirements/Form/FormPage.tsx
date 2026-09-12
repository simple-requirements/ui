import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { DirtyFormNavigationDialog } from '@/components/FormNavigation/DirtyFormNavigationDialog';

import { RequirementForm } from '@/pages/ProjectRequirements/Form/RequirementForm';
import { useRequirementFormController } from '@/pages/ProjectRequirements/Form/useRequirementFormController';
import { useRequirementFormData } from '@/pages/ProjectRequirements/Form/useRequirementFormData';
import { useRequirementFormRoute } from '@/pages/ProjectRequirements/Form/useRequirementFormRoute';

import '@/pages/ProjectRequirements/Form/FormPage.scss';

export function FormPage() {
    const route = useRequirementFormRoute();
    const formData = useRequirementFormData(route.projectId, route.requirementId);
    const formController = useRequirementFormController(
        route.projectId,
        route.requirementId,
        route.initialCategoryId,
        route.mode,
        formData,
    );
    const isUpdateMissing = route.mode === 'update' && formData.requirement === undefined;

    if (route.projectId === undefined) {
        return (
            <section className='project-requirements-form-page'>
                <InlineStatus kind='error'>Project route is missing a project id.</InlineStatus>
            </section>
        );
    }

    return (
        <section
            className='project-requirements-form-page'
            aria-labelledby='project-requirements-form-page-title'>
            <div className='project-requirements-form-page__panel'>
                <header className='project-requirements-form-page__header'>
                    <h1
                        id='project-requirements-form-page-title'
                        className='project-requirements-form-page__title'>
                        {formController.formTitle}
                    </h1>
                </header>

                <LoadableContent
                    loading={formData.loading}
                    error={formData.error}
                    empty={isUpdateMissing}
                    loadingMessage='Loading requirement form …'
                    errorMessage='Requirement form data could not be loaded.'
                    emptyMessage='Requirement could not be found in the project requirements list.'>
                    <RequirementForm
                        mode={route.mode}
                        categories={formData.categories}
                        controller={formController}
                    />
                </LoadableContent>

                <DirtyFormNavigationDialog
                    visible={formController.dirtyNavigationDialog.visible}
                    message='Your input will be lost. Do you want to continue?'
                    onStay={formController.dirtyNavigationDialog.onStay}
                    onDiscard={formController.dirtyNavigationDialog.onDiscard}
                />
            </div>
        </section>
    );
}
