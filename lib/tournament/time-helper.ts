export function getAdjustedTime(): number {
  const realNow = Date.now();
  const d = new Date(realNow);
  const realYear = d.getFullYear();
  if (realYear < 2026) {
    // Offset the year to 2026 to match the tournament schedule while preserving the month, day, and time
    d.setFullYear(d.getFullYear() + (2026 - realYear));
    return d.getTime();
  }
  return realNow;
}

export function getAdjustedDate(): Date {
  return new Date(getAdjustedTime());
}
