/**
 * Lobby UI - Apple Design Language
 * Refined, minimal, and elegant game selection experience.
 */
import { createCard, createButton } from './components.js';
import RNG from '../core/rng.js';

export default class LobbyUI {
    constructor(stateManager, currencyManager, soundManager) {
        this.state = stateManager;
        this.currency = currencyManager;
        this.sound = soundManager;
        this.container = document.getElementById('game-list');
        this.gameContainer = document.getElementById('game-container');
        this.currentGame = null;
    }

    init() {
        if (!this.container) return;
        this.render();
    }

    render() {
        // Reset view to lobby with Apple-inspired design
        this.gameContainer.innerHTML = `
            <div id="lobby-view" class="apple-lobby">
                <div class="hero-section">
                    <h1 class="hero-title">
                        <span class="hero-greeting">ENTER</span>
                        <span class="hero-main">THE CASINO</span>
                    </h1>
                    <p class="hero-subtitle">High stakes. Higher rewards.<br>Welcome to the floor.</p>
                </div>
                <div id="game-list" class="game-list-container"></div>
                <div class="footer-spacer"></div>
            </div>
        `;
        this.container = document.getElementById('game-list');

        const categories = [
            {
                title: 'Featured',
                games: [
                    { id: 'slots', name: 'Slots', desc: 'Spin to win big', icon: '🎰', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accentColor: '#667eea' },
                    { id: 'roulette', name: 'Roulette', desc: 'Bet on your lucky number', icon: '🎡', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', accentColor: '#f5576c' }
                ]
            },
            {
                title: 'Table Games',
                games: [
                    { id: 'blackjack', name: 'Blackjack', desc: 'Beat the dealer to 21', icon: '🃏', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', accentColor: '#4facfe' },
                    { id: 'poker', name: 'Poker', desc: 'Texas Hold\'em action', icon: '♣️', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', accentColor: '#43e97b' }
                ]
            },
            {
                title: 'Arcade',
                games: [
                    { id: 'dice', name: 'Hi-Lo Dice', desc: 'Simple and fast betting', icon: '🎲', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', accentColor: '#fa709a' }
                ]
            }
        ];

        categories.forEach(cat => {
            const section = document.createElement('div');
            section.className = 'category-section';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = cat.title;
            section.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'games-grid';

            cat.games.forEach((game, index) => {
                const card = this.createAppleCard(game, index);
                grid.appendChild(card);
            });

            section.appendChild(grid);
            this.container.appendChild(section);
        });
    }

    createAppleCard(game, index) {
        const card = document.createElement('div');
        card.className = 'game-card apple-card';
        card.style.setProperty('--animation-order', index);
        card.style.setProperty('--card-gradient', game.color);
        card.style.setProperty('--accent-color', game.accentColor);

        card.innerHTML = `
            <div class="card-background"></div>
            <div class="card-content">
                <div class="game-icon-container">
                    <div class="game-icon">${game.icon}</div>
                </div>
                <div class="game-info">
                    <h3 class="game-title">${game.name}</h3>
                    <p class="game-desc">${game.desc}</p>
                </div>
                <div class="card-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.handleGameSelect(game.id);
        });

        return card;
    }

    async handleGameSelect(gameId) {
        console.log(`Loading ${gameId}...`);

        // Cleanup current game if any
        if (this.currentGame && this.currentGame.destroy) {
            this.currentGame.destroy();
        }

        try {
            // Dynamic import
            const module = await import(`../games/${gameId}.js`);
            const GameClass = module.default;

            // Clear container
            this.gameContainer.innerHTML = '';

            // Add Apple-style Navigation with Back Button
            const nav = document.createElement('nav');
            nav.className = 'apple-nav';

            const backBtn = document.createElement('button');
            backBtn.className = 'back-btn apple-back-btn';
            backBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Lobby</span>
            `;
            backBtn.addEventListener('click', () => {
                if (this.currentGame && this.currentGame.destroy) {
                    this.currentGame.destroy();
                }
                this.currentGame = null;
                this.render();
            });

            nav.appendChild(backBtn);
            this.gameContainer.appendChild(nav);

            // Create a specific container for the game to render into
            const gameInstanceContainer = document.createElement('div');
            gameInstanceContainer.id = 'active-game-instance';
            this.gameContainer.appendChild(gameInstanceContainer);

            // Initialize Game into the sub-container
            const rng = new RNG();
            this.currentGame = new GameClass(this.state, this.currency, this.sound, rng);
            this.currentGame.init(gameInstanceContainer);

        } catch (error) {
            console.error(`Failed to load game ${gameId}:`, error);
            alert('Could not load game module. Check console.');
        }
    }
}