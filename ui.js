'use strict'

let title = `
  _______ _____ _______      _____  _________  _  __
 / ___/ // / _ /_  __/ | /| / / _ |/ ___/ __ \\/ |/ /
/ /__/ _  / __ |/ /  | |/ |/ / __ / (_ / /_/ /    / 
\\___/_//_/_/ |_/_/   |__/|__/_/ |_\\___/\\____/_/|_/  
`

function displayBanner(name, wagons){ 
    let banner = title
    
    banner += `\nWelcome ${name}!\n`
    
    if(wagons.length > 0){
        let wagonsObj = JSON.parse(wagons)

        wagons = wagonsObj.wagons

        banner += `There are currently ${wagons.length} active wagons.`

        for (let wagon of wagons){
            banner += `\n  | ${wagon.name} [${wagon.riders}/${wagon.capacity}]`
        }

        banner += `\nType join <name> to join a wagon.\n`
    } else {
        banner += `There are no active wagons.\n`
    }

    banner += `Type create <name> to start a new wagon.\n`

    banner += `Type exit to leave application.\n\n`

    banner += `>> `

    return banner
}

function displayTitle(){
    return title
}

module.exports = { displayBanner, displayTitle }

