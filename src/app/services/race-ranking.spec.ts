import { driverColor, RaceEntry, rankDrivers, splitField } from './race-ranking';
const entry = (uid: string, score: number, updatedAt = 1): RaceEntry => ({
  uid,
  score,
  updatedAt,
  displayName: uid,
  highScore: score,
});
describe('Race ranking', () => {
  it('splits five leaders and at most fifteen back markers without losing overflow', () => {
    const field = splitField(
      rankDrivers(Array.from({ length: 27 }, (_, i) => entry('u' + i, 270 - i * 10))),
    );
    expect(field.front.map((d) => d.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(field.back.length).toBe(15);
    expect(field.back[14].rank).toBe(20);
    expect(field.more).toBe(7);
  });
  it('ranks by score, then earlier update, then uid for deterministic equal timestamps', () => {
    const entries = [
      entry('b', 10, 5),
      entry('a', 10, 5),
      entry('early', 10, 2),
      entry('leader', 20, 99),
    ];
    expect(rankDrivers(entries).map((d) => d.uid)).toEqual(['leader', 'early', 'a', 'b']);
    expect(entries[0].uid).toBe('b');
  });
  it('finds the current user in the back pack and after an overtake', () => {
    const entries = Array.from({ length: 15 }, (_, i) => entry('u' + i, 150 - i * 10));
    expect(splitField(rankDrivers(entries), 'u11').currentPosition).toBe(12);
    entries[11].score = 160;
    expect(splitField(rankDrivers(entries), 'u11').currentPosition).toBe(1);
  });
  it('keeps zero scores and calculates the gap to the immediately preceding driver', () => {
    const drivers = rankDrivers([entry('zero', 0), entry('first', 30), entry('next', 10)]);
    expect(drivers.map((d) => d.gap)).toEqual([0, 20, 10]);
    expect(drivers[2].uid).toBe('zero');
  });
  it('handles a short or empty grid and an absent current user', () => {
    expect(splitField([], 'missing')).toEqual({
      front: [],
      back: [],
      more: 0,
      currentPosition: null,
    });
    expect(splitField(rankDrivers([entry('one', 0)])).back).toEqual([]);
    expect(splitField(rankDrivers([entry('one', 0)]), 'other').currentPosition).toBeNull();
  });
  it('assigns a stable color to a uid regardless of score or rank', () => {
    expect(driverColor('driver-123')).toBe(driverColor('driver-123'));
    expect(rankDrivers([entry('driver-123', 0)])[0].color).toBe(driverColor('driver-123'));
  });
});
