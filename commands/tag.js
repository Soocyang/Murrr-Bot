const Discord = require('discord.js');
const client = new Discord.Client({
  partials: ['MESSAGE'],
});

const Sequelize = require('sequelize');
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
});

module.exports = {
  name: 'tag',
  description: 'Allows users to manage tags',
  execute(msg, args, client) {
    if (!args[0]) {
      return msg.channel.send(
        `You didn't provide any tag action, ${msg.author}!`
      );
    }
    const tagAction = args[0];

    if (tagAction === 'add') {
      if (
        validateTagName(msg, args[1]) &&
        validateTagDescription(msg, args[2])
      ) {
        const tagName = args[1];
        const tagDesc = args.slice(2).join(' ');
        //Calling addtag
        addtag(msg, tagName, tagDesc);
      }
    } else if (tagAction === 'edit') {
      if (
        validateTagName(msg, args[1]) &&
        validateTagDescription(msg, args[2])
      ) {
        const tagName = args[1];
        const tagDesc = args.slice(2).join(' ');
        //Calling edittag
        edittag(msg, tagName, tagDesc);
      }
    } else if (tagAction === 'info') {
      if (validateTagName(msg, args[1])) {
        const tagName = args[1];
        taginfo(msg, tagName);
      }
    } else if (tagAction === 'remove') {
      if (validateTagName(msg, args[1])) {
        const tagName = args[1];
        removetag(msg, tagName);
      }
    } else if (tagAction === 'list') {
      taglist(msg, client);
    } else {
      return msg.channel.send(`Tag action not found!, ${msg.author}!`);
    }
  },
};

async function addtag(msg, name, desc) {
  const tagName = name;
  const tagDescription = desc;

  const tag = await Tags.findOne({
    where: { name: tagName, guildId: msg.guild.id },
  });
  if (!tag) {
    try {
      // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
      const tag = await Tags.create({
        name: tagName,
        description: tagDescription,
        username: msg.author.username,
        guildId: msg.guild.id,
      });
      return msg.reply(`Tag ${tag.name} added.`);
    } catch (e) {
      console.log('Something went wrong with adding a tag.');
      console.log(e);
      return msg.reply('Something went wrong with adding a tag.');
    }
  } else {
    return msg.reply(
      'That tag already exists. Please provide another tag name!'
    );
  }
}

async function edittag(msg, tagName, tagDescription) {
  // equivalent to: UPDATE tags (description) values (?) WHERE name='?';
  const affectedRows = await Tags.update(
    { description: tagDescription },
    { where: { name: tagName, guildId: msg.guild.id } }
  );
  if (affectedRows > 0) {
    return msg.reply(`Tag ${tagName} was edited.`);
  }
  return msg.reply(`Could not find a tag with name ${tagName}.`);
}

async function taginfo(msg, tagName) {
  // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
  const tag = await Tags.findOne({
    where: { name: tagName, guildId: msg.guild.id },
  });
  if (tag) {
    const d = new Date(tag.createdAt);
    date =
      d.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }) +
      ', ' +
      d.toDateString();

    if (is_url(tag.description)) {
      const embed = new Discord.MessageEmbed()
        .setColor(0x3ba3ee)
        .setTitle(`${tagName}`)
        .setThumbnail(`${tag.description}`)
        .addFields(
          { name: 'Author', value: `Created by ${tag.username}`, inline: true },
          {
            name: 'Use Count',
            value: `${tag.usage_count} times.`,
            inline: true,
          }
        )
        .setFooter(`Created at ${date}`);
      return msg.channel.send(embed);
    } else {
      const embed = new Discord.MessageEmbed()
        .setColor(0x3ba3ee)
        .setTitle(`${tagName}`)
        .addFields(
          { name: 'Description', value: `${tag.description}` },
          { name: '\u200B', value: '\u200B' },
          { name: 'Author', value: `Created by ${tag.username}`, inline: true },
          {
            name: 'Use Count',
            value: `${tag.usage_count} times.`,
            inline: true,
          }
        )
        .setFooter(`Created at ${date}`);
      return msg.channel.send(embed);
    }
  }
  return msg.reply(`Could not find tag: ${tagName}`);
}

async function removetag(msg, tagName) {
  // equivalent to: DELETE from tags WHERE name = ?;
  const rowCount = await Tags.destroy({
    where: { name: tagName, guildId: msg.guild.id },
  });
  if (!rowCount) return message.reply('That tag did not exist.');

  return msg.reply('Tag deleted.');
}

async function taglist(msg, client) {
  // equivalent to: SELECT name FROM tags;
  const tagList = await Tags.findAll({
    attributes: ['name'],
    where: { guildId: msg.guild.id },
  });
  const tagString = tagList.map((t) => t.name).join('\n') || 'No tags set.';

  const embed = new Discord.MessageEmbed()
    .setColor(0x3ba3ee)
    .setTitle('Tags List')
    .setDescription(`${tagString}`)
    .setTimestamp()
    .setFooter(client.user.username, client.user.displayAvatarURL());

  msg.channel.send(`${msg.author} here is the tags list: `);
  return msg.channel.send(embed);
}

function validateTagName(msg, tagName) {
  if (!tagName) {
    msg.channel.send(`You didn't provide tag name, ${msg.author}!`);
    return false;
  }
  return true;
}

function validateTagDescription(msg, tagDescription) {
  if (!tagDescription) {
    msg.channel.send(`You didn't provide tag description, ${msg.author}!`);
    return false;
  }
  return true;
}

function is_url(str) {
  regexp =
    /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  if (regexp.test(str)) {
    return true;
  } else {
    return false;
  }
}
