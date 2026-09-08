const { Client, GatewayIntentBits, WebhookClient } = require('discord.js');
const express = require('express');

// ===== EXPRESS SERVER =====
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is alive ✅"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;

// Webhook-ul din variabile de mediu
const webhook = new WebhookClient({ 
  id: process.env.WEBHOOK_ID, 
  token: process.env.WEBHOOK_TOKEN 
});

async function sendBump() {
  try {
    await webhook.send('/bump');
    console.log('✅ Bump sent');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

client.once('ready', () => {
  console.log(`✅ Bot ${client.user.tag} is online!`);
  setTimeout(sendBump, 5000);
  setInterval(sendBump, 2 * 60 * 60 * 1000);
});

client.login(TOKEN);
