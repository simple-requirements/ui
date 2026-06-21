import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { mapApiError } from '@/api/errors/apiError';
import {
    compareSources,
    makeCurrentSource,
    makeRevisionSource,
    mapComparisonError,
    type RequirementRevisionView,
    validateComparisonSources,
    visibleComparedFields,
} from '@/features/requirements/revisions';
import {
    buildRequirementComparisonPath,
    formatComparisonRef,
    parseComparisonPair,
    type ComparisonPair,
} from '@/features/requirements/comparisonRefs';
import { TextDiffView } from '@/features/revisions/components/TextDiffView';
import { useRequirementRevisionDetailQuery, useRequirementRevisionsQuery } from '@/utils/revisionQueries';
import type { RequirementView } from '@/types/domain';

type Props = Readonly<{ requirement: RequirementView; onClose: () => void; initialComparison?: string | null }>;

const nullLabel = 'Null / not specified';
const display = (value: string | null | undefined) => value ?? nullLabel;
const formatTime = (value?: string) => (value ? new Date(value).toLocaleString() : nullLabel);

const revisionHistoryErrorMessage = 'Revision history is currently unavailable. Please try again later.';
const revisionDetailErrorMessage = 'Revision detail is currently unavailable. Please try again later.';
const isRetryableRevisionQueryError = (error: unknown) => mapApiError(error).kind !== 'unexpected';

function RevisionDetail({ revision }: Readonly<{ revision: RequirementRevisionView }>) {
    return (
        <article
            className='revision-detail'
            aria-label={`Revision ${String(revision.revisionNumber)} read-only snapshot`}>
            <h3>Revision {revision.revisionNumber}</h3>
            <p>
                <strong>Historical read-only snapshot.</strong> Edit and lifecycle actions are unavailable.
            </p>
            <dl className='requirement-detail__definition-list'>
                <dt>Visible key</dt>
                <dd>{revision.visibleKey}</dd>
                <dt>Category</dt>
                <dd>{revision.categoryKey}</dd>
                <dt>Type</dt>
                <dd>{revision.type}</dd>
                <dt>Description</dt>
                <dd>{revision.description}</dd>
                <dt>Priority</dt>
                <dd>{revision.priority}</dd>
                <dt>Owner</dt>
                <dd>{display(revision.owner)}</dd>
                <dt>Rationale</dt>
                <dd>{display(revision.rationale)}</dd>
                <dt>Source</dt>
                <dd>{display(revision.source)}</dd>
                <dt>Status</dt>
                <dd>{revision.status}</dd>
                <dt>Revision timestamp</dt>
                <dd>
                    <time dateTime={revision.requirementUpdatedAt}>{formatTime(revision.requirementUpdatedAt)}</time>
                </dd>
            </dl>
        </article>
    );
}

