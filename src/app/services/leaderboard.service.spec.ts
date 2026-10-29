import { PLATFORM_ID, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { LeaderboardService } from './leaderboard.service';
import { Auth } from './auth';
describe('Leaderboard SSR', () => {
  it('does not access Firestore or start timers on the server even with a user', () => {
    const timer = spyOn(window, 'setInterval').and.callThrough();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: { currentUser: signal({ id: 'driver' }) } },
      ],
    });
    const board = TestBed.inject(LeaderboardService);
    TestBed.tick();
    expect(board.drivers()).toEqual([]);
    expect(board.loading()).toBeFalse();
    expect(timer).not.toHaveBeenCalled();
  });
});
