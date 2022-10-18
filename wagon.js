'use strict'

// Chatroom class object
class Wagon {
    #name // Unique; used as primary key
    #capacity // Max total users to accommodate
    #riders // Track current connected users
    #messages // Array of messages; Saved message history

    constructor(name, capacity=5) {
        this.#name = name
        this.#capacity = capacity
        this.#riders = []
        this.#messages = []
    }

    get name() { return this.#name }
    get capacity() { return this.#capacity }
    get riders() { return this.#riders }
    get messages() { return this.#messages }

    // Check capacity
    hasSpot() { return this.#riders.length < this.#capacity }

    // Add and remove user
    addRider(rider) {
        if (this.hasSpot()) {
            this.#riders.push(rider)
            return true
        }
        return false
    }
    removeRider(name) {
        let index = this.#riders.indexOf(name)
        if(index >= 0){
            this.#riders.splice(index, 1)
            return true
        }
        return false
    }

    // Format chat message
    addMessage(name, msg) { 
        let index = this.#riders.indexOf(name)
        if(index >= 0){
            let formatted = name + ": " + msg + "\n"
            this.#messages.push(formatted) 
            return formatted
        }
        return ""
    }
}

module.exports = Wagon