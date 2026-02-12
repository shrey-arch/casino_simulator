/**
 * Random Number Generator
 * Uses crypto.getRandomValues for better randomness than Math.random()
 */
export default class RNG {
    constructor() { }

    /**
     * Returns a random floating-point number between 0 (inclusive) and 1 (exclusive)
     */
    random() {
        const array = new Uint32Array(1);
        self.crypto.getRandomValues(array);
        return array[0] / (0xffffffff + 1);
    }

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     */
    range(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }
}
