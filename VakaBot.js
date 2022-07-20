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
const twitch = new twitchAPI({
    client_secret: `dkuey0t6mqwnrfa7zje0hj4erg5byn`,
    client_id: `dligvbv3oosiq1fpcapfbrmf3op9ih`,
});

let prefix = `!`;
let isGiveawayRunning = false;
let streamAnnouncement = false;
let playingSavedMusic = false;
let loopMusic = false;
let newVideoVaka = false;

client.on(`ready`, () =>
{
    console.log(`Bot ready!`);
    client.user.setStatus(`online`);
    client.user.setActivity(`Vakarian!`, {type: `WATCHING`, url: `https://www.twitch.tv/tdw_vakarian`});
    BDD[`giveawayID`] = ``;
    saveBDD();
    BDD[`giveawayMember`] = [];
    saveBDD();
});


notifier.on(`video`, video =>
{
    BDD[`newVideoVakaInfo`] = video;
    saveBDD();

    newVideoVaka = true;
});


client.on(`message`, async message =>
{
    if(!BDD[message.guild.id])
    {
        BDD[message.guild.id] = {};
        saveBDD();
    }

    if(message.author.bot)
    {
        return;
    }

    if(message.channel.type == `dm`)
    {
        return;
    }

    if(newVideoVaka)
    {
        let channelName = BDD[`newVideoVakaInfo`].channelName;
        let title = BDD[`newVideoVakaInfo`].title;
        let url = BDD[`newVideoVakaInfo`].url;
        let embed = new discord.MessageEmbed()
        .setTitle(`**YOUTUBE NOTIF**`)
        .setAuthor(channelName)
        .setColor(`#FFE000`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676989307387924/3.png`)
        .setDescription(`Vakarian a publié une nouvelle vidéo!`)
        .addField(`Titre`, title)
        .addField(`Lien`, url)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();
    
        let channel = BDD[message.guild.name][`channelNotifYT`];
        if(channel)
        {
            client.channels.cache.get(channel.id).send(`@everyone`);
            client.channels.cache.get(channel.id).send(embed);
            newVideoVaka = false;
        }
        else
        {
            message.channel.send(`@everyone`);
            message.channel.send(embed);
            newVideoVaka = false;
        }
    }

    if(BDD[message.guild.id][`prefix`])
    {
        prefix = BDD[message.guild.id][`prefix`];
    }
    else
    {
        prefix = `!`;
    }

    const serverQueue = queue.get(message.guild.id);

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
        let embed = new discord.MessageEmbed()
        .setTitle(`**TWITCH NOTIF**`)
        .setAuthor(stream.user_name)
        .setColor(`#FF3E00`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676989307387924/3.png`)
        .setDescription(`Vakarian a publié une nouvelle vidéo!`)
        .addField(`Titre`, stream.title, false)
        .addField(`Jeu`, stream.game_name, false)
        .addField(`Lien`, `https://www.twitch.tv/tdw_vakarian`)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        let channel = BDD[message.guild.name][`channelNotifTTV`];
        if(channel)
        {
            client.channels.cache.get(channel.id).send(`@everyone`);
            client.channels.cache.get(channel.id).send(embed);
            streamAnnouncement = true;
        }
        else
        {
            message.channel.send(`@everyone`);
            message.channel.send(embed);
            streamAnnouncement = true;
        }
        
        client.user.setActivity(`Vakarian est en stream! Viens le rejoindre!`, { type: `STREAMING`, url: `https://www.twitch.tv/tdw_vakarian` });
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
        .addField(`${prefix}twitch`, BDD[`commandsDescriptions`][`twitch`], true)
        .addField(`${prefix}youtube`, BDD[`commandsDescriptions`][`youtube`], true)
        .addField(`${prefix}instagram`, BDD[`commandsDescriptions`][`instagram`], true)
        .addField(`${prefix}boutique`, BDD[`commandsDescriptions`][`boutique`], true)
        .addField(`${prefix}settings`, BDD[`commandsDescriptions`][`settings`], true)
        .addField(`${prefix}giveaway`, BDD[`commandsDescriptions`][`giveaway`], true)
        .addField(`${prefix}ID`, BDD[`commandsDescriptions`][`ID`], true)
        .addField(`${prefix}shutdown`, BDD[`commandsDescriptions`][`shutdown`], true)
        .addField(`Musique`, `Jouer de la musique dans ton channel vocal`)
        .addField(`${prefix}play`, BDD[`commandsDescriptions`][`play`], true)
        .addField(`${prefix}stop`, BDD[`commandsDescriptions`][`stop`], true)
        .addField(`${prefix}skip`, BDD[`commandsDescriptions`][`skip`], true)
        .addField(`${prefix}loop`, BDD[`commandsDescriptions`][`loop`], true)
        .addField(`${prefix}queue`, BDD[`commandsDescriptions`][`queue`], true)
        .addField(`${prefix}volume`, BDD[`commandsDescriptions`][`volume`], true)
        .addField(`${prefix}lyrics`, BDD[`commandsDescriptions`][`lyrics`], true)
        .addField(`${prefix}save-music`, BDD[`commandsDescriptions`][`save-music`], true)
        .addField(`${prefix}save-play`, BDD[`commandsDescriptions`][`save-play`], true)
        .addField(`Modération`, `Commandes de modération`)
        .addField(`${prefix}ban`, BDD[`commandsDescriptions`][`ban`], true)
        .addField(`${prefix}kick`, BDD[`commandsDescriptions`][`kick`], true)
        .addField(`${prefix}mute`, BDD[`commandsDescriptions`][`mute`], true)
        .addField(`${prefix}unmute`, BDD[`commandsDescriptions`][`unmute`], true)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        message.channel.send(embed);
    }

    if(message.content.startsWith(`${prefix}settings`))
    {
        if(!BDD[message.guild.name])
        {
            BDD[message.guild.name] = {};
            saveBDD();
        }

        if(!message.member.hasPermission(`MANAGE_GUILD`))
        {
            return message.channel.send(`Vous n'avez pas la permission de faire cette commande!`);
        }

        let args = message.content.split(` `);

        if(!args[1])
        {
            return message.channel.send(`Veuillez indiquer qu'est-ce que vous voulez paramétrer! ${prefix}settings notif-channel / prefix`);
        }

        switch(args[1].toLowerCase())
        {
            case `notif-channel`:

                if(args[2].startsWith(`youtube`))
                {
                    let channel = message.mentions.channels.first();

                    if(!channel)
                    {
                        return message.channel.send(`Veuillez mentionner le channel!`);
                    }
    
                    BDD[message.guild.name][`channelNotifYT`] = channel;
                    saveBDD();
    
                    message.channel.send(`Le channel ${channel.name} a bien été enregistré!`);                    
                }
                else if(args[2].startsWith(`twitch`))
                {
                    let channel = message.mentions.channels.first();

                    if(!channel)
                    {
                        return message.channel.send(`Veuillez mentionner le channel!`);
                    }
    
                    BDD[message.guild.name][`channelNotifTTV`] = channel;
                    saveBDD();
    
                    message.channel.send(`Le channel ${channel.name} a bien été enregistré!`);    
                }
                else
                {
                    return message.channel.send(`Veuillez spécifier la plateforme (youtube / twitch)`);
                }

                break;

            case `prefix`:

                if(!args[2])
                {
                    return message.channel.send(`Veuillez indiquer le nouveau prefix!`);
                }

                BDD[message.guild.name][`prefix`] = args[2];
                saveBDD();

                message.channel.send(`Le nouveau prefix (${args[2]}) a bien été enregistré!`);

                break;

            default:
                
                return message.channel.send(`Veuillez indiquer qu'est-ce que vous voulez paramétrer! ${prefix}settings notif-channel / prefix`);
        }
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
        .setTitle(`**GIVEWAY**`)
        .setAuthor(message.member.displayName, message.author.displayAvatarURL({ format: `png`, dynamic: true }))
        .setColor(`#FFEC00`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676990771204106/7.png`)
        .setDescription(`Un nouveau giveway vient de commencer! Bonne chance!`)
        .addField(`Gain:`, descriptionGiveaway, false)
        .addField(`Gagnants:`, winnerNumber, true)
        .addField(`Temps:`, `${args[1]}min`, true)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        message.channel.send(`@everyone`);
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
                    BDD[`giveawayID`] = ``;
                    saveBDD();
                    BDD[`giveawayMember`] = [];
                    saveBDD();

                    isGiveawayRunning = false;
                    return message.channel.send(`Il n'y a pas de gagnant ou d'autre gagnant!`);
                }

                let winnerUser = client.users.cache.get(winnerBDD);
                winnerUser.send(`Bravo ! Tu viens de gagner le giveaway!`).catch(() =>
                {
                    console.log(`Une erreur irréparable est survenue!`);
                });

                let embed = new discord.MessageEmbed()
                .setTitle(`**GIVEAWAY**`)
                .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
                .setColor(`#FF1B00`)
                .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676990339198996/6.png`)
                .setDescription(`Giveaway fini! GG!`)
                .addField(`Gain`, descriptionGiveaway, false)
                .addField(`Gagnant`, winnerUser, true)
                .addField(`Temps`, `${args[2]}min`, true)
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

    if(message.content.startsWith(`${prefix}ID`))
    {
        let embed = new discord.MessageEmbed()
        .setTitle(`**ID**`)
        .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
        .setColor(`#FF1B00`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676988904751115/1.png`)
        .setDescription(`Voici les ID de jeux de Vakarian`)
        .addField(`Epic:`, `TDWvakarian`, true)
        .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
        .setTimestamp();

        message.channel.send(embed);
    }

    if(message.content.startsWith(`${prefix}shutdown`))
    {
        if((message.member.id == `284374660764925952`) || (message.member.id == `527830313921937408`))
        {
            message.channel.send(`Arrêt du bot`);
            client.destroy();
        }
        else
        {
            return message.channel.send(`Vous ne pouvez pas faire cette commande!`);
        }
    }

    if(message.content.startsWith(`${prefix}play`))
    {
        if(playingSavedMusic)
        {
            return message.channel.send(`Cette fonctionnalité est indisponible pour le moment veuillez réessayer plus tard`);
        }

        let args = message.content.split(` `);

        execute(message, serverQueue, args);
    }

    if(message.content.startsWith(`${prefix}stop`))
    {
        if(playingSavedMusic)
        {
            return message.channel.send(`Cette fonctionnalité est indisponible pour le moment veuillez réessayer plus tard`);
        }

        stop(message, serverQueue);
    }

    if(message.content.startsWith(`${prefix}skip`))
    {
        if(playingSavedMusic)
        {
            return message.channel.send(`Cette fonctionnalité est indisponible pour le moment veuillez réessayer plus tard`);
        }

        skip(message, serverQueue);
    }

    if(message.content.startsWith(`${prefix}loop`))
    {
        let args = message.content.split(` `);
        if(!args[1])
        {
            return message.channel.send(`Veuillez spécifier quelle répétition vous voulez: ${prefix}loop musique/queue/off`);
        }

        if(playingSavedMusic)
        {
            return message.channel.send(`Cette fonctionnalité est indisponible pour le moment veuillez réessayer plus tard`);
        }

        loop(args, serverQueue, message);
    }

    if(message.content.startsWith(`${prefix}queue`))
    {
        if(playingSavedMusic)
        {
            return message.channel.send(`Cette fonctionnalité est indisponible pour le moment veuillez réessayer plus tard`);
        }

        musicQueue(serverQueue, message);
    }

    if(message.content.startsWith(`${prefix}volume`))
    {
        if(playingSavedMusic)
        {
            return message.channel.send(`Cette fonctionnalité n'est pas disponible pour le moment, réessayez plus tard`);
        }

        let args = message.content.split(` `);

        volume(serverQueue, message, args);
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
        if(serverQueue)
        {
            return message.channel.send(`Cette fonctionnalité n'est pas disponible pour le moment veuillez réessayer plus tard!`);
        }

        let args = message.content.split(` `);

        if((args[1]) && (args[1].startsWith(`loop`)))
        {
            if(loopMusic)
            {
                loopMusic = false;
                message.channel.send(`La répétition de la musique a été désactivée!`);
            }
            else
            {
                loopMusic = true;
                message.channel.send(`La répétition de la musique a été activée!`);
            }
        }

        playingSavedMusic = true;
        savePlay(message, loopMusic);
    }

    if(message.content.startsWith(`${prefix}ban`))
    {
        if(!message.member.hasPermission(`BAN_MEMBERS`))
        {
            return message.channel.send(`Vous n'avez pas la permission de faire cette commande!`);
        }

        let userBan = message.mentions.members.first();

        if(!userBan)
        {
            return message.channel.send(`Veuillez mentionner une personne pour pouvoir la bannir`);
        }

        if(!userBan.bannable)
        {
            return message.channel.send(`Impossible de bannir cette personne!`);
        }

        message.channel.send(`${userBan.displayName} a bien été banni!`);
        userBan.ban().catch(err =>
            {
                return message.channel.send(`Un problème vient d'apparaître! Plus d'infos: ${err}`);
            });
    }

    if(message.content.startsWith(`${prefix}kick`))
    {
        if(!message.member.hasPermission(`KICK_MEMBERS`))
        {
            return message.channel.send(`Vous n'avez pas la permission de faire cette commande!`);
        }

        let userKick = message.mentions.members.first();

        if(!userKick)
        {
            return message.channel.send(`Veuillez mentionner une personne pour pouvoir la kick`);
        }

        if(!userKick.kickable)
        {
            return message.channel.send(`Impossible de kick cette personne!`);
        }

        message.channel.send(`${userKick.displayName} a bien été kick!`);
        userKick.kick().catch(err =>
            {
                return message.channel.send(`Un problème vient d'apparaître! Plus d'infos: ${err}`);
            });
    }

    if(message.content.startsWith(`${prefix}mute`))
    {
        if(!message.member.hasPermission(`MUTE_MEMBERS`))
        {
            return message.channel.send(`Vous n'avez pas la permission de faire cette commande!`);
        }

        let userMute = message.mentions.members.first();

        if(!userMute)
        {
            return message.channel.send(`Veuillez mentionner une personne pour pouvoir la mute`);
        }

        let roleMute = message.guild.roles.cache.find(i => i.name == `Muted`);

        if(!roleMute)
        {
            let newRoleMute = message.guild.roles.create({
                data: 
                {
                    name: `Muted`,
                    permissions: [],
                }
            }).catch(err =>
                {
                    return message.channel.send(`Un problème vient d'apparaître! Plus d'infos: ${err}`);
                });

            userMute.roles.add(`${(await newRoleMute).id}`).catch(err => 
                {
                    return message.channel.send(`Un problème vient d'apparaître! Plus d'infos: ${err}`);
                });

            message.channel.send(`${userMute.displayName} a bien été mute!`);
        }
        else
        {
            userMute.roles.add(`${roleMute.id}`).catch(err =>
                {
                    return message.channel.send(`Un problème vient d'apparaître! Plus d'infos: ${err}`);
                });
            message.channel.send(`${userMute.displayName} a bien été mute!`);
        }
    }

    if(message.content.startsWith(`${prefix}unmute`))
    {
        if(!message.member.hasPermission(`MUTE_MEMBERS`))
        {
            return message.channel.send(`Vous n'avez pas la permission de faire cette commande!`);
        }

        let userUnmute = message.mentions.members.first();

        if(!userUnmute)
        {
            return message.channel.send(`Veuillez mentionner une personne pour pouvoir la démute`);
        }

        let roleMute = message.guild.roles.cache.find(i => i.name == `Muted`);

        if(!roleMute)
        {
            message.guild.roles.create({
                data: 
                {
                    name: `Muted`,
                    permissions: [],
                }
            }).catch(err =>
                {
                    return message.channel.send(`Un problème vient d'apparaître! Plus d'infos: ${err}`);
                });
        }
        else
        {
            userUnmute.roles.remove(`${roleMute.id}`).catch(err =>
                {
                    return message.channel.send(`Un problème vient d'apparaître! Plus d'infos: ${err}`);
                });
                
            message.channel.send(`${userUnmute.displayName} a bien été démute!`);
        }
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
        member.send(`Tu participes au giveaway! Bonne chance!`).catch(() =>
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
            member.send(`Tu ne participes plus au giveaway!`).catch(() =>
            {
                return;
            });
        }
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
    if(!args[1])
    {
        return message.channel.send(`Veuillez mettre une url ou le titre et l'artiste de la musique!`);
    }

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
    let res = await ytsr(BDD[`savedMusic`][message.member.id].url);
    let video = res.items.filter(i => i.type == `video`)[0];
    let songInfo = {
        author: video.author.name,
        title: video.title,
        image: video.bestThumbnail.url,
        views: video.views.toLocaleString(),
        duration: video.duration,
        url: video.url
    }

    let embed = new discord.MessageEmbed()
    .setTitle(`**MUSIQUE**`)
    .setAuthor(message.member.displayName, message.member.user.displayAvatarURL({ format: `png`, dynamic: true }))
    .setColor(`#00FFC1`)
    .setThumbnail(`https://cdn.discordapp.com/attachments/830567944948809748/958676989307387924/3.png`)
    .setImage(songInfo.image)
    .addField(`Auteur`, songInfo.author)
    .addField(`Titre`, songInfo.title)
    .addField(`Vues`, songInfo.views, true)
    .addField(`Durée`, songInfo.duration, true)
    .setFooter(`Développé par Niroshy#0426 et Vakarian#3947`)
    .setTimestamp();

    message.channel.send(embed);

    let dispatcher = connection.play(ytdl(songInfo.url, { quality: `highestaudio`, highWaterMark: 1 << 25 }));

    dispatcher.on(`finish`, () =>
    {
        if(loopMusic)
        {
            savePlay(message, connection, loopMusic);
        }
        else
        {
            playingSavedMusic = false;
            vc.leave();
            dispatcher.destroy();
        }
    });
}

function volume(serverQueue, message, args)
{
    if(!serverQueue)
    {
        return message.channel.send(`Il n'y a aucune musique en cours!`);
    }

    if((!args[1]) || (isNaN(args[1])))
    {
        return message.channel.send(`Veuillez mettre un nombre!`);
    }
    else if((args[1] < 0) || (args[1] > 2))
    {
        return message.channel.send(`Veuillez mettre un nombre entre 0 et 2 (1 étant par défaut)`);
    }

    serverQueue.connection.dispatcher.setVolume(args[1]);
    message.channel.send(`Le volume de la musique a bien été mis à ${args[1]}`);
}

client.login(process.env.TOKEN);