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
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('\u25b2 BOOST');
    expect(root.textContent).toContain('\u25bc SLOWDOWN');
    expect(root.textContent).toContain('\u22125');
    expect(root.textContent).toContain('Load challenge \u2192');
    expect(root.textContent).not.toContain('?');
    game.loadQuestion();
    fixture.detectChanges();
    expect(root.textContent).toContain('Deploy boost \u2192');
    state.saving.set(true);
    fixture.detectChanges();
    expect(root.textContent).toContain('Saving\u2026');
    state.saving.set(false);
    game.userAnswer.set('7');
    await game.submitAnswer();
    await game.submitAnswer();
    expect(state.recordAnswer).toHaveBeenCalledTimes(1);
    expect(state.loadUserScore).toHaveBeenCalledTimes(1);
    expect(game.feedback()).toContain('+10');
    fixture.destroy();
  });
});
