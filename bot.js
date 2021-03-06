require('dotenv').config()

const music = require('./music.js');
const fetch = require('node-fetch');
const Discord = require('discord.js');
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

const fs = require('fs');
const { url } = require('inspector');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}


//Execute Music feature
music.execute(client);


//Bot activity status
client.on('ready', () => {
  console.log("Bot is ready!!!");
  let statusCounter = 0;
  client.user.setActivity(`奇怪的知识增加了` + '| ~help', { type: 'WATCHING' });

  // const statuses = ['Mr & Mrs Gao', 'Kurzgesagt – In a Nutshell', 'TEDx Talks', 'Vsauce', 'Li Ke Tai Tai', 'Veritasium'];

  // const statusItv = setInterval(updateStatus, 300000);

  // function updateStatus() {
  //   client.user.setActivity(`${statuses[statusCounter]} ` + '| ~help', { type: 'LISTENING' });
  //   if (statusCounter == statuses.length - 1) {
  //     statusCounter = -1;
  //   }
  //   statusCounter++;
  // }
});

//Useful functions command
client.on('message', async msg => {

  //Default message reply memes
  client.commands.get('defaultCmd').execute(msg);


  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;
  const args = msg.content.slice(PREFIX.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
  try {
    const tag = await Tags.findOne({ where: { name: command, guildId: msg.guild.id } });
    if (tag) {
      // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
      tag.increment('usage_count');
      return msg.channel.send(tag.get('description'));
    }
  } catch (e) {
    console.log(e);
    return msg.reply(`Could not find tag: ${command}`);
  }

  if (command === 'args-info') {
    checkArgs(msg, args);
    msg.channel.send(`Command name: ${command}\nArguments: ${args}`);
  }
  else if (command === 'clearchat') {
    checkArgs(msg, args);
    client.commands.get('clearchat').execute(msg, args);
    //clearChat(msg, args);
  }
  else if (command === 'help') {
    client.commands.get('help').execute(msg, client);
  }
  else if (command === 'avatar') {
    checkArgs(msg, args);
    client.commands.get('avatar').execute(msg, args);
  }
  else if (command === 'tag') {
    client.commands.get('tag').execute(msg, args, client);
  }
  else if (command === 'ping') {
    client.commands.get('ping').execute(msg, args);
  }
  else if (command === 'guild') {
    msg.channel.send(msg.guild.id);
  }
  else if (command === 'cat') {
    const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
    msg.channel.send(file);
  }

});

function checkArgs(msg, args) {
  if (!args.length) {
    return msg.channel.send(`You didn't provide any arguments, ${msg.author}!`);
  }
}

/**Testing-Playground**/



//Login bot
client.login(process.env.BOT_TOKEN);

