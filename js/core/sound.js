import StorageManager from './storage.js';

/**
 * SoundManager
 * Handles sound effects using Web Audio API for synthesized retro sounds.
 */
export default class SoundManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.storage = new StorageManager(); // Ensure StorageManager is imported or available
        this.muted = false;
        this.ctx = null;

        // Predefined sound types
        this.types = {
            CLICK: 'click',
            WIN: 'win',
            LOSE: 'lose',
            SPIN: 'spin',
            CARD: 'card',
            CHIP: 'chip'
        };
    }

    init() {
        // Load settings
        const muted = this.storage.load('sound_muted', false);
        this.muted = muted;

        // Initialize AudioContext on first interaction
        const initAudio = () => {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
        };

        window.addEventListener('click', initAudio);
        window.addEventListener('keydown', initAudio);
    }

    play(name) {
        if (this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        switch (name) {
            case 'click': this.playClick(); break;
            case 'win': this.playWin(); break;
            case 'lose': this.playLose(); break;
            case 'spin': this.playSpin(); break;
            case 'card': this.playCard(); break;
            case 'chip': this.playChip(); break;
            default: console.warn(`Sound ${name} not implemented`);
        }
    }

    // synthesized sounds

    playClick() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playWin() {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => { // C Major Arpeggio
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = 'square';
            osc.frequency.value = freq;

            const start = now + (i * 0.1);
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);

            osc.start(start);
            osc.stop(start + 0.3);
        });
    }

    playLose() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    playSpin() {
        // Ticking noise
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playCard() {
        // White noise burst for card slide
        const bufferSize = this.ctx.sampleRate * 0.1; // 100ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();

        // Filter to make it less harsh (Lowpass)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        noise.start();
    }

    playChip() {
        this.playClick(); // Reuse click for now or make distinct metallic sound
    }

    toggleMute() {
        this.muted = !this.muted;
        this.storage.save('sound_muted', this.muted);
        return this.muted;
    }
}
