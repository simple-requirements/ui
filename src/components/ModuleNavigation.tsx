import type { Action, Module } from '@/state/workspaceReducer';

interface ModuleNavigationProps {
    activeModule: Module;
    dispatch: (action: Action) => void;
}

export function ModuleNavigation({ activeModule, dispatch }: ModuleNavigationProps) {
    return (
        <nav className="module-nav">
            <button
                className={activeModule === 'requirements' ? 'active' : ''}
                onClick={() => dispatch({ type: 'selectModule', module: 'requirements' })}
            >
                Requirements
            </button>
            <button
                className={activeModule === 'categories' ? 'active' : ''}
                onClick={() => dispatch({ type: 'selectModule', module: 'categories' })}
            >
                Categories
            </button>
        </nav>
    );
}
