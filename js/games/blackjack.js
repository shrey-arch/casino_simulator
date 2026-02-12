/**
 * Blackjack Game Module - Premium Edition
 * Features: Realistic cards, Felt Table, "How to Play" Guide
 */
import RNG from '../core/rng.js';
import Animations from '../ui/animations.js';

export default class BlackjackGame {
    constructor(stateManager, currencyManager, soundManager, rng) {
        this.state = stateManager;
        this.currency = currencyManager;
        this.sound = soundManager;
        this.rng = rng;

        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.betAmount = 10;
        this.isPlaying = false;

        // Settings
        this.hasShownRules = false;
    }

    init(container) {
        this.container = container;
        this.render();
        // Show rules on first load
        if (!this.hasShownRules) {
            this.showRules();
            this.hasShownRules = true;
        }
    }

    render() {
        this.container.innerHTML = '';

        // 1. Rules Modal Container
        this.rulesOverlay = document.createElement('div');
        this.rulesOverlay.className = 'rules-overlay';
        this.rulesOverlay.innerHTML = `
            <div class="rules-modal">
                <h2>How to Play</h2>
                <ul>
                    <li><strong>Goal:</strong> Get closer to 21 than the Dealer without going over ("Bust").</li>
                    <li><strong>Card Values:</strong> Face cards (J,Q,K) are 10. Aces are 1 or 11. Others are face value.</li>
                    <li><strong>Hit:</strong> Take another card.</li>
                    <li><strong>Stand:</strong> Keep your current hand and end your turn.</li>
                    <li><strong>Dealer:</strong> Must hit until 17 or higher.</li>
                    <li><strong>Blackjack:</strong> Ace + 10/Face card pays 3:2!</li>
                </ul>
                <button class="rules-btn">I Understand</button>
            </div>
        `;
        this.rulesOverlay.querySelector('button').onclick = () => this.hideRules();
        this.container.appendChild(this.rulesOverlay);

        // 2. Game Container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'blackjack-game-container';

        // Table
        const table = document.createElement('div');
        table.className = 'blackjack-table';

        // Dealer Section
        const dealerSection = document.createElement('div');
        dealerSection.className = 'dealer-section';
        dealerSection.innerHTML = `<h3>DEALER</h3>`;
        this.dealerHandEl = document.createElement('div');
        this.dealerHandEl.className = 'hand-display';
        this.dealerScoreEl = document.createElement('div');
        this.dealerScoreEl.className = 'hand-score';
        this.dealerScoreEl.textContent = 'Score: 0';
        dealerSection.appendChild(this.dealerHandEl);
        dealerSection.appendChild(this.dealerScoreEl);
        table.appendChild(dealerSection);

        // Center Messages / Deck area
        this.messageArea = document.createElement('div');
        this.messageArea.style.textAlign = 'center';
        this.messageArea.style.height = '30px';
        this.messageArea.style.fontWeight = 'bold';
        this.messageArea.style.color = '#fff';
        this.messageArea.style.textShadow = '0 2px 4px #000';
        table.appendChild(this.messageArea);

        // Player Section
        const playerSection = document.createElement('div');
        playerSection.className = 'player-section';
        playerSection.innerHTML = `<h3>PLAYER</h3>`;
        this.playerHandEl = document.createElement('div');
        this.playerHandEl.className = 'hand-display';
        this.playerScoreEl = document.createElement('div');
        this.playerScoreEl.className = 'hand-score';
        this.playerScoreEl.textContent = 'Score: 0';
        playerSection.appendChild(this.playerHandEl);
        playerSection.appendChild(this.playerScoreEl);
        table.appendChild(playerSection);

        // Controls Area (Inside table at bottom, or below?)
        // Let's put it below the table for better mobile access, or float it. 
        // For this design, let's put it at the bottom OF the table div so it sits on the felt.
        this.controlsArea = document.createElement('div');
        this.controlsArea.className = 'bj-controls-area';
        table.appendChild(this.controlsArea);

        gameContainer.appendChild(table);
        this.container.appendChild(gameContainer);

        this.renderBettingControls();
    }

    showRules() {
        this.rulesOverlay.style.display = 'flex';
        Animations.fadeIn(this.rulesOverlay);
    }

    hideRules() {
        this.rulesOverlay.style.display = 'none';
        if (this.sound) this.sound.play('click');
    }

    renderBettingControls() {
        this.controlsArea.innerHTML = '';

        // Input
        const input = document.createElement('input');
        input.type = 'number';
        input.value = this.betAmount;
        input.className = 'dice-bet-input'; // Reuse styled input
        input.style.width = '80px';
        input.style.fontSize = '1.2rem';
        input.onchange = (e) => this.betAmount = parseInt(e.target.value);
        this.controlsArea.appendChild(input);

        // Deal Button
        const dealBtn = document.createElement('button');
        dealBtn.className = 'bj-btn deal';
        dealBtn.textContent = 'DEAL HAND';
        dealBtn.onclick = () => this.deal();
        this.controlsArea.appendChild(dealBtn);
    }

