import {inject, Injectable} from '@angular/core';
import {doc, Firestore, getDoc, serverTimestamp, setDoc, updateDoc} from '@angular/fire/firestore';
import {UserScore} from '../models/user-score.model';
import {from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private firestore = inject(Firestore);

  /**
   * FIRESTORE: Get user score from database
   */
  getUserScore(userId: string): Observable<UserScore | null> {
    console.log('Fetching score for user:', userId);

    const userDocRef = doc(this.firestore, `scores/${userId}`);

    return from(
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserScore;
          console.log('Score retrieved:', data);
          return {
            ...data,
            lastPlayed: data.lastPlayed ? new Date(data.lastPlayed) : new Date(),
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
          };
        } else {
          console.log('No score data found for user');
          return null;
        }
      }).catch((error) => {
        console.error('Error fetching score:', error);
        return null;
      })
    );
  }

  /**
   * FIRESTORE: Initialize new user score
   */
  initializeUserScore(userId: string, email: string): Observable<void> {
    console.log('Initializing score for new user:', userId);

    const userDocRef = doc(this.firestore, `scores/${userId}`);

    const initialScore: UserScore = {
      userId: userId,
      email: email,
      score: 0,
      highScore: 0,
      attempts: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      lastPlayed: new Date(),
      createdAt: new Date()
    };

    return from(
      setDoc(userDocRef, {
        ...initialScore,
        lastPlayed: serverTimestamp(),
        createdAt: serverTimestamp()
      }).then(() => {
        console.log('User score initialized');
      }).catch((error) => {
        console.error('Error initializing score:', error);
        throw error;
      })
    );
  }

  /**
   * FIRESTORE: Update user score after game action
   */
  updateUserScore(
    userId: string,
    updates: Partial<UserScore>
  ): Observable<void> {
    console.log('Updating score for user:', userId, updates);

    const userDocRef = doc(this.firestore, `scores/${userId}`);

    return from(
      updateDoc(userDocRef, {
        ...updates,
        lastPlayed: serverTimestamp()
      }).then(() => {
        console.log('Score updated successfully');
      }).catch((error) => {
        console.error('Error updating score:', error);
        throw error;
      })
    );
  }

  /**
   * FIRESTORE: Increment score (correct answer)
   */
  incrementScore(
    userId: string,
    currentScore: number,
    points: number = 10
  ): Observable<void> {
    const newScore = currentScore + points;

    return from(
      getDoc(doc(this.firestore, `scores/${userId}`)).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserScore;
          const newHighScore = Math.max(data.highScore || 0, newScore);

          return updateDoc(doc(this.firestore, `scores/${userId}`), {
            score: newScore,
            highScore: newHighScore,
            attempts: (data.attempts || 0) + 1,
            correctAnswers: (data.correctAnswers || 0) + 1,
            lastPlayed: serverTimestamp()
          });
        } else {
          throw new Error('User score document does not exist');
        }
      }).then(() => {
        console.log('Score incremented:', newScore);
      }).catch((error) => {
        console.error('Error incrementing score:', error);
        throw error;
      })
    );
  }

  /**
   * FIRESTORE: Decrement score (wrong answer)
   */
  decrementScore(
    userId: string,
    currentScore: number,
    points: number = 5
  ): Observable<void> {
    const newScore = Math.max(0, currentScore - points);

    return from(
      getDoc(doc(this.firestore, `scores/${userId}`)).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserScore;

          return updateDoc(doc(this.firestore, `scores/${userId}`), {
            score: newScore,
            attempts: (data.attempts || 0) + 1,
            wrongAnswers: (data.wrongAnswers || 0) + 1,
            lastPlayed: serverTimestamp()
          });
        } else {
          throw new Error('User score document does not exist');
        }
      }).then(() => {
        console.log('Score decremented:', newScore);
      }).catch((error) => {
        console.error('Error decrementing score:', error);
        throw error;
      })
    );
  }

  /**
   * FIRESTORE: Reset current score (keep high score)
   */
  resetScore(userId: string): Observable<void> {
    console.log('Resetting score for user:', userId);

    const userDocRef = doc(this.firestore, `scores/${userId}`);

    return from(
      updateDoc(userDocRef, {
        score: 0,
        lastPlayed: serverTimestamp()
      }).then(() => {
        console.log('Score reset to 0');
      }).catch((error) => {
        console.error('Error resetting score:', error);
        throw error;
      })
    );
  }
}
