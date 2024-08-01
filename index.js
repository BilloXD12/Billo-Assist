const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// Define an array of custom status messages
const statusMessages = [
  'Helping BilloXD',
  'Watching Members',
  'Editing Reels!',
  'dsc/gg/billoxd'
];

// Create an Express server
const app = express();
const port = process.env.PORT || 3000; // Use the port provided by Render or default to 3000

app.get('/', (req, res) => {
  res.send('Bot is running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Function to set the custom status
  const setCustomStatus = (status) => {
    client.user.setPresence({
      activities: [{ name: status, type: 0 }],
      status: 'online'
    });
  };

  // Set an initial status
  setCustomStatus(statusMessages[0]);

  // Change status every 30 seconds (30000 milliseconds)
  let index = 0;
  setInterval(() => {
    index = (index + 1) % statusMessages.length;
    setCustomStatus(statusMessages[index]);
  }, 30000);

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return console.error('Guild not found');

  const voiceChannel = guild.channels.cache.get(process.env.VOICE_CHANNEL_ID);
  if (!voiceChannel) return console.error('Voice channel not found');

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('Bot has connected to the channel!');
  });

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    console.log('Bot has disconnected from the channel');

    // Get the user to DM
    const user = await client.users.fetch(process.env.USER_ID);
    if (user) {
      user.send('The bot has disconnected from the voice channel.').catch(console.error);
    } else {
      console.error('User not found');
    }
  });
});

client.login(process.env.TOKEN);
