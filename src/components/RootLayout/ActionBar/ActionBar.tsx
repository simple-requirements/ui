import { useSelector } from '@tanstack/react-store';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import type { ComponentProps } from 'react';
import { useNavigate, useParams } from 'react-router';

import '@/components/RootLayout/ActionBar/ActionBar.scss';

import { getProjectCategoryCreateRoute, getProjectRequirementCreateRoute } from '@/router/projectRoutes';
import { type ActionBarKind, useRouteUiMetadata } from '@/router/routeUiMetadata';
import { actionBarStore, setRequirementKey } from '@/stores/actionBarStore';

type CreateActionKind = 'category' | 'requirement';

type ActionBarConfiguration = Readonly<{
    ariaLabel: string;
    createActionKind?: CreateActionKind;
    disabled: boolean;
    showRequirementLookup: boolean;
    showStartReview: boolean;
}>;

export type ActionBarProps = Readonly<{ onFindRequirementKey?: (requirementKey: string) => void }>;

export type RequirementKeyLookupProps = Readonly<{ disabled?: boolean; onFindKey?: (requirementKey: string) => void }>;

function isDraftRequirementStatus(status: string | undefined): boolean {
    return status?.toLowerCase() === 'draft';
}

function getActionBarConfiguration(actionBarKind: ActionBarKind): ActionBarConfiguration {
    switch (actionBarKind) {
        case 'categories':
            return {
                ariaLabel: 'Category actions',
                createActionKind: 'category',
                disabled: false,
                showRequirementLookup: false,
                showStartReview: false,
            };
        case 'categoryForm':
            return {
                ariaLabel: 'Category form actions',
                createActionKind: 'category',
                disabled: true,
                showRequirementLookup: false,
                showStartReview: false,
            };
        case 'requirementDetails':
            return {
                ariaLabel: 'Requirement actions',
                createActionKind: 'requirement',
                disabled: false,
                showRequirementLookup: false,
                showStartReview: false,
            };
        case 'requirementForm':
            return {
                ariaLabel: 'Requirement form actions',
                createActionKind: 'requirement',
                disabled: true,
                showRequirementLookup: false,
                showStartReview: false,
            };
        case 'requirements':
            return {
                ariaLabel: 'Requirement actions',
                createActionKind: 'requirement',
                disabled: false,
                showRequirementLookup: true,
                showStartReview: true,
            };
        case 'project':
            return {
                ariaLabel: 'Project actions',
                disabled: false,
                showRequirementLookup: false,
                showStartReview: false,
            };
        case 'none':
            return {
                ariaLabel: 'Workspace actions',
                disabled: true,
                showRequirementLookup: false,
                showStartReview: false,
            };
    }
}

function getCreateRoute(projectId: string, createActionKind: CreateActionKind): string {
    return createActionKind === 'category' ?
            getProjectCategoryCreateRoute(projectId)
        :   getProjectRequirementCreateRoute(projectId);
}

export function RequirementKeyLookup({ disabled = false, onFindKey }: RequirementKeyLookupProps) {
    const requirementKey = useSelector(actionBarStore, (state) => state.requirementKey);

    const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
        event.preventDefault();

        const trimmedKey = requirementKey.trim();
        if (trimmedKey.length > 0) {
            onFindKey?.(trimmedKey);
        }
    };

    return (
        <form
            className='action-bar__lookup'
            aria-label='Requirement key lookup'
            onSubmit={handleSubmit}>
            <InputText
                id='requirement-key'
                value={requirementKey}
                disabled={disabled}
                onChange={(event) => setRequirementKey(event.currentTarget.value)}
                placeholder='FR-KEY-0001'
                aria-label='Requirement key'
                pt={{ root: { className: 'action-bar__input' } }}
            />

            <Button
                outlined
                type='submit'
                label='Find requirement'
                disabled={disabled}
                pt={{ root: { className: 'action-bar__button' } }}
            />
        </form>
    );
}

export function ActionBar({ onFindRequirementKey }: ActionBarProps) {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { actionBar: actionBarKind } = useRouteUiMetadata();
    const configuration = getActionBarConfiguration(actionBarKind);
    const reviewActionRequirement = useSelector(actionBarStore, (state) => state.reviewActionRequirement);

    const canCreate =
        configuration.createActionKind !== undefined && !configuration.disabled && projectId !== undefined;
    const canStartReview = configuration.showStartReview && isDraftRequirementStatus(reviewActionRequirement?.status);

    function handleCreate(): void {
        if (projectId === undefined || configuration.createActionKind === undefined) {
            return;
        }

        void navigate(getCreateRoute(projectId, configuration.createActionKind));
    }

    return (
        <section
            className='action-bar'
            aria-label={configuration.ariaLabel}>
            {configuration.showRequirementLookup && (
                <RequirementKeyLookup
                    disabled={configuration.disabled}
                    onFindKey={onFindRequirementKey}
                />
            )}

            {configuration.createActionKind !== undefined && (
                <Button
                    type='button'
                    label='Create'
                    disabled={!canCreate}
                    onClick={handleCreate}
                    pt={{ root: { className: 'action-bar__button' } }}
                />
            )}

            {canStartReview && (
                <Button
                    type='button'
                    label='Start review'
                    pt={{ root: { className: 'action-bar__button' } }}
                />
            )}
        </section>
    );
}
