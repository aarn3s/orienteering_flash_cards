import { save, load } from './storage.js';
import { cards } from './cards.js';

export class Game {
  constructor() {
    this.cards = [];
    this.currentCardIndex = 0;
    this.score = 0;
    this.streak = load('streak', 0);
    this.achievements = load('badges', []);
    this.isBossLevel = false;
    this.bossLevelQuestionCount = 0;
    this.loadCards();
  }

  loadCards() {
    this.cards = cards.map(card => ({
      id: card.id,
      questionImage: `pictures/q${card.id}.png`,
      answerImage: `pictures/a${card.id}.png`,
      answer: card.description
    }));
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  getNextCard() {
    if (this.currentCardIndex >= this.cards.length) {
      this.currentCardIndex = 0;
      this.shuffle();
    }
    return this.cards[this.currentCardIndex++];
  }

  markAnswer(isCorrect) {
    if (isCorrect) {
      // Check for BOSS LEVEL trigger
      if (!this.isBossLevel && this.score >= 99) {
        this.isBossLevel = true;
        this.bossLevelQuestionCount = 0;
      }

      // BOSS LEVEL scoring
      if (this.isBossLevel) {
        this.score += 10; // Fixed 10 points in BOSS LEVEL
        this.streak++;
        this.bossLevelQuestionCount++;
        return {
          timeBonus: 0, // No time bonus in BOSS LEVEL
          pointsBonus: 10,
          achievements: this.checkAchievements(),
          bossLevel: true,
          bossLevelQuestion: this.bossLevelQuestionCount
        };
      }

      // Regular game scoring
      const pointsBonus = this.streak >= 20 ? 3 : 1;
      this.score += pointsBonus;
      this.streak++;
      
      let timeBonus = 1;
      if (this.streak >= 20) timeBonus = 4;
      else if (this.streak >= 10) timeBonus = 3;
      else if (this.streak >= 5) timeBonus = 2;

      const newAchievements = this.checkAchievements();
      save('streak', this.streak);

      return {
        timeBonus,
        pointsBonus,
        achievements: newAchievements,
        bossLevel: false
      };
    } else {
      this.streak = 0;
      this.isBossLevel = false;
      this.bossLevelQuestionCount = 0;
      save('streak', this.streak);
      return {
        timeBonus: 0,
        pointsBonus: 0,
        achievements: [],
        bossLevel: false,
        gameOver: this.isBossLevel // End game if wrong answer in BOSS LEVEL
      };
    }
  }

  checkAchievements() {
    const newAchievements = [];
    
    // First correct answer
    if (this.score === 3 && !this.hasAchievement('first_correct')) {
      newAchievements.push({
        id: 'first_correct',
        title: 'First Correct Answer!',
        description: 'You got your first answer right!'
      });
    }

    // Streak achievements
    if (this.streak === 3 && !this.hasAchievement('streak_3')) {
      newAchievements.push({
        id: 'streak_3',
        title: 'On Fire!',
        description: '3 correct answers in a row!'
      });
    }

    if (this.streak === 5 && !this.hasAchievement('streak_5')) {
      newAchievements.push({
        id: 'streak_5',
        title: 'Unstoppable!',
        description: '5 correct answers in a row! Time bonus increased!'
      });
    }

    if (this.streak === 10 && !this.hasAchievement('streak_10')) {
      newAchievements.push({
        id: 'streak_10',
        title: 'Perfect 10!',
        description: '10 correct answers in a row! Time bonus increased!'
      });
    }

    if (this.streak === 20 && !this.hasAchievement('streak_20')) {
      newAchievements.push({
        id: 'streak_20',
        title: 'Legendary!',
        description: '20 correct answers in a row! Maximum time bonus!'
      });
    }

    // Score achievements
    if (this.score >= 15 && !this.hasAchievement('score_15')) {
      newAchievements.push({
        id: 'score_15',
        title: 'Getting Started',
        description: 'Score 15 points!'
      });
    }

    if (this.score >= 30 && !this.hasAchievement('score_30')) {
      newAchievements.push({
        id: 'score_30',
        title: 'Map Master',
        description: 'Score 30 points!'
      });
    }

    if (newAchievements.length > 0) {
      this.achievements = [...this.achievements, ...newAchievements];
      save('badges', this.achievements);
    }

    return newAchievements;
  }

  hasAchievement(id) {
    return this.achievements.some(a => a.id === id);
  }

  reset() {
    this.score = 0;
    this.currentCardIndex = 0;
    this.streak = 0;
    this.isBossLevel = false;
    this.bossLevelQuestionCount = 0;
    save('streak', this.streak);
    this.shuffle();
  }
} 