# Orienteering Flash Cards

A web-based flash card application for learning orienteering map symbols. Built with vanilla JavaScript and ES modules.

## Features

- 66 orienteering map symbols with questions and answers
- Score tracking with streaks
- Achievement badges
- Keyboard navigation support
- Mobile-friendly design
- Persistent progress using localStorage

## Project Structure

```
/orienteering_flash_cards
│
├── index.html           # Main HTML file
├── pictures/           # Image assets (q1.png...a66.png)
│
└── js/
    ├── game.js        # Game logic (points, streaks, badges)
    ├── storage.js     # Simple persistence wrapper
    └── ui.js          # DOM updates and event handling
```

## Usage

1. Host the files on a web server (required for ES modules to work)
2. Open index.html in a modern browser
3. Use keyboard arrows or buttons to navigate
4. Press Enter or "Show Answer" to reveal answers
5. Mark your answers as correct/incorrect to track progress

## Keyboard Shortcuts

- `→` or "Next" button: Next card
- `←` or "Previous" button: Previous card
- `Enter` or "Show Answer" button: Reveal answer

## Scoring System

- Base points: 10 points per correct answer
- Streak multiplier: Points × current streak
- Achievements: Badge at 5-card streak

## Development

The code is organized into ES modules:

- `storage.js`: Handles localStorage persistence
- `game.js`: Core game logic and state management
- `ui.js`: DOM manipulation and event handling

## Future Enhancements

- Custom UI for correct/incorrect marking
- Timer-based bonus points
- Additional achievements and challenges
- Daily practice goals
- Statistics tracking 