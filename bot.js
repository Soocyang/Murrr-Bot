require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client({
    partials: ['MESSAGE']
});

const BOT_PREFIX = '-'
const MOD_ME_COMMAND = 'mod-me'

client.on('ready', () => {
  console.log("Bot is ready!!!");
});


client.on('messageDelete', msg => {
    msg.channel.send('Y DELETE')
});

client.on('message', msg => {
    if (msg.content === `${BOT_PREFIX}${MOD_ME_COMMAND}`) {
      modUser(msg.member)
    }
});

function modUser(member){
    member.roles.add("787976983714988042")
}

client.login(process.env.BOT_TOKEN);

