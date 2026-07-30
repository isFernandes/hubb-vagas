export function hasTimeConflict(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  // Buffer of 1 hour (3600000 ms)
  return startA < endB + 3600000 && startB < endA + 3600000;
}
