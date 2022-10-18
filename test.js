'use strict'

let assert = require('assert')
let Wagon = require('./wagon.js')

// Objects
let w1 = new Wagon("HeyWagon") // Wagon with default cap 5
let w2 = new Wagon("ZeWagon", 2) // Wagon with cap 2
let w3 = new Wagon("NoWagon", 0) // Wagon with cap 0
let riders = ["Yeehaw", "Dustin", "Crush", "Hickory", "ununundrum", "L0veL135T"]

function main() {
    let pass = 0
    console.log("Begin test.js suite\n")

    // Test wagon creation
    console.log("#1: Test wagon creation")
    createWagon(w1, "HeyWagon", 5)
    createWagon(w2, "ZeWagon", 2)
    createWagon(w3, "NoWagon", 0)
    pass++

    // Test filling up to capacity
    console.log("#2: Test filling up to capacity")
    fillWagon(w1, 5)
    fillWagon(w2, 2)
    fillWagon(w3, 0)
    pass++

    // Test restricting new entrants on full wagons
    console.log("#3: Test restricting new entrants on full wagons")
    restrictWagon(w1)
    restrictWagon(w2)
    restrictWagon(w3)
    pass++

    // Test removing existing riders from wagon
    console.log("#4: Test removing existing riders from wagon")
    removeValidRider(w1, riders[1])
    removeValidRider(w2, riders[0])
    pass++

    // Test removing non-existing riders from wagon
    console.log("#5: Test removing non-existing riders from wagon")
    removeInvalidRider(w1, "Yeet")
    removeInvalidRider(w2, "Nullboy")
    removeInvalidRider(w3, riders[0])
    pass++

    // Test redacted wagons has spot for new rider
    console.log("#6: Test redacted wagons has spot for new rider")
    addRiderToWagon(w1, riders[5])
    addRiderToWagon(w2, riders[5])
    pass++

    // Test add message for each existing rider
    console.log("#7: Test add message for each existing rider")
    addMessage(w1, "ping")
    addMessage(w2, "ping")
    addMessage(w3, "ping")
    pass++

    console.log("\nAll Tests finished!\nTotal passed: " + pass)
}


function createWagon(w, name, cap) {
    assert(w)
    assert.equal(name, w.name)
    assert.equal(cap, w.capacity)
}

function fillWagon(w, cap) {
    for(let i=0; i<cap; i++){
        let success = w.addRider(riders[i])
        assert(success)
    }
}

function restrictWagon(w){
    let success = w.addRider(riders[5])
    assert(!success)
}

function removeValidRider(w, r){
    let oldTotal = w.riders.length
    w.removeRider(r)
    let newTotal = w.riders.length
    assert.notEqual(oldTotal, newTotal)
}

function removeInvalidRider(w, r){
    let oldTotal = w.riders.length
    w.removeRider(r)
    let newTotal = w.riders.length
    assert.equal(oldTotal, newTotal)
}

function addRiderToWagon(w, r){
    let success = w.addRider(r)
    assert(success)
}

function addMessage(w, msg){
    for(let i=0; i<riders.length; i++){
        w.addMessage(riders[i], msg)
    }
    let wagonRiders = w.riders
    let wagonMessages = w.messages
    assert.equal(wagonRiders.length, wagonMessages.length)
}

main()
