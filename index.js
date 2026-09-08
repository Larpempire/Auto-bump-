const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// Configurare bot
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1544266220566749194';
const BUMP_INTERVAL = 2 * 60 * 60 * 1000; // 2 ore în milisecunde

// Creare client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Variabilă pentru a ține evidența ultimului bump
let lastBumpTime = 0;

// Când botul este gata
client.once('ready', () => {
    console.log(`Botul ${client.user.tag} este online!`);
    console.log(`Va face bump în canalul: ${CHANNEL_ID}`);
    
    // Primul bump după 10 secunde
    setTimeout(() => {
        performBump();
    }, 10000);
    
    // Setare interval pentru bump la fiecare 2 ore
    setInterval(performBump, BUMP_INTERVAL);
});

// Funcția pentru bump
async function performBump() {
    try {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (!channel) {
            console.error('Canalul nu a fost găsit! Verifică ID-ul.');
            return;
        }

        // Verifică dacă a trecut destul timp (2 ore)
        const now = Date.now();
        if (now - lastBumpTime < BUMP_INTERVAL) {
            console.log('Mai așteaptă până la următorul bump...');
            return;
        }

        // Trimite mesajul de bump
        await channel.send('/bump');
        lastBumpTime = now;
        console.log(`Bump executat la: ${new Date().toLocaleString()}`);
        
        // Programează următorul bump exact la 2 ore
        const nextBump = new Date(now + BUMP_INTERVAL);
        console.log(`Următorul bump la: ${nextBump.toLocaleString()}`);

    } catch (error) {
        console.error('Eroare la bump:', error);
    }
}

// Gestionare erori
client.on('error', error => {
    console.error('Eroare client:', error);
});

// Gestionare rată limită
client.on('rateLimit', (rateLimitInfo) => {
    console.log(`Rată limită atinsă: ${rateLimitInfo.timeout}ms`);
});

// Server Express pentru menținerea botului activ pe Render
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Botul Discord este activ!');
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Pornește serverul Express
app.listen(PORT, () => {
    console.log(`Server Express rulează pe portul ${PORT}`);
});

// Conectare bot
client.login(TOKEN);

// Oprire gracefully
process.on('SIGTERM', () => {
    console.log('Primit SIGTERM, oprire bot...');
    client.destroy();
    process.exit(0);
});
