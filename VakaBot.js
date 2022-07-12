const discord = require(`discord.js`);
const client = new discord.Client();
const fs = require(`fs`);
const ytdl = require(`ytdl-core`);
const ytsr = require(`ytsr`);
const queue = new Map();
const twitchAPI = require(`node-twitch`).default;
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

    if((message.mentions.users.get(`957724516736450671`)) || (message.content.startsWith(`${prefix}aide`)))
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
            playMusic(message.guild, queueConstructor.songs[0], video, message);
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

function playMusic(guild, song, video, message)
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
            return playMusic(guild, serverQueue.songs[0], video, message);
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

        playMusic(guild, serverQueue.songs[0], video, message);
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
                message.channel.send(`La répétitiotn de la musique a été désactivée!`);
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


client.login(process.env.TOKEN);