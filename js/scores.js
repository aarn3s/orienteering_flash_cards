import { load, save } from './storage.js';

export class ScoreManager {
  constructor() {
    this.scores = load('highScores', []);
  }

  addScore(score) {
    this.scores.push(score);
    this.scores.sort((a, b) => b - a); // Sort descending
    this.scores = this.scores.slice(0, 10); // Keep only top 10
    save('highScores', this.scores);
    
    // Return true if this is a new high score (top position)
    return score === this.scores[0];
  }

  getScores() {
    return this.scores;
  }

  getHighScore() {
    return this.scores[0] || 0;
  }

  reset() {
    this.scores = [];
    save('highScores', this.scores);
  }
} 