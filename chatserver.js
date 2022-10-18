'use strict'

let net = require('net') 
let ui = require('./ui.js')
let Wagon = require('./wagon.js')

// Track currently online clients
let riders = []

// List of created chatrooms
let wagons = []


let server = net.createServer()

/*===========================
    Handle client REQUESTS
  ===========================*/
server.on('connection', (socket) => {

    // Add new client to list of riders
    socket.address = socket.remoteAddress + ":" + socket.remotePort
    riders.push(socket)
    
    // Initiate Chatwagon UI on client
    socket.write(packWagons()) 

    // Client request types
    socket.on('data', function (data) {
        let message = data.toString().trim()
        let toks = message.split('@')

        if (toks.length > 1){
            if(toks[0] == "join"){

                // Handle join request
                let wagonName = toks[1]
                let theWagon = getWagon(wagonName)
                if(theWagon){
                    let hasSpot = theWagon.addRider(socket.name)
                    if(hasSpot){
                        lobbyBroadcast(packWagons())
                        socket.write("@joinsuccess")
                        socket.wagon = wagonName
                        process.stdout.write("[JOIN] Rider " + socket.name + " (" + socket.address + ") hopped on " + wagonName + ".\n")
                        setTimeout(function() {
                            let chatMessages = theWagon.messages
                            for(let msg of chatMessages){
                                socket.write(msg+"\n")
                            }
                        }, 300);
                    } else {
                        socket.write("@joinfull")
                    }
                } else {
                    socket.write("@joindne")
                }

            } else if(toks[0] == "create"){

                // Handle create request
                let wagonName = toks[1]
                if(validateWagon(wagonName)){
                    wagons.push(new Wagon(wagonName))
                    process.stdout.write("[CREATE] Wagon " + toks[1] + " is created.\n")
                    lobbyBroadcast(packWagons()) 
                } else {
                    socket.write("@createfail")   
                }

            } else if(toks[0] == "register"){

                // Register user name
                socket.name = toks[1]
                process.stdout.write("[CONNECTION] Rider " + socket.name + " connected to the server from " + socket.address + ".\n")

            } else if(toks[0] == "chat"){

                // Handle chatroom message broadcast
                let wagonName = toks[1]
                let chatMessage = toks[2]
                let theWagon = getWagon(wagonName)
                chatMessage = theWagon.addMessage(socket.name, chatMessage)
                wagonBroadcast(theWagon, chatMessage)

            } else if(toks[0] == "leave"){

                // Handle user chatroom leave and return to lobby
                let theWagon = getWagon(toks[1])
                if(theWagon){
                    let removed = theWagon.removeRider(socket.name)
                    if(removed){
                        process.stdout.write("[LEAVE] Rider " + socket.name + " (" + socket.address + ") got off " + toks[1] + ".\n")
                        socket.wagon = null
                        lobbyBroadcast(packWagons()) 
                    }
                    else
                    process.stdout.write("[ERROR] Failed to remove Rider " + socket.name + " from wagon " + toks[1] + ". Rider not found.\n")
                } else {
                    process.stdout.write("[ERROR] Failed to remove Rider " + socket.name + " from wagon " + toks[1] + ". Wagon not found.\n")
                }

            }
        } else {

            // Print console arrow prompt
            socket.write("@chat")

        }
    })
  
    // validateWagon
    //   Check if wagon name currently exists in list
    //   Returns: boolean
    function validateWagon(name){
        for(let wagon of wagons){
            if(wagon.name == name)
                return false
        }
        return true
    }

    // getWagon
    //   Get Wagon based on name key
    //   Returns: Wagon
    function getWagon(name){
        for(let wagon of wagons){
            if(wagon.name == name)
                return wagon
        }
    }

    // packWagons
    //   Pack wagon data as JSON and serialize into a string
    //   Returns: string
    function packWagons(){
        let wagonList = []
        for(let wagon of wagons){
            let w = {
                "name": wagon.name,
                "riders": wagon.riders.length,
                "capacity": wagon.capacity
            }
            wagonList.push(w)
        }
        let wagonObj = {
            "wagons": wagonList
        }
        return JSON.stringify(wagonObj)
    }

    // lobbyBroadcast
    //   Send a message to all users that are in the Lobby
    function lobbyBroadcast(message) {
        riders.forEach(function (rider) {
            if(!rider.wagon)
                rider.write(message)
        })
    }

    // wagonBroadcast
    //   Send a message to only all users in a given room
    function wagonBroadcast(theWagon, message) {
        let wagonRiders = theWagon.riders
        riders.forEach(function (rider) {
            if (wagonRiders.includes(rider.name)){
                rider.write(message)
            }
        })
    }

    // Rider disconnect handler
    socket.on('end', function () {
        // Remove Rider from its wagon if disconnected in chatroom state
        let currWagon = getWagon(socket.wagon)
        if(currWagon){
            currWagon.removeRider(socket.name)
            process.stdout.write("[LEAVE] Rider " + socket.name + " (" + socket.address + ") is removed from " + currWagon.name + ".\n")
        }
        riders.splice(riders.indexOf(socket), 1)
        process.stdout.write("[CONNECTION] Rider " + socket.name + " (" + socket.address + ") is disconnected from server.\n")
    })

})

// Server error handling
server.on('error', (err) => {
    throw err
})
 
// Server connect and startup UI
// Listens on port 8080 on localhost with a backlog of 200
server.listen(8080, 'localhost', 200, () => {
    process.stdout.write(ui.displayTitle())
    console.log(`\nServer started on ${server.address().address}:${server.address().port}.\n`)
})