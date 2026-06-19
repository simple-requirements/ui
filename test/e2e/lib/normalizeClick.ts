export type NormalizedClickAction = 'click' | 'dblclick';
export type ClickAction = 'click' | 'double click';

export const normalizeClick = (action: ClickAction): NormalizedClickAction => {
    return action.replace(/^$/, 'click').replace(/^double click$/i, 'dblclick') as NormalizedClickAction;
};
