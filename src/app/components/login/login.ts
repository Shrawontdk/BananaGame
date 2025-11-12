import {Component, inject, signal} from '@angular/core';
import {Auth} from '../../services/auth';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(Auth);
  username = signal<string>('');
  password = signal<string>('');
  errorMessage = signal<string>('');

  /**
   * EVENT-DRIVEN: Handle login button click
   * VIRTUAL IDENTITY: Authenticate user
   */
  onLogin(): void {
    const user = this.username();
    const pass = this.password();

    if (!user || !pass) {
      this.errorMessage.set('Please enter username and password');
      return;
    }

    // VIRTUAL IDENTITY: Attempt login
    const success = this.authService.login(user, pass);

    if (!success) {
      this.errorMessage.set('Invalid credentials');
    } else {
      this.errorMessage.set('');
    }
  }

  /**
   * EVENT-DRIVEN: Handle Enter key press
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }

  /**
   * Update username signal
   */
  updateUsername(value: string): void {
    this.username.set(value);
    this.errorMessage.set(''); // Clear error when typing
  }

  /**
   * Update password signal
   */
  updatePassword(value: string): void {
    this.password.set(value);
    this.errorMessage.set(''); // Clear error when typing
  }
}
