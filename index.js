const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config');
const messageHandler = require('./handlers/messageHandler');
const slashCommandHandler = require('./handlers/slashCommandHandler');

// Create a new Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Define slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('adddeveloper')
        .setDescription('Add a user as a developer (developers only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to add as developer')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('removedeveloper')
        .setDescription('Remove a user from developers (developers only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove from developers')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('listdevelopers')
        .setDescription('List all current developers (developers only)')
].map(command => command.toJSON());

// Bot ready event
client.once('ready', async () => {
    console.log(`✅ Bot is online as ${client.user.tag}!`);
    console.log(`📢 Monitoring channel ID: ${config.CHANNEL_ID}`);
    
    // Register slash commands
    try {
        const rest = new REST({ version: '10' }).setToken(config.BOT_TOKEN);
        console.log('🔄 Registering slash commands...');
        
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        
        console.log('✅ Slash commands registered successfully!');
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }
    
    // Set bot status
    client.user.setActivity('Roblox Scripts | Be Safe!', { type: 'WATCHING' });
});

// Message event handler
client.on('messageCreate', async (message) => {
    // Ignore bot messages, system messages, and messages from other channels
    if (message.author.bot || message.system || message.channel.id !== config.CHANNEL_ID) {
        return;
    }

    try {
        await messageHandler.handleMessage(message);
    } catch (error) {
        console.error('Error handling message:', error);
        
        // Send error message to user
        try {
            await message.reply('⚠️ Something went wrong while processing your message. Please try again!\n\n**Remember, be careful when exploiting!**');
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
});

// Slash command handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
        await slashCommandHandler.handleSlashCommand(interaction);
    } catch (error) {
        console.error('Error handling slash command:', error);
        
        if (!interaction.replied) {
            await interaction.reply({
                content: '❌ An error occurred while processing the command.',
                ephemeral: true
            });
        }
    }
});

// Error handling
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(config.BOT_TOKEN).catch((error) => {
    console.error('Failed to login to Discord:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down bot...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Shutting down bot...');
    client.destroy();
    process.exit(0);
});
