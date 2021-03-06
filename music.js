const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const randomColor = require('randomcolor');
const Discord = require('discord.js');

const PREFIX = '~'
// Testing Music Bot
let connection;
let dispatcher;
let nowPlayingEmbed = 0;
let isPlaying = 0;
let songQueue = [];
let loopFlag = 0;
const streamOptions = {
    seek: 0,
    volumn: 0.25,
    highWaterMark: 1
}


module.exports = {
    name: 'music_bot',
    description: 'this is a music bot',
    async execute(client) {

        client.on('message', async msg => {
            if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;
            const args = msg.content.slice(PREFIX.length).trim().split(' ');
            const command = args.shift().toLowerCase();

            if (command === 'play' || command === 'p') {

                const searchKeysUrl = args.join(' ');
                if (searchKeysUrl == '') return msg.reply('You need to provide a search key or youtube url');
                const voiceChannel = msg.member.voice.channel;
                if (!voiceChannel) return msg.reply('You need to be in a voice channel to execute this command!');

                connection = await voiceChannel.join();

                if (ytdl.validateURL(searchKeysUrl)) {
                    addSongtoQueue(searchKeysUrl, msg, connection, voiceChannel);
                }
                else {
                    //If not a valid url then use ytsearch for the clip
                    const videoFinder = async (query) => {
                        const vidResult = await ytSearch(query);
                        return (vidResult.videos.length > 1) ? vidResult.videos[0] : null;
                    }

                    const video = await videoFinder(args.join(' '));
                    if (video) {
                        addSongtoQueue(video.url, msg, connection, voiceChannel);
                    }
                }
            }
            else if (command === 'queue' || command === 'q') {

                const voiceChannel = msg.member.voice.channel;
                if (!voiceChannel) return msg.channel.send('You need to be in a voice channel to execute this command!');
                if (songQueue.length == 0) return msg.channel.send('The song queue is currently empty');

                let currentlyPlaying = '[' + songQueue[0].title + '](' + songQueue[0].url + ')\n' +
                    '⌚ \`' + songQueue[0].duration + '\` ' +
                    ' : \`[' + songQueue[0].username + ']\`';
                let totalTime = Number(songQueue[0].length);

                if (loopFlag == 1) {
                    currentlyPlaying += ' - 🔂Looping ';
                }

                let upNext = '';
                if (songQueue[1] != undefined) upNext += '**Up Next**\n';

                for (var i = 1; i < songQueue.length; i++) {
                    upNext += `\`${i}.\`` + '[' + songQueue[i].title + '](' + songQueue[i].url + ') | ' +
                        ' ⌚ \`' + songQueue[i].duration + '\`' +
                        ' : \`[' + songQueue[i].username + ']\`\n\n';
                    totalTime += Number(songQueue[i].length);
                }

                const totalMinutes = Math.floor(totalTime / 60);
                const totalSeconds = totalTime - totalMinutes * 60;

                totalTime = str_pad_left(totalMinutes, '0', 2) + ':' + str_pad_left(totalSeconds, '0', 2);

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
            else if (command === 'skip') {

                const voiceChannel = msg.member.voice.channel;
                if (!voiceChannel) return msg.reply('You need to be in a voice channel to execute this command!');

                if (songQueue.length === 1) return msg.reply('You are skipping the last song!');

                loopFlag = 0;
                songQueue.shift();

                try {
                    await playSong(msg, connection, voiceChannel);
                    isPlaying = 1;
                    msg.react('⏭️');
                }
                catch (e) {
                    console.log(e);
                }
            }
            else if (command === 'pause') {
                dispatcher.pause();
                msg.react('⏸️');
            }
            else if (command === 'resume') {
                dispatcher.resume();
                msg.react('▶️');
            }
            else if (command === 'loop') {
                loopFlag = 1;
                msg.react('🔂');
            }
            else if (command === 'loopoff') {
                loopFlag = 0;
                msg.react('⏩');
            }
            else if (command === 'remove') {

                const index = parseInt(args[0]);

                if (index == 0) return msg.reply('To remove current song why not use "skip" instead :joy:')
                if (index > songQueue.length - 1) return msg.reply('The number of the song not found!');
                if (!Number.isInteger(index)) return msg.reply('Not a valid number!');

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
            else if (command === 'dis' || command === 'disconnect') {
                const voiceChannel = msg.member.voice.channel;

                if (!voiceChannel) return msg.channel.send('You need to be in a voice channel to stop the music!');
                voiceChannel.leave();
                msg.react('🛑');
                msg.channel.send('Murrr has disconnected :wave:');
                isPlaying = 0;
                loopFlag = 0;
                songQueue = [];

            }

        });

        async function playSong(msg, connection, voiceChannel) {

            //Remove previous Now Playing Embed

            msg.channel.messages.fetch({ around: `${nowPlayingEmbed}`, limit: 1 })
                .then(messages => {
                    messages.first().delete();
                }).catch(error => {
                    if (error.name === "TypeError")
                        console.log(`Bot is playing music in server: ${msg.channel.guild}`);
                    else
                        console.log(error);
                });

            const currentTrack = songQueue[0];
            const stream = ytdl(currentTrack.url, { filter: 'audio', quality: 'highestaudio', highWaterMark: 1 << 25 });

            dispatcher = connection.play(stream, streamOptions);

            const embed = new Discord.MessageEmbed()
                .setColor(randomColor())
                .setTitle('🎵 Now Playing')
                .setDescription(`**[${currentTrack.title}](${currentTrack.url})**`)
                .setThumbnail(currentTrack.thumbail.url)
                .addField('Song duration', `⌚ ${currentTrack.duration}`, true)
                .addField('Channel', `🎤 ${currentTrack.author.name}`, true)
                .setFooter(`Requested by ${currentTrack.username}`, `${currentTrack.userpic}`);


            msg.channel.send(embed).then(sentMessage => {
                nowPlayingEmbed = sentMessage.id;
            });

            //console.log(stream);

            dispatcher.on('finish', () => {

                if (loopFlag == 0) {
                    songQueue.shift();
                    setTimeout(() => {
                        if (songQueue.length == 0) {
                            msg.channel.messages.fetch({ around: `${nowPlayingEmbed}`, limit: 1 })
                                .then(messages => {
                                    messages.first().delete();
                                })
                            msg.channel.send('The queue is empty now! Play some song now!')
                            isPlaying = 0;
                            nowPlayingEmbed = 0;
                        }
                        else {
                            playSong(msg, connection, voiceChannel);
                        }
                    }, 5000)
                } else {
                    playSong(msg, connection, voiceChannel);
                }
            })
        }


        async function addSongtoQueue(url, msg, connection, voiceChannel) {

            //Add song to the queue
            const songDetails = (await ytdl.getBasicInfo(url)).videoDetails;
            const songLength = songDetails.lengthSeconds
            const songMinutes = Math.floor(songLength / 60);
            const songSeconds = songLength - songMinutes * 60;

            const songDuration = str_pad_left(songMinutes, '0', 2) + ':' + str_pad_left(songSeconds, '0', 2);
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
            if (isPlaying) {

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
                try {
                    await playSong(msg, connection, voiceChannel);
                    isPlaying = 1;
                }
                catch (e) {
                    console.log(e);
                }
            }

        }

        function str_pad_left(string, pad, length) {
            return (new Array(length + 1).join(pad) + string).slice(-length);
        }



    }
}