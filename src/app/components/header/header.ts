import { Component, computed, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { GameStateService } from '../../services/game-state-service';
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private auth = inject(Auth);
  gameState = inject(GameStateService);
  name = computed(() => this.auth.currentUser()?.username.split('@')[0] ?? 'Driver');
  logoutError = signal('');
  onLogout(): void {
    this.auth
      .logout()
      .subscribe({
        next: () => this.gameState.clearSession(),
        error: () => this.logoutError.set('Could not sign out. Try again.'),
      });
  }
  onReset(): void {
    if (confirm('Reset your current score to 0? Your best score and history will be kept.'))
      void this.gameState.resetGame();
  }
}
