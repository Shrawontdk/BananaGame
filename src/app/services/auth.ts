import {inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {User} from '../models/user.model';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  currentUser = signal<User | null>(null);
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (this.isBrowser) {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser.set(JSON.parse(storedUser));
      }
    }
  }

  login(username: string, password: string): boolean {
    if (username && password) {
      const user: User = {
        username: username,
        id: Date.now(),
        loginTime: new Date()
      };

      if (this.isBrowser) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
      }
      this.currentUser.set(user);

      console.log('Login event triggered for user:', username);
      return true;
    }
    return false;
  }

  /**
   * VIRTUAL IDENTITY: Logout method
   * Clears user session and triggers state update
   */
  logout(): void {
    sessionStorage.removeItem('currentUser');

    this.currentUser.set(null);

    console.log('Logout event triggered');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

}
