import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';

import { CategoryForm } from '@/pages/ProjectCategories/Form/CategoryForm';
import { useCategoryFormController } from '@/pages/ProjectCategories/Form/useCategoryFormController';
import { useCategoryFormData } from '@/pages/ProjectCategories/Form/useCategoryFormData';
import { useCategoryFormRoute } from '@/pages/ProjectCategories/Form/useCategoryFormRoute';

import '@/pages/ProjectCategories/Form/FormPage.scss';

export function FormPage() {
    const route = useCategoryFormRoute();
    const formData = useCategoryFormData(route.projectId, route.categoryId);
    const formController = useCategoryFormController(route.projectId, route.categoryId, route.mode, formData);
    const isUpdateMissing = route.mode === 'update' && formData.category === undefined;

    if (route.projectId === undefined) {
        return (
            <section className='project-categories-form-page'>
                <InlineStatus kind='error'>Project route is missing a project id.</InlineStatus>
            </section>
        );
    }

    return (
        <section
            className='project-categories-form-page'
            aria-labelledby='project-categories-form-page-title'>
            <div className='project-categories-form-page__panel'>
                <header className='project-categories-form-page__header'>
                    <h1
                        id='project-categories-form-page-title'
                        className='project-categories-form-page__title'>
                        {formController.formTitle}
                    </h1>
                </header>

                <LoadableContent
                    loading={formData.loading}
                    error={formData.error}
                    empty={isUpdateMissing}
                    loadingMessage='Loading category …'
                    errorMessage='Category could not be loaded.'
                    emptyMessage='Category could not be found in the project categories list.'>
                    <CategoryForm
                        mode={route.mode}
                        controller={formController}
                    />
                </LoadableContent>
            </div>
        </section>
    );
}
