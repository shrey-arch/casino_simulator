/**
 * StateManager
 * Handles simple Pub/Sub event management for decoupled communication.
 */
export default class StateManager {
    constructor() {
        this.events = {};
        this.state = {};
    }

    /**
     * Subscribe to an event
     * @param {string} eventName 
     * @param {function} callback 
     */
    subscribe(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);

        // Return unsubscribe function
        return () => {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        };
    }

    /**
     * Publish an event
     * @param {string} eventName 
     * @param {any} data 
     */
    publish(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in subscriber for ${eventName}:`, error);
                }
            });
        }
    }

    /**
     * Set a global state value
     * @param {string} key 
     * @param {any} value 
     */
    setState(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        this.publish('stateChanged', { key, value, oldValue });
    }

    /**
     * Get a global state value
     * @param {string} key 
     */
    getState(key) {
        return this.state[key];
    }
}
