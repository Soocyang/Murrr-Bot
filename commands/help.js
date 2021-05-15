const Discord = require('discord.js');

module.exports = {
  name: 'help',
  description: 'HELP!',
  async execute(msg, client) {
    const devID = '380295136774586369';
    const user = client.users.cache.find((user) => user.id === devID);
    const embed = new Discord.MessageEmbed()
      .setColor(0x3ba3ee)
      .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
        'Need help? Here it is.\n\n' +
          '**Commands**\n\n' +
          '**:headphones: Musics :musical_note:**\n' +
          '`~p or ~play [song name] or [url]` to **Add** song or queue \n' +
          '`~q or ~queue` to view the song list/ Song **Queue**\n' +
          '`~remove/delete [index/number]` to **Remove** the song\n' +
          '`~skip` to **Skip** current track \n' +
          '`~loop` to **Loop** current track \n' +
          '`~loopoff` to **Stop Looping** current track \n' +
          '`~dis/disconnect/leave` to **Disconect** bot\n' +
          '`~pause/resume` to **Pause** or **Resume** current track\n\n' +
          '**:label: Tags** (Not stable)\n' +
          '`~tag add [name] [description]` to **Add** tag \n' +
          '`~tag edit [name] [description]` to **Edit** tag \n' +
          '`~tag info [name]` to **Show** tag **info** \n' +
          '`~tag remove [name]` to **Remove** tag \n' +
          '`~tag list` to **show all** tags list\n\n' +
          '**:sparkles: Extras**\n' +
          '`~cat` to summon random cats :smile_cat:'
      )
      .setFooter(`By ${user.username}`, `${user.displayAvatarURL()}`);
    msg.channel.send(embed);
  },
};
