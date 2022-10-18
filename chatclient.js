'use strict'

let ui = require('./ui.js')
let net = require('net'),
host = process.argv[2] || 'localhost',
port = process.argv[3] || 8080,
riderName = process.argv[4] || Math.random().toString(36).substring(2, 15) // User gets random UUID if name not given in command line

// Client tracks its own state to vary its behavior to some responses 
// 0 - lobby
// 1 - chatroom
let state = 0

// Current Wagon or chatroom that client is in
let currWagon
let wagons

let socket = new net.Socket()

/*===============================
    Handle RESPONSES from server
  ===============================*/
socket.on('data', (data) => {
    let response = data.toString()

    // Specialized response types
    if (response == "@createfail") { 
        process.stdout.write("\nCreate failed. Wagon name already exists.\n\n>>")
    } else if (response.includes("@joinsuccess")) { 
        console.clear()
        state = 1
        console.log("You hopped on " + currWagon + ". Type exit to return to lobby.\n")
    } else if (response == "@joindne") { 
        process.stdout.write("\nJoin failed. Wagon does not exist.\n\n>>")
        currWagon = null
    } else if (response == "@joinfull") { 
        process.stdout.write("\nJoin failed. Wagon is already full.\n\n>>")
        currWagon = null
    } else if (response == "@chat") {
        process.stdout.write("\n>> ")
    } else {

        if(state==0){

            // Lobby broadcast: Print wagon list and user totals per wagon
            wagons = response
            process.stdout.write(ui.displayBanner(riderName, wagons))

        } else { 
            
            // Chatroom broadcast: Print chat message received
            process.stdout.write(response)

        }
        
    }
})

// Connection error handler
socket.on('error', (err) => {
    console.log('Error connecting to Server on host: ' + host + ' port: ' + port)
    console.log(err)
})

// Rider client registers name to server as first point of contact when connection is successful
socket.connect(port, host)
socket.write("register@" + riderName)


/*===========================
    Send MESSAGE to server
  ===========================*/
process.stdin.on('data', input => {
    let stringIn = input.toString()

    // Lobby input types
    if (state == 0){ 
        let toks = stringIn.split(' ')
        if (stringIn.trim() == "exit"){

            // Exit client application
            socket.end()
            console.log("Exiting client.")
            process.exit(0)

        } else if (toks.length>1 && toks[0] == "create") {
            
            // Request create Wagon
            socket.write("create@" + toks[1])

        } else if (toks.length>1 && toks[0] == "join") {
            
            // Request join Wagon
            currWagon = toks[1].trim()
            socket.write("join@" + toks[1])

        } else {
            process.stdout.write(">> ")
        }
    } 
    
    // Chatroom input types
    else {
        if (stringIn.trim() == "exit"){

            // Leave the chatroom
            socket.write("leave@" + currWagon)
            console.clear()
            state = 0

        } else {

            // Send a chat message
            socket.write("chat@" + currWagon + "@" + input)

        }
    }

})