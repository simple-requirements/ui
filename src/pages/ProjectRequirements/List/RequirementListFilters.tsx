import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

import type { Category } from '@/api/categoriesApi';
import type { Requirement } from '@/api/requirementsApi';
import {
    emptyRequirementSearchFilters,
    type RequirementListView,
    type RequirementSearchFilters,
} from '@/pages/ProjectRequirements/List/requirementSearch';

export function RequirementListFilters({
    categories,
    requirements,
    filters,
    view,
    visibleColumns,
    onFiltersChange,
    onViewChange,
    onVisibleColumnsChange,
}: Readonly<{
    categories: readonly Category[];
    requirements: readonly Requirement[];
    filters: RequirementSearchFilters;
    view: RequirementListView;
    visibleColumns: ReadonlySet<string>;
    onFiltersChange: (filters: RequirementSearchFilters) => void;
    onViewChange: (view: RequirementListView) => void;
    onVisibleColumnsChange: (columns: ReadonlySet<string>) => void;
}>) {
    const owners = [
        ...new Set(
            requirements.map((requirement) => requirement.owner).filter((owner): owner is string => owner !== null),
        ),
    ].sort();
    const metricKeys = [
        ...new Set(
            requirements.flatMap((requirement) =>
                (requirement.metricReferences ?? []).map((reference) => reference.key),
            ),
        ),
    ].sort();
    const requirementKeys = requirements.map((requirement) => requirement.visibleKey).sort();
    const columns = [
        ['description', 'Description'],
        ['type', 'Type'],
        ['category', 'Category'],
        ['status', 'Status'],
        ['priority', 'Priority'],
        ['owner', 'Owner'],
        ['reviewer', 'Reviewer'],
        ['updatedAt', 'Updated'],
    ] as const;

    const update = <K extends keyof RequirementSearchFilters>(key: K, value: RequirementSearchFilters[K]) =>
        onFiltersChange({ ...filters, [key]: value });

    return (
        <div
            className='project-requirements-list-page__filters'
            aria-label='Requirement search and filters'>
            <div className='project-requirements-list-page__filter-grid'>
                <label className='project-requirements-list-page__filter-field'>
                    <span className='ui-label'>Search</span>
                    <InputText
                        aria-label='Search requirements'
                        value={filters.search}
                        placeholder='Key, description, source, owner, status'
                        pt={{ root: { className: 'ui-control' } }}
                        onChange={(event) => update('search', event.target.value)}
                    />
                </label>
                <label className='project-requirements-list-page__filter-field'>
                    <span className='ui-label'>Type</span>
                    <select
                        className='ui-control'
                        aria-label='Filter by type'
                        value={filters.type}
                        onChange={(event) => update('type', event.target.value as RequirementSearchFilters['type'])}>
                        <option value=''>All</option>
                        <option value='FR'>FR</option>
                        <option value='NFR'>NFR</option>
                    </select>
                </label>
                <label className='project-requirements-list-page__filter-field'>
                    <span className='ui-label'>Category</span>
                    <select
                        className='ui-control'
                        aria-label='Filter by category'
                        value={filters.categoryId}
                        onChange={(event) => update('categoryId', event.target.value)}>
                        <option value=''>All</option>
                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className='project-requirements-list-page__filter-field'>
                    <span className='ui-label'>Category key</span>
                    <select
                        className='ui-control'
                        aria-label='Filter by category key'
                        value={filters.categoryKey}
                        onChange={(event) => update('categoryKey', event.target.value)}>
                        <option value=''>All</option>
                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.key}>
                                {category.key}
                            </option>
                        ))}
                    </select>
                </label>
                <label className='project-requirements-list-page__filter-field'>
                    <span className='ui-label'>Status</span>
                    <select
                        className='ui-control'
                        aria-label='Filter by status'
                        value={filters.status}
                        onChange={(event) => update('status', event.target.value)}>
                        <option value=''>All active</option>
                        {['draft', 'approved', 'implemented', 'obsolete', 'rejected'].map((status) => (
                            <option
                                key={status}
                                value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </label>
                <label className='project-requirements-list-page__filter-field'>
                    <span className='ui-label'>Priority</span>
                    <select
                        className='ui-control'
                        aria-label='Filter by priority'
                        value={filters.priority}
                        onChange={(event) => update('priority', event.target.value)}>
                        <option value=''>All</option>
                        <option value='p1'>P1</option>
                        <option value='p2'>P2</option>
                        <option value='p3'>P3</option>
                    </select>
                </label>
                <label className='project-requirements-list-page__filter-field'>
                    <span className='ui-label'>Owner</span>
                    <select
                        className='ui-control'
                        aria-label='Filter by owner'
                        value={filters.owner}
                        onChange={(event) => update('owner', event.target.value)}>
                        <option value=''>All</option>
                        {owners.map((owner) => (
                            <option
                                key={owner}
                                value={owner}>
                                {owner}
                            </option>
                        ))}
                    </select>
                </label>
                <label className='project-requirements-list-page__filter-field'>
                    <span className='ui-label'>Metric</span>
                    <select
                        className='ui-control'
                        aria-label='Filter by metric'
                        value={filters.metricKey}
                        onChange={(event) => update('metricKey', event.target.value)}>
                        <option value=''>All</option>
                        {metricKeys.map((key) => (
                            <option
                                key={key}
                                value={key}>
                                {key}
                            </option>
                        ))}
                    </select>
                </label>
                <label className='project-requirements-list-page__filter-field'>
                    <span className='ui-label'>Linked requirement</span>
                    <input
                        className='ui-control'
                        aria-label='Filter by linked requirement'
                        list='requirement-list-linked-keys'
                        value={filters.linkedRequirementKey}
                        onChange={(event) => update('linkedRequirementKey', event.target.value)}
                    />
                    <datalist id='requirement-list-linked-keys'>
                        {requirementKeys.map((key) => (
                            <option
                                key={key}
                                value={key}
                            />
                        ))}
                    </datalist>
                </label>
            </div>
            <div className='project-requirements-list-page__filter-actions'>
                <label className='project-requirements-list-page__check'>
                    <input
                        type='checkbox'
                        checked={filters.unresolvedMetricsOnly}
                        onChange={(event) => update('unresolvedMetricsOnly', event.target.checked)}
                    />{' '}
                    Unresolved metrics only
                </label>
                <label className='project-requirements-list-page__check'>
                    <input
                        type='checkbox'
                        checked={filters.includeInactive}
                        onChange={(event) => update('includeInactive', event.target.checked)}
                    />{' '}
                    Include rejected/obsolete
                </label>
                <Button
                    type='button'
                    label='Clear filters'
                    outlined
                    pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
                    onClick={() => onFiltersChange(emptyRequirementSearchFilters)}
                />
                <div
                    className='project-requirements-list-page__view-toggle'
                    role='group'
                    aria-label='Requirement view'>
                    <Button
                        type='button'
                        label='Table'
                        outlined={view !== 'table'}
                        pt={{
                            root: {
                                className:
                                    view === 'table' ?
                                        'ui-button ui-button--primary ui-button--action'
                                    :   'ui-button ui-button--outline ui-button--action',
                            },
                        }}
                        onClick={() => onViewChange('table')}
                    />
                    <Button
                        type='button'
                        label='Document'
                        outlined={view !== 'document'}
                        pt={{
                            root: {
                                className:
                                    view === 'document' ?
                                        'ui-button ui-button--primary ui-button--action'
                                    :   'ui-button ui-button--outline ui-button--action',
                            },
                        }}
                        onClick={() => onViewChange('document')}
                    />
                </div>
                {view === 'table' && (
                    <details className='project-requirements-list-page__columns'>
                        <summary>Columns</summary>
                        <div>
                            {columns.map(([key, label]) => (
                                <label key={key}>
                                    <input
                                        type='checkbox'
                                        checked={visibleColumns.has(key)}
                                        onChange={(event) => {
                                            const next = new Set(visibleColumns);
                                            if (event.target.checked) next.add(key);
                                            else next.delete(key);
                                            onVisibleColumnsChange(next);
                                        }}
                                    />{' '}
                                    {label}
                                </label>
                            ))}
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
}
