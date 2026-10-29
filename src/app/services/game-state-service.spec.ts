import { TestBed } from '@angular/core/testing';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GameStateService } from './game-state-service';
import { ScoreService } from './score.service';
import { Auth } from './auth';
import { GameHistory } from '../models/game-history.model';
describe('GameStateService race scoring', () => {
  let state: GameStateService;
  let scores: jasmine.SpyObj<ScoreService>;
  const entry: GameHistory = {
    question: 'puzzle',
    userAnswer: 2,
    correctAnswer: 2,
    isCorrect: true,
    timestamp: new Date(),
  };
  beforeEach(() => {
    scores = jasmine.createSpyObj('ScoreService', [
      'incrementScore',
      'decrementScore',
      'saveUserHistory',
      'resetScore',
    ]);
    scores.incrementScore.and.returnValue(of(undefined));
    scores.decrementScore.and.returnValue(of(undefined));
    scores.saveUserHistory.and.returnValue(of(undefined));
    scores.resetScore.and.returnValue(of(undefined));
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ScoreService, useValue: scores },
        {
          provide: Auth,
          useValue: { currentUser: signal({ id: 'driver', username: 'driver@example.com' }) },
        },
      ],
    });
    state = TestBed.inject(GameStateService);
  });
  it('floors a wrong answer at zero and persists the original score', async () => {
    state.score.set(3);
    await state.recordAnswer(false, { ...entry, isCorrect: false });
    expect(scores.decrementScore).toHaveBeenCalledWith('driver', 3);
    expect(state.score()).toBe(0);
    expect(state.wrongAnswers()).toBe(1);
    expect(state.history().length).toBe(1);
  });
  it('only confirms a boost after saving and preserves best score on manual reset', async () => {
    await state.recordAnswer(true, entry);
    expect(state.score()).toBe(10);
    expect(state.highScore()).toBe(10);
    expect(state.boost()).toBeTrue();
    await state.resetGame();
    expect(state.score()).toBe(0);
    expect(state.highScore()).toBe(10);
    expect(state.history().length).toBe(1);
    expect(state.correctAnswers()).toBe(1);
  });
  it('does not award points or append history when the score write fails', async () => {
    scores.incrementScore.and.returnValue(throwError(() => new Error('offline')));
    expect(await state.recordAnswer(true, entry)).toBeFalse();
    expect(state.score()).toBe(0);
    expect(state.history()).toEqual([]);
    expect(state.boost()).toBeFalse();
    expect(state.error()).toContain('Could not save');
  });
});
