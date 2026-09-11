export function isDraftRequirementStatus(status: string | undefined): boolean {
    return status?.toLowerCase() === "draft";
}

export function canBecomeObsolete(status: string | undefined): boolean {
    return status === "approved" || status === "implemented";
}
