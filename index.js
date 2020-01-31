const discord = require('discord.js')
const fs = require('fs')

const client = new discord.Client()

const token = fs.readFileSync('.env', 'utf8').replace("\n", "")

const state = {}

const color_set = new Set([15158332, 3066993, 2123412])

const sync = guild => {
    state[guild.id] = {};
    for (role of guild.roles.array()) {
        if (color_set.has(role.color)) {
            state[guild.id][role.name] = role.id
        }
    }
}

client.on('guildCreate', sync)
client.on('ready', () => {
    for (guild of client.guilds.array()) {
        sync(guild)
    }
    console.log(state)
})

client.on('message', message => {
    const cont = message.content.trim().split(" ")
    if (cont[0] === "<@!511611017630056488>") {
        const user = message.member
        const channel = message.channel
        const name = cont.slice(2).join(" ").trim()
        switch (cont[1]) {
            case "add-role":
                 if (state[message.guild.id][name] === undefined) {
                    channel.send(`Role does not exist in guild or cannot be joined. Check your spelling and capitalization.`)
                } else {
                    channel.send(`Role added!`)
                        .catch(console.error)
                    user.addRole(state[message.guild.id][name])
                        .catch(console.error)
                }
                break;
            case "remove-role":
                const ind = user.roles.array().map(role => role.name).indexOf(name)
                if (ind !== -1) {
                    user.removeRole(user.roles.array()[ind])
                    channel.send(`Role removed!`)
                } else {
                    channel.send(`Could not find the role in your role list!`)
                }
                break;
            case "view-roles":
                channel.send(`The roles available to join are:

${Object.keys(state[message.guild.id]).join(", ")}`)
                break;
            case "help":
                channel.send(`The available commands are:

    \`add-role\`: add a role to yourself
    \`remove-role\`: remove a role from yourself
    \`view-roles\`: list all joinable roles
    \`help\`: print this help message`)
                break;
            default:
                channel.send("Unknown command! Use `help` to see all available commands.")
                break;
        }
    } 

})

const update = (oldr, role) => {
    if (oldr.name !== role.name) {
        delete state[oldr.guild.id][oldr.name]
    }
    if (color_set.has(role.color)) {
        state[role.guild.id][role.name] = role.id
    } else {
        delete state[role.guild.id][role.name]
    }
}

client.on('roleCreate', nr => update(null, nr))
client.on('roleUpdate', update)

client.login(token)
