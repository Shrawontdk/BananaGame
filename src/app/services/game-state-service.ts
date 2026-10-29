import { inject, Injectable, signal } from '@angular/core';
import { GameHistory } from '../models/game-history.model';
import { ScoreService } from './score.service';
import { Auth } from './auth';
import { firstValueFrom } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class GameStateService {
  private scores = inject(ScoreService);
  private auth = inject(Auth);
  score = signal(0);
  highScore = signal(0);
  attempts = signal(0);
  correctAnswers = signal(0);
  wrongAnswers = signal(0);
  history = signal<GameHistory[]>([]);
  isLoadingScore = signal(false);
  saving = signal(false);
  error = signal('');
  boost = signal(false);
  slowdown = signal(false);
  async loadUserScore(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    this.clearSession();
    this.isLoadingScore.set(true);
    try {
      await firstValueFrom(this.scores.initializeUserScore(user.id, user.username));
      const [score, history] = await Promise.all([
        firstValueFrom(this.scores.getUserScore(user.id)),
        firstValueFrom(this.scores.getUserHistory(user.id)),
      ]);
      if (this.auth.currentUser()?.id !== user.id) return;
      if (score) {
        this.score.set(score.score);
        this.highScore.set(score.highScore);
        this.attempts.set(score.attempts);
        this.correctAnswers.set(score.correctAnswers);
        this.wrongAnswers.set(score.wrongAnswers);
      }
      this.history.set(history);
    } catch {
      if (this.auth.currentUser()?.id === user.id)
        this.error.set('Could not load your score. Sign out and try again.');
    } finally {
      if (this.auth.currentUser()?.id === user.id) this.isLoadingScore.set(false);
    }
  }
  async recordAnswer(correct: boolean, entry: GameHistory): Promise<boolean> {
    const user = this.auth.currentUser();
    if (!user || this.saving() || this.isLoadingScore() || this.error()) return false;
    this.saving.set(true);
    try {
      await firstValueFrom(
        correct
          ? this.scores.incrementScore(user.id, this.score())
          : this.scores.decrementScore(user.id, this.score()),
      );
      if (this.auth.currentUser()?.id !== user.id) return false;
      this.score.update((v) => (correct ? v + 10 : Math.max(0, v - 5)));
      this.highScore.update((v) => Math.max(v, this.score()));
      this.attempts.update((v) => v + 1);
      (correct ? this.correctAnswers : this.wrongAnswers).update((v) => v + 1);
      (correct ? this.boost : this.slowdown).set(true);
      const history = [...this.history(), entry];
      this.history.set(history);
      try {
        await firstValueFrom(this.scores.saveUserHistory(user.id, history));
      } catch {
        this.error.set('Points saved, but history could not be saved. Sign in again to reload.');
      }
      return true;
    } catch {
      this.error.set('Could not save your answer. Sign in again to reload your score.');
      return false;
    } finally {
      this.saving.set(false);
    }
  }
  clearHistory(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.scores.saveUserHistory(user.id, []).subscribe({
      next: () => this.history.set([]),
      error: () => this.error.set('Could not clear history.'),
    });
  }
  async resetGame(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user || this.saving() || this.isLoadingScore() || this.error()) return;
    this.saving.set(true);
    try {
      await firstValueFrom(this.scores.resetScore(user.id));
      if (this.auth.currentUser()?.id === user.id) this.score.set(0);
    } catch {
      this.error.set('Could not reset your score.');
    } finally {
      this.saving.set(false);
    }
  }
  clearSession(): void {
    this.score.set(0);
    this.highScore.set(0);
    this.attempts.set(0);
    this.correctAnswers.set(0);
    this.wrongAnswers.set(0);
    this.history.set([]);
    this.error.set('');
    this.boost.set(false);
    this.slowdown.set(false);
    this.isLoadingScore.set(false);
  }
}
