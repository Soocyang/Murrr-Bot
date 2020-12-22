const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

module.exports = {
    name: 'play',
    description: 'Joins and play a video from youtube',
    async execute(msg, args){
        //Validaion checking
        const voiceChannel = msg.member.voice.channel;
        if(!voiceChannel) return msg.channel.send('You need to be in a voice channel to execute this command!');
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if(!permissions.has('CONNECT')) return msg.channel.send('You dont have correct permissions!');
        if(!permissions.has('SPEAK')) return msg.channel.send('You dont have correct permissions!');
        if(!args.length) return msg.channel.send('You didnt provide any search keywords');

        const vidUrl = args[0];
        if(is_url(vidUrl)){

            try{
                const connection = await voiceChannel.join();
                const stream = ytdl(vidUrl, {filter: 'audioonly'});
    
                connection.play(stream, {seek: 0, volumn: 1})
                .on('finish', () => {
                    voiceChannel.leave();
                    msg.channel.send('Murrr has leave the channel :C');
                })
    
                await msg.reply(`:thumbsup: Now Playing ***Your Link***`);
            }
            catch(e){
                msg.reply(`Not a valid video link`);
            }
            return
        }

        //Connect to voice channel
        const connection = await voiceChannel.join();

        const videoFinder = async (query) => {
            const vidResult = await ytSearch(query);
            return (vidResult.videos.length > 1) ? vidResult.videos[0] : null;
        }

        const video = await videoFinder(args.join(' '));

        if(video){
            const stream = ytdl(video.url, {filter: 'audioonly'});
            connection.play(stream, {seek: 0, volumn: 1})
            .on('finish', () => {
                voiceChannel.leave();
            })

            await msg.reply(`:musical_note: Now Playing ***${video.title}***`)
        }
        else{
            msg.reply('No results found');
        }

    }
}

function is_url(str)
{
  regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  if (regexp.test(str))
  {
    return true;
  }
  else
  {
    return false;
  }
}