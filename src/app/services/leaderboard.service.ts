import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  collection,
  doc,
  Firestore,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
} from '@angular/fire/firestore';
import { Auth } from './auth';
import { RaceEntry, rankDrivers, splitField } from './race-ranking';
@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private uid = computed(() => this.auth.currentUser()?.id);
  private browser = isPlatformBrowser(inject(PLATFORM_ID));
  private entries = signal<RaceEntry[]>([]);
  readonly ownEntry = signal<RaceEntry | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly total = signal(0);
  readonly more = computed(() => Math.max(0, this.total() - 20));
  readonly drivers = computed(() => rankDrivers(this.entries()));
  readonly field = computed(() => splitField(this.drivers(), this.uid()));
  readonly outsideField = computed(() => {
    const own = this.ownEntry();
    return own && !this.drivers().some((d) => d.uid === own.uid) ? own : null;
  });
  constructor() {
    effect((onCleanup) => {
      const uid = this.uid();
      this.entries.set([]);
      this.ownEntry.set(null);
      this.error.set('');
      this.loading.set(false);
      this.total.set(0);
      if (!this.browser || !uid) return;
      this.loading.set(true);
      let active = true;
      let lastCountAt = -Infinity;
      const refreshCount = () => {
        const now = Date.now();
        if (!active || now - lastCountAt < 30_000) return;
        lastCountAt = now;
        getCountFromServer(collection(this.firestore, 'leaderboard'))
          .then((count) => {
            if (active) this.total.set(count.data().count);
          })
          .catch(() => {
            /* Keep the last known count while offline. */
          });
      };
      // New drivers outside the top 20 do not trigger the limited listener.
      const countTimer = setInterval(refreshCount, 30_000);
      const stop = onSnapshot(
        query(collection(this.firestore, 'leaderboard'), orderBy('score', 'desc'), limit(20)),
        (snapshot) => {
          this.entries.set(
            snapshot.docs.map((d) => this.toEntry(d.id, d.data({ serverTimestamps: 'estimate' }))),
          );
          refreshCount();
          this.loading.set(false);
        },
        () => {
          this.loading.set(false);
          this.error.set(
            'Live timing unavailable. Check your connection and leaderboard permissions.',
          );
        },
      );
      const stopOwn = onSnapshot(
        doc(this.firestore, 'leaderboard/' + uid),
        (snapshot) => {
          this.ownEntry.set(
            snapshot.exists()
              ? this.toEntry(uid, snapshot.data({ serverTimestamps: 'estimate' }))
              : null,
          );
        },
        () => this.error.set('Your live timing is unavailable. Please reconnect.'),
      );
      onCleanup(() => {
        active = false;
        clearInterval(countTimer);
        stop();
        stopOwn();
      });
    });
  }
  private toEntry(uid: string, data: any): RaceEntry {
    return {
      uid,
      displayName: String(data.displayName || 'Driver').split('@')[0],
      score: Number(data.score) || 0,
      highScore: Number(data.highScore) || 0,
      updatedAt: data.updatedAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER,
    };
  }
}
