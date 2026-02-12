/**
 * Video Poker Module - Jacks or Better
 * Features: 5-card draw, Hold mechanic, Hand Evaluation, Paytable
 */
import RNG from '../core/rng.js';
import Animations from '../ui/animations.js';

export default class PokerGame {
    constructor(stateManager, currencyManager, soundManager, rng) {
        this.state = stateManager;
        this.currency = currencyManager;
        this.sound = soundManager;
        this.rng = rng;

        this.deck = [];
        this.hand = [];
        this.betAmount = 5;
        this.gameState = 'BETTING'; // BETTING, HOLDING, RESULT
        this.heldIndices = new Set();
        this.hasShownRules = false;

        this.payouts = [
            { name: 'Royal Flush', mult: 800 },
            { name: 'Straight Flush', mult: 50 },
            { name: 'Four of a Kind', mult: 25 },
            { name: 'Full House', mult: 9 },
            { name: 'Flush', mult: 6 },
            { name: 'Straight', mult: 4 },
            { name: 'Three of a Kind', mult: 3 },
            { name: 'Two Pair', mult: 2 },
            { name: 'Jacks or Better', mult: 1 }
        ];
    }

    init(container) {
        this.container = container;
        this.render();
        if (!this.hasShownRules) {
            this.showRules();
            this.hasShownRules = true;
        }
    }

    render() {
        this.container.innerHTML = '';

        // 1. Rules Modal
        this.rulesOverlay = document.createElement('div');
        this.rulesOverlay.className = 'rules-overlay';
        this.rulesOverlay.innerHTML = `
            <div class="rules-modal">
                <h2>Video Poker Rules</h2>
                <ul>
                    <li><strong>Goal:</strong> Make the best 5-card poker hand.</li>
                    <li><strong>Play:</strong> Deal 5 cards -> Choose which to HOLD -> DRAW to replace others.</li>
                    <li><strong>Winning:</strong> You need at least a pair of Jacks ("Jacks or Better") to win.</li>
                    <li><strong>Royal Flush:</strong> Pays 800x your bet!</li>
                </ul>
                <button class="rules-btn">Play Poker</button>
            </div>
        `;
        this.rulesOverlay.querySelector('button').onclick = () => this.hideRules();
        this.container.appendChild(this.rulesOverlay);

        // 2. Game Area
        const gameContainer = document.createElement('div');
        gameContainer.className = 'poker-game-container';

        const table = document.createElement('div');
        table.className = 'poker-table';

        // Paytable
        this.paytableEl = document.createElement('div');
        this.paytableEl.className = 'poker-paytable';
        this.payouts.forEach(p => {
            const row = document.createElement('div');
            row.className = 'poker-pay-row';
            row.dataset.hand = p.name;
            row.innerHTML = `<span>${p.name}</span><span>${p.mult}x</span>`;
            this.paytableEl.appendChild(row);
        });
        table.appendChild(this.paytableEl);

        // Cards Area
        this.cardsArea = document.createElement('div');
        this.cardsArea.className = 'poker-hand-display';
        table.appendChild(this.cardsArea);

        // Message
        this.messageEl = document.createElement('div');
        this.messageEl.className = 'poker-message';
        this.messageEl.textContent = 'Place your bet to start';
        table.appendChild(this.messageEl);

        // Controls
        this.controlsArea = document.createElement('div');
        this.controlsArea.className = 'poker-controls-area';
        table.appendChild(this.controlsArea);

        gameContainer.appendChild(table);
        this.container.appendChild(gameContainer);

        this.renderBettingControls();
    }

    showRules() { this.rulesOverlay.style.display = 'flex'; Animations.fadeIn(this.rulesOverlay); }
    hideRules() { this.rulesOverlay.style.display = 'none'; if (this.sound) this.sound.play('click'); }

    // --- RENDER HELPERS ---

    renderBettingControls() {
        this.controlsArea.innerHTML = '';

        // Input
        const input = document.createElement('input');
        input.type = 'number';
        input.value = this.betAmount;
        input.className = 'dice-bet-input';
        input.style.width = '80px';
        input.onchange = (e) => this.betAmount = parseInt(e.target.value);
        this.controlsArea.appendChild(input);

        // Deal Button
        const dealBtn = document.createElement('button');
        dealBtn.className = 'poker-btn deal';
        dealBtn.textContent = 'DEAL';
        dealBtn.onclick = () => this.deal();
        this.controlsArea.appendChild(dealBtn);
    }

    renderDrawControls() {
        this.controlsArea.innerHTML = '';
        const drawBtn = document.createElement('button');
        drawBtn.className = 'poker-btn draw';
        drawBtn.textContent = 'DRAW CARDS';
        drawBtn.onclick = () => this.draw();
        this.controlsArea.appendChild(drawBtn);
    }

