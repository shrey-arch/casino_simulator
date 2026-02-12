/**
 * StorageManager
 * Wrapper for LocalStorage with JSON parsing and error handling.
 */
export default class StorageManager {
    constructor() {
        this.prefix = 'casino_app_';
    }

    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (e) {
            console.error('Storage Save Error:', e);
            return false;
        }
    }

    load(key, defaultValue = null) {
        try {
            const serialized = localStorage.getItem(this.prefix + key);
            if (serialized === null) return defaultValue;
            return JSON.parse(serialized);
        } catch (e) {
            console.error('Storage Load Error:', e);
            return defaultValue;
        }
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        // Only clear our app's keys
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}
