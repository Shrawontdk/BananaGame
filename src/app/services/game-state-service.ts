// EVENT-DRIVEN Theme: Game state management with reactive signals
import { Injectable, signal, computed } from '@angular/core';
import { GameHistory } from '../models/game-history.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private scoreSignal = signal<number>(0);
  private attemptsSignal = signal<number>(0);
  private historySignal = signal<GameHistory[]>([]);

  score = this.scoreSignal.asReadonly();
  attempts = this.attemptsSignal.asReadonly();
  history = this.historySignal.asReadonly();

  // Computed signal - automatically updates when score/attempts change
  accuracy = computed(() => {
    const total = this.attemptsSignal();
    if (total === 0) return 0;
    const correct = this.historySignal().filter(h => h.isCorrect).length;
    return Math.round((correct / total) * 100);
  });


  incrementScore(points: number = 10): void {
    this.scoreSignal.update(current => current + points);
    console.log('Score increment event:', this.scoreSignal());
  }


  decrementScore(points: number = 5): void {
    this.scoreSignal.update(current => Math.max(0, current - points));
    console.log('Score decrement event:', this.scoreSignal());
  }


  incrementAttempts(): void {
    this.attemptsSignal.update(current => current + 1);
    console.log('Attempts increment event:', this.attemptsSignal());
  }


  addToHistory(entry: GameHistory): void {
    this.historySignal.update(current => [...current, entry]);
    console.log('History updated event:', this.historySignal().length, 'entries');
  }

  resetGame(): void {
    this.scoreSignal.set(0);
    this.attemptsSignal.set(0);
    this.historySignal.set([]);
    console.log('Game reset event triggered');
  }
}