    renderHand() {
        this.cardsArea.innerHTML = '';
        this.hand.forEach((card, i) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'poker-card-wrapper';
            if (this.heldIndices.has(i)) wrapper.classList.add('held');

            // Interaction: Toggle Hold
            wrapper.onclick = () => {
                if (this.gameState !== 'HOLDING') return;

                if (this.heldIndices.has(i)) {
                    this.heldIndices.delete(i);
                    wrapper.classList.remove('held');
                    if (this.sound) this.sound.play('click');
                } else {
                    this.heldIndices.add(i);
                    wrapper.classList.add('held');
                    if (this.sound) this.sound.play('chip'); // Clack sound
                }
            };

            const stamp = document.createElement('div');
            stamp.className = 'hold-stamp';
            stamp.textContent = 'HELD';
            wrapper.appendChild(stamp);

            wrapper.appendChild(this.createCardEl(card));
            this.cardsArea.appendChild(wrapper);
        });
    }

    createCardEl(card) {
        const el = document.createElement('div');
        el.className = `playing-card ${card.color}`;
        el.innerHTML = `
            <div class="card-top-left"><span>${card.val}</span><span>${card.suit}</span></div>
            <div class="card-center-suit">${card.suit}</div>
            <div class="card-bottom-right"><span>${card.val}</span><span>${card.suit}</span></div>
        `;
        return el;
    }

    // --- GAME LOGIC ---

    createDeck() {
        // Same logic as Blackjack for now
        const suits = ['♠', '♥', '♣', '♦'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];
        suits.forEach(suit => {
            values.forEach(val => {
                let rank = parseInt(val);
                if (val === 'J') rank = 11;
                if (val === 'Q') rank = 12;
                if (val === 'K') rank = 13;
                if (val === 'A') rank = 14;

                this.deck.push({
                    suit, val, rank,
                    color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
                });
            });
        });
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = this.rng.range(0, i);
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    deal() {
        if (this.currency.balance < this.betAmount) {
            alert('Insufficient Funds');
            return;
        }
        this.currency.subtract(this.betAmount);
        this.createDeck();
        this.shuffle();

        this.hand = [];
        for (let i = 0; i < 5; i++) this.hand.push(this.deck.pop());

        this.heldIndices.clear();
        this.gameState = 'HOLDING';
        this.messageEl.textContent = 'Select cards to HOLD, then click DRAW';

        // Remove Paytable highlights
        Array.from(this.paytableEl.children).forEach(el => el.classList.remove('highlight'));

        this.renderHand();
        this.renderDrawControls();
        if (this.sound) this.sound.play('card');
    }

    draw() {
        this.gameState = 'RESULT';
        // Replace unheld cards
        for (let i = 0; i < 5; i++) {
            if (!this.heldIndices.has(i)) {
                this.hand[i] = this.deck.pop();
            }
        }

        this.renderHand(); // Show new cards
        if (this.sound) this.sound.play('card');

        this.evaluateHand();
    }

    evaluateHand() {
        // Sort for easy eval
        const sorted = [...this.hand].sort((a, b) => a.rank - b.rank);
        const ranks = sorted.map(c => c.rank);
        const suits = sorted.map(c => c.suit);

        const isFlush = suits.every(s => s === suits[0]);
        let isStraight = true;
        for (let i = 0; i < 4; i++) {
            if (ranks[i + 1] !== ranks[i] + 1) {
                // Check Ace-low straight (A, 2, 3, 4, 5) -> 2,3,4,5,14
                if (i === 3 && ranks[4] === 14 && ranks[0] === 2 && ranks[1] === 3 && ranks[2] === 4 && ranks[3] === 5) {
                    isStraight = true; // Wheel straight
                } else {
                    isStraight = false;
                }
                break;
            }
        }

        // Count ranks for pairs/trips
        const counts = {};
        ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
        const freq = Object.values(counts).sort((a, b) => b - a); // [4,1] or [3,2] etc

        // Determine Hand
        let handName = null;

        if (isFlush && isStraight && ranks[0] === 10) handName = 'Royal Flush';
        else if (isFlush && isStraight) handName = 'Straight Flush';
        else if (freq[0] === 4) handName = 'Four of a Kind';
        else if (freq[0] === 3 && freq[1] === 2) handName = 'Full House';
        else if (isFlush) handName = 'Flush';
        else if (isStraight) handName = 'Straight';
        else if (freq[0] === 3) handName = 'Three of a Kind';
        else if (freq[0] === 2 && freq[1] === 2) handName = 'Two Pair';
        else if (freq[0] === 2) {
            // Check Jacks or Better
            const pairRank = parseInt(Object.keys(counts).find(key => counts[key] === 2));
            if (pairRank >= 11) handName = 'Jacks or Better';
        }

        if (handName) {
            const win = this.payouts.find(p => p.name === handName);
            const payout = this.betAmount * win.mult;
            this.currency.add(payout);
            this.messageEl.textContent = `${handName}! WON $${payout}`;
            this.messageEl.style.color = 'var(--gold-primary)';
            if (this.sound) this.sound.play('win');

            // Highlight paytable
            const row = this.paytableEl.querySelector(`[data-hand="${handName}"]`);
            if (row) row.classList.add('highlight');
        } else {
            this.messageEl.textContent = 'Game Over';
            this.messageEl.style.color = '#ccc';
        }

        setTimeout(() => {
            this.gameState = 'BETTING';
            this.renderBettingControls();
        }, 2000);
    }

    destroy() {
        this.container.innerHTML = '';
    }
}
