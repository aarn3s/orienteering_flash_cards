import { Game } from './game.js';
import { ScoreManager } from './scores.js';

const GAME_DURATION = 20; // 20 seconds

class UI {
  constructor() {
    this.game = new Game();
    this.scoreManager = new ScoreManager();
    this.gameTimer = null;
    this.timeLeft = GAME_DURATION;
    this.timerPaused = false;
    this.bossLevelTimers = [5, 4.5, 4, 3.5, 3, 3, 2.5, 2.5, 2, 2, 1.5, 1.5, 1, 1];
    this.setupEventListeners();
    this.createFloatingShapes();
    this.updateHighScoresList();
    this.updateScore();
  }

  createFloatingShapes() {
    const container = document.querySelector('.floating-shapes');
    for (let i = 0; i < 20; i++) {
      const shape = document.createElement('div');
      shape.className = 'shape';
      shape.style.left = Math.random() * 100 + '%';
      shape.style.top = Math.random() * 100 + '%';
      shape.style.width = Math.random() * 50 + 20 + 'px';
      shape.style.height = shape.style.width;
      shape.style.setProperty('--tx', (Math.random() * 200 - 100) + 'px');
      shape.style.setProperty('--ty', (Math.random() * 200 - 100) + 'px');
      shape.style.animationDelay = Math.random() * -20 + 's';
      container.appendChild(shape);
    }
  }

  setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', () => this.startGame());
    document.getElementById('play-again').addEventListener('click', () => this.restartGame());
    document.getElementById('show-answer').addEventListener('click', () => this.showAnswer());
    document.getElementById('mark-correct').addEventListener('click', () => this.markAnswer(true));
    document.getElementById('mark-wrong').addEventListener('click', () => this.markAnswer(false));
    document.getElementById('reset-scores').addEventListener('click', () => this.resetScores());
  }

  resetScores() {
    if (confirm('Are you sure you want to reset all high scores? This cannot be undone.')) {
      this.scoreManager.reset();
      this.updateHighScoresList();
    }
  }

  startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('score-screen').style.display = 'none';
    document.body.classList.remove('boss-mode'); // Remove boss mode visuals
    
    // Reset scroll position and ensure proper viewport
    window.scrollTo(0, 0);
    
    // Focus on the game area
    document.getElementById('card').focus();
    
    this.timeLeft = GAME_DURATION;
    this.updateTimer();
    this.startTimer();
    this.game.reset();
    this.showNextCard();
  }

  restartGame() {
    document.body.classList.remove('boss-mode'); // Remove boss mode visuals
    this.startGame();
  }

  startTimer() {
    if (this.gameTimer) clearInterval(this.gameTimer);
    this.timerPaused = false;
    this.gameTimer = setInterval(() => {
      if (!this.timerPaused) {
        this.timeLeft -= 0.1; // Update every 100ms for smoother countdown
        this.updateTimer();
        if (this.timeLeft <= 0) {
          this.endGame();
        }
      }
    }, 100);
  }

  updateTimer() {
    const progress = (this.timeLeft / (this.game.isBossLevel ? this.getBossLevelTime() : GAME_DURATION)) * 100;
    const timerBar = document.getElementById('timer-progress');
    timerBar.style.width = progress + '%';
    
    // Add color transitions based on time left
    if (this.timeLeft <= 1) {
      timerBar.style.backgroundColor = 'var(--danger)';
    } else if (this.timeLeft <= 2) {
      timerBar.style.backgroundColor = '#ffc107'; // warning yellow
    } else {
      timerBar.style.backgroundColor = this.game.isBossLevel ? 'var(--danger)' : 'var(--primary)';
    }

    // Update timer text with one decimal place
    const seconds = this.timeLeft.toFixed(1);
    timerBar.textContent = `${seconds}s`;
  }

  getBossLevelTime() {
    const questionIndex = this.game.bossLevelQuestionCount;
    return questionIndex >= this.bossLevelTimers.length ? 1 : this.bossLevelTimers[questionIndex];
  }

  showBossLevelAnnouncement() {
    const announcement = document.getElementById('boss-level-announcement');
    announcement.style.display = 'flex';
    document.body.classList.add('boss-mode');
    
    // Add dramatic sound effect or visual effects here if desired
    
    // Hide announcement after 2 seconds
    setTimeout(() => {
      announcement.style.display = 'none';
      this.startBossLevel();
    }, 2000);
  }

  startBossLevel() {
    this.timeLeft = 5; // First question gets 5 seconds
    this.updateTimer();
  }

  showAnswer() {
    const answerDiv = document.getElementById('answer');
    answerDiv.classList.add('visible');
    document.getElementById('mark-correct').style.display = 'block';
    document.getElementById('mark-wrong').style.display = 'block';
    document.getElementById('show-answer').style.display = 'none';
    
    // Pause the timer
    this.timerPaused = true;
    
    // Visual indication that timer is paused
    document.getElementById('timer-progress').style.opacity = '0.5';
  }

  showTimeBonus(seconds) {
    const bonus = document.createElement('div');
    bonus.className = 'time-bonus';
    bonus.textContent = `+${seconds}s`;
    document.getElementById('timer-bar').appendChild(bonus);
    
    // Remove the element after animation completes
    setTimeout(() => bonus.remove(), 1000);
  }

  showPointsBonus(points) {
    if (!points) return;
    
    const bonus = document.createElement('div');
    bonus.className = 'points-bonus';
    bonus.textContent = `+${points}`;
    document.body.appendChild(bonus);
    
    // Remove the element after animation completes
    setTimeout(() => bonus.remove(), 1000);
  }

  markAnswer(isCorrect) {
    // Resume the timer
    this.timerPaused = false;
    document.getElementById('timer-progress').style.opacity = '1';
    
    const result = this.game.markAnswer(isCorrect);
    
    if (result.gameOver) {
      this.endGame();
      return;
    }

    if (result.bossLevel && this.game.bossLevelQuestionCount === 1) {
      // First BOSS LEVEL question - show announcement
      this.showBossLevelAnnouncement();
    }

    if (isCorrect) {
      if (result.bossLevel) {
        // Set timer for next question
        this.timeLeft = this.getBossLevelTime();
        this.showPointsBonus(result.pointsBonus);
      } else if (result.timeBonus > 0) {
        this.timeLeft += result.timeBonus;
        this.showTimeBonus(result.timeBonus);
      }
      this.updateTimer();
    }

    this.updateScore();
    
    if (result.achievements && result.achievements.length > 0) {
      this.showAchievements(result.achievements);
    }
    
    this.showNextCard();
  }

  showNextCard() {
    const card = this.game.getNextCard();
    if (!card) return;

    document.getElementById('question-img').src = card.questionImage;
    document.getElementById('answer-img').src = card.answerImage;
    document.getElementById('answer-text').textContent = card.answer;
    
    const answerDiv = document.getElementById('answer');
    answerDiv.classList.remove('visible');
    
    document.getElementById('mark-correct').style.display = 'none';
    document.getElementById('mark-wrong').style.display = 'none';
    document.getElementById('show-answer').style.display = 'block';
  }

  updateScore() {
    const scoreText = `Score: ${this.game.score} | Streak: ${this.game.streak}`;
    document.getElementById('score-text').textContent = scoreText;
  }

  showAchievements(achievements) {
    const achievementsContainer = document.getElementById('achievements');
    
    achievements.forEach(achievement => {
      const badge = document.createElement('div');
      badge.className = 'badge achievement-animation';
      badge.textContent = achievement.title;
      badge.title = achievement.description;
      achievementsContainer.appendChild(badge);

      // Remove the badge after animation
      setTimeout(() => {
        badge.classList.add('visible');
      }, 100);
    });
  }

  updateHighScoresList(newScoreIndex = -1) {
    const scores = this.scoreManager.getScores();
    const lists = ['high-scores-list', 'final-high-scores-list'];
    
    lists.forEach(listId => {
      const list = document.getElementById(listId);
      list.innerHTML = '';
      scores.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'score-item' + (index === newScoreIndex ? ' new' : '');
        item.innerHTML = `
          <span>#${index + 1}</span>
          <span>${score}</span>
        `;
        list.appendChild(item);
      });
    });
  }

  showConfetti() {
    const container = document.getElementById('confetti-container');
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 10 + 5 + 'px';
      confetti.style.animation = `confettiFall ${Math.random() * 2 + 3}s linear forwards`;
      confetti.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
  }

  endGame() {
    clearInterval(this.gameTimer);
    document.body.classList.remove('boss-mode'); // Remove boss mode visuals
    const finalScore = this.game.score;
    document.getElementById('final-score').textContent = finalScore;
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('score-screen').style.display = 'flex';
    
    const isHighScore = this.scoreManager.addScore(finalScore);
    const newScoreIndex = this.scoreManager.getScores().indexOf(finalScore);
    this.updateHighScoresList(newScoreIndex);
    
    if (isHighScore) {
      this.showConfetti();
    }
  }
}

// Initialize the UI
const ui = new UI(); 