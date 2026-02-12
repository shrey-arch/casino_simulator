/**
 * Advanced European Roulette Game Module - Refactored for Visual Fidelity
 */
import { createButton } from '../ui/components.js';

export default class RouletteGame {
    // ... existing constructor ...
    constructor(stateManager, currencyManager, soundManager, rng) {
        this.state = stateManager;
        this.currency = currencyManager;
        this.sound = soundManager;
        this.rng = rng;
        this.numbers = [
            0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
            11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
            31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
        ];
        this.redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        this.bets = [];
        this.currentChipValue = 10;
        this.isSpinning = false;
    }

    init(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        this.container.classList.add('premium-roulette-view');

        const wrapper = document.createElement('div');
        wrapper.className = 'roulette-wrapper';

        // --- 1. WHEEL SECTION ---
        const wheelOuter = document.createElement('div');
        wheelOuter.className = 'roulette-wheel-outer';

        this.wheel = document.createElement('div');
        this.wheel.className = 'roulette-wheel';

        // Layer 1: Colored Wedges (Background)
        const wedgesLayer = document.createElement('div');
        wedgesLayer.className = 'wheel-layer-wedges';

        // Layer 2: Numbers (Foreground)
        const numbersLayer = document.createElement('div');
        numbersLayer.className = 'wheel-layer-numbers';

        const segmentAngle = 360 / this.numbers.length;

        this.numbers.forEach((num, i) => {
            const rotation = i * segmentAngle;

            // Wedge
            const wedge = document.createElement('div');
            wedge.className = 'wheel-wedge';
            wedge.style.transform = `rotate(${rotation}deg)`;

            if (num === 0) wedge.classList.add('green');
            else if (this.redNumbers.includes(num)) wedge.classList.add('red');
            else wedge.classList.add('black');

            wedgesLayer.appendChild(wedge);

            // Number
            const numEl = document.createElement('div');
            numEl.className = 'wheel-number';
            numEl.style.transform = `rotate(${rotation}deg)`;

            const textSpan = document.createElement('span');
            textSpan.textContent = num;
            textSpan.style.transform = `rotate(180deg) translateY(2px)`;

            numEl.appendChild(textSpan);
            numbersLayer.appendChild(numEl);
        });

        this.wheel.appendChild(wedgesLayer);
        this.wheel.appendChild(numbersLayer);
        wheelOuter.appendChild(this.wheel);

        // Center Decoration
        const center = document.createElement('div');
        center.className = 'wheel-center-decoration';
        wheelOuter.appendChild(center);

        // Ball Track & Ball
        const track = document.createElement('div');
        track.className = 'ball-track';
        this.ball = document.createElement('div');
        this.ball.className = 'roulette-ball';
        track.appendChild(this.ball);
        wheelOuter.appendChild(track);

        // Result Overlay
        this.resultOverlay = document.createElement('div');
        this.resultOverlay.className = 'result-overlay';
        this.resultOverlay.textContent = '?';
        wheelOuter.appendChild(this.resultOverlay);

        wrapper.appendChild(wheelOuter);

        // --- 2. TABLE SECTION ---
        this.renderTable(wrapper);

        this.container.appendChild(wrapper);
    }

