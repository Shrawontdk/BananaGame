import { computed, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RaceTrack } from './race-track';
import { LeaderboardService } from '../../services/leaderboard.service';
import { Auth } from '../../services/auth';
import { GameStateService } from '../../services/game-state-service';
import { RaceEntry, rankDrivers, splitField } from '../../services/race-ranking';
describe('RaceTrack', () => {
  it('keeps car elements on overtakes and exposes the order and current-user position', async () => {
    const entries = signal<RaceEntry[]>(
      Array.from({ length: 20 }, (_, i) => ({
        uid: 'u' + i,
        displayName: 'Driver ' + i,
        score: 200 - i * 10,
        highScore: 200,
        updatedAt: i,
      })),
    );
    const drivers = computed(() => rankDrivers(entries()));
    const board = {
      drivers,
      field: computed(() => splitField(drivers(), 'u11')),
      more: signal(4),
      loading: signal(false),
      error: signal(''),
      outsideField: signal(null),
    };
    await TestBed.configureTestingModule({
      imports: [RaceTrack],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LeaderboardService, useValue: board },
        { provide: Auth, useValue: { currentUser: signal({ id: 'u11' }) } },
        { provide: GameStateService, useValue: { boost: signal(false), slowdown: signal(false) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(RaceTrack);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('.driver:not(.back)').length).toBe(5);
    const firstCar = root.querySelector('.driver app-f1-car')!.getBoundingClientRect();
    const firstLane = root.querySelector('.lane')!.getBoundingClientRect();
    expect(firstCar.bottom).toBeLessThanOrEqual(firstLane.bottom);
    expect(root.querySelectorAll('.driver.back').length).toBe(15);
    expect(root.querySelectorAll('ol li').length).toBe(20);
    expect(root.textContent).toContain('Your position: P12');
    expect(root.textContent).toContain('+4 more');
    const own = root.querySelector('.driver.you');
    entries.update((items) =>
      items.map((item) => (item.uid === 'u11' ? { ...item, score: 210 } : item)),
    );
    fixture.detectChanges();
    expect(root.querySelector('.driver.you')).toBe(own);
    expect(root.textContent).toContain('Your position: P1');
    expect(root.querySelector('.driver.you')?.classList.contains('back')).toBeFalse();
    root.style.display = 'block';
    root.style.width = '375px';
    const scroll = root.querySelector('.track-scroll') as HTMLElement;
    expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
  });
});
