import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Game } from './game';
import { Auth } from '../../services/auth';
import { BananaApiService } from '../../services/banana-api-service';
import { GameStateService } from '../../services/game-state-service';
describe('Boost challenge', () => {
  it('awards one result per puzzle even with repeated submit, and loads score once', async () => {
    const state = {
      loadUserScore: jasmine.createSpy(),
      recordAnswer: jasmine.createSpy().and.resolveTo(true),
      saving: signal(false),
      isLoadingScore: signal(false),
      error: signal(''),
      history: signal([]),
      boost: signal(false),
      slowdown: signal(false),
    };
    await TestBed.configureTestingModule({
      imports: [Game],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Auth, useValue: { currentUser: signal({ id: 'driver' }) } },
        { provide: GameStateService, useValue: state },
        {
          provide: BananaApiService,
          useValue: { getQuestion: () => of({ question: 'puzzle', solution: 7 }) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Game);
    fixture.detectChanges();
    const game = fixture.componentInstance;
    game.loadQuestion();
    game.userAnswer.set('7');
    await game.submitAnswer();
    await game.submitAnswer();
    expect(state.recordAnswer).toHaveBeenCalledTimes(1);
    expect(state.loadUserScore).toHaveBeenCalledTimes(1);
    expect(game.feedback()).toContain('+10');
    fixture.destroy();
  });
});
