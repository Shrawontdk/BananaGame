import { Component, computed, inject } from '@angular/core';
import { F1Car } from '../f1-car/f1-car';
import { LeaderboardService } from '../../services/leaderboard.service';
import { Auth } from '../../services/auth';
import { GameStateService } from '../../services/game-state-service';
import { driverColor, RankedDriver } from '../../services/race-ranking';
@Component({
  selector: 'app-race-track',
  standalone: true,
  imports: [F1Car],
  templateUrl: './race-track.html',
  styleUrls: ['./race-track.css', './race-effects.css'],
})
export class RaceTrack {
  board = inject(LeaderboardService);
  state = inject(GameStateService);
  user = inject(Auth).currentUser;
  color = driverColor;
  // Keep DOM siblings in uid order; only their transform and stacking order follow rank.
  cars = computed(() => [...this.board.drivers()].sort((a, b) => a.uid.localeCompare(b.uid)));
  height = computed(() => 660 + Math.ceil(this.board.field().back.length / 3) * 100);
  x(driver: RankedDriver): number {
    return driver.rank <= 5
      ? 500 - (driver.rank - 1) * 65
      : 24 + ((driver.rank - 6) % 3) * 240 + (Math.floor((driver.rank - 6) / 3) % 2) * 14;
  }
  y(driver: RankedDriver): number {
    return driver.rank <= 5
      ? 8 + (driver.rank - 1) * 120
      : 660 + Math.floor((driver.rank - 6) / 3) * 100;
  }
}
