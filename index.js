const discord = require('discord.js')
const fs = require('fs')

const client = new discord.Client()

const token = fs.readFileSync('.env', 'utf8').replace("\n", "")

const state = {}

const sync = guild => {
    state[guild.id] = {};
    for (role of guild.roles.array()) {
        if (role.color === 15158332) {
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
    if (cont[0] === "bean-gaming") {
        const user = message.member
       const channel = message.channel
        const name = cont.slice(2).join(" ").trim()
        switch (cont[1]) {
            case "add-role":
                 if (state[message.guild.id][name] === undefined) {
                    channel.send(`Role does not exist in guild or cannot be joined!`)
                } else {
                    channel.send(`Role added!`)
                    user.addRole(state[message.guild.id][name])
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
            default:
                channel.send("Unknown command!")
                break;
        }
    }
})

const update = role => {
    if (role.color == 15158332) {
        state[role.guild.id][role.name] = role.id
    } else {
        delete state[role.guild.id][role.name]
    }
}

client.on('roleCreate', update)
client.on('roleUpdate', (_, role) => update(role))

client.login(token)