/** Renders server-backed history and comparison within the current workspace or tab context. */
export function RequirementHistory({ requirement, onClose, initialComparison = null }: Props) {
    const revisionsQuery = useRequirementRevisionsQuery(requirement.id);
    const [selectedRevision, setSelectedRevision] = useState<number | null>(null);
    const parsedInitialComparison = initialComparison ? parseComparisonPair(initialComparison) : null;
    const [comparing, setComparing] = useState(Boolean(parsedInitialComparison));
    const [leftKey, setLeftKey] = useState(() =>
        parsedInitialComparison?.ok ? formatComparisonRef(parsedInitialComparison.value.left) : 'current',
    );
    const [rightKey, setRightKey] = useState<string | null>(() =>
        parsedInitialComparison?.ok ? formatComparisonRef(parsedInitialComparison.value.right) : null,
    );
    const [showUnchanged, setShowUnchanged] = useState(true);

    useEffect(() => {
        setSelectedRevision(null);
        setComparing(Boolean(parsedInitialComparison));
        setLeftKey(parsedInitialComparison?.ok ? formatComparisonRef(parsedInitialComparison.value.left) : 'current');
        setRightKey(parsedInitialComparison?.ok ? formatComparisonRef(parsedInitialComparison.value.right) : null);
    }, [requirement.id, initialComparison]);
    useEffect(() => {
        if (!selectedRevision && revisionsQuery.data?.[0]) setSelectedRevision(revisionsQuery.data[0].revisionNumber);
        if (!rightKey && revisionsQuery.data?.[0]) setRightKey(String(revisionsQuery.data[0].revisionNumber));
    }, [revisionsQuery.data, selectedRevision, rightKey]);

    const detailQuery = useRequirementRevisionDetailQuery(requirement.id, selectedRevision);
    const revisionListRetryable = revisionsQuery.isError ? isRetryableRevisionQueryError(revisionsQuery.error) : false;
    const sources = useMemo(
        () => [
            { key: 'current', label: 'Current requirement', source: makeCurrentSource(requirement) },
            ...(revisionsQuery.data ?? []).map((revision) => ({
                key: String(revision.revisionNumber),
                label: `Revision ${String(revision.revisionNumber)}`,
                source: makeRevisionSource(revision),
            })),
        ],
        [requirement, revisionsQuery.data],
    );
    const left = sources.find((source) => source.key === leftKey)?.source ?? null;
    const right = sources.find((source) => source.key === rightKey)?.source ?? null;
    const routeValidation =
        initialComparison && parsedInitialComparison && !parsedInitialComparison.ok ?
            parsedInitialComparison.message
        :   null;
    const validation = routeValidation ?? validateComparisonSources(left, right);
    const compared = left && right && !validation ? compareSources(left, right) : [];
    const visibleCompared = visibleComparedFields(compared, showUnchanged);
    const changedCount = compared.filter((field) => field.difference !== 'unchanged').length;
    const pairForUrl = (nextLeft: string, nextRight: string | null): ComparisonPair | null => {
        const parsed = parseComparisonPair(`${nextLeft}..${nextRight ?? ''}`);
        return parsed.ok ? parsed.value : null;
    };
    const updateRef = (side: 'left' | 'right', value: string) => {
        const nextLeft = side === 'left' ? value : leftKey;
        const nextRight = side === 'right' ? value : rightKey;
        setLeftKey(nextLeft);
        setRightKey(nextRight);
        const pair = pairForUrl(nextLeft, nextRight);
        if (pair) history.pushState(null, '', buildRequirementComparisonPath(requirement.id, pair));
    };
    const leftLabel = left?.label ?? 'Left side';
    const rightLabel = right?.label ?? 'Right side';

    const revisionButton = (revision: RequirementRevisionView) => (
        <Button
            key={revision.revisionNumber}
            type='button'
            className={`revision-history__row ${selectedRevision === revision.revisionNumber ? 'selected' : ''}`}
            aria-pressed={selectedRevision === revision.revisionNumber}
            onClick={() => setSelectedRevision(revision.revisionNumber)}>
            <strong>Revision {revision.revisionNumber}</strong>
            <span>{revision.status}</span>
            <time dateTime={revision.requirementUpdatedAt}>{formatTime(revision.requirementUpdatedAt)}</time>
            {revision.revisionNumber === revisionsQuery.data?.[0]?.revisionNumber ?
                <span>Latest revision</span>
            :   null}
        </Button>
    );

    return (
        <section
            className='revision-history'
            aria-label={`Revision history for ${requirement.visibleKey}`}>
            <header className='revision-history__header'>
                <div>
                    <h2>Revision history for {requirement.visibleKey}</h2>
                    <p>Current requirement and historical revisions are separate read-only comparison sources.</p>
                </div>
                <div className='revision-history__actions'>
                    <Button
                        type='button'
                        label={comparing ? 'Close comparison' : 'Compare revisions'}
                        onClick={() => setComparing((value) => !value)}
                    />
                    <Button
                        type='button'
                        label='Close history'
                        onClick={onClose}
                    />
                </div>
            </header>
            {revisionsQuery.isLoading ?
                <div
                    role='status'
                    className='state'>
                    Loading revision history…
                </div>
            :   null}
            {revisionsQuery.isError ?
                <div
                    role='alert'
                    className='state'>
                    {revisionHistoryErrorMessage}
                    {revisionListRetryable ?
                        <Button
                            type='button'
                            label='Retry'
                            onClick={() => void revisionsQuery.refetch()}
                        />
                    :   null}
                </div>
            :   null}
            {!revisionsQuery.isLoading && !revisionsQuery.isError && revisionsQuery.data?.length === 0 ?
                <div
                    role='status'
                    className='state'>
                    No revisions exist for this requirement.
                </div>
            :   null}
            {(!revisionsQuery.isError && revisionsQuery.data?.length) || comparing ?
                comparing ?
                    <div
                        className='revision-comparison'
                        aria-label='Revision comparison'>
                        <label>
                            Left side
                            <Dropdown
                                value={leftKey}
                                options={sources.map(({ key, label }) => ({ value: key, label }))}
                                onChange={(event) => updateRef('left', event.value as string)}
                            />
                        </label>
                        <label>
                            Right side
                            <Dropdown
                                value={rightKey}
                                options={sources.map(({ key, label }) => ({ value: key, label }))}
                                onChange={(event) => updateRef('right', event.value as string)}
                            />
                        </label>
                        <p
                            className='sr-only'
                            aria-live='polite'>
                            Comparing {leftLabel} with {rightLabel}. {changedCount} changed fields:{' '}
                            {compared
                                .filter((field) => field.difference !== 'unchanged')
                                .map((field) => field.label)
                                .join(', ') || 'none'}
                            .
                        </p>
                        <Button
                            type='button'
                            label={showUnchanged ? 'Collapse unchanged fields' : 'Show unchanged fields'}
                            onClick={() => setShowUnchanged((value) => !value)}
                        />
                        {validation ?
                            <p role='alert'>{validation}</p>
                        : revisionsQuery.isError ?
                            <p role='alert'>{mapComparisonError(revisionsQuery.error)}</p>
                        :   visibleCompared.map((field) => (
                                <section
                                    key={field.field}
                                    className={`revision-comparison__field ${field.difference}`}
                                    aria-label={`${field.label} ${field.difference}`}>
                                    <h3>
                                        {field.label} — {field.difference}
                                    </h3>
                                    {field.kind === 'text' ?
                                        <TextDiffView
                                            oldText={display(field.left)}
                                            newText={display(field.right)}
                                            oldLabel={leftLabel}
                                            newLabel={rightLabel}
                                            ariaLabel={`${field.label} text diff`}
                                        />
                                    :   <div
                                            className='revision-comparison__metadata'
                                            role='table'
                                            aria-label={`${field.label} before and after`}>
                                            <div role='row'>
                                                <strong role='cell'>{leftLabel}</strong>
                                                <p role='cell'>{display(field.left)}</p>
                                            </div>
                                            <div role='row'>
                                                <strong role='cell'>{rightLabel}</strong>
                                                <p role='cell'>{display(field.right)}</p>
                                            </div>
                                        </div>
                                    }
                                </section>
                            ))
                        }
                    </div>
                :   <div className='revision-history__content'>
                        <nav
                            className='revision-history__list'
                            aria-label='Revision list'>
                            {revisionsQuery.data.map(revisionButton)}
                        </nav>
                        <section
                            className='revision-history__detail'
                            aria-live='polite'>
                            {!selectedRevision ?
                                <div className='state'>Select a revision to inspect its immutable snapshot.</div>
                            :   null}
                            {detailQuery.isFetching ?
                                <div
                                    role='status'
                                    className='state'>
                                    Loading revision detail…
                                </div>
                            :   null}
                            {detailQuery.isError ?
                                <div
                                    role='alert'
                                    className='state'>
                                    {revisionDetailErrorMessage}
                                    <Button
                                        type='button'
                                        label='Retry'
                                        onClick={() => void detailQuery.refetch()}
                                    />
                                </div>
                            :   null}
                            {detailQuery.data ?
                                <RevisionDetail revision={detailQuery.data} />
                            :   null}
                        </section>
                    </div>

            :   null}
        </section>
    );
}
