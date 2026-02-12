/**
 * Loan UI Module
 * Handles the "Bankruptcy Rescue" modal logic.
 */
export default class LoanUI {
    constructor(stateManager, currencyManager, soundManager) {
        this.state = stateManager;
        this.currency = currencyManager;
        this.sound = soundManager;
    }

    init() {
        // Subscribe to bankruptcy warning
        this.state.subscribe('bankruptcy_warning', () => {
            setTimeout(() => {
                this.showBankruptcyModal();
            }, 1000); // Delay for dramatic effect
        });
    }

    showBankruptcyModal() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');

        // Prevent duplicate modals if already open
        if (!modal.classList.contains('hidden')) return;

        content.innerHTML = `
            <div class="bankruptcy-modal">
                <h2>The House Always Wins...</h2>
                <p>But we like to keep you playing.</p>
                <div class="loan-amount">+$1,000</div>
                <p class="terms">"Complimentary House Loan"</p>
                <button id="accept-loan-btn" class="primary-btn">Accept Loan</button>
            </div>
        `;

        modal.classList.remove('hidden');

        const btn = document.getElementById('accept-loan-btn');
        if (btn) {
            btn.onclick = () => {
                this.currency.resetBalance(1000);
                modal.classList.add('hidden');
                if (this.sound) this.sound.play('win'); // Satisfying sound
            };
        }
    }
}
