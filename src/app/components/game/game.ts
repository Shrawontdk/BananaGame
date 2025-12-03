import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Auth} from '../../services/auth';
import {BananaApiResponse} from '../../models/game-data.model';
import {GameHistory} from '../../models/game-history.model';
import {BananaApiService} from '../../services/banana-api-service';
import {GameStateService} from '../../services/game-state-service';

@Component({
  selector: 'app-game',
  imports: [CommonModule, FormsModule],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit {
  private bananaApi = inject(BananaApiService);
  gameState = inject(GameStateService); // Made public for template access
  private authService = inject(Auth);

  // Component state signals
  currentQuestion = signal<BananaApiResponse | null>(null);
  userAnswer = signal<string>('');
  isLoading = signal<boolean>(false);
  feedback = signal<string>('');
  feedbackType = signal<'success' | 'error' | ''>('');

  constructor() {
    // EFFECT: Load score when user changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        console.log('User logged in, loading score from Firestore...');
        this.gameState.loadUserScore();
      }
    });
  }

  ngOnInit(): void {
    // Load score if user is already logged in
    if (this.authService.isAuthenticated()) {
      console.log('User authenticated, loading score...');
      this.gameState.loadUserScore();
    }
  }

  /**
   * INTEROPERABILITY: Fetch question from Banana API
   * EVENT: Question load triggers state update
   */
  loadQuestion(): void {
    this.isLoading.set(true);
    this.feedback.set('');
    this.userAnswer.set('');

    this.bananaApi.getQuestion().subscribe({
      next: (data) => {
        this.currentQuestion.set(data);
        this.isLoading.set(false);
        console.log('Question loaded:', data);
      },
      error: (error) => {
        this.feedback.set('Error loading question. Please try again.');
        this.feedbackType.set('error');
        this.isLoading.set(false);
        console.error('API Error:', error);
      }
    });
  }

  /**
   * EVENT: Submit answer button click
   * Validates answer and updates score in Firestore
   */
  submitAnswer(): void {
    const answer = this.userAnswer();
    const question = this.currentQuestion();

    if (!answer || !question) {
      this.feedback.set('Please enter an answer');
      this.feedbackType.set('error');
      return;
    }

    const userNum = parseInt(answer);
    const isCorrect = userNum === question.solution;

    // Create history entry
    const historyEntry: GameHistory = {
      question: question.question,
      userAnswer: userNum,
      correctAnswer: question.solution,
      isCorrect: isCorrect,
      timestamp: new Date()
    };

    if (isCorrect) {
      // EVENT: Correct answer - saves to Firestore automatically
      this.gameState.incrementScore(10);
      this.feedback.set('Correct! Well done! 🎉');
      this.feedbackType.set('success');

      // EVENT: Auto-load next question after delay
      setTimeout(() => {
        this.loadQuestion();
      }, 1500);
    } else {
      // EVENT: Wrong answer - saves to Firestore automatically
      this.gameState.decrementScore(5);
      this.feedback.set(`Incorrect. The answer was ${question.solution}. Try the next one!`);
      this.feedbackType.set('error');

      // EVENT: Load next question after delay
      setTimeout(() => {
        this.loadQuestion();
      }, 2000);
    }

    // Add to local history
    this.gameState.addToHistory(historyEntry);
  }

  /**
   * EVENT: Skip button click
   */
  skipQuestion(): void {
    this.loadQuestion();
  }

  /**
   * EVENT: Enter key press in input
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.userAnswer()) {
      this.submitAnswer();
    }
  }

  /**
   * Update answer signal
   */
  updateAnswer(value: string): void {
    this.userAnswer.set(value);
  }

  /**
   * Clear game history
   */
  clearHistory(): void {
    if (confirm('Clear all game history?')) {
      this.gameState.history.set([]);
      console.log('Game history cleared');
    }
  }

  // Expose game state signals to template
  get score() {
    return this.gameState.score;
  }

  get highScore() {
    return this.gameState.highScore;
  }

  get attempts() {
    return this.gameState.attempts;
  }

  get correctAnswers() {
    return this.gameState.correctAnswers;
  }

  get wrongAnswers() {
    return this.gameState.wrongAnswers;
  }

  get history() {
    return this.gameState.history;
  }
}
