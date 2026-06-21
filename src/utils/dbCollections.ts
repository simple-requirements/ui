import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db';
import type { Category, ProjectSummary, RequirementView } from '@/types/domain';

/** React DB collection backing project rows once the backend project contract is available. */
export const projectsCollection = createCollection<ProjectSummary, string>(
    localOnlyCollectionOptions({ id: 'projects', getKey: (project) => project.id }),
);

/** React DB collection backing global category browsing. */
export const categoriesCollection = createCollection<Category, string>(
    localOnlyCollectionOptions({ id: 'categories', getKey: (category) => category.id }),
);

/** React DB collection backing the active project's requirement rows. */
export const requirementsCollection = createCollection<RequirementView, string>(
    localOnlyCollectionOptions({ id: 'requirements', getKey: (requirement) => requirement.id }),
);

/** React DB collection backing loaded requirement detail records and dedicated tabs. */
export const requirementDetailsCollection = createCollection<RequirementView, string>(
    localOnlyCollectionOptions({ id: 'requirement-details', getKey: (requirement) => requirement.id }),
);

interface MutableCollection<TItem extends object, TKey extends string | number> {
    getKeyFromItem: (row: TItem) => TKey;
    keys: () => Iterable<TKey>;
    has: (key: TKey) => boolean;
    insert: (row: TItem) => unknown;
    update: (key: TKey, updater: (draft: TItem) => void) => unknown;
    delete: (key: TKey) => unknown;
}

/** Replaces collection contents with authoritative rows from the latest backend query. */
export function replaceCollectionRows<TItem extends object, TKey extends string | number>(
    collection: MutableCollection<TItem, TKey>,
    rows: readonly TItem[],
) {
    const nextKeys = new Set(rows.map((row) => collection.getKeyFromItem(row)));
    for (const key of collection.keys()) {
        if (!nextKeys.has(key)) collection.delete(key);
    }
    for (const row of rows) {
        const key = collection.getKeyFromItem(row);
        if (collection.has(key)) {
            collection.update(key, (draft) => Object.assign(draft, row));
        } else {
            collection.insert(row);
        }
    }
}

/** Upserts one backend row into a React DB collection. */
export function upsertCollectionRow<TItem extends object, TKey extends string | number>(
    collection: MutableCollection<TItem, TKey>,
    row: TItem,
) {
    const key = collection.getKeyFromItem(row);
    if (collection.has(key)) {
        collection.update(key, (draft) => Object.assign(draft, row));
        return;
    }
    collection.insert(row);
}

/** Clears local collections between isolated tests or sessions. */
export function clearCollection<TItem extends object, TKey extends string | number>(
    collection: MutableCollection<TItem, TKey>,
) {
    for (const key of collection.keys()) {
        collection.delete(key);
    }
}
