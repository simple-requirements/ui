import { Button } from 'primereact/button';

import '@/components/RootLayout/TabBar/Tab.scss';

type TabProps = Readonly<{ label: string; active?: boolean; fixed?: boolean; onClick?: () => void }>;

function getTabClassName(active: boolean, fixed: boolean): string {
    const classNames = ['tab'];

    if (active) classNames.push('tab--active');
    if (fixed) classNames.push('tab--fixed');

    return classNames.join(' ');
}

export function Tab({ label, active = false, fixed = false, onClick }: TabProps) {
    return (
        <Button
            outlined
            type='button'
            label={label}
            aria-current={active ? 'page' : undefined}
            onClick={onClick}
            pt={{ root: { className: getTabClassName(active, fixed) }, label: { className: 'tab__label' } }}
        />
    );
}
