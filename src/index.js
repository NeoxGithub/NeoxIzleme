const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const config = require('./config.json');
const { readdirSync } = require('fs');

const intents = Object.values(GatewayIntentBits);
const partials = Object.values(Partials);

const client = new Client({
	intents,
	partials,
	allowedMentions: { parse: ['users', 'roles'] },
	presence: {
		activities: [{ name: '', type: ActivityType.Watching }],
		status: 'idle',
	},
});

client.commands = new Collection();
client.embed = require('./utils/embed.js');
client.config = config;

readdirSync('./src/events').forEach(async (file) => {
	const event = require(`./events/${file}`);
	event(client);
});

readdirSync('./src/commands').forEach((category) => {
	readdirSync(`./src/commands/${category}`).forEach(async (file) => {
		const command = require(`./commands/${category}/${file}`);
		client.commands.set(command.data.name, command);
	});
});

client.login(config.bot.token);

const { joinVoiceChannel } = require('@discordjs/voice');
client.on('ready', () => { 
joinVoiceChannel({
channelId: "1105516411889139722",
guildId: "1085590365278572714",       
adapterCreator: client.guilds.cache.get("1085590365278572714").voiceAdapterCreator
    });
});