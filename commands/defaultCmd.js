const Discord = require('discord.js');

module.exports = {
  name: 'defaultCmd',
  description: 'default command for murrr memes',
  execute(msg) {
    if (msg.content === 'murrr') {
      const attachment = new Discord.MessageAttachment(
        './resource/memes/murrr.png'
      );
      msg.channel.send(attachment);
    } else if (msg.content === 'shock') {
      const attachment = new Discord.MessageAttachment(
        './resource/memes/mur_shock.jpg'
      );
      msg.channel.send(attachment);
    } else if (msg.content === 'noted') {
      const attachment = new Discord.MessageAttachment(
        './resource/memes/mur_yessir.jpg'
      );
      msg.channel.send(attachment);
    } else if (msg.content === 'lc') {
      const attachment = new Discord.MessageAttachment(
        './resource/memes/mur_lc.jpg'
      );
      msg.channel.send(attachment);
    } else if (msg.content === 'sadED') {
      const attachment = new Discord.MessageAttachment(
        './resource/memes/mur_heartbreak.jpg'
      );
      msg.channel.send(attachment);
    } else if (msg.content === 'omg') {
      const attachment = new Discord.MessageAttachment(
        './resource/memes/mur_omg.jpg'
      );
      msg.channel.send(attachment);
    } else if (msg.content === 'headache') {
      const attachment = new Discord.MessageAttachment(
        './resource/memes/mur_headache.jpg'
      );
      msg.channel.send(attachment);
    } else if (msg.content === 'roll') {
      const attachment = new Discord.MessageAttachment(
        './resource/memes/mur_rollaway.jpg'
      );
      msg.channel.send(attachment);
    } else if (msg.content === '忍') {
      const attachment = new Discord.MessageAttachment(
        './resource/memes/mur_tolerate.jpg'
      );
      msg.channel.send(attachment);
    } else if (msg.content === 'noice') {
      const attachment = new Discord.MessageAttachment(
        './resource/memes/mur_noice.jpg'
      );
      msg.channel.send(attachment);
    } else {
      return;
    }
  },
};
