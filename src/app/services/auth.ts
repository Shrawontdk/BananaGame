import {inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {User} from '../models/user.model';
import {isPlatformBrowser} from '@angular/common';
import {
  Auth as FirebaseAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from '@angular/fire/auth';
import {from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  currentUser = signal<User | null>(null);
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private firebaseAuth = inject(FirebaseAuth);
  isLoading = signal<boolean>(false);
  authError = signal<string>('');


  constructor() {
    onAuthStateChanged(this.firebaseAuth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          username: firebaseUser.email || 'User',
          id: firebaseUser.uid, // Firebase UID
          loginTime: new Date()
        };
        this.currentUser.set(user);
        console.log('Firebase auth state: User logged in', user);
      } else {
        this.currentUser.set(null);
        console.log('Firebase auth state: User logged out');
      }
    });
  }

  register(email: string, password: string): Observable<any> {
    this.isLoading.set(true);
    this.authError.set('');
    console.log('Attempting to register user:', email);

    return from(
      createUserWithEmailAndPassword(this.firebaseAuth, email, password)
        .then((result) => {
          this.isLoading.set(false);
          console.log('Registration successful', result);
          return result;
        })
        .catch((error) => {
          this.isLoading.set(false);
          this.authError.set(this.getErrorMessage(error.code));
          console.error('Registration error:', error);
          throw error;
        })
    );
  }


  login(email: string, password: string): Observable<any> {
    this.isLoading.set(true);
    this.authError.set('');
    console.log('Attempting to login user:', email);

    return from(
      signInWithEmailAndPassword(this.firebaseAuth, email, password)
        .then((result) => {
          this.isLoading.set(false);
          console.log('Login successful', result);
          return result;
        })
        .catch((error) => {
          this.isLoading.set(false);
          this.authError.set(this.getErrorMessage(error.code));
          console.error('Login error:', error);
          throw error;
        })
    );
  }

  /**
   * VIRTUAL IDENTITY: Logout method
   * Clears user session and triggers state update
   */
  logout(): Observable<any> {
    this.isLoading.set(true);
    console.log('Logging out user');

    return from(
      signOut(this.firebaseAuth)
        .then(() => {
          this.isLoading.set(false);
          console.log('Logout successful');
        })
        .catch((error) => {
          this.isLoading.set(false);
          console.error('Logout error:', error);
          throw error;
        })
    );
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email already registered. Please login instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

}
