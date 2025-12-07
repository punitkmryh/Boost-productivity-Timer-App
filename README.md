# Boost Productivity App

A comprehensive productivity tracking application built with React, TypeScript, and Tailwind CSS.

## Features
- **Focus Timer:** High-end animated timer with soundscapes and break modes.
- **Habit Tracker:** Weekly and Monthly tracking with streaks and levels.
- **To-Do List:** AI-powered task suggestions and priority management.
- **Analytics:** Visual charts and productivity insights.
- **Boost Center:** Gamification and breathing exercises.

## Setup & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Local Development
```bash
npm run dev
```

### 3. Deploy to GitHub Pages
1. Open `package.json` and ensure the `homepage` field is not set (Vite handles base path via config).
2. Run the deploy script:
```bash
npm run deploy
```
This command builds the project to the `dist` folder and pushes it to the `gh-pages` branch of your repository.

### API Key
To use the AI features (Gemini), create a `.env` file in the root directory:
```
VITE_API_KEY=your_gemini_api_key_here
```
