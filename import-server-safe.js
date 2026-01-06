// import-server-safe.js
// YZ CHEATS Discord Server Auto Setup Script
// SAFE VERSION (uses Railway environment variables)

const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');

const TOKEN = process.env.TOKEN;       // Railway Variable
const GUILD_ID = process.env.GUILD_ID; // Railway Variable

if (!TOKEN || !GUILD_ID) {
  console.error('❌ TOKEN or GUILD_ID missing in environment variables');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const guild = await client.guilds.fetch(GUILD_ID);
  const template = JSON.parse(fs.readFileSync('./yz_cheats_discord_template.json', 'utf8'));

  // ================= ROLES =================
  for (const role of template.roles) {
    const exists = guild.roles.cache.find(r => r.name === role.name);
    if (exists) continue;

    await guild.roles.create({
      name: role.name,
      color: role.color,
      permissions: role.permissions.map(p => PermissionsBitField.Flags[p]),
    });

    console.log(`✅ Role created: ${role.name}`);
  }

  // ================= CATEGORIES & CHANNELS =================
  for (const category of template.categories) {
    const cat = await guild.channels.create({
      name: category.name,
      type: ChannelType.GuildCategory,
    });

    console.log(`📂 Category created: ${category.name}`);

    for (const channel of category.channels) {
      await guild.channels.create({
        name: channel.name.toLowerCase().replace(/\s+/g, '-'),
        type: channel.type === 'voice'
          ? ChannelType.GuildVoice
          : ChannelType.GuildText,
        parent: cat.id,
      });

      console.log(`   ➜ Channel created: ${channel.name}`);
    }
  }

  console.log('🎉 SERVER SETUP COMPLETE!');
  process.exit(0);
});

client.login(TOKEN);
