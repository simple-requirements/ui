import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { clampSplitter } from '@/state/workspaceReducer';

type VerticalSplitPaneProps = Readonly<{
    position: number;
    onChange: (nextPosition: number) => void;
    top: ReactNode;
    bottom: ReactNode;
}>;

const SMALL_KEYBOARD_STEP = 0.04;
const LARGE_KEYBOARD_STEP = 0.1;
const MINIMUM_LIST_POSITION = 0.25;
const MAXIMUM_LIST_POSITION = 0.8;

export function VerticalSplitPane({ position, onChange, top, bottom }: VerticalSplitPaneProps) {
    const listPaneSize = Math.round(position * 100);
    const detailPaneSize = 100 - listPaneSize;

    const handleOnKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        let nextPosition = position;

        if (event.key === 'ArrowUp') {
            nextPosition -= event.shiftKey ? LARGE_KEYBOARD_STEP : SMALL_KEYBOARD_STEP;
        } else if (event.key === 'ArrowDown') {
            nextPosition += event.shiftKey ? LARGE_KEYBOARD_STEP : SMALL_KEYBOARD_STEP;
        } else if (event.key === 'Home') {
            nextPosition = MINIMUM_LIST_POSITION;
        } else if (event.key === 'End') {
            nextPosition = MAXIMUM_LIST_POSITION;
        } else {
            return;
        }

        event.preventDefault();
        onChange(clampSplitter(nextPosition));
    };

    const handleOnPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        document.body.classList.add('resizing');
        const handleOnPointerUp = () => document.body.classList.remove('resizing');
        addEventListener('pointerup', handleOnPointerUp, { once: true });
    };

    return (
        <Splitter
            layout="vertical"
            className="requirements-split split"
            gutterSize={10}
            onResizeEnd={(event) => onChange(clampSplitter((event.sizes[0] ?? listPaneSize) / 100))}
            pt={{
                gutter: {
                    role: 'separator',
                    'aria-orientation': 'horizontal',
                    'aria-valuemin': 25,
                    'aria-valuemax': 80,
                    'aria-valuenow': listPaneSize,
                    tabIndex: 0,
                    className: 'requirements-split__separator splitter',
                    onKeyDown: handleOnKeyDown,
                    onPointerDown: handleOnPointerDown,
                },
                gutterHandler: { className: 'requirements-split__separator-handle' },
            }}
        >
            <SplitterPanel className="requirements-split__pane split-pane" size={listPaneSize} minSize={25}>
                {top}
            </SplitterPanel>
            <SplitterPanel className="requirements-split__pane requirements-split__pane--detail split-pane detail-pane" size={detailPaneSize} minSize={20}>
                {bottom}
            </SplitterPanel>
        </Splitter>
    );
}
