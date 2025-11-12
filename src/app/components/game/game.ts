import {Component, inject, OnInit, signal} from '@angular/core';
import {GameHistory} from '../../models/game-history.model';
import {BananaApiResponse} from '../../models/game-data.model';
import {BananaApiService} from '../../services/banana-api-service';
import {GameStateService} from '../../services/game-state-service';

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit {
  private bananaApi = inject(BananaApiService);
  private gameState = inject(GameStateService);

  currentQuestion = signal<BananaApiResponse | null>(null);
  userAnswer = signal<string>('');
  isLoading = signal<boolean>(false);
  feedback = signal<string>('');
  feedbackType = signal<'success' | 'error' | ''>('');


  score = this.gameState.score;
  history = this.gameState.history;

  ngOnInit(): void {
    console.log('Game component initialized');
  }


  loadQuestion(): void {
    this.isLoading.set(true);
    this.feedback.set('');
    this.feedbackType.set('');
    this.userAnswer.set('');

    console.log('Loading question from Banana API...');

    // INTEROPERABILITY: HTTP call to external API
    this.bananaApi.getQuestion().subscribe({
      next: (data: BananaApiResponse) => {
        this.currentQuestion.set(data);
        this.gameState.incrementAttempts();
        this.isLoading.set(false);

        console.log('Question loaded successfully:', {
          imageUrl: data.question,
          solution: data.solution
        });
      },
      error: (error) => {
        this.feedback.set('Error loading question. Please try again.');
        this.feedbackType.set('error');
        this.isLoading.set(false);

        console.error('API Error:', error);
      }
    });
  }


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
      this.gameState.incrementScore(10);
      this.feedback.set('Correct! Well done! 🎉');
      this.feedbackType.set('success');

      console.log('Correct answer event:', {
        userAnswer: userNum,
        correctAnswer: question.solution,
        newScore: this.gameState.score()
      });

      setTimeout(() => this.loadQuestion(), 1500);
    } else {
      this.gameState.decrementScore(5);
      this.feedback.set(`Incorrect. The answer was ${question.solution}. Try the next one!`);
      this.feedbackType.set('error');

      console.log('Wrong answer event:', {
        userAnswer: userNum,
        correctAnswer: question.solution,
        newScore: this.gameState.score()
      });

      setTimeout(() => this.loadQuestion(), 2000);
    }

    this.gameState.addToHistory(historyEntry);
  }


  skipQuestion(): void {
    console.log('Skip question event triggered');
    this.loadQuestion();
  }


  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.userAnswer()) {
      this.submitAnswer();
    }
  }


  updateAnswer(value: string): void {
    this.userAnswer.set(value);
  }
}
