import { Button } from 'primereact/button';
import type { Action, Module } from '@/state/workspaceReducer';

type ModuleNavigationProps = Readonly<{ activeModule: Module; dispatch: (action: Action) => void }>;

/** Provides keyboard-accessible switching between workspace modules. */
export function ModuleNavigation({ activeModule, dispatch }: ModuleNavigationProps) {
    return (
        <nav className='module-nav'>
            <Button
                type='button'
                className={activeModule === 'requirements' ? 'active' : ''}
                onClick={() => dispatch({ type: 'selectModule', module: 'requirements' })}>
                Requirements
            </Button>
            <Button
                type='button'
                className={activeModule === 'categories' ? 'active' : ''}
                onClick={() => dispatch({ type: 'selectModule', module: 'categories' })}>
                Categories
            </Button>
        </nav>
    );
}
