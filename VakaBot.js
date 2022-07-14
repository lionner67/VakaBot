const discord = require(`discord.js`);
const client = new discord.Client();
const fs = require(`fs`);
const ytdl = require(`ytdl-core`);
const ytsr = require(`ytsr`);
const lyricsFinder = require(`lyrics-finder`);
const queue = new Map();
const twitchAPI = require(`node-twitch`).default;
const ytNotifier = require(`youtube-notification-module`);
const notifier = new ytNotifier({
    channels: [`UCYP2wRPOrRv6h2zX7OiCIbA`],
    checkInterval: 30,
});
const BDD = require(`./BDD.json`);
const prefix = `!`;
const twitch = new twitchAPI({
    client_secret: `dkuey0t6mqwnrfa7zje0hj4erg5byn`,
    client_id: `dligvbv3oosiq1fpcapfbrmf3op9ih`,
});

let isGiveawayRunning = false;
let streamAnnouncement = false;

client.on(`ready`, () =>
{
    console.log(`Bot ready!`);
    client.user.setStatus(`online`);
    client.user.setActivity(`Vakarian!`, {type: `WATCHING`, url: `https://www.twitch.tv/tdw_vakarian`});
});


notifier.on(`video`, video =>
{
    let channelName = video.channelName;
    let title = video.title;
    let url = video.url;
    let embed = new discord.MessageEmbed()
    .setTitle(`**YOUTUBE NOTIF**`)
    .setAuthor(channelName)
    .setColor(`#FFE000`)
    .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676989307387924/3.png`)
    .setDescription(`Vakarian a publié une nouvelle vidéo!`)
    .addField(`Titre:`, title)
    .addField(`Lien:`, url)
    .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
    .setTimestamp();

    client.channels.cache.get(`958103235825123431`).send(`@everyone`);
    client.channels.cache.get(`958103235825123431`).send(embed);
});


client.on(`message`, async message =>
{
    const serverQueue = queue.get(message.guild.id);

    if(message.author.bot)
    {
        return;
    }

    let streams = await twitch.getStreams({ channel: `TDW_Vakarian` });
    BDD[`stream`] = streams;
    saveBDD();
    let stream = BDD[`stream`][`data`][0];
    
    if(!stream)
    {
        streamAnnouncement = false;
    }

    if((!streamAnnouncement) && (stream) && (stream.type == `live`))
    {
        client.channels.cache.get(`958103235825123431`).send(`Oui`);
        client.user.setActivity(`Vakarian est en stream! Viens le rejoindre!`, { type: `STREAMING`, url: `https://www.twitch.tv/tdw_vakarian` });
        streamAnnouncement = true;
    }

    if((message.mentions.users.get(`957724516736450671`)) || (message.content.startsWith(`${prefix}help`)))
    {
        let embed = new discord.MessageEmbed()
        .setTitle(`**AIDE**`)
        .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
        .setColor(`#FFE400`)
        .setThumbnail(client.user.displayAvatarURL({ format: `png`, dynamic: true }))
        .setDescription(`Je suis VakaBot! Le bot officiel de Vakarian! Mon prefix est ${prefix}`)
        .addField(`Réseaux & autre`, `Avoir les différents réseaux sociaux de Vakarian`)
        .addField(`${prefix}twitch:\n`, BDD[`commandsDescriptions`][`twitch`], true)
        .addField(`${prefix}youtube\n`, BDD[`commandsDescriptions`][`youtube`], true)
        .addField(`${prefix}instagram`, BDD[`commandsDescriptions`][`instagram`], true)
        .addField(`${prefix}boutique`, BDD[`commandsDescriptions`][`boutique`], true)
        .addField(`${prefix}giveaway`, BDD[`commandsDescriptions`][`giveaway`], true)
        .addField(`Musique`, `Jouer de la musique dans ton channel vocal`)
        .addField(`${prefix}play`, BDD[`commandsDescriptions`][`play`], true)
        .addField(`${prefix}stop`, BDD[`commandsDescriptions`][`stop`], true)
        .addField(`${prefix}skip`, BDD[`commandsDescriptions`][`skip`], true)
        .addField(`${prefix}pause`, BDD[`commandsDescriptions`][`pause`], true)
        .addField(`${prefix}resume`, BDD[`commandsDescriptions`][`resume`], true)
        .addField(`${prefix}loop`, BDD[`commandsDescriptions`][`loop`], true)
        .addField(`${prefix}queue`, BDD[`commandsDescriptions`][`queue`], true)
        .addField(`${prefix}lyrics`, BDD[`commandsDescriptions`][`lyrics`], true)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        message.channel.send(embed);
    }

    if(message.content.startsWith(`${prefix}twitch`))
    {
        let embed = new discord.MessageEmbed()
        .setTitle(`**TWITCH**`)
        .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
        .setColor(`#FF1B00`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676990339198996/6.png`)
        .setDescription(streamAnnouncement ? `Vakarian est actuellement entrain de streamer sur ${BDD[`stream`][`data`][0].game_name}! N'hésite pas à le rejoindre! https://www.twitch.tv/tdw_vakarian` : `Actuellement Vakarian ne stream pas mais n'hésite pas à follow! https://www.twitch.tv/tdw_vakarian`)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        message.channel.send(embed);
    }

    if(message.content.startsWith(`${prefix}youtube`))
    {
        let embed = new discord.MessageEmbed()
        .setTitle(`**YOUTUBE**`)
        .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
        .setColor(`#00E8FF`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676988904751115/1.png`)
        .setDescription(`Voilà la chaîne! N'hésite pas à t'abonner! https://www.youtube.com/channel/UCYP2wRPOrRv6h2zX7OiCIbA`)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        message.channel.send(embed);
    }

    if(message.content.startsWith(`${prefix}instagram`))
    {
        let embed = new discord.MessageEmbed()
        .setTitle(`**INSTAGRAM**`)
        .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
        .setColor(`#C100FF`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676990771204106/7.png`)
        .setDescription(`Voilà l'instagram de Vakarian! N'hésite pas à te follow! https://www.instagram.com/tdw_vakarian/`)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        message.channel.send(embed);
    }

    if(message.content.startsWith(`${prefix}boutique`))
    {
        let embed = new discord.MessageEmbed()
        .setTitle(`**BOUTIQUE**`)
        .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
        .setColor(`#00FF36`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676989307387924/3.png`)
        .setDescription(`Voilà la boutique officielle de Vakarian! https://utip.io/vakarian/shop`)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        message.channel.send(embed);
    }
    
    if(message.content.startsWith(`${prefix}giveaway`))
    {
        if(!message.member.hasPermission(`ADMINISTRATOR`))
        {
            return message.channel.send(`Vous n'avez pas la permission d'effectuer cette commande!`);
        }

        if(isGiveawayRunning)
        {
            return message.channel.send(`Un giveaway est déjà en cours!`);
        }

        let args = message.content.split(` `);
        let timeGiveaway = args[1] * 100000;
        if(!timeGiveaway)
        {
            return message.channel.send(`Vous n'avez pas indiquer le temps du giveaway!`);
        }
        else if(isNaN(timeGiveaway))
        {
            return message.channel.send(`Vous n'avez pas mis de nombre!`);
        }

        let winnerNumber = args[2];
        if(!winnerNumber)
        {
            return message.channel.send(`Vous n'avez pas indiquer de nombre de gagnant!`);
        }
        else if(isNaN(winnerNumber))
        {
            return message.channel.send(`Vous n'avez pas mis de nombre!`);
        }
        
        let descriptionGiveaway = args.splice(3).join(` `);
        if(!descriptionGiveaway)
        {
            return message.channel.send(`Vous n'avez pas indiquer une description pour le giveaway!`);
        }

        let embedGiveaway = new discord.MessageEmbed()
        .setAuthor(message.member.displayName, message.author.displayAvatarURL({format: `png`, dynamic: true}))
        .setColor(`#FFEC00`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676990771204106/7.png`)
        .setDescription(`${descriptionGiveaway}\nGagnants: ${winnerNumber}`)
        .setFooter(`Temps: ${args[2]}min`)
        .setTimestamp();
        message.channel.send(embedGiveaway).then(message =>
            {
                message.react(`✅`);
                isGiveawayRunning = true;
                BDD[`giveawayID`] = message.id;
                saveBDD();
            }).catch(err =>
                {
                    return message.channel.send(`Impossible à envoyer le message!\nPlus d'infos: ${err}`);
                });
        message.delete();
        setTimeout(function()
        {
            for(var i = 0; i < winnerNumber; i++)
            {
                let randomNumber = Math.floor(Math.random() * Math.floor(BDD[`giveawayMember`].length));
                let winnerBDD = BDD[`giveawayMember`][randomNumber];
                if(!winnerBDD)
                {
                    return message.channel.send(`Il n'y a pas de gagnant ou d'autre gagnant!`);
                }

                let winnerUser = client.users.cache.get(winnerBDD);
                winnerUser.send(`Bravo ! Tu viens de gagner le giveaway!`).catch(() =>
                {
                    return;
                });

                let embed = new discord.MessageEmbed()
                .setTitle(`**GIVEAWAY**`)
                .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
                .setColor(`#FF1B00`)
                .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676990339198996/6.png`)
                .setDescription(`Bravo à <@${winnerUser.id}> pour avoir gagné le giveaway!`)
                .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
                .setTimestamp();

                message.channel.send(embed);
                BDD[`giveawayMember`].splice(randomNumber, 1);
                saveBDD();
            }

            BDD[`giveawayID`] = ``;
            saveBDD();
            BDD[`giveawayMember`] = [];
            saveBDD();
            isGiveawayRunning = false;
        }, timeGiveaway);
    }

    if(message.content.startsWith(`${prefix}play`))
    {
        let args = message.content.split(` `);

        execute(message, serverQueue, args);
    }

    if(message.content.startsWith(`${prefix}stop`))
    {
        stop(message, serverQueue);
    }

    if(message.content.startsWith(`${prefix}skip`))
    {
        skip(message, serverQueue);
    }

    if(message.content.startsWith(`${prefix}pause`))
    {
        pause(serverQueue, message);
    }

    if(message.content.startsWith(`${prefix}resume`))
    {
        resume(serverQueue, message);
    }

    if(message.content.startsWith(`${prefix}loop`))
    {
        let args = message.content.split(` `);
        if(!args[1])
        {
            return message.channel.send(`Veuillez spécifier quelle répétition vous voulez: ${prefix}loop musique/queue/off`);
        }

        loop(args, serverQueue, message);
    }

    if(message.content.startsWith(`${prefix}queue`))
    {
        musicQueue(serverQueue, message);
    }

    if(message.content.startsWith(`${prefix}lyrics`))
    {
        let args = message.content.split(` `);
        let artiste = ``;
        let songName = ``;
        let pages = [];
        let currentPage = 0;
        let messageFilter = m => m.author.id == message.author.id;
        let reactionFilter = (reaction, user) => [`⬅️`, `➡️`].includes(reaction.emoji.name) && (message.author.id == user.id);

        if((serverQueue) && (serverQueue.connection) && (args.length < 2))
        {
            artiste = serverQueue.songs[0].author;
            songName = serverQueue.songs[0].title;

            await lyrics(artiste, songName, message, pages);

            let lyricEmbed = await message.channel.send(`Pages: ${currentPage + 1} / ${pages.length}`, pages[currentPage]);
        
            await lyricEmbed.react(`⬅️`);
            await lyricEmbed.react(`➡️`);

            let collector = lyricEmbed.createReactionCollector(reactionFilter);

            collector.on(`collect`, (reaction, user) => 
            {
                if(reaction.emoji.name == `➡️`)
                {
                    if(currentPage < pages.length - 1)
                    {
                        currentPage += 1;
                        lyricEmbed.edit(`Pages: ${currentPage + 1} / ${pages.length}`, pages[currentPage]);
                        message.reactions.resolve(reaction).users.remove(user);
                    }
                }
                else if(reaction.emoji.name == `⬅️`)
                {
                    if(currentPage !== 0)
                    {
                        currentPage -= 1;
                        lyricEmbed.edit(`Pages: ${currentPage + 1} / ${pages.length}`, pages[currentPage]);
                        message.reactions.resolve(reaction).remove(user);
                    }
                }
            });
        }
        else
        {
            if(args.length < 2)
            {
                return message.channel.send(`Veuillez réessayer en mettant le nom de l'artiste!\n${prefix}lyrics {nom de l'artiste}`);
            }

            artiste = args.splice(1).join(` `);

            message.channel.send(`Veuillez entrer le titre de la musique maintenant`);

            await message.channel.awaitMessages(messageFilter, { max: 1, time: 20000 }).then(async collected =>
                {
                    songName = collected.first().content;
                    await lyrics(artiste, songName, message, pages);
                }).catch(err =>
                    {
                        return message.channel.send(`Une erreur est survenue! Plus d'infos: ${err}`);
                    });
        
            let lyricEmbed = await message.channel.send(`Pages: ${currentPage + 1} / ${pages.length}`, pages[currentPage]);
        
            await lyricEmbed.react(`⬅️`);
            await lyricEmbed.react(`➡️`);

            let collector = lyricEmbed.createReactionCollector(reactionFilter);

            collector.on(`collect`, (reaction, user) => 
            {
                if(reaction.emoji.name == `➡️`)
                {
                    if(currentPage < pages.length - 1)
                    {
                        currentPage += 1;
                        lyricEmbed.edit(`Pages: ${currentPage + 1} / ${pages.length}`, pages[currentPage]);
                        message.reactions.resolve(reaction).users.remove(user);
                    }
                }
                else if(reaction.emoji.name == `⬅️`)
                {
                    if(currentPage !== 0)
                    {
                        currentPage -= 1;
                        lyricEmbed.edit(`Pages: ${currentPage + 1} / ${pages.length}`, pages[currentPage]);
                        message.reactions.resolve(reaction).remove(user);
                    }
                }
            });
        }
    }

    if(message.content.startsWith(`${prefix}save-music`))
    {
        let args = message.content.split(` `);

        saveMusic(serverQueue, message, args);
    }

    if(message.content.startsWith(`${prefix}save-play`))
    {
        let loopMusic = false;
        let args = message.content.split(` `);

        if((args[1]) && (args[1].startsWith(`musique`)))
        {
            loopMusic = true;
        }

        savePlay(message, loopMusic);
    }
});

client.on(`messageReactionAdd`, (reaction, member) =>
{
    if((reaction.emoji.name == `✅`) && (reaction.message.id == BDD[`giveawayID`]) && (isGiveawayRunning))
    {
        if(member.id == client.user.id)
        {
            return;
        }

        BDD[`giveawayMember`].push(member.id);
        saveBDD();
        member.send(`Tu participes au giveaway ! Bonne chance !`).catch(() =>
        {
            return;
        });
    }
});

client.on(`messageReactionRemove`, (reaction, member) =>
{
    if((reaction.emoji.name == `✅`) && (reaction.message.id == BDD[`giveawayID`]) && (isGiveawayRunning))
    {
        if(member.id == client.user.id)
        {
            return;
        }

        let getIndex = BDD[`giveawayMember`].indexOf(member.id);
        if(getIndex > -1)
        {
            BDD[`giveawayMember`].splice(getIndex, 1);
            saveBDD();
            member.send(`Tu ne participes plus au giveaway !`);
        }
    }
});

client.on(`presenceUpdate`, async () =>
{
    let streams = await twitch.getStreams({ channel: `TDW_Vakarian` });
    BDD[`stream`] = streams;
    saveBDD();
    let stream = BDD[`stream`][`data`][0];
    
    if(!stream)
    {
        streamAnnouncement = false;
    }

    if((!streamAnnouncement) && (stream) && (stream.type == `live`))
    {
        client.channels.cache.get(`958103235825123431`).send(`Oui`);
        client.user.setActivity(`Vakarian est en stream! Viens le rejoindre!`, { type: `STREAMING`, url: `https://www.twitch.tv/tdw_vakarian` });
        streamAnnouncement = true;
    }
});

function saveBDD()
{
    fs.writeFile(`./BDD.json`, JSON.stringify(BDD, null, 4), (err) => 
    {
        if(err)
        {
            console.log(`Problème avec la fonction de la base de donnée ! ${err}`);
        }
    });
}

async function execute(message, serverQueue, args)
{
    let vc = message.member.voice.channel;
    if(!vc)
    {
        return message.channel.send(`Veuillez rejoindre un chat vocal!`);
    }

    let query = args.splice(1).join(` `);
    let res = await ytsr(query).catch(() =>
    {
        message.channel.send(`Pas de résultat!`);
    });
    let video = res.items.filter(i => i.type == `video`)[0];

    let song = {
        author: video.author.name,
        title: video.title,
        image: video.bestThumbnail.url,
        views: video.views.toLocaleString(),
        duration: video.duration,
        url: video.url
    };

    if(!serverQueue)
    {
        const queueConstructor = {
            txtChannel: message.channel,
            vChannel: vc,
            connection: null,
            songs: [],
            volume: 10,
            playing: true,
            loopone: false,
            loopall: false
        };

        queue.set(message.guild.id, queueConstructor);
        queueConstructor.songs.push(song);

        try
        {
            let connection = await vc.join();
            queueConstructor.connection = connection;
            playMusic(message.guild, queueConstructor.songs[0], message);
        }
        catch(err)
        {
            queue.delete(message.guild.id);
            return message.channel.send(`Une erreur est survenue! Plus d'infos: ${err}`);
        }
    }
    else
    {
        serverQueue.songs.push(song);

        let embed = new discord.MessageEmbed()
        .setTitle(`**MUSIQUE**`)
        .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
        .setColor(`#FF00D8`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676990339198996/6.png`)
        .setImage(song.image)
        .setDescription(`La musique a bien été ajoutée!`)
        .addField(`Auteur`, song.author)
        .addField(`Titre`, song.title)
        .addField(`Vues`, song.views, true)
        .addField(`Durée`, song.duration, true)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        return message.channel.send(embed);
    }
}

function playMusic(guild, song, message)
{
    let serverQueue = queue.get(guild.id);
    if(!song)
    {
        serverQueue.vChannel.leave();
        queue.delete(guild.id);
        return;
    }

    let dispatcher = serverQueue.connection.play(ytdl(song.url, { quality: `highestaudio`, highWaterMark: 1 << 25 }));

    dispatcher.on(`finish`, () =>
    {
        if(serverQueue.loopone)
        {
            return playMusic(guild, serverQueue.songs[0], message);
        }
        else if(serverQueue.loopall)
        {
            serverQueue.songs.push(serverQueue.songs[0]);
            serverQueue.songs.shift();
        }
        else
        {
            serverQueue.songs.shift();
        }

        playMusic(guild, serverQueue.songs[0], message);
    });

    let embed = new discord.MessageEmbed()
    .setTitle(`**MUSIQUE**`)
    .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
    .setColor(`#FF00D8`)
    .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676989307387924/3.png`)
    .setImage(song.image)
    .addField(`Auteur`, song.author)
    .addField(`Titre`, song.title)
    .addField(`Vues`, song.views, true)
    .addField(`Durée`, song.duration, true)
    .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
    .setTimestamp();

    serverQueue.txtChannel.send(embed);
}

function stop(message, serverQueue)
{
    if(!message.member.voice.channel)
    {
        return message.channel.send(`Veuillez rejoindre un chat vocal!`);
    }

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function skip(message, serverQueue)
{
    if(!message.member.voice.channel)
    {
        return message.channel.send(`Veuillez rejoindre un chat vocal!`);
    }

    if(!serverQueue)
    {
        return message.channel.send(`Il n'y a pas de musique à passer!`);
    }

    serverQueue.connection.dispatcher.end();
}

function pause(serverQueue, message)
{
    if(!serverQueue.connection)
    {
        return message.channel.send(`Il n'y a pas de musique en cours!`);
    }

    if(!message.member.voice.channel)
    {
        return message.channel.send(`Veuillez rejoindre un chat vocal!`);
    }

    if(serverQueue.connection.dispatcher.paused)
    {
        return message.channel.send(`La musique est déjà en pause!`);
    }

    serverQueue.connection.dispatcher.pause();
    message.channel.send(`La musique a été mis en pause!`);
}

function resume(serverQueue, message)
{
    if(!serverQueue.connection)
    {
        return message.channel.send(`Il n'y a pas de musique en cours!`);
    }

    if(!message.member.voice.channel)
    {
        return message.channel.send(`Veuillez rejoindre un chat vocal!`);
    }

    if(serverQueue.connection.dispatcher.resumed)
    {
        return message.channel.send(`La musique est déjà en cours!`);
    }

    console.log(serverQueue.connection.dispatcher);

    serverQueue.connection.dispatcher.resume();
    message.channel.send(`La musique a repris!`);
}

function loop(args, serverQueue, message)
{
    switch(args[1].toLowerCase())
    {
        case `queue`:

            serverQueue.loopall = !serverQueue.loopall;
            serverQueue.loopone = false;

            if(serverQueue.loopall == true)
            {
                message.channel.send(`La répétition de la queue a été activée!`);
            }
            else
            {
                message.channel.send(`La répétition de la queue a été désactivée!`);
            }

            break;
        
        case `musique`:

            serverQueue.loopone = !serverQueue.loopone;
            serverQueue.loopall = false;

            if(serverQueue.loopone == true)
            {
                message.channel.send(`La répétition de la musique a été activée!`);
            }
            else
            {
                message.channel.send(`La répétition de la musique a été désactivée!`);
            }

            break;
        
        case `off`:

            serverQueue.loopone = false;
            serverQueue.loopall = false;

            message.channel.send(`La répétition a été désactivée!`);

            break;
    }
}

function musicQueue(serverQueue, message)
{
    if(!serverQueue.connection)
    {
        return message.channel.send(`Il n'y a pas de musique en cours!`);
    }

    if(!message.member.voice.channel)
    {
        return message.channel.send(`Veuillez vous connecter dans un chat vocal!`);
    }

    let nowPlaying = serverQueue.songs[0];
    let qMsg = `Musique: ${nowPlaying.title}\n------------------------\n`;

    for(var i = 1; i < serverQueue.songs.length; i++)
    {
        qMsg += `${i}) ${serverQueue.songs[i].title}\n`;
    }

    let embed = new discord.MessageEmbed()
    .setTitle(`**QUEUE**`)
    .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
    .setColor(`#8700FF`)
    .setThumbnail(`https://static-cdn.jtvnw.net/jtv_user_pictures/a3b4762e-93d4-4678-8328-4c050bbc8d4e-profile_image-150x150.png`)
    .setDescription(qMsg)
    .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
    .setTimestamp();

    message.channel.send(embed).catch(err =>
        {
            return message.channel.send(`Une erreur est survenue! Plus d'infos: ${err}`);
        });
}

async function lyrics(artiste, songName, message, pages)
{
    let fullLyrics = await lyricsFinder(artiste, songName) || `Pas trouvé!`;
    for(let i = 0; i < fullLyrics.length; i += 2048)
    {
        let lyric = fullLyrics.substring(i, Math.min(fullLyrics.length, i + 2048));
        let embed = new discord.MessageEmbed()
        .setTitle(`**LYRICS**`)
        .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
        .setColor(`#FF2E00`)
        .setThumbnail(`https://static-cdn.jtvnw.net/jtv_user_pictures/a3b4762e-93d4-4678-8328-4c050bbc8d4e-profile_image-150x150.png`)
        .setDescription(lyric)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        pages.push(embed);
    }
}

async function saveMusic(serverQueue, message, args)
{
    if(args.length < 2)
    {
        if(!serverQueue)
        {
            return message.channel.send(`Veuillez entrer le nom de l'artiste ainsi que le titre de la musique afin de la sauvegarder`);
        }
        else
        {
            BDD[`savedMusic`][message.member.id] = serverQueue.songs[0];
            saveBDD();

            let embed = new discord.MessageEmbed()
            .setTitle(`**MUSIQUE SAUVEGARDÉE**`)
            .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
            .setColor(`#46E237`)
            .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676990771204106/7.png`)
            .setImage(serverQueue.songs[0].image)
            .addField(`Auteur`, serverQueue.songs[0].author)
            .addField(`Titre`, serverQueue.songs[0].title)
            .addField(`Vues`, serverQueue.songs[0].views, true)
            .addField(`Durée`, serverQueue.songs[0].duration, true)
            .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
            .setTimestamp();
    
            message.channel.send(embed);
        }
    }
    else
    {
        let argsMusic = args.splice(1).join(` `);
        let res = await ytsr(argsMusic);
        let video = res.items.filter(i => i.type == `video`)[0];

        BDD[`savedMusic`][message.member.id] = video;
        saveBDD();

        let embed = new discord.MessageEmbed()
        .setTitle(`**MUSIQUE SAUVEGARDÉE**`)
        .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
        .setColor(`#7400FF`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676990771204106/7.png`)
        .setImage(video.bestThumbnail.url)
        .addField(`Auteur`, video.author.name)
        .addField(`Titre`, video.title)
        .addField(`Vues`, video.views.toLocaleString(), true)
        .addField(`Durée`, video.duration, true)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        message.channel.send(embed);
    }
}

async function savePlay(message, loopMusic)
{
    let vc = message.member.voice.channel;

    if(!vc)
    {
        return message.channel.send(`Vous n'êtes pas dans un salon vocal!`);
    }

    let connection = await vc.join();
    let dispatcher = connection.play(ytdl(BDD[`savedMusic`][message.member.id].url, { quality: `highestaudio`, highWaterMark: 1 << 25 }));

    dispatcher.on(`finish`, () =>
    {
        if(loopMusic)
        {
            savePlay(message, connection, loopMusic);
        }
        else
        {
            vc.leave();
            dispatcher.destroy();
        }
    });
}

client.login(process.env.TOKEN);