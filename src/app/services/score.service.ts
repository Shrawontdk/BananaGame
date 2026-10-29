import { inject, Injectable } from '@angular/core';
import {
  doc,
  Firestore,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { UserScore } from '../models/user-score.model';
import { GameHistory } from '../models/game-history.model';
import { defer, Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ScoreService {
  private firestore = inject(Firestore);
  getUserHistory(uid: string): Observable<GameHistory[]> {
    return defer(async () => {
      const snapshot = await getDoc(doc(this.firestore, 'scores/' + uid));
      return (snapshot.data()?.['history'] ?? []).map((entry: any) => ({
        ...entry,
        timestamp: entry.timestamp?.toDate?.() ?? new Date(entry.timestamp),
      }));
    });
  }
  saveUserHistory(uid: string, history: GameHistory[]): Observable<void> {
    return defer(() => updateDoc(doc(this.firestore, 'scores/' + uid), { history }));
  }
  getUserScore(uid: string): Observable<UserScore | null> {
    return defer(async () => {
      const snapshot = await getDoc(doc(this.firestore, 'scores/' + uid));
      return snapshot.exists() ? (snapshot.data() as UserScore) : null;
    });
  }
  // Upsert on login also migrates existing users without resetting their score.
  initializeUserScore(uid: string, email: string): Observable<void> {
    return defer(() =>
      runTransaction(this.firestore, async (transaction) => {
        const privateRef = doc(this.firestore, 'scores/' + uid);
        const publicRef = doc(this.firestore, 'leaderboard/' + uid);
        const snapshot = await transaction.get(privateRef);
        const publicSnapshot = await transaction.get(publicRef);
        const data = snapshot.exists()
          ? (snapshot.data() as UserScore)
          : {
              userId: uid,
              email,
              score: 0,
              highScore: 0,
              attempts: 0,
              correctAnswers: 0,
              wrongAnswers: 0,
            };
        if (!snapshot.exists())
          transaction.set(privateRef, {
            ...data,
            createdAt: serverTimestamp(),
            lastPlayed: serverTimestamp(),
            history: [],
          });
        transaction.set(publicRef, {
          displayName: email.split('@')[0] || 'Driver',
          score: data.score,
          highScore: data.highScore,
          updatedAt: publicSnapshot.data()?.['updatedAt'] ?? serverTimestamp(),
        });
      }),
    );
  }
  private changeScore(uid: string, delta: number | null): Observable<void> {
    return defer(() =>
      runTransaction(this.firestore, async (transaction) => {
        const privateRef = doc(this.firestore, 'scores/' + uid);
        const snapshot = await transaction.get(privateRef);
        if (!snapshot.exists()) throw new Error('Your score is not ready. Please sign in again.');
        const data = snapshot.data() as UserScore;
        const score = delta === null ? 0 : Math.max(0, data.score + delta);
        const highScore = Math.max(data.highScore, score);
        transaction.update(privateRef, {
          score,
          highScore,
          lastPlayed: serverTimestamp(),
          ...(delta === null
            ? {}
            : {
                attempts: data.attempts + 1,
                correctAnswers: data.correctAnswers + (delta > 0 ? 1 : 0),
                wrongAnswers: data.wrongAnswers + (delta < 0 ? 1 : 0),
              }),
        });
        transaction.set(doc(this.firestore, 'leaderboard/' + uid), {
          displayName: data.email.split('@')[0] || 'Driver',
          score,
          highScore,
          updatedAt: serverTimestamp(),
        });
      }),
    );
  }
  incrementScore(uid: string, _currentScore: number, points = 10): Observable<void> {
    return this.changeScore(uid, points);
  }
  decrementScore(uid: string, _currentScore: number, points = 5): Observable<void> {
    return this.changeScore(uid, -points);
  }
  resetScore(uid: string): Observable<void> {
    return this.changeScore(uid, null);
  }
}
