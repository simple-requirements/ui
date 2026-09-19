import { resetProjectCategoriesCollections } from '@/api/collections/projectCategoriesCollection';
import { resetProjectRequirementsCollections } from '@/api/collections/projectRequirementsCollection';
import { resetProjectsCollection } from '@/api/collections/projectsCollection';

/** Clears every TanStack DB collection that may contain authenticated domain data. */
export async function resetDomainCollections(): Promise<void> {
    await Promise.all([
        resetProjectsCollection(),
        resetProjectCategoriesCollections(),
        resetProjectRequirementsCollections(),
    ]);
}
