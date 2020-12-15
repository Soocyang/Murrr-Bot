require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client({
    partials: ['MESSAGE'],
});

const PREFIX = '>'
const ROLE_COLOR = {
  sky: '787976983714988042',
  mint: '788222969549684767',
  grape: '788223025824006164',
  peach: '788223196545286214',
  lemon: '788223232373293086',
  orange: '788223321140363276'
}

//Bot activity status
client.on('ready', () => {
  console.log("Bot is ready!!!");
  client.user.setActivity('weird knowledge', { type:'PLAYING' });
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
  if(msg.content === 'murrr'){
      const attachment = new Discord.MessageAttachment('./resource/memes/murrr.png');
      msg.channel.send(attachment);
  }
  else if(msg.content === 'shock'){
    const attachment = new Discord.MessageAttachment('./resource/memes/mur_shock.jpg');
    msg.channel.send(attachment);
  }
  else if(msg.content === 'noted'){
      const attachment = new Discord.MessageAttachment('./resource/memes/mur_yessir.jpg');
      msg.channel.send(attachment);
  }
  else if(msg.content === 'lc'){
    const attachment = new Discord.MessageAttachment('./resource/memes/mur_lc.jpg');
    msg.channel.send(attachment);
  }
  else if(msg.content === 'heart break'){
    const attachment = new Discord.MessageAttachment('./resource/memes/mur_heartbreak.jpg');
    msg.channel.send(attachment);
  }
  else if(msg.content === 'omg'){
    const attachment = new Discord.MessageAttachment('./resource/memes/mur_omg.jpg');
    msg.channel.send(attachment);
  }
  else if(msg.content === 'headache'){
    const attachment = new Discord.MessageAttachment('./resource/memes/mur_headache.jpg');
    msg.channel.send(attachment);
  }
  else if(msg.content === 'roll'){
    const attachment = new Discord.MessageAttachment('./resource/memes/mur_rollaway.jpg');
    msg.channel.send(attachment);
  }
  else if(msg.content === '忍'){
    const attachment = new Discord.MessageAttachment('./resource/memes/mur_tolerate.jpg');
    msg.channel.send(attachment);
  }
  else{
    return;
  }

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
  else if(command === 'role'){
    checkArgs(msg, args);
    modUser(msg, args);
  }
  else if(command === 'clearchat'){
    checkArgs(msg, args);
    clearChat(msg, args);
  }
  else if(command === 'help'){
    help(msg);
  }
  else if(command === 'avatar'){
    checkArgs(msg, args);
    avatar(msg);
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

function clearChat(msg, numbers){
    // Bulk delete messages
    msg.channel.bulkDelete(numbers[0])
    .then(msg => console.log(`Bulk deleted ${msg.size} messages`))
    .catch(console.error);
}

function help(msg){
  const embed = new Discord.MessageEmbed()
                .setAuthor(client.user.username, client.user.displayAvatarURL)              
                .setColor(0xffa8a8)
                .setDescription('Commands Listing')
                .addField('Avatar','Show profile pics e.g. `>avatar @user`')
                .addField('Roles', 'Select a role color e.g. `>role mint`  \n' + 
                              '1. sky\n 2. mint\n 3. grape \n 4. peach \n 5. lemon \n 6. orange')
                .addField('Memes', 'to be cont...')


  msg.channel.send(embed);
}

function avatar(msg){
  const user = msg.mentions.users.first();
  if(user == null) return;
  msg.channel.send(user.displayAvatarURL());
}


/**Testing-Playground**/

//Login bot
client.login(process.env.BOT_TOKEN);

