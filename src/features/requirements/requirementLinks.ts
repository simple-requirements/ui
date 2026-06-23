import type { DifferenceKind } from '@/features/requirements/revisions';
import type { LinkCollectionView, RequirementLinkView } from '@/types/domain';

export type LinkDirection = 'outgoing' | 'incoming';

export interface ComparedLinkGroup {
    direction: LinkDirection;
    difference: DifferenceKind;
    links: readonly RequirementLinkView[];
}

const linkIdentity = (link: RequirementLinkView) =>
    `${link.relationshipType}:${link.sourceRequirementId}:${link.targetRequirementId}`;

const sortLinks = (links: readonly RequirementLinkView[]) =>
    [...links].sort((a, b) =>
        `${a.sourceVisibleKey}:${a.targetVisibleKey}:${a.id}`.localeCompare(
            `${b.sourceVisibleKey}:${b.targetVisibleKey}:${b.id}`,
        ),
    );

function classifyLinks(
    direction: LinkDirection,
    leftLinks: readonly RequirementLinkView[],
    rightLinks: readonly RequirementLinkView[],
): ComparedLinkGroup[] {
    const leftByIdentity = new Map(leftLinks.map((link) => [linkIdentity(link), link]));
    const rightByIdentity = new Map(rightLinks.map((link) => [linkIdentity(link), link]));
    const removed = leftLinks.filter((link) => !rightByIdentity.has(linkIdentity(link)));
    const added = rightLinks.filter((link) => !leftByIdentity.has(linkIdentity(link)));
    const unchanged = rightLinks.filter((link) => leftByIdentity.has(linkIdentity(link)));

    return [
        { direction, difference: 'added', links: sortLinks(added) },
        { direction, difference: 'removed', links: sortLinks(removed) },
        { direction, difference: 'unchanged', links: sortLinks(unchanged) },
    ];
}

export function compareLinkCollections(left: LinkCollectionView, right: LinkCollectionView): ComparedLinkGroup[] {
    return [
        ...classifyLinks('outgoing', left.outgoingLinks, right.outgoingLinks),
        ...classifyLinks('incoming', left.incomingLinks, right.incomingLinks),
    ];
}

export function visibleComparedLinkGroups(groups: readonly ComparedLinkGroup[], showUnchanged: boolean) {
    return showUnchanged ? groups : groups.filter((group) => group.difference !== 'unchanged');
}

export function describeLink(link: RequirementLinkView, direction: LinkDirection) {
    if (direction === 'outgoing') {
        return `${link.sourceVisibleKey} references ${link.targetVisibleKey}`;
    }
    return `${link.targetVisibleKey} is referenced by ${link.sourceVisibleKey}`;
}

export const emptyLinkCollection: LinkCollectionView = { outgoingLinks: [], incomingLinks: [] };
