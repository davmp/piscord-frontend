export function formatDate(
  dateStr: string,
  opt?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  return date.toLocaleTimeString(
    ["pt-BR"],
    opt || {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );
}

export function formatDateLong(
  dateStr: string,
  opt?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  return date.toLocaleString(
    ["pt-BR"],
    opt || {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );
}
