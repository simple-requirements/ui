export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatNullableDateTime(value: string | null): string {
  return value === null ? "—" : formatDateTime(value);
}

export function formatNullableValue(value: string | null): string {
  return value ?? "—";
}
