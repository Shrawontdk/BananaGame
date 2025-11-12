import {Component, inject, OnInit, signal} from '@angular/core';
import {Login} from './components/login/login';
import {HeaderComponent} from './components/header/header';
import {Game} from './components/game/game';
import {Auth} from './services/auth';

@Component({
  selector: 'app-root',
  imports: [Login, HeaderComponent, Game],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('banana-game');
  authService = inject(Auth)
  currentUser = this.authService.currentUser;


  ngOnInit() {
  }

}
