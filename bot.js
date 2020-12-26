require('dotenv').config()

const fetch = require('node-fetch');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const Sequelize = require('sequelize');
const client = new Discord.Client({
    partials: ['MESSAGE'],
});

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

//Create model
const Tags = sequelize.define('tags', {
	name: {
		type: Sequelize.STRING,
	},
	description: Sequelize.TEXT,
	username: Sequelize.STRING,
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
  },
  guildId: Sequelize.INTEGER,
});

client.once('ready', () => {
  Tags.sync();
})

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
const { url } = require('inspector');
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

//Default message reply memes
client.on('message', msg => {
  client.commands.get('defaultCmd').execute(msg);

});

//Useful functions command
client.on('message', async msg => {
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;
  const args = msg.content.slice(PREFIX.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
  try{
    const tag = await Tags.findOne({ where: { name: command, guildId: msg.guild.id} });
    if (tag) {
      // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
      tag.increment('usage_count');
      return msg.channel.send(tag.get('description'));
    }
  }catch(e){
    console.log(e);
    return msg.reply(`Could not find tag: ${command}`);
  }
  
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
  else if(command === 'avatar'){
    checkArgs(msg, args);
    client.commands.get('avatar').execute(msg, args);
  }
  else if(command === 'tag'){
    client.commands.get('tag').execute(msg, args, client);
  }
  else if(command === 'ping'){
    client.commands.get('ping').execute(msg, args);
  }
  else if(command === 'guild'){
    msg.channel.send(msg.guild.id);
  }
  else if(command === 'cat'){
    const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
	  msg.channel.send(file);
  }
  else if(command === 'playfbi'){
    // if (msg.member.voice.channel) {
    //   const connection = await msg.member.voice.channel.join();
    //   play(connection);
    // }
    msg.reply('Cmd Disabled :D');
  }
  // else if(command === 'play' || command === 'p'){
  //   client.commands.get('play').execute(msg, args);    
  // }
  // else if(command === 'dis'){
  //   client.commands.get('leave').execute(msg, args);
  // }




});

function checkArgs(msg, args){
  if (!args.length) {
    return msg.channel.send(`You didn't provide any arguments, ${msg.author}!`);
  }
}

/**Testing-Playground**/
//This when user delete message YELL AT THEM!!!!
// client.on('messageDelete', msg => {
//     // Create the attachment using MessageAttachment
//     const attachment = new Discord.MessageAttachment('https://images-ext-2.discordapp.net/external/gSnYcbkGLhtVvwNloUomWx0762Nnfeduwkembi-SBy0/https/media.discordapp.net/attachments/620183192879628298/735538633255419924/unknown.png');
//     // Send the attachment in the message channel
//     msg.channel.send(attachment);
// });

//This function is to let user get role

function modUser(msg, color){
  for(let key in ROLE_COLOR){
    if (color[0] === `${key}`) {
      msg.member.roles.add(ROLE_COLOR[key])
    }
  }
}


async function play(voiceChannel) {
  const dispatcher = voiceChannel.play('./resource/y2mate_OzpmNhZ.mp3');

  dispatcher.on('start', () => {
    console.log('y2mate_OzpmNhZ.mp3 is now playing!');
  });
  
  dispatcher.on('finish', () => {
    dispatcher.destroy();
    console.log('y2mate_OzpmNhZ.mp3 finished playing!');
    voiceChannel.disconnect();
  });
  
  // Always remember to handle errors appropriately!
  dispatcher.on('error', console.error);

}


// Testing Music Bot
let connection;
let isPlaying = 0;
let musicQueue = [];
const streamOptions = {
  seek: 0,
  volumn: 0.5
}

client.on('message', async msg => {
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;
  const args = msg.content.slice(PREFIX.length).trim().split(' ');
  const command = args.shift().toLowerCase();
 
  if(command === 'play' || command === 'p'){
    
    const searchKeysUrl = args.join(' ');
    const voiceChannel = msg.member.voice.channel;
    if(!voiceChannel) return msg.reply('You need to be in a voice channel to execute this command!');

    connection = await voiceChannel.join();

    if(ytdl.validateURL(searchKeysUrl)){

      //check if the url is repeated
      const flag = musicQueue.some(element => element === searchKeysUrl);
      if(!flag){
        musicQueue.push(searchKeysUrl);

        if(isPlaying){
          const embed = new Discord.MessageEmbed()
          .setColor(0x3ba3ee)
          .setAuthor(client.user.username, client.user.displayAvatarURL())
          .setDescription('Song successfully added to the queue\n' + 
                            `[${(await ytdl.getBasicInfo(searchKeysUrl)).videoDetails.title}](${searchKeysUrl})`);
          msg.channel.send(embed);
        }
        else {
          try{
            await playSong(msg, connection, voiceChannel);
            isPlaying = 1;
          }
          catch(e){
            console.log(e);
          }
        }
      }
    }
    else{
      //If not a valid url then use ytsearch for the clip
      const videoFinder = async (query) => {
        const vidResult = await ytSearch(query);
        return (vidResult.videos.length > 1) ? vidResult.videos[0] : null;
      }

      const video = await videoFinder(args.join(' '));
      if(video){

        musicQueue.push(video.url);

        if(isPlaying){
          const embed = new Discord.MessageEmbed()
          .setColor(0x3ba3ee)
          .setAuthor(client.user.username, client.user.displayAvatarURL())
          .setDescription('Song successfully added to the queue\n' + 
                            `[${(await ytdl.getBasicInfo(video.url)).videoDetails.title}](${video.url})`);
          msg.channel.send(embed);
        }
        else {
          try{
            await playSong(msg, connection, voiceChannel);
            isPlaying = 1;
          }
          catch(e){
            console.log(e);
          }
        }


      }


    }




  }
  else if(command === 'queue' || command === 'q'){

    const voiceChannel = msg.member.voice.channel;
    if(!voiceChannel) return msg.channel.send('You need to be in a voice channel to execute this command!');
    if(musicQueue.length == 0) return msg.channel.send('The song queue is currently empty');

    try{
      let currentlyPlaying = (await ytdl.getBasicInfo(musicQueue[0])).videoDetails.title;
      let upNext = '';
  
      for(var i = 1; i < musicQueue.length; i++){
        upNext += `${i}. "` + (await ytdl.getBasicInfo(musicQueue[i])).videoDetails.title + '"\n';
      }
      msg.channel.send('```bash\n'+
                      'Song List\n' +
                      '---------\n' +
                      'Currently Playing\n' + 
                      `▶️ "${currentlyPlaying}" 🎶\n\n` +
                      'Coming Up Next Songs\n' +
                      `${upNext}` +
                      '```');
                      
    }catch(e){
      console.log(e);
    }

    
  } 
  else if(command === 'skip'){

    const voiceChannel = msg.member.voice.channel;
    if(!voiceChannel) return msg.reply('You need to be in a voice channel to execute this command!');
 
    musicQueue.shift();
    if(musicQueue[0] === undefined) return msg.reply('You are skipping the last song!');

    try{
      await playSong(msg, connection, voiceChannel);
      isPlaying = 1;
      msg.react('⏭️')
    }
    catch(e){
      console.log(e);
    }
  }
  else if(command === 'dis' || command === 'disconnect'){
    const voiceChannel = msg.member.voice.channel;

    if(!voiceChannel) return msg.channel.send('You need to be in a voice channel to stop the music!');
    await voiceChannel.leave();
    await msg.channel.send('Murrr has leave the channel :C');
    isPlaying = 0;
    musicQueue = [];

  }

});




async function playSong(msg, connection, voiceChannel) {

  const stream = ytdl(musicQueue[0], { filter: 'audioonly' });
  const songInfo = ytdl.getBasicInfo(musicQueue[0]);
  const dispatcher = connection.play(stream, streamOptions);

  const embed = new Discord.MessageEmbed()
            .setColor(0x3ba3ee)
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setDescription('Currently Playing \n' + 
                            `[${(await songInfo).videoDetails.title}](${musicQueue[0]})`);
            msg.channel.send(embed);
            
  //console.log(stream);

  dispatcher.on('finish', () => {
    musicQueue.shift();

    setTimeout(() => {
      if(musicQueue.length == 0){
        isPlaying = 0;
        voiceChannel.leave();
      }
      else{
        playSong(msg, connection, voiceChannel);
      }
    }, 5000)

  })
}

//Login bot
client.login(process.env.BOT_TOKEN);

