import type { Category } from '@/api/categoriesApi';
import type { RequirementLinksOverview } from '@/api/requirementLinksApi';
import type { Requirement } from '@/api/requirementsApi';
import { RequirementDescription } from '@/pages/ProjectRequirements/RequirementDescription';
import { RequirementStatusBadge } from '@/pages/ProjectRequirements/RequirementStatusBadge';

export function RequirementDocumentView({
    requirements,
    allRequirements,
    categories,
    linksByRequirementId,
    onOpenRequirement,
}: Readonly<{
    requirements: readonly Requirement[];
    allRequirements: readonly Requirement[];
    categories: readonly Category[];
    linksByRequirementId: ReadonlyMap<string, RequirementLinksOverview>;
    onOpenRequirement: (requirement: Requirement) => void;
}>) {
    const categoriesById = new Map(categories.map((category) => [category.id, category]));
    return (
        <div
            className='requirement-document-view'
            aria-label='Requirement specification document'>
            {requirements.map((requirement) => {
                const category = categoriesById.get(requirement.categoryId);
                const links = linksByRequirementId.get(requirement.id)?.outgoing ?? [];
                return (
                    <article
                        key={requirement.id}
                        className='requirement-document-view__requirement'>
                        <header className='requirement-document-view__header'>
                            <button
                                type='button'
                                className='requirement-document-view__key'
                                onClick={() => onOpenRequirement(requirement)}>
                                {requirement.visibleKey}
                            </button>
                            <span>{category?.type ?? requirement.visibleKey.split('-')[0]}</span>
                            <span>{category?.name ?? 'Unknown category'}</span>
                            <RequirementStatusBadge status={requirement.status} />
                        </header>
                        <div className='requirement-document-view__description'>
                            <RequirementDescription requirement={requirement} />
                        </div>
                        {(requirement.owner !== null || requirement.priority !== null) && (
                            <p className='requirement-document-view__meta'>
                                Priority: {requirement.priority?.toUpperCase() ?? '—'} · Owner:{' '}
                                {requirement.owner ?? '—'}
                            </p>
                        )}
                        {links.length > 0 && (
                            <p className='requirement-document-view__links'>
                                References:{' '}
                                {links.map((link, index) => (
                                    <span key={link.id}>
                                        {index > 0 ? ', ' : ''}
                                        <button
                                            type='button'
                                            onClick={() => {
                                                const target = allRequirements.find(
                                                    (candidate) => candidate.id === link.target.requirementId,
                                                );
                                                if (target !== undefined) onOpenRequirement(target);
                                            }}>
                                            {link.target.visibleKey}
                                        </button>
                                    </span>
                                ))}
                            </p>
                        )}
                    </article>
                );
            })}
        </div>
    );
}
