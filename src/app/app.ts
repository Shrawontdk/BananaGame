import { Component, inject } from '@angular/core';
import { Login } from './components/login/login';
import { HeaderComponent } from './components/header/header';
import { Game } from './components/game/game';
import { RaceTrack } from './components/race-track/race-track';
import { Auth } from './services/auth';
@Component({
  selector: 'app-root',
  imports: [Login, HeaderComponent, Game, RaceTrack],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  currentUser = inject(Auth).currentUser;
}
