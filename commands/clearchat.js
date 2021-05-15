const Discord = require('discord.js');

module.exports = {
  name: 'clearchat',
  description: 'Clear chat',
  execute(msg, numbers) {
    msg.channel
      .bulkDelete(numbers[0])
      .then((msg) => console.log(`Bulk deleted ${msg.size} messages`))
      .catch(console.error);
  },
};
