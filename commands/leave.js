
module.exports = {
    name: 'leave',
    description: 'Stop playing and leave channel',
    async execute(msg, args){
        const voiceChannel = msg.member.voice.channel;

        if(!voiceChannel) return msg.channel.send('You need to be in a voice channel to stop the music!');
        await voiceChannel.leave();
        await msg.channel.send('Murrr has leave the channel :C');
    }

}