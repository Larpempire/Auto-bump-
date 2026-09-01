const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const BUMP_CHANNEL_ID = "1544266220566749194";

async function sendBump() {
  try {
    const channel = client.channels.cache.get(BUMP_CHANNEL_ID);
    if (channel) {
      await channel.send('/bump');
    }
  } catch (error) {
    // silent fail
  }
}

client.once('ready', () => {
  setTimeout(sendBump, 5000);
  setInterval(sendBump, 2 * 60 * 60 * 1000);
});

client.login(TOKEN);
