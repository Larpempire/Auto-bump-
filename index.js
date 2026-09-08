const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// Configurare bot
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1544266220566749194';
const BUMP_INTERVAL = 2 * 60 * 60 * 1000; // 2 ore

// Verifică dacă token-ul există
if (!TOKEN) {
    console.error('❌ DISCORD_TOKEN nu este setat în variabilele de mediu!');
    process.exit(1);
}

console.log('✅ Token găsit, lungime:', TOKEN.length);

// Creare client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let lastBumpTime = 0;
let isReady = false;

// Când botul este gata
client.once('ready', () => {
    isReady = true;
    console.log(`✅ Botul ${client.user.tag} este online!`);
    console.log(`📢 Canal target: ${CHANNEL_ID}`);
    console.log(`⏰ Interval bump: ${BUMP_INTERVAL / 1000 / 60} minute`);
    
    // Verifică dacă canalul există
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
        console.log(`✅ Canal găsit: #${channel.name}`);
    } else {
        console.error(`❌ Canalul ${CHANNEL_ID} nu a fost găsit!`);
        console.log('📋 Canale disponibile:');
        client.channels.cache.forEach(ch => {
            console.log(`   - ${ch.name} (${ch.id})`);
        });
    }
    
    // Primul bump după 10 secunde
    console.log('⏳ Așteaptă 10 secunde pentru primul bump...');
    setTimeout(() => {
        performBump();
    }, 10000);
    
    // Setare interval
    setInterval(performBump, BUMP_INTERVAL);
});

// Funcția pentru bump
async function performBump() {
    if (!isReady) {
        console.log('⏳ Botul nu este încă pregătit...');
        return;
    }

    try {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (!channel) {
            console.error('❌ Canalul nu a fost găsit!');
            return;
        }

        const now = Date.now();
        if (now - lastBumpTime < BUMP_INTERVAL) {
            const remaining = (BUMP_INTERVAL - (now - lastBumpTime)) / 1000 / 60;
            console.log(`⏳ Mai așteaptă ${Math.round(remaining)} minute până la următorul bump...`);
            return;
        }

        console.log('🔄 Trimit bump...');
        await channel.send('/bump');
        lastBumpTime = now;
        console.log(`✅ Bump executat la: ${new Date().toLocaleString()}`);
        
        const nextBump = new Date(now + BUMP_INTERVAL);
        console.log(`⏰ Următorul bump la: ${nextBump.toLocaleString()}`);

    } catch (error) {
        console.error('❌ Eroare la bump:', error.message);
        if (error.code) {
            console.error('Cod eroare:', error.code);
        }
    }
}

// Gestionare erori
client.on('error', error => {
    console.error('❌ Eroare client:', error.message);
});

client.on('rateLimit', (rateLimitInfo) => {
    console.log(`⚠️ Rată limită atinsă: ${rateLimitInfo.timeout}ms`);
});

// Server Express
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <h1>Discord Bump Bot</h1>
        <p>Status: ${isReady ? '✅ Online' : '⏳ Conectare...'}</p>
        <p>Ultimul bump: ${lastBumpTime ? new Date(lastBumpTime).toLocaleString() : 'Niciunul'}</p>
        <p>Următorul bump: ${lastBumpTime ? new Date(lastBumpTime + BUMP_INTERVAL).toLocaleString() : 'În așteptare...'}</p>
    `);
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`✅ Server Express rulează pe portul ${PORT}`);
});

// Conectare bot
console.log('🔄 Conectare la Discord...');
client.login(TOKEN).catch(error => {
    console.error('❌ Eroare la login:', error.message);
    process.exit(1);
});

// Oprire gracefully
process.on('SIGTERM', () => {
    console.log('🛑 Primit SIGTERM, oprire...');
    client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Eroare neașteptată:', error);
});
