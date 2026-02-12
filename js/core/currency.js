/**
 * CurrencyManager
 * Manages player balance.
 */
import StorageManager from './storage.js';

export default class CurrencyManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.storage = new StorageManager();
        this.balance = 0;
        this.HISTORY_LIMIT = 50;
    }

    init() {
        this.balance = this.storage.load('balance', 1000); // Default 1000 starting cash
        this.updateDisplay();

        this.state.subscribe('game_win', (amount) => this.add(amount));
        this.state.subscribe('game_bet', (amount) => this.subtract(amount));
    }

    get() {
        return this.balance;
    }

    add(amount) {
        this.balance += amount;
        this.save();
        this.updateDisplay();
        this.state.publish('balance_updated', this.balance);
    }

    subtract(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.save();
            this.updateDisplay();
            this.state.publish('balance_updated', this.balance);

            // Check for bankruptcy (Low balance warning) AFTER bet
            if (this.balance < 10) {
                this.state.publish('bankruptcy_warning', this.balance);
            }
            return true;
        }

        // Failed to bet (Insufficient funds)
        if (this.balance < 10) {
            this.state.publish('bankruptcy_warning', this.balance);
        }
        return false;
    }

    resetBalance(amount = 1000) {
        this.balance = amount;
        this.save();
        this.updateDisplay();
        this.state.publish('balance_updated', this.balance);
        this.state.publish('balance_reset', amount);
    }

    hasEnough(amount) {
        return this.balance >= amount;
    }

    save() {
        this.storage.save('balance', this.balance);
    }

    updateDisplay() {
        const display = document.getElementById('currency-display');
        if (display) {
            display.textContent = `Balance: $${this.balance.toLocaleString()}`;
        }
    }
}
