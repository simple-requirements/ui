import '@git-diff-view/react/styles/diff-view.css';
import { DiffModeEnum, DiffView } from '@git-diff-view/react';
import { useId } from 'react';

export type TextDiffViewProps = Readonly<{
    oldText: string;
    newText: string;
    oldLabel: string;
    newLabel: string;
    ariaLabel?: string;
}>;

const normalizeDiffText = (value: string) => (value.length > 0 ? value : '∅ Empty field');

/**
 * Internal adapter isolating the app from @git-diff-view/react's data shape and CSS contract.
 */
export function TextDiffView({ oldText, newText, oldLabel, newLabel, ariaLabel }: TextDiffViewProps) {
    const headingId = useId();
    const safeOldText = normalizeDiffText(oldText);
    const safeNewText = normalizeDiffText(newText);

    return (
        <figure
            className='text-diff-view'
            aria-labelledby={headingId}
            aria-label={ariaLabel}>
            <figcaption id={headingId}>
                Git-style text diff from {oldLabel} to {newLabel}
            </figcaption>
            <DiffView
                data={{
                    oldFile: { fileName: oldLabel, fileLang: 'text', content: safeOldText },
                    newFile: { fileName: newLabel, fileLang: 'text', content: safeNewText },
                    hunks: [],
                }}
                diffViewMode={DiffModeEnum.SplitGitHub}
                diffViewWrap
                diffViewHighlight={false}
                className='text-diff-view__viewer'
            />
            <div
                className='text-diff-view__fallback'
                aria-label='Plain text comparison fallback'>
                <section aria-label={`${oldLabel} plain text`}>
                    <strong>Removal side: {oldLabel}</strong>
                    <pre>{safeOldText}</pre>
                </section>
                <section aria-label={`${newLabel} plain text`}>
                    <strong>Addition side: {newLabel}</strong>
                    <pre>{safeNewText}</pre>
                </section>
            </div>
        </figure>
    );
}
