require('dotenv').config()

const fetch = require('node-fetch');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const randomColor = require('randomcolor');
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
  let statusCounter = 0;
  const statuses = ['迎春花', '财神到', '春风吻上我得脸', '大发财', '贺新年', '大团圆'];

  const statusItv = setInterval(updateStatus, 300000);

  function updateStatus(){
    client.user.setActivity(`${statuses[statusCounter]} ` + '| ~help', { type:'LISTENING' });
    if(statusCounter == statuses.length - 1){
    	statusCounter = -1;
    }
    statusCounter++;
  }
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

// Testing Music Bot
let connection;
let dispatcher;
let isPlaying = 0;
let songQueue = [];
let loopFlag = 0;
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
    if(searchKeysUrl == '') return msg.reply('You need to provide a search key or youtube url');
    const voiceChannel = msg.member.voice.channel;
    if(!voiceChannel) return msg.reply('You need to be in a voice channel to execute this command!');

    connection = await voiceChannel.join();

    if(ytdl.validateURL(searchKeysUrl)){
      addSongtoQueue(searchKeysUrl, msg, connection, voiceChannel);
    }
    else{
      //If not a valid url then use ytsearch for the clip
      const videoFinder = async (query) => {
        const vidResult = await ytSearch(query);
        return (vidResult.videos.length > 1) ? vidResult.videos[0] : null;
      }

      const video = await videoFinder(args.join(' '));
      if(video){
        addSongtoQueue(video.url, msg, connection, voiceChannel);
      }
    }
  }
  else if(command === 'queue' || command === 'q'){

    const voiceChannel = msg.member.voice.channel;
    if(!voiceChannel) return msg.channel.send('You need to be in a voice channel to execute this command!');
    if(songQueue.length == 0) return msg.channel.send('The song queue is currently empty');

    let currentlyPlaying = '[' + songQueue[0].title + '](' + songQueue[0].url + ')\n' + 
                           '⌚ \`' + songQueue[0].duration + '\` ' +
                           ' : \`[' + songQueue[0].username + ']\`';
    let totalTime = Number(songQueue[0].length);

    if(loopFlag == 1){
      currentlyPlaying += ' - 🔂Looping ';
    }
    
    let upNext = '';
    if(songQueue[1] != undefined) upNext += '**Up Next**\n';
    
    for(var i = 1; i < songQueue.length; i++){
      upNext += `\`${i}.\`` + '[' + songQueue[i].title + '](' + songQueue[i].url + ') | ' + 
                ' ⌚ \`' + songQueue[i].duration + '\`' +
                ' : \`[' + songQueue[i].username + ']\`\n\n';
      totalTime += Number(songQueue[i].length);
    }

    const totalMinutes = Math.floor( totalTime / 60 );
    const totalSeconds = totalTime - totalMinutes * 60;
    
    totalTime = str_pad_left(totalMinutes,'0',2)+':'+str_pad_left(totalSeconds,'0',2);

    const embed = new Discord.MessageEmbed()
                    .setColor(randomColor())
                    .setTitle(`🎶 Song Queue for ${msg.guild.name}`)
                    .setDescription(
                      `**Now Playing** \n` + 
                      `${currentlyPlaying} \n\n` + 
                      `${upNext}\n`)
                    .setFooter(`${songQueue.length} songs in queue | Total length: ${totalTime}`, msg.guild.iconURL());
                    msg.channel.send(embed);

  } 
  else if(command === 'skip'){

    const voiceChannel = msg.member.voice.channel;
    if(!voiceChannel) return msg.reply('You need to be in a voice channel to execute this command!');
   
    if(songQueue.length === 1) return msg.reply('You are skipping the last song!');
    
    loopFlag = 0;
    songQueue.shift();

    try{
      await playSong(msg, connection, voiceChannel);
      isPlaying = 1;
      msg.react('⏭️');
    }
    catch(e){
      console.log(e);
    }
  }
  else if(command === 'pause'){
    dispatcher.pause();
    msg.react('⏸️');
  }
  else if(command === 'resume'){
    dispatcher.resume();
    msg.react('▶️');
  }
  else if(command === 'loop'){
    loopFlag = 1;
    msg.react('🔂');
  }
  else if(command === 'loopoff'){
    loopFlag = 0;
    msg.react('⏩');
  }
  else if(command === 'remove'){

    const index = parseInt(args[0]);

    if(index == 0) return msg.reply('To remove current song why not use "skip" instead :joy:')
    if(index > songQueue.length-1) return msg.reply('The number of the song not found!');
    if(!Number.isInteger(index)) return msg.reply('Not a valid number!');

    const song = songQueue[index];
    //remove requested song
    songQueue.splice(index, 1);

    msg.react('👌');
    const embed = new Discord.MessageEmbed()
                    .setColor(randomColor())
                    .setTitle(':ballot_box_with_check: Removed')
                    .setDescription(`**[${song.title}](${song.url})**`)
                    .setThumbnail(song.thumbail.url)
    msg.channel.send(embed);

  }
  else if(command === 'dis' || command === 'disconnect'){
    const voiceChannel = msg.member.voice.channel;

    if(!voiceChannel) return msg.channel.send('You need to be in a voice channel to stop the music!');
    voiceChannel.leave();
    msg.react('🛑');
    msg.channel.send('Murrr has disconnected :wave:');
    isPlaying = 0;
    loopFlag = 0;
    songQueue = [];

  }

});

