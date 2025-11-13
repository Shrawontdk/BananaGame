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
  email = signal<string>('');
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  isRegisterMode = signal<boolean>(false); // Toggle between login/register


  onLogin(): void {
    const emailValue = this.email();
    const passValue = this.password();

    // Validation
    if (!emailValue || !passValue) {
      this.errorMessage.set('Please enter email and password');
      return;
    }

    if (!this.isValidEmail(emailValue)) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    // FIREBASE: Call login method
    this.authService.login(emailValue, passValue).subscribe({
      next: () => {
        this.successMessage.set('Login successful!');
        console.log('Login successful');
      },
      error: (error) => {
        this.errorMessage.set(this.authService.authError());
        console.error('Login failed:', error);
      }
    });
  }

  onRegister(): void {
    const emailValue = this.email();
    const passValue = this.password();

    // Validation
    if (!emailValue || !passValue) {
      this.errorMessage.set('Please enter email and password');
      return;
    }

    if (!this.isValidEmail(emailValue)) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }

    if (passValue.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    // FIREBASE: Call register method
    this.authService.register(emailValue, passValue).subscribe({
      next: () => {
        this.successMessage.set('Registration successful! You are now logged in.');
        console.log('Registration successful');
      },
      error: (error) => {
        this.errorMessage.set(this.authService.authError());
        console.error('Registration failed:', error);
      }
    });
  }

  toggleMode(): void {
    this.isRegisterMode.update(mode => !mode);
    this.errorMessage.set('');
    this.successMessage.set('');
  }


  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.isRegisterMode()) {
        this.onRegister();
      } else {
        this.onLogin();
      }
    }
  }

  updateEmail(value: string): void {
    this.email.set(value);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  updatePassword(value: string): void {
    this.password.set(value);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isLoading(): boolean {
    return this.authService.isLoading();
  }
}
