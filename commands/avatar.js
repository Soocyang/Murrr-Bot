const Discord = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'User Avatar',
  execute(msg, args) {
    const user = msg.mentions.users.first();
    if (user == null) return;
    const embed = new Discord.MessageEmbed()
      .setAuthor(user.username)
      .setColor(0x3ba3ee)
      .setThumbnail(user.displayAvatarURL());
    msg.channel.send(embed);
  },
};
