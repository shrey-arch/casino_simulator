/**
 * Main Entry Point
 * Initializes the core systems and UI.
 */

import StateManager from './core/stateManager.js';
import CurrencyManager from './core/currency.js';
import SoundManager from './core/sound.js';
import LobbyUI from './ui/lobbyUI.js';
import LoanUI from './ui/loanUI.js';

class CasinoApp {
    constructor() {
        this.state = new StateManager();
        this.currency = new CurrencyManager(this.state);
        this.sound = new SoundManager(this.state);
        this.ui = new LobbyUI(this.state, this.currency, this.sound);
        this.loanUI = new LoanUI(this.state, this.currency, this.sound);

        this.init();
    }

    init() {
        console.log('Casino App Initializing...');

        // Initialize Core Systems
        this.currency.init();
        this.sound.init();

        // Initialize UI
        this.ui.init();
        this.loanUI.init();

        // Expose app for debugging
        window.casinoApp = this;

        console.log('Casino App Initialized.');
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CasinoApp();
});