async function playSong(msg, connection, voiceChannel) {

  const currentTrack = songQueue[0];
  const stream = ytdl(currentTrack.url, { filter: 'audioonly' });

  dispatcher = connection.play(stream, streamOptions);

  const embed = new Discord.MessageEmbed()
            .setColor(randomColor())
            .setTitle('🎵 Now Playing')
            .setDescription(`**[${currentTrack.title}](${currentTrack.url})**`)
            .setThumbnail(currentTrack.thumbail.url)
            .addField('Song duration', `⌚ ${currentTrack.duration}`, true)
            .addField('Channel', `🎤 ${currentTrack.author.name}`, true)
            .setFooter(`Requested by ${currentTrack.username}`,`${currentTrack.userpic}`);
            msg.channel.send(embed);
            
  //console.log(stream);

  dispatcher.on('finish', () => {

    if(loopFlag == 0){
      songQueue.shift();
      setTimeout(() => {
        if(songQueue.length == 0){
          isPlaying = 0;
          msg.channel.send('The queue is empty now! Play some song now!')
        }
        else{
          playSong(msg, connection, voiceChannel);
        }
      }, 5000)
    }else{
      playSong(msg, connection, voiceChannel);
    }
  })
}


async function addSongtoQueue(url, msg, connection, voiceChannel ){

  //Add song to the queue
  const songDetails = (await ytdl.getBasicInfo(url)).videoDetails;
  const songLength = songDetails.lengthSeconds
  const songMinutes = Math.floor( songLength / 60 );
  const songSeconds = songLength - songMinutes * 60;
  
  const songDuration = str_pad_left(songMinutes,'0',2)+':'+str_pad_left(songSeconds,'0',2);
  const song = {
    title: songDetails.title,
    url: url,
    duration: songDuration,
    length: songLength,
    author: songDetails.author,
    thumbail: songDetails.thumbnails[1],
    username: msg.author.username,
    userpic: msg.author.displayAvatarURL()
  }
  songQueue.push(song);

  // Verify the bot is playing 
  if(isPlaying){

    //if Yes reply song added to the queue
    const embed = new Discord.MessageEmbed()
    .setColor(randomColor())
    .setAuthor('Song added to the queue', msg.author.displayAvatarURL())
    .setDescription(`**[${song.title}](${song.url})**`)
    .setThumbnail(song.thumbail.url)
    .addField('Song duration', `⌚ ${song.duration}`, true)
    .addField('Channel', `🎤 ${song.author.name}`, true);

    msg.channel.send(embed);
  }
  else {

    //if not start playing
    try{
      await playSong(msg, connection, voiceChannel);
      isPlaying = 1;
    }
    catch(e){
      console.log(e);
    }
  }

}

function str_pad_left(string,pad,length) {
  return (new Array(length+1).join(pad)+string).slice(-length);
}

//Login bot
client.login(process.env.BOT_TOKEN);

