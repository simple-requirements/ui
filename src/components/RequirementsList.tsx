import type { DemoRequirement } from '@/demo/demoTypes';
import type { Action } from '@/state/workspaceReducer';

interface RequirementsListProps {
    requirements: readonly DemoRequirement[];
    selectedRequirementId: string | null;
    dispatch: (action: Action) => void;
}

export function RequirementsList({ requirements, selectedRequirementId, dispatch }: RequirementsListProps) {
    return (
        <table className="req-list">
            <thead>
                <tr>
                    <th>Visible key</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Owner</th>
                </tr>
            </thead>
            <tbody>
                {requirements.map((requirement) => (
                    <tr
                        key={requirement.id}
                        className={requirement.id === selectedRequirementId ? 'selected' : ''}
                        tabIndex={0}
                        onClick={() => dispatch({ type: 'selectRequirement', requirementId: requirement.id })}
                        onDoubleClick={() =>
                            dispatch({
                                type: 'openRequirementTab',
                                requirementId: requirement.id,
                                visibleKey: requirement.visibleKey,
                            })
                        }
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && event.ctrlKey) {
                                dispatch({
                                    type: 'openRequirementTab',
                                    requirementId: requirement.id,
                                    visibleKey: requirement.visibleKey,
                                });
                            }
                        }}
                    >
                        <td>{requirement.visibleKey}</td>
                        <td>{requirement.categoryKey}</td>
                        <td>{requirement.type}</td>
                        <td>{requirement.status}</td>
                        <td>{requirement.priority}</td>
                        <td>{requirement.owner ?? '—'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
