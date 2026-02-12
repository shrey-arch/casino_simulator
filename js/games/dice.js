/**
 * Dice Game Module - Premium 3D Edition
 * Features: Realistic 3D Cube animations, Felt Table, Gold Controls
 */
import RNG from '../core/rng.js';
import Animations from '../ui/animations.js';

export default class DiceGame {
    constructor(stateManager, currencyManager, soundManager, rng) {
        this.state = stateManager;
        this.currency = currencyManager;
        this.sound = soundManager;
        this.rng = rng; // Injected from Lobby

        this.currentBet = 0;
        this.isRolling = false;
        this.history = [];

        // Map roll result (1-6) to [rotateX, rotateY] degrees
        // Standard Dice Orientation:
        // 1: Front (0,0)
        // 6: Back (0, 180)
        // 2: Right (0, -90)
        // 5: Left (0, 90)
        // 3: Top (-90, 0)
        // 4: Bottom (90, 0)
        this.rotationMap = {
            1: [0, 0],
            2: [0, -90],
            3: [-90, 0],
            4: [90, 0],
            5: [0, 90],
            6: [0, 180]
        };
    }

    init(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        const gameContainer = document.createElement('div');
        gameContainer.className = 'dice-game-container';

        // 1. Table Area (Felt)
        const table = document.createElement('div');
        table.className = 'dice-table';

        const perspective = document.createElement('div');
        perspective.className = 'perspective-container';

        this.die1 = this.create3DDie();
        this.die2 = this.create3DDie();

        perspective.appendChild(this.die1);
        perspective.appendChild(this.die2);
        table.appendChild(perspective);
        gameContainer.appendChild(table);

        // 2. Controls Area
        const controls = document.createElement('div');
        controls.className = 'dice-controls-panel';

        // Bet Input
        const betContainer = document.createElement('div');
        betContainer.className = 'bet-input-container';
        betContainer.innerHTML = `
            <label>WAGER</label>
            <span style="color:var(--gold-primary)">$</span>
        `;
        this.betInput = document.createElement('input');
        this.betInput.className = 'dice-bet-input';
        this.betInput.type = 'number';
        this.betInput.value = '10';
        this.betInput.min = '1';
        betContainer.appendChild(this.betInput);
        controls.appendChild(betContainer);

        // Buttons
        const btnGroup = document.createElement('div');
        btnGroup.className = 'dice-btn-group';

        this.btnUnder = this.createBetButton('Under 7', 'x2', () => this.roll('under'));
        this.btnExact = this.createBetButton('Exact 7', 'x5', () => this.roll('exact'));
        this.btnOver = this.createBetButton('Over 7', 'x2', () => this.roll('over'));

        btnGroup.appendChild(this.btnUnder);
        btnGroup.appendChild(this.btnExact);
        btnGroup.appendChild(this.btnOver);
        controls.appendChild(btnGroup);

        // History
        this.historyLog = document.createElement('div');
        this.historyLog.className = 'dice-result-log';
        this.historyLog.textContent = 'Ready to roll...';
        controls.appendChild(this.historyLog);

        gameContainer.appendChild(controls);
        this.container.appendChild(gameContainer);
    }

    create3DDie() {
        const wrapper = document.createElement('div');
        wrapper.className = 'die-wrapper';

        ['one', 'two', 'three', 'four', 'five', 'six'].forEach((face, i) => {
            const el = document.createElement('div');
            el.className = `die-face ${face}`;
            // Add dots
            const dotCount = i + 1;
            for (let d = 0; d < dotCount; d++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                el.appendChild(dot);
            }
            wrapper.appendChild(el);
        });

        return wrapper;
    }

    createBetButton(title, odds, handler) {
        const btn = document.createElement('button');
        btn.className = 'dice-bet-btn';
        btn.innerHTML = `
            <span class="dice-btn-title">${title}</span>
            <span class="dice-btn-odds">PAYOUT ${odds}</span>
        `;
        btn.onclick = handler;
        return btn;
    }

    async roll(type) {
        if (this.isRolling) return;

        const amount = parseInt(this.betInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert("Invalid bet!");
            return;
        }
        if (this.currency.balance < amount) {
            alert("Insufficient funds!");
            return;
        }

        this.isRolling = true;
        this.currency.subtract(amount);
        this.setButtonsState(false);
        if (this.sound) this.sound.play('click'); // Chip sound

        // 1. Determine Result
        const res1 = this.rng.range(1, 6);
        const res2 = this.rng.range(1, 6);
        const sum = res1 + res2;

        // 2. Animate
        // Random Spins (at least 2 full rotations + target)
        const xRot1 = 720 + this.rotationMap[res1][0];
        const yRot1 = 720 + this.rotationMap[res1][1];

        // Add some noise to spins so they don't move identically
        const xRot2 = 720 + 360 + this.rotationMap[res2][0];
        const yRot2 = 720 - 360 + this.rotationMap[res2][1];

        this.die1.style.transform = `rotateX(${xRot1}deg) rotateY(${yRot1}deg)`;
        this.die2.style.transform = `rotateX(${xRot2}deg) rotateY(${yRot2}deg)`;

        if (this.sound) this.sound.play('spin'); // Rolling sound

        await new Promise(r => setTimeout(r, 1200)); // Wait for transition

        // 3. Resolve
        let won = false;
        let payout = 0;

        if (type === 'under' && sum < 7) { won = true; payout = amount * 2; }
        else if (type === 'over' && sum > 7) { won = true; payout = amount * 2; }
        else if (type === 'exact' && sum === 7) { won = true; payout = amount * 5; }

        if (won) {
            this.currency.add(payout);
            if (this.sound) this.sound.play('win');
            this.historyLog.textContent = `WIN! Rolled ${sum}. Won $${payout}`;
            this.historyLog.style.color = 'var(--gold-primary)';
        } else {
            this.historyLog.textContent = `LOSS. Rolled ${sum}. Lost $${amount}`;
            this.historyLog.style.color = 'var(--text-secondary)';
        }

        // Reset rotations (remove 720 offset silently?? No, keep increasing to avoid rewinding)
        // Actually, CSS transform accumulation is tricky without resetting class. 
        // For simple logic, we just keep adding degrees or let it spin back. 
        // "Rewind" visual can be annoying. 
        // Better: Reset transition to none, snap to mod 360, then spin again.
        // For this demo: straightforward transition is fine.

        this.isRolling = false;
        this.setButtonsState(true);
    }

    setButtonsState(enabled) {
        [this.btnUnder, this.btnExact, this.btnOver].forEach(b => b.disabled = !enabled);
    }

    destroy() {
        this.container.innerHTML = '';
    }
}