    renderTable(wrapper) {
        const table = document.createElement('div');
        table.className = 'betting-table-container';

        // Info Bar
        const infoBar = document.createElement('div');
        infoBar.className = 'table-info-bar';
        infoBar.innerHTML = `
            <span>Balance: <span id="r-balance">$${this.currency.balance}</span></span>
            <span>Bet: <span id="total-bet">$0</span></span>
        `;
        table.appendChild(infoBar);

        // The Board (Grid)
        this.board = document.createElement('div');
        this.board.className = 'premium-board';

        // Assuming renderCell is a helper method or needs to be defined
        // For now, let's assume it's a placeholder or will be added later.
        // If it's meant to be a simple div, it would be:
        // const zeroCell = document.createElement('div');
        // zeroCell.className = 'board-cell cell-zero';
        // zeroCell.textContent = '0';
        // zeroCell.onclick = () => this.placeBet('number', 0);
        // this.board.appendChild(zeroCell);
        // For now, keeping the original `this.renderCell` call as per instruction.
        this.renderCell(0, 'cell-zero', this.board);

        for (let n = 1; n <= 36; n++) {
            const col = Math.ceil(n / 3) + 1; // +1 for Zero col
            let row;
            if (n % 3 === 0) row = 1;
            else if (n % 3 === 2) row = 2;
            else row = 3;

            const color = this.redNumbers.includes(n) ? 'cell-red' : 'cell-black';
            const cell = document.createElement('div');
            cell.className = `board-cell ${color}`;
            cell.textContent = n;
            cell.style.gridRow = row;
            cell.style.gridColumn = col;
            cell.onclick = () => this.placeBet('number', n);
            this.board.appendChild(cell);
        }
        table.appendChild(this.board);

        // Outside Bets
        const outsideRow = document.createElement('div');
        outsideRow.className = 'outside-bets-row';
        ['1-18', 'EVEN', 'RED', 'BLACK', 'ODD', '19-36'].forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'bet-option';
            btn.textContent = opt;
            if (opt === 'RED') btn.style.borderColor = '#c0392b';
            if (opt === 'BLACK') btn.style.borderColor = '#555';
            btn.onclick = () => this.placeBet(opt.toLowerCase(), opt);
            outsideRow.appendChild(btn);
        });
        table.appendChild(outsideRow);

        // Chip Controls
        const chipControls = document.createElement('div');
        chipControls.className = 'chip-controls';
        [1, 5, 10, 25, 100].forEach(val => {
            const chip = document.createElement('div');
            chip.className = `chip-btn ${val === this.currentChipValue ? 'active' : ''}`;
            chip.textContent = val;
            chip.onclick = () => {
                this.currentChipValue = val;
                this.updateChipUI(chipControls, chip);
            };
            chipControls.appendChild(chip);
        });
        table.appendChild(chipControls);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'roulette-actions';
        actions.appendChild(createButton('Clear', () => this.clearBets(), 'btn-clear'));
        actions.appendChild(createButton('SPIN', () => this.spin(), 'btn-spin'));
        table.appendChild(actions);

        wrapper.appendChild(table);
    }

    // ... rest of class methods

    renderCell(num, className, container) {
        const cell = document.createElement('div');
        cell.className = `board-cell ${className}`;
        cell.textContent = num;
        cell.onclick = () => this.placeBet('number', num);
        container.appendChild(cell);
    }

    updateChipUI(container, activeChip) {
        const chips = container.querySelectorAll('.chip-btn');
        chips.forEach(chip => chip.classList.remove('active'));
        if (activeChip) activeChip.classList.add('active');
    }

    placeBet(type, value) {
        if (this.isSpinning) return;

        // Check balance
        if (this.currency.balance < this.currentChipValue) {
            alert("Insufficient funds!");
            return;
        }

        // Deduct balance
        this.currency.subtract(this.currentChipValue);

        // Add bet
        this.bets.push({
            type: type,
            value: value,
            amount: this.currentChipValue
        });

        this.updateUI();
        this.sound.play('chip'); // Assuming soundManager has play()
    }

    clearBets() {
        if (this.isSpinning) return;

        // Refund bets to balance since they weren't played
        const totalBet = this.bets.reduce((sum, bet) => sum + bet.amount, 0);
        this.currency.add(totalBet);

        this.bets = [];
        this.updateUI();
    }

    updateUI() {
        // Update balance display
        const balanceEl = document.getElementById('r-balance');
        if (balanceEl) balanceEl.textContent = `$${this.currency.balance}`;

        // Update total bet display
        const totalBet = this.bets.reduce((sum, bet) => sum + bet.amount, 0);
        const betEl = document.getElementById('total-bet');
        if (betEl) betEl.textContent = `$${totalBet}`;
    }

    spin() {
        if (this.isSpinning) return;

        if (this.bets.length === 0) {
            alert("Please place a bet first!");
            return;
        }

        this.isSpinning = true;

        // Pick winning number
        const winningNumber = this.numbers[Math.floor(this.rng.random() * this.numbers.length)];

        // Calculate rotation
        // Find index of winning number in this.numbers array
        const winningIndex = this.numbers.indexOf(winningNumber);

        // The wheel segments are ordered clockwise from 0 index.
        // If angle is 0, index 0 is at top (usually; depends on initial rotation).
        // Let's assume standard wheel rotation to align winning number with pointer at top.
        // Segment angle = 360 / 37 ≈ 9.73 deg.
        const segmentAngle = 360 / this.numbers.length;

        // Random extra spins (5-10 full rotations)
        const extraSpins = 5 + Math.floor(this.rng.random() * 5);

        // Calculate target rotation. 
        // We need to rotate the wheel so the winning number is at the top (0 degrees or -90 or wherever the pointer is).
        // Assuming pointer is at top (0 deg).
        // If index 0 is at 0 deg initially. Index i is at i * segmentAngle.
        // To bring index i to 0 deg, we rotate by - (i * segmentAngle).
        // Adding extra spins: - (i * segmentAngle) - (extraSpins * 360).
        const targetRotation = -(winningIndex * segmentAngle) - (extraSpins * 360);

        // Determine random offset within the wedge for realism (-4deg to +4deg)
        const randomOffset = (this.rng.random() - 0.5) * (segmentAngle * 0.8);
        const finalRotation = targetRotation + randomOffset;

        // Apply rotation to wheel
        this.wheel.style.transition = 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)';
        this.wheel.style.transform = `rotate(${finalRotation}deg)`;

        // Spin ball in opposite direction
        // Ball track is separate. Ball needs to land near the number.
        // This is complex visually; simplified: spin ball opposite direction.

        this.sound.play('spin'); // Placeholder

        setTimeout(() => {
            this.handleResult(winningNumber);
        }, 4000);
    }

    handleResult(winningNumber) {
        this.isSpinning = false;
        this.wheel.style.transition = 'none';

        // Normalize rotation for next spin (optional but good for CSS)
        const segmentAngle = 360 / this.numbers.length;
        const winningIndex = this.numbers.indexOf(winningNumber);
        const normalizedRotation = -(winningIndex * segmentAngle);
        this.wheel.style.transform = `rotate(${normalizedRotation}deg)`;

        this.resultOverlay.textContent = winningNumber;
        this.resultOverlay.classList.add('visible');

        // Calculate winnings
        let totalWinnings = 0;
        this.bets.forEach(bet => {
            const win = this.checkWin(bet, winningNumber);
            if (win > 0) {
                totalWinnings += win;
            }
        });

        if (totalWinnings > 0) {
            this.currency.add(totalWinnings);
            this.sound.play('win');
            // Show win animation/message
            alert(`You won $${totalWinnings}!`);
        } else {
            // Show lose message
        }

        this.bets = []; // Clear bets or keep them? Usually clear.
        this.updateUI(); // Updates balance

        setTimeout(() => {
            this.resultOverlay.classList.remove('visible');
        }, 3000);
    }

    checkWin(bet, winningNumber) {
        let multiplier = 0;
        const isRed = this.redNumbers.includes(winningNumber);
        const isBlack = !isRed && winningNumber !== 0;
        const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
        const isOdd = winningNumber !== 0 && winningNumber % 2 !== 0;

        switch (bet.type) {
            case 'number':
                if (bet.value === winningNumber) multiplier = 35;
                break;
            case 'even': // 'EVEN'
            case 'EVEN':
                if (isEven) multiplier = 1;
                break;
            case 'odd': // 'ODD'
            case 'ODD':
                if (isOdd) multiplier = 1;
                break;
            case 'red': // 'RED'
            case 'RED':
                if (isRed) multiplier = 1;
                break;
            case 'black': // 'BLACK'
            case 'BLACK':
                if (isBlack) multiplier = 1;
                break;
            case '1-18':
                if (winningNumber >= 1 && winningNumber <= 18) multiplier = 1;
                break;
            case '19-36':
                if (winningNumber >= 19 && winningNumber <= 36) multiplier = 1;
                break;
        }

        return multiplier > 0 ? bet.amount * (multiplier + 1) : 0; // Payout includes stake? Usually 35:1 means bet 1 get 35 + 1 back.
    }
} 
