import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import type { MouseEventHandler } from 'react';
import { useId } from 'react';
import { NavLink } from 'react-router';

import { Tooltip } from '@/components/Tooltip';

import '@/components/Navigation/ExpandableNavigationItem.scss';

export type ExpandableNavigationSubItem = Readonly<{ id: string; label: string; to: string; iconClassName?: string }>;

export type ExpandableNavigationItemProps = Readonly<{
    label: string;
    badgeValue?: number | string;
    expanded: boolean;
    active: boolean;
    subItems: readonly ExpandableNavigationSubItem[];
    iconClassName?: string;
    expandedIconClassName?: string;
    onToggle: () => void;
    onSubItemClick?: () => void;
    onContextMenu?: MouseEventHandler<HTMLButtonElement>;
}>;

function getRootClassName(expanded: boolean): string {
    return expanded ? 'expandable-navigation-item expandable-navigation-item--expanded' : 'expandable-navigation-item';
}

function getButtonClassName(active: boolean): string {
    return active ?
            'expandable-navigation-item__button expandable-navigation-item__button--active'
        :   'expandable-navigation-item__button';
}

function getIconClassName(expanded: boolean, iconClassName: string, expandedIconClassName: string): string {
    const stateIconClassName = expanded ? expandedIconClassName : iconClassName;

    return `${stateIconClassName} expandable-navigation-item__icon`;
}

function getSubItemClassName(active: boolean): string {
    return active ?
            'expandable-navigation-item__sub-link expandable-navigation-item__sub-link--active'
        :   'expandable-navigation-item__sub-link';
}

export function ExpandableNavigationItem({
    label,
    badgeValue,
    expanded,
    active,
    subItems,
    iconClassName = 'pi pi-folder',
    expandedIconClassName = 'pi pi-folder-open',
    onToggle,
    onSubItemClick,
    onContextMenu,
}: ExpandableNavigationItemProps) {
    const subListId = useId();

    return (
        <li className={getRootClassName(expanded)}>
            <Tooltip content={label}>
                {(tooltipTriggerProps) => (
                    <Button
                        outlined
                        type='button'
                        aria-current={active ? 'page' : undefined}
                        aria-expanded={expanded}
                        aria-controls={subListId}
                        onClick={onToggle}
                        onContextMenu={onContextMenu}
                        pt={{ root: { className: getButtonClassName(active) } }}
                        {...tooltipTriggerProps}>
                        <span className='expandable-navigation-item__button-content'>
                            <i
                                className={getIconClassName(expanded, iconClassName, expandedIconClassName)}
                                aria-hidden='true'
                            />

                            <span className='expandable-navigation-item__label'>{label}</span>

                            {badgeValue !== undefined && (
                                <Badge
                                    value={badgeValue}
                                    className='expandable-navigation-item__badge'
                                />
                            )}
                        </span>
                    </Button>
                )}
            </Tooltip>

            <div
                id={subListId}
                className='expandable-navigation-item__sub-list-wrapper'
                aria-hidden={!expanded}>
                <ul className='expandable-navigation-item__sub-list'>
                    {subItems.map((subItem) => (
                        <li key={subItem.id}>
                            <NavLink
                                to={subItem.to}
                                tabIndex={expanded ? undefined : -1}
                                className={({ isActive }) => getSubItemClassName(isActive)}
                                onClick={() => onSubItemClick?.()}>
                                {subItem.iconClassName !== undefined && (
                                    <i
                                        className={`${subItem.iconClassName} expandable-navigation-item__sub-icon`}
                                        aria-hidden='true'
                                    />
                                )}

                                <span>{subItem.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    );
}
