import { DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Auth as FirebaseAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { defer, finalize, Observable, catchError, throwError } from 'rxjs';
import { User } from '../models/user.model';
@Injectable({ providedIn: 'root' })
export class Auth {
  currentUser = signal<User | null>(null);
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private firebaseAuth = inject(FirebaseAuth);
  isLoading = signal(false);
  authError = signal('');
  constructor() {
    if (!this.isBrowser) return;
    const stop = onAuthStateChanged(this.firebaseAuth, (user) => {
      this.currentUser.set(
        user ? { username: user.email || 'Driver', id: user.uid, loginTime: new Date() } : null,
      );
    });
    inject(DestroyRef).onDestroy(stop);
  }
  register(email: string, password: string): Observable<unknown> {
    return this.request(() => createUserWithEmailAndPassword(this.firebaseAuth, email, password));
  }
  login(email: string, password: string): Observable<unknown> {
    return this.request(() => signInWithEmailAndPassword(this.firebaseAuth, email, password));
  }
  logout(): Observable<unknown> {
    return this.request(() => signOut(this.firebaseAuth));
  }
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
  private request<T>(action: () => Promise<T>): Observable<T> {
    return defer(() => {
      this.isLoading.set(true);
      this.authError.set('');
      return action();
    }).pipe(
      catchError((error) => {
        this.authError.set(this.getErrorMessage(error.code));
        return throwError(() => error);
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }
  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-credential': 'Incorrect email or password',
      'auth/email-already-in-use': 'Email already registered. Please login instead.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
      'auth/network-request-failed': 'Network error. Check your internet connection.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    };
    return messages[code] || 'Authentication failed. Please try again.';
  }
}
