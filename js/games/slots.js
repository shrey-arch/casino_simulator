/**
 * Slots Game Module - "The Golden Reel"
 * Features: Realistic cabinet, motion blur spins, manual stop option (maybe later), luxury paytable
 */
import RNG from '../core/rng.js';
import Animations from '../ui/animations.js';

export default class SlotsGame {
    constructor(stateManager, currencyManager, soundManager, rng) {
        this.state = stateManager;
        this.currency = currencyManager;
        this.sound = soundManager;
        this.rng = rng;

        this.symbols = [
            { icon: '🍒', value: 3, weight: 0.40 },
            { icon: '🍋', value: 5, weight: 0.30 },
            { icon: '🍇', value: 10, weight: 0.15 },
            { icon: '💎', value: 20, weight: 0.10 },
            { icon: '7️⃣', value: 50, weight: 0.05 }
        ];

        this.reelElements = [];
        this.isSpinning = false;
    }

    init(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        const gameContainer = document.createElement('div');
        gameContainer.className = 'slots-container';

        // 1. The Machine Cabinet
        const machine = document.createElement('div');
        machine.className = 'slot-machine';

        // Result Display (Top of machine)
        this.resultDisplay = document.createElement('div');
        this.resultDisplay.style.height = '30px';
        this.resultDisplay.style.marginBottom = '20px';
        this.resultDisplay.style.color = 'var(--gold-primary)';
        this.resultDisplay.style.fontFamily = 'var(--font-heading)';
        this.resultDisplay.textContent = 'PLACE YOUR BET';
        machine.appendChild(this.resultDisplay);

        // Reels Window
        const windowDiv = document.createElement('div');
        windowDiv.className = 'reels-window';

        // Payline
        const payline = document.createElement('div');
        payline.className = 'payline-guide';
        windowDiv.appendChild(payline);

        // Create Reels
        this.reelElements = [];
        for (let i = 0; i < 3; i++) {
            const reel = document.createElement('div');
            reel.className = 'slot-reel';
            reel.textContent = '7️⃣';
            this.reelElements.push(reel);
            windowDiv.appendChild(reel);
        }
        machine.appendChild(windowDiv);

        // Controls Panel (Attached to machine)
        const controls = document.createElement('div');
        controls.className = 'slot-controls-panel';

        // Bet Input
        const betControl = document.createElement('div');
        betControl.className = 'slot-bet-control';
        betControl.innerHTML = '<span class="slot-bet-label">Wager</span>';

        this.betInput = document.createElement('input');
        this.betInput.className = 'slot-bet-input';
        this.betInput.type = 'number';
        this.betInput.value = '10';
        this.betInput.min = '1';
        betControl.appendChild(this.betInput);
        controls.appendChild(betControl);

        // SPIN BUTTON
        this.spinBtn = document.createElement('button');
        this.spinBtn.className = 'big-spin-btn';
        this.spinBtn.textContent = 'SPIN';
        this.spinBtn.onclick = () => this.spin();
        controls.appendChild(this.spinBtn);

        machine.appendChild(controls);
        gameContainer.appendChild(machine);

        // 2. Paytable (Below Machine)
        const paytable = document.createElement('div');
        paytable.className = 'slot-paytable';
        paytable.innerHTML = `
            <div class="paytable-item">3x 7️⃣ <br><span>50x</span></div>
            <div class="paytable-item">3x 💎 <br><span>20x</span></div>
            <div class="paytable-item">3x 🍇 <br><span>10x</span></div>
            <div class="paytable-item">3x 🍋 <br><span>5x</span></div>
            <div class="paytable-item">3x 🍒 <br><span>3x</span></div>
            <div class="paytable-item">2x 🍒 <br><span>1x</span></div>
        `;
        gameContainer.appendChild(paytable);

        this.container.appendChild(gameContainer);
    }

    getRandomSymbol() {
        const rand = this.rng.random();
        let cumulative = 0;
        for (const sym of this.symbols) {
            cumulative += sym.weight;
            if (rand < cumulative) return sym;
        }
        return this.symbols[0];
    }

    async spin() {
        if (this.isSpinning) return;

        const bet = parseInt(this.betInput.value);
        if (isNaN(bet) || bet <= 0) return;

        // Attempt to bet
        if (!this.currency.subtract(bet)) {
            // Insufficient funds - Modal will trigger via currency event
            return;
        }

        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.resultDisplay.textContent = 'GOOD LUCK!';
        this.resultDisplay.style.color = '#fff';

        // Clear previous winner styles
        this.reelElements.forEach(el => el.classList.remove('winner'));

        if (this.sound) this.sound.play('spin'); // Start mechanical sound

        // Decide Result
        const res1 = this.getRandomSymbol();
        const res2 = this.getRandomSymbol();
        const res3 = this.getRandomSymbol();
        const results = [res1, res2, res3];

        // Animate Reels
        const spinReel = (index, target) => {
            return new Promise(resolve => {
                const el = this.reelElements[index];
                el.classList.add('spinning');
                el.textContent = ''; // Clear text to show blur only? Or keep text blurred.
                // CSS blur animation handles the visual. 
                // We can cycle textContent randomly for extra realism if we want, 
                // but strictly CSS blur on the container often looks smoother than JS text swapping which flickers.
                // Let's try JS text swapping + CSS blur for maximum chaos.

                const duration = 1500 + (index * 500);
                const interval = setInterval(() => {
                    el.textContent = this.getRandomSymbol().icon; // Flicker symbols
                }, 100);

                setTimeout(() => {
                    clearInterval(interval);
                    el.classList.remove('spinning');
                    el.textContent = target.icon;
                    if (this.sound) this.sound.play('click'); // Reel stop clack
                    resolve();
                }, duration);
            });
        };

        await Promise.all([
            spinReel(0, res1),
            spinReel(1, res2),
            spinReel(2, res3)
        ]);

        this.resolveWin(results, bet);
    }

    resolveWin(symbols, bet) {
        const icons = symbols.map(s => s.icon);
        const unique = [...new Set(icons)];
        let payout = 0;
        let winName = '';

        if (unique.length === 1) {
            payout = bet * symbols[0].value;
            winName = `TRIPLE ${symbols[0].icon}`;
        } else {
            const cherries = icons.filter(i => i === '🍒').length;
            if (cherries >= 2) {
                payout = bet * 1;
                winName = "Double Cherry";
            }
        }

        if (payout > 0) {
            this.currency.add(payout);
            this.resultDisplay.textContent = `${winName}! WON $${payout}`;
            this.resultDisplay.style.color = 'var(--gold-primary)';
            if (this.sound) this.sound.play('win');

            // Highlight Reels
            this.reelElements.forEach(el => el.classList.add('winner'));
            Animations.shake(this.container);
        } else {
            this.resultDisplay.textContent = 'TRY AGAIN';
            this.resultDisplay.style.color = '#ccc';
        }

        this.isSpinning = false;
        this.spinBtn.disabled = false;
    }

    destroy() {
        this.container.innerHTML = '';
    }
}
