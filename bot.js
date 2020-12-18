require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client({
    partials: ['MESSAGE'],
});

const PREFIX = '~'
const ROLE_COLOR = {
  sky: '787976983714988042',
  mint: '788222969549684767',
  grape: '788223025824006164',
  peach: '788223196545286214',
  lemon: '788223232373293086',
  orange: '788223321140363276'
}

const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}

//Bot activity status
client.on('ready', () => {
  console.log("Bot is ready!!!");
  client.user.setActivity('Mr & Mrs Gao', { type:'WATCHING' });
});

//This when user delete message YELL AT THEM!!!!
// client.on('messageDelete', msg => {
//     // Create the attachment using MessageAttachment
//     const attachment = new Discord.MessageAttachment('https://images-ext-2.discordapp.net/external/gSnYcbkGLhtVvwNloUomWx0762Nnfeduwkembi-SBy0/https/media.discordapp.net/attachments/620183192879628298/735538633255419924/unknown.png');
//     // Send the attachment in the message channel
//     msg.channel.send(attachment);
// });


//Default message reply memes
client.on('message', msg => {
  client.commands.get('defaultCmd').execute(msg);

});

//Useful functions command
client.on('message', msg => {
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;
  const args = msg.content.slice(PREFIX.length).trim().split(' ');
  const command = args.shift().toLowerCase();
  if(command === 'args-info'){
    checkArgs(msg, args);
    msg.channel.send(`Command name: ${command}\nArguments: ${args}`);
  }
  else if(command === 'clearchat'){
    checkArgs(msg, args);
    client.commands.get('clearchat').execute(msg, args);
    //clearChat(msg, args);
  }
  else if(command === 'help'){
    client.commands.get('help').execute(msg, client);
  }
  else if(command === 'admhelp'){
    client.commands.get('admhelp').execute(msg, client);
  }
  else if(command === 'avatar'){
    checkArgs(msg, args);
    client.commands.get('avatar').execute(msg, args);
    //avatar(msg);
  }
  else if(command === 'ping'){
    client.commands.get('ping').execute(msg, args);
  }
});

function checkArgs(msg, args){
  if (!args.length) {
    return msg.channel.send(`You didn't provide any arguments, ${msg.author}!`);
  }
}

//This function is to let user get role
function modUser(msg, color){
  for(let key in ROLE_COLOR){
    if (color[0] === `${key}`) {
      msg.member.roles.add(ROLE_COLOR[key])
    }
  }
}

/**Testing-Playground**/

//Login bot
client.login(process.env.BOT_TOKEN);

