import { useLiveQuery } from '@tanstack/react-db';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';
import { queryClient } from '@/api/queryClient';
import {
    createRequirementLinkRequest,
    deleteRequirementLinkRequest,
    getRequirementLinksQueryKey,
    getRequirementLinksRequest,
    type RequirementLink,
    updateRequirementLinkRequest,
} from '@/api/requirementLinksApi';
import type { Requirement } from '@/api/requirementsApi';
import { useProjectPermissions } from '@/auth/projectPermissions';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { getProjectRequirementDetailsRoute } from '@/router/projectRoutes';
import { RequirementStatusBadge } from '@/pages/ProjectRequirements/RequirementStatusBadge';

import '@/pages/ProjectRequirements/RequirementLinksPanel.scss';

type EditorState = Readonly<{ link?: RequirementLink; targetKey: string }>;

function LinkTable({
    label,
    links,
    direction,
    onOpen,
    canManage,
    onEdit,
    onRemove,
}: Readonly<{
    label: string;
    links: RequirementLink[];
    direction: 'outgoing' | 'incoming';
    onOpen: (requirementId: string) => void;
    canManage: boolean;
    onEdit: (link: RequirementLink) => void;
    onRemove: (link: RequirementLink) => void;
}>) {
    return (
        <section
            className='requirement-links-panel__group'
            aria-labelledby={`requirement-links-${direction}`}>
            <h3
                id={`requirement-links-${direction}`}
                className='requirement-links-panel__group-title'>
                {label}
            </h3>
            {links.length === 0 ?
                <InlineStatus kind='empty'>No {direction} links.</InlineStatus>
            :   <div className='requirement-links-panel__table-wrap'>
                    <table
                        className='requirement-links-panel__table'
                        aria-label={`${label} links`}>
                        <thead>
                            <tr>
                                <th>Source</th>
                                <th>Target</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Status</th>
                                {canManage && direction === 'outgoing' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {links.map((link) => {
                                const endpoint = direction === 'outgoing' ? link.target : link.source;
                                return (
                                    <tr key={link.id}>
                                        <td>
                                            <button
                                                type='button'
                                                className='requirement-links-panel__link-button'
                                                onClick={() => onOpen(link.source.requirementId)}>
                                                {link.source.visibleKey}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                type='button'
                                                className='requirement-links-panel__link-button'
                                                onClick={() => onOpen(link.target.requirementId)}>
                                                {link.target.visibleKey}
                                            </button>
                                        </td>
                                        <td>{endpoint.type}</td>
                                        <td>{endpoint.categoryName}</td>
                                        <td>
                                            <RequirementStatusBadge status={endpoint.status} />
                                        </td>
                                        {canManage && direction === 'outgoing' && (
                                            <td className='requirement-links-panel__actions'>
                                                <Button
                                                    type='button'
                                                    label='Correct'
                                                    outlined
                                                    pt={{
                                                        root: {
                                                            className: 'ui-button ui-button--outline ui-button--action',
                                                        },
                                                    }}
                                                    onClick={() => onEdit(link)}
                                                />
                                                <Button
                                                    type='button'
                                                    label='Remove'
                                                    outlined
                                                    pt={{
                                                        root: {
                                                            className: 'ui-button ui-button--outline ui-button--action',
                                                        },
                                                    }}
                                                    onClick={() => onRemove(link)}
                                                />
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            }
        </section>
    );
}

export function RequirementLinksPanel({
    projectId,
    requirement,
}: Readonly<{ projectId: string; requirement: Requirement }>) {
    const navigate = useNavigate();
    const permissions = useProjectPermissions(projectId);
    const [editor, setEditor] = useState<EditorState>();
    const [removeLink, setRemoveLink] = useState<RequirementLink>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [filterText, setFilterText] = useState('');

    const queryKey = getRequirementLinksQueryKey(projectId, requirement.id);
    const overviewQuery = useQuery({ queryKey, queryFn: () => getRequirementLinksRequest(projectId, requirement.id) });
    const requirementsCollection = useMemo(() => getProjectRequirementsCollection(projectId), [projectId]);
    const requirementsQuery = useLiveQuery(
        (query) => query.from({ requirements: requirementsCollection }),
        [requirementsCollection],
    );

    const targetKeys = useMemo(
        () =>
            (requirementsQuery.data ?? [])
                .filter((candidate) => candidate.id !== requirement.id)
                .map((candidate) => candidate.visibleKey),
        [requirement.id, requirementsQuery.data],
    );

    const normalizedFilter = filterText.trim().toUpperCase();
    const matchesFilter = (link: RequirementLink) =>
        normalizedFilter.length === 0
        || link.source.visibleKey.includes(normalizedFilter)
        || link.target.visibleKey.includes(normalizedFilter);
    const outgoingLinks = (overviewQuery.data?.outgoing ?? []).filter(matchesFilter);
    const incomingLinks = (overviewQuery.data?.incoming ?? []).filter(matchesFilter);

    const refresh = async () => queryClient.invalidateQueries({ queryKey });
    const mutation = useMutation({
        mutationFn: async (state: EditorState) =>
            state.link === undefined ?
                createRequirementLinkRequest(projectId, requirement.id, state.targetKey)
            :   updateRequirementLinkRequest(projectId, requirement.id, state.link.id, state.targetKey),
        onSuccess: () => {
            setEditor(undefined);
            setErrorMessage(undefined);
            void refresh();
        },
        onError: (error) =>
            setErrorMessage(error instanceof Error ? error.message : 'Requirement link could not be saved.'),
    });
    const removeMutation = useMutation({
        mutationFn: (link: RequirementLink) => deleteRequirementLinkRequest(projectId, requirement.id, link.id),
        onSuccess: () => {
            setRemoveLink(undefined);
            setErrorMessage(undefined);
            void refresh();
        },
        onError: (error) =>
            setErrorMessage(error instanceof Error ? error.message : 'Requirement link could not be removed.'),
    });

    const submitEditor = () => {
        if (editor === undefined) return;
        const targetKey = editor.targetKey.trim();
        if (!targetKeys.includes(targetKey)) {
            setErrorMessage('Select an existing requirement key from this project.');
            return;
        }
        mutation.mutate({ ...editor, targetKey });
    };

    return (
        <div
            className='requirement-links-panel ui-panel ui-panel--padded'
            role='region'
            aria-label='Requirement links'>
            <div className='requirement-links-panel__header'>
                <h2 className='requirement-links-panel__title'>Requirement links</h2>
                {permissions.canManageRequirements && (
                    <Button
                        type='button'
                        label='New link'
                        pt={{ root: { className: 'ui-button ui-button--primary ui-button--action' } }}
                        onClick={() => {
                            setErrorMessage(undefined);
                            setEditor({ targetKey: '' });
                        }}
                    />
                )}
            </div>

            <div className='requirement-links-panel__filter'>
                <label
                    className='ui-label'
                    htmlFor='requirement-links-filter'>
                    Filter by source or target
                </label>
                <InputText
                    id='requirement-links-filter'
                    value={filterText}
                    placeholder='Requirement key'
                    pt={{ root: { className: 'ui-control' } }}
                    onChange={(event) => setFilterText(event.target.value)}
                />
            </div>

            {overviewQuery.isLoading && <InlineStatus kind='loading'>Loading requirement links …</InlineStatus>}
            {overviewQuery.isError && <InlineStatus kind='error'>Requirement links could not be loaded.</InlineStatus>}
            {overviewQuery.data !== undefined && (
                <div className='requirement-links-panel__groups'>
                    <LinkTable
                        label='Outgoing references'
                        links={outgoingLinks}
                        direction='outgoing'
                        canManage={permissions.canManageRequirements}
                        onOpen={(id) => void navigate(getProjectRequirementDetailsRoute(projectId, id))}
                        onEdit={(link) => {
                            setErrorMessage(undefined);
                            setEditor({ link, targetKey: link.target.visibleKey });
                        }}
                        onRemove={(link) => {
                            setErrorMessage(undefined);
                            setRemoveLink(link);
                        }}
                    />
                    <LinkTable
                        label='Incoming references'
                        links={incomingLinks}
                        direction='incoming'
                        canManage={false}
                        onOpen={(id) => void navigate(getProjectRequirementDetailsRoute(projectId, id))}
                        onEdit={() => undefined}
                        onRemove={() => undefined}
                    />
                </div>
            )}

            <Dialog
                visible={editor !== undefined}
                modal
                closable={!mutation.isPending}
                dismissableMask={false}
                closeOnEscape={!mutation.isPending}
                draggable={false}
                resizable={false}
                header={
                    <h2 className='ui-dialog__heading'>
                        {editor?.link === undefined ? 'Create requirement link' : 'Correct requirement link'}
                    </h2>
                }
                pt={{
                    root: { className: 'ui-dialog ui-dialog--compact' },
                    header: { className: 'ui-dialog__header' },
                    content: { className: 'ui-dialog__content' },
                }}
                onHide={() => setEditor(undefined)}>
                <div className='ui-form--dialog ui-form--dialog-spacious'>
                    <div className='ui-field--dialog'>
                        <label
                            className='ui-label ui-label--dialog'
                            htmlFor='requirement-link-target'>
                            Target requirement key
                        </label>
                        <InputText
                            id='requirement-link-target'
                            value={editor?.targetKey ?? ''}
                            list='requirement-link-targets'
                            autoComplete='off'
                            disabled={mutation.isPending}
                            pt={{ root: { className: 'ui-control ui-control--dialog' } }}
                            onChange={(event) =>
                                setEditor((current) =>
                                    current === undefined ? current : (
                                        { ...current, targetKey: event.target.value.toUpperCase() }
                                    ),
                                )
                            }
                        />
                        <datalist id='requirement-link-targets'>
                            {targetKeys.map((key) => (
                                <option
                                    key={key}
                                    value={key}
                                />
                            ))}
                        </datalist>
                        {errorMessage !== undefined && <InlineStatus kind='error'>{errorMessage}</InlineStatus>}
                    </div>
                    <div className='ui-dialog__actions'>
                        <Button
                            type='button'
                            label='Abort'
                            outlined
                            disabled={mutation.isPending}
                            pt={{ root: { className: 'ui-button ui-button--outline ui-button--dialog' } }}
                            onClick={() => setEditor(undefined)}
                        />
                        <Button
                            type='button'
                            label='Save'
                            loading={mutation.isPending}
                            disabled={mutation.isPending}
                            pt={{ root: { className: 'ui-button ui-button--primary ui-button--dialog' } }}
                            onClick={submitEditor}
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={removeLink !== undefined}
                modal
                closable={!removeMutation.isPending}
                dismissableMask={false}
                closeOnEscape={!removeMutation.isPending}
                draggable={false}
                resizable={false}
                header={<h2 className='ui-dialog__heading'>Remove requirement link</h2>}
                pt={{
                    root: { className: 'ui-dialog ui-dialog--compact' },
                    header: { className: 'ui-dialog__header' },
                    content: { className: 'ui-dialog__content' },
                }}
                onHide={() => setRemoveLink(undefined)}>
                <p className='ui-dialog__message'>
                    Remove the reference to {removeLink?.target.visibleKey ?? 'this requirement'}?
                </p>
                {errorMessage !== undefined && <InlineStatus kind='error'>{errorMessage}</InlineStatus>}
                <div className='ui-dialog__actions'>
                    <Button
                        type='button'
                        label='Abort'
                        outlined
                        disabled={removeMutation.isPending}
                        pt={{ root: { className: 'ui-button ui-button--outline ui-button--dialog' } }}
                        onClick={() => setRemoveLink(undefined)}
                    />
                    <Button
                        type='button'
                        label='Remove'
                        loading={removeMutation.isPending}
                        disabled={removeMutation.isPending}
                        pt={{ root: { className: 'ui-button ui-button--primary ui-button--dialog' } }}
                        onClick={() => {
                            if (removeLink !== undefined) removeMutation.mutate(removeLink);
                        }}
                    />
                </div>
            </Dialog>
        </div>
    );
}
