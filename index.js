const { Client, GatewayIntentBits } = require('discord.js');
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
const BUMP_CHANNEL_ID = "1544266220566749194";

async function sendBump() {
  try {
    const channel = client.channels.cache.get(BUMP_CHANNEL_ID);
    if (!channel) {
      console.error('❌ Canalul nu a fost găsit!');
      return;
    }

    // Trimite comanda /bump ca mesaj text (singura metodă care funcționează)
    await channel.send('/bump');
    console.log('✅ /bump trimis în canal');
    
  } catch (error) {
    console.error('❌ Eroare:', error);
  }
}

client.once('ready', () => {
  console.log(`✅ Botul ${client.user.tag} este online!`);
  console.log(`📢 Canal bump: ${BUMP_CHANNEL_ID}`);
  
  // Primul bump la 5 secunde
  setTimeout(sendBump, 5000);
  
  // Bump la fiecare 2 ore
  setInterval(sendBump, 2 * 60 * 60 * 1000);
});

client.login(TOKEN);
