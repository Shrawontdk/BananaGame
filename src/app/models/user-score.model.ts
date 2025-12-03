export interface UserScore {
  userId: string;           // Firebase UID
  email: string;            // User email
  score: number;            // Current score
  highScore: number;        // Best score ever
  attempts: number;         // Total attempts
  correctAnswers: number;   // Total correct
  wrongAnswers: number;     // Total wrong
  lastPlayed: Date;         // Last activity
  createdAt: Date;          // Account creation
}
