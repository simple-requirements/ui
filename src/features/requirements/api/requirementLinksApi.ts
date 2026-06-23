import { apiFetch, runOrvalFetch } from '@/api/client/config';
import {
    getDeleteRequirementLinksLinkIdUrl,
    getGetRequirementsIdLinkChangesUrl,
    getGetRequirementsIdLinkHistoryUrl,
    getGetRequirementsIdLinksIncomingUrl,
    getGetRequirementsIdLinksOutgoingUrl,
    getGetRequirementsIdRevisionsRevisionNumberLinksUrl,
    getPatchRequirementLinksLinkIdUrl,
    getPostRequirementsIdLinksUrl,
} from '@/api/generated/endpoints/requirement-links/requirement-links';
import type {
    GetRequirementsIdLinkChangesParams,
    RequirementLinkChangesResponseDto,
    RequirementLinkHistoryResponseDto,
    RequirementLinkResponseDto,
    RequirementLinkTargetDto,
    RequirementRevisionLinksResponseDto,
} from '@/api/generated/models';
import type {
    LinkCollectionView,
    RequirementLinkChangesView,
    RequirementLinkHistoryEventView,
    RequirementLinkView,
    RequirementRevisionLinksView,
} from '@/types/domain';

export const normalizeRequirementLinkTargetKey = (targetVisibleKey: string) => targetVisibleKey.trim().toUpperCase();

const jsonRequestInit = (init: RequestInit | undefined, method: 'POST' | 'PATCH', body: unknown): RequestInit => {
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');
    return { ...init, method, headers, body: JSON.stringify(body) };
};

const methodRequestInit = (init: RequestInit | undefined, method: 'DELETE'): RequestInit => ({ ...init, method });

export const sortRequirementLinks = (links: readonly RequirementLinkView[]) =>
    [...links].sort((a, b) =>
        `${a.sourceVisibleKey}:${a.targetVisibleKey}:${a.id}`.localeCompare(
            `${b.sourceVisibleKey}:${b.targetVisibleKey}:${b.id}`,
        ),
    );

export function mapRequirementLink(dto: RequirementLinkResponseDto): RequirementLinkView {
    return {
        id: dto.id,
        projectId: dto.projectId,
        relationshipType: dto.relationshipType,
        sourceRequirementId: dto.sourceRequirementId,
        sourceVisibleKey: dto.sourceVisibleKey,
        sourceType: dto.sourceType,
        sourceCategoryId: dto.sourceCategoryId,
        sourceCategoryKey: dto.sourceCategoryKey ?? '—',
        sourceStatus: dto.sourceStatus,
        targetRequirementId: dto.targetRequirementId,
        targetVisibleKey: dto.targetVisibleKey,
        targetType: dto.targetType,
        targetCategoryId: dto.targetCategoryId,
        targetCategoryKey: dto.targetCategoryKey ?? '—',
        targetStatus: dto.targetStatus,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
    };
}

export function mapRequirementLinkHistory(dto: RequirementLinkHistoryResponseDto): RequirementLinkHistoryEventView {
    return {
        id: dto.id,
        linkId: dto.linkId,
        projectId: dto.projectId,
        eventType: dto.eventType,
        relationshipType: dto.relationshipType,
        sourceRequirementId: dto.sourceRequirementId,
        sourceVisibleKey: dto.sourceVisibleKey,
        oldTargetRequirementId: dto.oldTargetRequirementId,
        oldTargetVisibleKey: dto.oldTargetVisibleKey,
        newTargetRequirementId: dto.newTargetRequirementId,
        newTargetVisibleKey: dto.newTargetVisibleKey,
        occurredAt: dto.occurredAt,
        actor: dto.actor,
        reason: dto.reason,
    };
}

export function mapRevisionLinks(dto: RequirementRevisionLinksResponseDto): RequirementRevisionLinksView {
    return {
        requirementId: dto.requirementId,
        revisionNumber: dto.revisionNumber,
        revisionCreatedAt: dto.revisionCreatedAt,
        outgoingLinks: sortRequirementLinks(dto.outgoingLinks.map(mapRequirementLink)),
        incomingLinks: sortRequirementLinks(dto.incomingLinks.map(mapRequirementLink)),
    };
}

