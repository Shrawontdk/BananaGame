import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Auth} from '../../services/auth';
import {GameStateService} from '../../services/game-state-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private authService = inject(Auth);
  private gameState = inject(GameStateService);
  currentUser = this.authService.currentUser;
  score = this.gameState.score;
  attempts = this.gameState.attempts;
  accuracy = this.gameState.accuracy;

  /**
   * EVENT-DRIVEN: Handle logout button click
   * Triggers multiple state changes across the app
   */
  onLogout(): void {
    this.gameState.resetGame();
    this.authService.logout();

    console.log('Logout process completed');
  }
}
