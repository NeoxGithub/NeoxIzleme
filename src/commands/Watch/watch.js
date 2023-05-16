const { Colors } = require('discord.js');
const db = require('croxydb');

module.exports.data = {
	name: 'watch',
	description: 'watch',
	options: [
		{
			name: 'bot',
			description: 'bot',
			type: 2,
			options: [
				{
					name: 'ekle',
					description: 'Watch sistemine bot eklersiniz.',
					type: 1,
					options: [
						{
							name: 'bot',
							description: 'Watch sistemine eklemek istediğiniz bot.',
							type: 6,
							required: true,
						},
						{
							name: 'kanal',
							description: 'LOg kanalı.',
							type: 7,
							channel_types: [0],
							required: true,
						},
						{
							name: 'rol',
							description: 'Etiketlenicek rolü seçin.',
							type: 8,
							required: true,
						},
					],
				},
				{
					name: 'sil',
					description: 'Watch sisteminden bot silersiniz.',
					type: 1,
					options: [
						{
							name: 'bot',
							description: 'Watch sistemine eklemek istediğiniz bot.',
							type: 6,
							required: true,
						},
					],
				},
				{
					name: 'liste',
					description: 'Watch sistemindeki botları listeler.',
					type: 1,
				},
			],
		},
	],
	cooldown: 10,
	async execute(interaction, client) {
		const command = interaction.options.getSubcommand();
		const { embed, config } = client;

		if (!interaction.member.permissions.has('Administrator'))
			return interaction.reply({
				ephemeral: true,
				embeds: [embed(interaction, 'Bu komutu kullanmak için `Yönetici` yetkisine sahip olman gerek.', 'red')],
			});

		if (command === 'ekle') {
			const bot = interaction.options.getMember('bot');
			const kanal = interaction.options.getChannel('kanal');
			const rol = interaction.options.getRole('rol');

			if (!bot.user.bot) {
				return interaction.reply({
					ephemeral: true,
					embeds: [embed(interaction, 'Lütfen bir bot seçin!', 'red')],
				});
			}

			const database = await db.get(`${interaction.guild.id}_${bot.id}`);
			if (database) {
				return interaction.reply({
					ephemeral: true,
					embeds: [embed(interaction, 'Bu bot zaten veritabanımda kayıtlı!', 'red')],
				});
			}

			await db.set(`${interaction.guild.id}_${bot.id}`, { rol: rol.id, kanal: kanal.id });

			interaction.reply({
				embeds: [
					embed(
						interaction,
						`Artık ${bot} botu, ${kanal} kanalında aktif olduğunda veya çevrimdışı olduğunda ${rol} rolünü etiketleyip bildirecektir.`,
						'green'
					),
				],
			});
		} else if (command === 'sil') {
			const bot = interaction.options.getMember('bot');
			if (!bot.user.bot) {
				return interaction.reply({
					ephemeral: true,
					embeds: [embed(interaction, 'Lütfen bir bot seçin!', 'red')],
				});
			}

			const database = await db.get(`${interaction.guild.id}_${bot.id}`);
			if (!database) {
				return interaction.reply({
					ephemeral: true,
					embeds: [embed(interaction, 'Bu bot veritabanımda kayıtlı değil!', 'red')],
				});
			}

			await db.delete(`${interaction.guild.id}_${bot.id}`);
			interaction.reply({
				embeds: [embed(interaction, `${bot} botu watch sisteminden kaldırıldı.`, 'green')],
			});
		} else if (command === 'liste') {
			let fieldArray = new Array();

			for (const [key, value] of Object.entries(db.all())) {
				if (key.startsWith(`${interaction.guild.id}_`)) {
					const bot = await client.users.fetch(key.replace(`${interaction.guild.id}_`, ''));
					const kanal = await client.channels.fetch(value.kanal);
					const rol = await interaction.guild.roles.cache.find((x) => x.id === value.rol);

					fieldArray.push({
						name: bot.tag,
						value: `Kanal: ${kanal} - Rol: ${rol}`,
					});
				}
			}

			interaction.reply({ embeds: [{ color: Colors.Blurple, fields: fieldArray }] });
		}
	},
};