export function mapRequirementLinkChanges(dto: RequirementLinkChangesResponseDto): RequirementLinkChangesView {
    return {
        requirementId: dto.requirementId,
        fromRevision: dto.fromRevision,
        toRevision: dto.toRevision,
        addedOutgoingLinks: sortRequirementLinks(dto.addedOutgoingLinks.map(mapRequirementLink)),
        removedOutgoingLinks: sortRequirementLinks(dto.removedOutgoingLinks.map(mapRequirementLink)),
        unchangedOutgoingLinks: sortRequirementLinks(dto.unchangedOutgoingLinks.map(mapRequirementLink)),
        addedIncomingLinks: sortRequirementLinks(dto.addedIncomingLinks.map(mapRequirementLink)),
        removedIncomingLinks: sortRequirementLinks(dto.removedIncomingLinks.map(mapRequirementLink)),
        unchangedIncomingLinks: sortRequirementLinks(dto.unchangedIncomingLinks.map(mapRequirementLink)),
    };
}

export async function listRequirementLinks(requirementId: string, init?: RequestInit): Promise<LinkCollectionView> {
    const [outgoingLinks, incomingLinks] = await Promise.all([
        runOrvalFetch(() =>
            apiFetch<RequirementLinkResponseDto[]>(getGetRequirementsIdLinksOutgoingUrl(requirementId), init),
        ),
        runOrvalFetch(() =>
            apiFetch<RequirementLinkResponseDto[]>(getGetRequirementsIdLinksIncomingUrl(requirementId), init),
        ),
    ]);
    return {
        outgoingLinks: sortRequirementLinks(outgoingLinks.map(mapRequirementLink)),
        incomingLinks: sortRequirementLinks(incomingLinks.map(mapRequirementLink)),
    };
}

export async function listRequirementLinkHistory(
    requirementId: string,
    init?: RequestInit,
): Promise<RequirementLinkHistoryEventView[]> {
    return runOrvalFetch(() =>
        apiFetch<RequirementLinkHistoryResponseDto[]>(getGetRequirementsIdLinkHistoryUrl(requirementId), init),
    ).then((events) => events.map(mapRequirementLinkHistory));
}

export async function getRequirementRevisionLinks(
    requirementId: string,
    revisionNumber: number,
    init?: RequestInit,
): Promise<RequirementRevisionLinksView> {
    return runOrvalFetch(() =>
        apiFetch<RequirementRevisionLinksResponseDto>(
            getGetRequirementsIdRevisionsRevisionNumberLinksUrl(requirementId, revisionNumber),
            init,
        ),
    ).then(mapRevisionLinks);
}

export async function getRequirementLinkChanges(
    requirementId: string,
    params: GetRequirementsIdLinkChangesParams,
    init?: RequestInit,
): Promise<RequirementLinkChangesView> {
    return runOrvalFetch(() =>
        apiFetch<RequirementLinkChangesResponseDto>(getGetRequirementsIdLinkChangesUrl(requirementId, params), init),
    ).then(mapRequirementLinkChanges);
}

export async function createRequirementLink(
    requirementId: string,
    target: RequirementLinkTargetDto,
    init?: RequestInit,
): Promise<RequirementLinkView> {
    return runOrvalFetch(() =>
        apiFetch<RequirementLinkResponseDto>(
            getPostRequirementsIdLinksUrl(requirementId),
            jsonRequestInit(init, 'POST', target),
        ),
    ).then(mapRequirementLink);
}

export async function updateRequirementLink(
    linkId: string,
    target: RequirementLinkTargetDto,
    init?: RequestInit,
): Promise<RequirementLinkView> {
    return runOrvalFetch(() =>
        apiFetch<RequirementLinkResponseDto>(
            getPatchRequirementLinksLinkIdUrl(linkId),
            jsonRequestInit(init, 'PATCH', target),
        ),
    ).then(mapRequirementLink);
}

export async function deleteRequirementLink(linkId: string, init?: RequestInit): Promise<void> {
    await runOrvalFetch(() =>
        apiFetch<unknown>(getDeleteRequirementLinksLinkIdUrl(linkId), methodRequestInit(init, 'DELETE')),
    );
}
