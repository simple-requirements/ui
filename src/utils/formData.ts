/**
 * Reads a string form field while keeping FormData boundary parsing in one place.
 * Missing or non-string values are normalized to the empty string because the
 * existing form DTO mappers perform domain-specific optional/null conversion.
 */
export function formValue(formData: FormData, fieldName: string) {
    const value = formData.get(fieldName);
    return typeof value === 'string' ? value : '';
}
