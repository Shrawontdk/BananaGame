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


  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }

  updateUsername(value: string): void {
    this.username.set(value);
    this.errorMessage.set(''); // Clear error when typing
  }

  updatePassword(value: string): void {
    this.password.set(value);
    this.errorMessage.set(''); // Clear error when typing
  }
}
