const { Colors } = require('discord.js');
const db = require('croxydb');

module.exports = (client) => {
	client.on('presenceUpdate', async (oldPresence, newPresence) => {
		const { embed } = client;
		const database = await db.get(`${newPresence.guild.id}_${newPresence.user.id}`);
		if (!database) return;

		const kanal = await client.channels.cache.get(database.kanal);
		const rol = await newPresence.guild.roles.cache.find((x) => x.id === database.rol);
		if (oldPresence.status === 'offline' && newPresence.status !== 'offline') {
			kanal.send({
				content: `${rol}`,
				embeds: [
					{
						title: 'Dikkat!',
						description: `${newPresence.user} aktif oldu!`,
						color: Colors.Green,
					},
				],
			});
		} else if (oldPresence.status !== 'offline' && newPresence.status === 'offline') {
			kanal.send({
				content: `${rol}`,
				embeds: [
					{
						title: 'Dikkat!',
						description: `${newPresence.user} deaktif oldu!`,
						color: Colors.Red,
					},
				],
			});
		}
	});
};
