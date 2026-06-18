import type { RequirementView } from '@/types/domain';

type RequirementDetailProps = Readonly<{ requirement: RequirementView }>;

const displayOptionalValue = (value: string | null) => value ?? 'Not specified';

/** Presents the complete detail fields for a requirement in split and dedicated views. */
export function RequirementDetail({ requirement }: RequirementDetailProps) {
    return (
        <article className='requirement-detail detail'>
            <h2 className='requirement-detail__heading'>{requirement.visibleKey}</h2>
            <p className='requirement-detail__status-line'>
                <span className={`requirement-detail__status badge ${requirement.status}`}>{requirement.status}</span>
            </p>
            <dl className='requirement-detail__definition-list'>
                <dt>Category</dt>
                <dd>
                    {requirement.categoryName} ({requirement.categoryKey})
                </dd>
                <dt>Type</dt>
                <dd>{requirement.type}</dd>
                <dt>Description</dt>
                <dd>{requirement.description}</dd>
                <dt>Priority</dt>
                <dd>{requirement.priority}</dd>
                <dt>Owner</dt>
                <dd>{displayOptionalValue(requirement.owner)}</dd>
                <dt>Rationale</dt>
                <dd>{displayOptionalValue(requirement.rationale)}</dd>
                <dt>Source</dt>
                <dd>{displayOptionalValue(requirement.source)}</dd>
            </dl>
        </article>
    );
}
