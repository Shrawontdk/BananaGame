import {inject, Injectable, signal} from '@angular/core';
import {GameHistory} from '../models/game-history.model';
import {ScoreService} from './score.service';
import {Auth} from './auth';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private scoreService = inject(ScoreService);
  private authService = inject(Auth);

  // EVENT-DRIVEN: Signals for reactive state
  score = signal<number>(0);
  highScore = signal<number>(0);
  attempts = signal<number>(0);
  correctAnswers = signal<number>(0);
  wrongAnswers = signal<number>(0);
  history = signal<GameHistory[]>([]);
  isLoadingScore = signal<boolean>(false);

  /**
   * Load user score from Firestore
   */
  loadUserScore(): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      console.log('No user logged in, cannot load score');
      return;
    }

    this.isLoadingScore.set(true);
    console.log('Loading score for user:', currentUser.id);

    this.scoreService.getUserScore(currentUser.id).subscribe({
      next: (userScore) => {
        if (userScore) {
          // Score exists, load it
          this.score.set(userScore.score);
          this.highScore.set(userScore.highScore);
          this.attempts.set(userScore.attempts);
          this.correctAnswers.set(userScore.correctAnswers);
          this.wrongAnswers.set(userScore.wrongAnswers);
          console.log('Score loaded from Firestore:', userScore);
        } else {
          // First time user, initialize
          this.scoreService.initializeUserScore(
            currentUser.id,
            currentUser.username
          ).subscribe({
            next: () => {
              console.log('New user score initialized');
              this.resetLocalState();
            },
            error: (error) => {
              console.error('Error initializing score:', error);
            }
          });
        }
        this.isLoadingScore.set(false);
      },
      error: (error) => {
        console.error('Error loading score:', error);
        this.isLoadingScore.set(false);
      }
    });
  }

  /**
   * EVENT: Correct answer - increment score
   */
  incrementScore(points: number = 10): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const newScore = this.score() + points;
    this.score.set(newScore);
    this.attempts.update(v => v + 1);
    this.correctAnswers.update(v => v + 1);

    // Update high score locally if needed
    if (newScore > this.highScore()) {
      this.highScore.set(newScore);
    }

    // FIRESTORE: Save to database
    this.scoreService.incrementScore(currentUser.id, this.score() - points, points)
      .subscribe({
        next: () => console.log('Score saved to Firestore'),
        error: (error) => console.error('Error saving score:', error)
      });
  }

  /**
   * EVENT: Wrong answer - decrement score
   */
  decrementScore(points: number = 5): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const newScore = Math.max(0, this.score() - points);
    this.score.set(newScore);
    this.attempts.update(v => v + 1);
    this.wrongAnswers.update(v => v + 1);

    // FIRESTORE: Save to database
    this.scoreService.decrementScore(currentUser.id, this.score() + points, points)
      .subscribe({
        next: () => console.log('Score saved to Firestore'),
        error: (error) => console.error('Error saving score:', error)
      });
  }

  /**
   * Add game to history
   */
  addToHistory(entry: GameHistory): void {
    this.history.update(current => [...current, entry]);
  }

  /**
   * Reset game (logout or manual reset)
   */
  resetGame(): void {
    const currentUser = this.authService.currentUser();

    if (currentUser) {
      // FIRESTORE: Reset score in database (keeps high score)
      this.scoreService.resetScore(currentUser.id).subscribe({
        next: () => console.log('Score reset in Firestore'),
        error: (error) => console.error('Error resetting score:', error)
      });
    }

    this.resetLocalState();
  }

  /**
   * Reset local state
   */
  private resetLocalState(): void {
    this.score.set(0);
    this.attempts.set(0);
    this.correctAnswers.set(0);
    this.wrongAnswers.set(0);
    this.history.set([]);
    console.log('Local game state reset');
  }
}
