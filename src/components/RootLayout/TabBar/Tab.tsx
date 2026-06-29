import { Button } from 'primereact/button';
import type { MouseEvent } from 'react';

import '@/components/RootLayout/TabBar/Tab.scss';

type Props = Readonly<{
    label: string;
    active?: boolean;
    fixed?: boolean;
    closable?: boolean;
    onClick?: () => void;
    onClose?: () => void;
}>;

function getTabClassName(active: boolean, fixed: boolean): string {
    const classNames = ['tab'];

    if (active) {
        classNames.push('tab--active');
    }

    if (fixed) {
        classNames.push('tab--fixed');
    }

    return classNames.join(' ');
}

export function Tab({ label, active = false, fixed = false, closable = true, onClick, onClose }: Props) {
    function handleCloseClick(event: MouseEvent<HTMLButtonElement>): void {
        event.stopPropagation();
        onClose?.();
    }

    return (
        <div
            className={getTabClassName(active, fixed)}
            role='group'
            aria-label={`${label} tab`}>
            <Button
                type='button'
                label={label}
                aria-current={active ? 'page' : undefined}
                onClick={onClick}
                pt={{ root: { className: 'tab__select-button' }, label: { className: 'tab__label' } }}
            />

            {closable && (
                <Button
                    type='button'
                    icon='pi pi-times'
                    aria-label={`Close ${label} tab`}
                    onClick={handleCloseClick}
                    pt={{ root: { className: 'tab__close-button' }, icon: { className: 'tab__close-icon' } }}
                />
            )}
        </div>
    );
}
