import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Auth} from '../../services/auth';
import {GameStateService} from '../../services/game-state-service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private authService = inject(Auth);
  gameState = inject(GameStateService); // Made public for template

  currentUser = this.authService.currentUser;
  score = this.gameState.score;
  highScore = this.gameState.highScore;
  attempts = this.gameState.attempts;
  correctAnswers = this.gameState.correctAnswers;
  wrongAnswers = this.gameState.wrongAnswers;

  /**
   * EVENT: Logout button click
   * Resets game and logs out user
   */
  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.gameState.resetGame();
      this.authService.logout().subscribe({
        next: () => console.log('Logged out successfully'),
        error: (error) => console.error('Logout error:', error)
      });
    }
  }

  /**
   * EVENT: Reset button click
   * Resets current score to 0 (keeps high score)
   */
  onReset(): void {
    if (confirm('Reset your current score to 0? (High score will be kept)')) {
      this.gameState.resetGame();
    }
  }
}