    renderActionControls() {
        this.controlsArea.innerHTML = '';

        const hitBtn = document.createElement('button');
        hitBtn.className = 'bj-btn hit';
        hitBtn.textContent = 'HIT';
        hitBtn.onclick = () => this.hit();

        const standBtn = document.createElement('button');
        standBtn.className = 'bj-btn stand';
        standBtn.textContent = 'STAND';
        standBtn.onclick = () => this.stand();

        this.controlsArea.appendChild(hitBtn);
        this.controlsArea.appendChild(standBtn);
    }

    createCardEl(card, hidden = false) {
        const el = document.createElement('div');
        el.className = `playing-card ${card.color} ${hidden ? 'hidden' : ''}`;

        if (!hidden) {
            el.innerHTML = `
                <div class="card-top-left"><span>${card.val}</span><span>${card.suit}</span></div>
                <div class="card-center-suit">${card.suit}</div>
                <div class="card-bottom-right"><span>${card.val}</span><span>${card.suit}</span></div>
            `;
        }
        return el;
    }

    // --- GAME LOGIC (Simplified from previous, adjusted for new UI) ---

    createDeck() {
        const suits = ['♠', '♥', '♣', '♦'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];
        suits.forEach(suit => {
            values.forEach(val => {
                let weight = parseInt(val);
                if (['J', 'Q', 'K'].includes(val)) weight = 10;
                if (val === 'A') weight = 11;
                this.deck.push({
                    suit, val, weight,
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

    getScore(hand) {
        let score = 0;
        let aces = 0;
        hand.forEach(c => {
            score += c.weight;
            if (c.val === 'A') aces++;
        });
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    }

    deal() {
        if (!this.currency.subtract(this.betAmount)) {
            // Modal handled by currency manager
            return;
        }
        this.createDeck();
        this.shuffle();
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.dealerHand = [this.deck.pop(), this.deck.pop()];

        this.isPlaying = true;
        this.renderActionControls();
        this.updateBoard();

        if (this.sound) this.sound.play('card');

        // Instant Blackjack
        if (this.getScore(this.playerHand) === 21) {
            this.stand();
        }
    }

    hit() {
        this.playerHand.push(this.deck.pop());
        if (this.sound) this.sound.play('card');
        this.updateBoard();

        if (this.getScore(this.playerHand) > 21) {
            this.endRound('bust');
        }
    }

    async stand() {
        this.isPlaying = false;
        this.controlsArea.innerHTML = ''; // removed controls

        // Reveal Dealer
        this.updateBoard(true);

        let dScore = this.getScore(this.dealerHand);
        while (dScore < 17) {
            await new Promise(r => setTimeout(r, 800));
            this.dealerHand.push(this.deck.pop());
            if (this.sound) this.sound.play('card');
            this.updateBoard(true);
            dScore = this.getScore(this.dealerHand);
        }

        const pScore = this.getScore(this.playerHand);
        if (dScore > 21) this.endRound('dealer_bust');
        else if (pScore > dScore) this.endRound('win');
        else if (pScore < dScore) this.endRound('lose');
        else this.endRound('push');
    }

    updateBoard(revealDealer = false) {
        // Player
        this.playerHandEl.innerHTML = '';
        this.playerHand.forEach(c => this.playerHandEl.appendChild(this.createCardEl(c)));
        this.playerScoreEl.textContent = `Score: ${this.getScore(this.playerHand)}`;

        // Dealer
        this.dealerHandEl.innerHTML = '';
        this.dealerHand.forEach((c, i) => {
            if (i === 1 && !revealDealer) {
                this.dealerHandEl.appendChild(this.createCardEl(c, true));
            } else {
                this.dealerHandEl.appendChild(this.createCardEl(c));
            }
        });

        if (revealDealer) {
            this.dealerScoreEl.textContent = `Score: ${this.getScore(this.dealerHand)}`;
        } else {
            // Only show partial score? Or just hide it to avoid confusion
            // showing first card value is standard
            this.dealerScoreEl.textContent = `Score: ?`;
        }
    }

    endRound(result) {
        let msg = '';
        let color = '#fff';
        let payout = 0;

        if (result === 'bust') { msg = "BUST! You Lose"; color = 'red'; }
        else if (result === 'dealer_bust') { msg = "Dealer Bust! You Win!"; color = '#4caf50'; payout = this.betAmount * 2; }
        else if (result === 'win') {
            // Check Blackjack
            if (this.getScore(this.playerHand) === 21 && this.playerHand.length === 2) {
                msg = "BLACKJACK! (3:2)"; payout = this.betAmount * 2.5;
            } else {
                msg = "YOU WIN!"; payout = this.betAmount * 2;
            }
            color = 'gold';
        }
        else if (result === 'lose') { msg = "Dealer Wins"; color = 'red'; }
        else if (result === 'push') { msg = "Push / Tie"; color = '#aaa'; payout = this.betAmount; }

        this.messageArea.textContent = msg;
        this.messageArea.style.color = color;

        if (payout > 0) {
            this.currency.add(payout);
            if (this.sound) this.sound.play('win');
        }

        setTimeout(() => this.renderBettingControls(), 2000);
    }

    destroy() {
        this.container.innerHTML = '';
    }
}
