import { Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from '../../services/auth';
import { BananaApiResponse } from '../../models/game-data.model';
import { BananaApiService } from '../../services/banana-api-service';
import { GameStateService } from '../../services/game-state-service';
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game {
  private api = inject(BananaApiService);
  private auth = inject(Auth);
  private destroyRef = inject(DestroyRef);
  gameState = inject(GameStateService);
  currentQuestion = signal<BananaApiResponse | null>(null);
  userAnswer = signal('');
  isLoading = signal(false);
  answered = signal(false);
  feedback = signal('');
  feedbackType = signal<'success' | 'error' | ''>('');
  private nextTimer?: ReturnType<typeof setTimeout>;
  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) untracked(() => void this.gameState.loadUserScore());
    });
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.nextTimer);
      this.gameState.boost.set(false);
      this.gameState.slowdown.set(false);
    });
  }
  loadQuestion(): void {
    if (this.isLoading() || this.gameState.saving()) return;
    clearTimeout(this.nextTimer);
    this.isLoading.set(true);
    this.answered.set(false);
    this.currentQuestion.set(null);
    this.feedback.set('');
    this.userAnswer.set('');
    this.gameState.boost.set(false);
    this.gameState.slowdown.set(false);
    this.api
      .getQuestion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.currentQuestion.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.feedback.set('Challenge radio offline. Try loading again.');
          this.feedbackType.set('error');
          this.isLoading.set(false);
        },
      });
  }
  async submitAnswer(): Promise<void> {
    if (
      this.answered() ||
      this.isLoading() ||
      this.gameState.saving() ||
      this.gameState.isLoadingScore() ||
      this.gameState.error()
    )
      return;
    const question = this.currentQuestion();
    const answer = this.userAnswer().trim();
    const value = Number(answer);
    if (!question || !answer || !Number.isInteger(value)) {
      this.feedback.set('Enter a whole number.');
      this.feedbackType.set('error');
      return;
    }
    this.answered.set(true);
    const correct = value === Number(question.solution);
    const saved = await this.gameState.recordAnswer(correct, {
      question: question.question,
      userAnswer: value,
      correctAnswer: question.solution,
      isCorrect: correct,
      timestamp: new Date(),
    });
    if (this.destroyRef.destroyed) return;
    if (!saved) {
      this.feedback.set('Answer could not be saved. Check the status above.');
      return;
    }
    this.feedbackType.set(correct ? 'success' : 'error');
    this.feedback.set(
      correct
        ? 'BOOST! +10 points. Keep pushing.'
        : 'Slowdown: -5 points (minimum 0). The answer was ' + question.solution + '.',
    );
    this.nextTimer = setTimeout(() => this.loadQuestion(), 1800);
  }
  clearHistory(): void {
    if (confirm('Clear all challenge history?')) this.gameState.clearHistory();
  }
}
