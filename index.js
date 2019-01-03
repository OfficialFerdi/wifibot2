const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({ disableEveryone: true });
bot.commands = new Discord.Collection();

bot.on("ready", async () => {
    console.log(`${bot.user.username} is online !`);
    bot.user.setActivity("+help | WifiBot", { type: "PLAYING" });

});

bot.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    let prefix = botconfig.prefix;
    if (!message.content.startsWith(prefix)) return;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(bot, message, args);

    if (cmd === `${prefix}help`) {
        return message.channel.send("-----------------\n+ticket - Open een ticket. \n+close - Verwijder je ticket. \n+rateticket - Beoordeel je ticket. \n-----------------")
    }

    if (cmd === `${prefix}ticket`) {
        const TicketReden = message.content.split(" ").slice(1).join(" ");
        if (!TicketReden) return message.channel.send("Vul een reden voor je ticket aub.")
        if (!message.guild.roles.exists("name", `Ticketsupport`)) return message.channel.send("Maak eerst Ticketsupport voor dat staff de tickets kunnen behandelen.")
        if (message.guild.channels.exists("name", "ticket-" + message.author.username)) return message.channel.send("Je hebt al een ticket.")
        message.guild.createChannel(`ticket-${message.author.username}`, "text").then(c => {
            let role = message.guild.roles.find("name", "Ticketsupport");
            let role2 = message.guild.roles.find("name", "@everyone")
            c.overwritePermissions(role, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            c.overwritePermissions(role2, {
                SEND_MESSAGES: false,
                READ_MESSAGES: false
            });
            c.overwritePermissions(message.author, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            let created = new Discord.RichEmbed()
                .setColor("#00ff00")
                .setDescription(`:white_check_mark: je ticket is succesvol gemaakt! #${c.name}`)
            message.channel.send(created);
            const channelEmbed = new Discord.RichEmbed()
                .setColor("#ffcc00")
                .setDescription(`Hallo, ${message.author}! \n \n Bedankt voor het openen van de ticket! ons staff gaat jou zo snel mogelijk helpen met jou ticket. \n \n Ticket reden: ${TicketReden}`)
                .setTimestamp()
            c.send(channelEmbed)
        }).catch(console.error);
    }

    if (cmd === `${prefix}close`) {
        if (!message.channel.name.startsWith(`ticket-`)) return message.channel.send("Je kunt deze channel niet verwijderen buiten een ticket.")
        // confirm verwijder - met timeout (geen command)
        message.channel.send(`Weet je het zeker? Na bevestiging kun je deze actie niet ongedaan maken! \N Om te bevestigen, typ dan \`/confirm \`. Dit zal na 10 seconden een time-out geven en worden geannuleerd.`)
        .then((m) => {
            message.channel.awaitMessages(response => response.content === '/confirm', {
                max: 1,
                time: 10000,
                errors: ['time'],
            })
            .then((collected) => {
                message.channel.delete();
            })
            .catch((e) => {
                m.edit('Ticket close timed out, het ticket was niet gesloten.').then(m2 => {
                    m2.delete();
                }, 3000)
            });
        });
    }

    if(cmd === `${prefix}rateticket`) {
        const RateReden = message.content.split(" ").slice(1).join(" ");
        if(!message.channel.name.startsWith("ticket-")) return message.channel.send("Je kunt geen feedback geven buiten je ticket.")
        if(!RateReden) return message.channel.send("Als je ticket een feedback wilt geven gelieve ook met een reden wat staff/management beter kunnen.")

        let feedbackticketEmbed = new Discord.RichEmbed()
        .setColor("#cccc00")
        .setDescription(`\n \n Ticket: ticket-${message.author.username} \n Feedback Reden: ${RateReden}`)

        message.delete()
        message.channel.send(":white_check_mark: **Feedback van je ticket verzonden!**")

        let rateticketChannel = message.guild.channels.find("name", `feedback-tickets`)
        if(!rateticketChannel) return message.channel.send("Helaas, #feedback-tickets is nog niet gemaakt, als je dit probleem niet weten te fixen, contacteer OfficieelFerdi#5109 voor dit probleem")

        rateticketChannel.send(feedbackticketEmbed);
    }

});

bot.login(botconfig.token);