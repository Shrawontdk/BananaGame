export interface RaceEntry {
  uid: string;
  displayName: string;
  score: number;
  highScore: number;
  updatedAt: number;
}
export interface RankedDriver extends RaceEntry {
  rank: number;
  gap: number;
  color: string;
}
export function driverColor(uid: string): string {
  let hash = 0;
  for (const char of uid) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  const hue = (hash >>> 0) % 360;
  // Separate the previously similar cyan/blue liveries while keeping uid colors stable.
  if (hue >= 160 && hue < 190) return '#193b78';
  if (hue >= 190 && hue <= 250) return '#ef3038';
  return 'hsl(' + hue + ' 78% 62%)';
}
export function rankDrivers(entries: readonly RaceEntry[]): RankedDriver[] {
  const sorted = [...entries].sort(
    (a, b) => b.score - a.score || a.updatedAt - b.updatedAt || a.uid.localeCompare(b.uid),
  );
  return sorted.map((entry, i) => ({
    ...entry,
    rank: i + 1,
    gap: i ? sorted[i - 1].score - entry.score : 0,
    color: driverColor(entry.uid),
  }));
}
export function splitField(drivers: readonly RankedDriver[], uid?: string) {
  return {
    front: drivers.slice(0, 5),
    back: drivers.slice(5, 20),
    more: Math.max(0, drivers.length - 20),
    currentPosition: drivers.find((driver) => driver.uid === uid)?.rank ?? null,
  };
}
