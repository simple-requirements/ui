import { useState } from 'react';
import { Button } from 'primereact/button';
import { RequirementLinksPanel } from '@/features/requirements/components/RequirementLinksPanel';
import type { RequirementView } from '@/types/domain';

type RequirementDetailProps = Readonly<{
    requirement: RequirementView;
    onOpenRequirement?: (requirementId: string, visibleKey: string) => void;
}>;

const displayOptionalValue = (value: string | null) => value ?? 'Not specified';

/** Presents the complete detail fields for a requirement in split and dedicated views. */
export function RequirementDetail({ requirement, onOpenRequirement }: RequirementDetailProps) {
    const [descriptionMode, setDescriptionMode] = useState<'code' | 'visual'>('visual');
    const description = descriptionMode === 'visual' ? requirement.renderedDescription : requirement.description;

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
                <dd>
                    <div
                        className='requirement-detail__description-tabs'
                        role='tablist'
                        aria-label='Description display mode'>
                        <Button
                            type='button'
                            label='Code'
                            size='small'
                            text={descriptionMode !== 'code'}
                            outlined={descriptionMode !== 'code'}
                            aria-pressed={descriptionMode === 'code'}
                            onClick={() => setDescriptionMode('code')}
                        />
                        <Button
                            type='button'
                            label='Visual'
                            size='small'
                            text={descriptionMode !== 'visual'}
                            outlined={descriptionMode !== 'visual'}
                            aria-pressed={descriptionMode === 'visual'}
                            onClick={() => setDescriptionMode('visual')}
                        />
                    </div>
                    <p className='requirement-detail__description-text'>{description}</p>
                    {requirement.metricReferences.length ?
                        <ul
                            className='requirement-detail__metric-references'
                            aria-label='Metric references'>
                            {requirement.metricReferences.map((metric) => (
                                <li key={metric.key}>
                                    <strong>{metric.key}</strong>{' '}
                                    {metric.resolved && metric.value ?
                                        <span>{metric.value}</span>
                                    :   <span>unresolved</span>}
                                    {metric.description ?
                                        <small> — {metric.description}</small>
                                    :   null}
                                </li>
                            ))}
                        </ul>
                    :   null}
                </dd>
                <dt>Priority</dt>
                <dd>{requirement.priority}</dd>
                <dt>Owner</dt>
                <dd>{displayOptionalValue(requirement.owner)}</dd>
                <dt>Rationale</dt>
                <dd>{displayOptionalValue(requirement.rationale)}</dd>
                <dt>Source</dt>
                <dd>{displayOptionalValue(requirement.source)}</dd>
            </dl>
            <RequirementLinksPanel
                requirement={requirement}
                onOpenRequirement={onOpenRequirement}
            />
        </article>
    );
}
