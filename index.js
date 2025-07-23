const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config');
const messageHandler = require('./handlers/messageHandler');
const slashCommandHandler = require('./handlers/slashCommandHandler');

// Create a new Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
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
        .setDescription('List all current developers (developers only)'),
    
    new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Premium login system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('login')
                .setDescription('Login to premium account')
                .addStringOption(option =>
                    option.setName('email')
                        .setDescription('Your email address')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('password')
                        .setDescription('Your password')
                        .setRequired(true)))
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

// Reaction handler for premium approvals
client.on('messageReactionAdd', async (reaction, user) => {
    // Ignore bot reactions
    if (user.bot) return;
    
    // Check if this is a premium approval or decline reaction
    if ((reaction.emoji.name === '✅' || reaction.emoji.name === '❌') && reaction.message.channel.type === 1) { // DM channel
        // Check if user is the owner
        const isOwner = user.id === process.env.OWNER_USER_ID;
        if (!isOwner) return;
        
        // Get premium request data
        const premiumRequest = slashCommandHandler.getPremiumRequest(reaction.message.id);
        if (!premiumRequest) return;
        
        try {
            // Get the user who made the premium request
            const requestUser = await client.users.fetch(premiumRequest.userId);
            
            if (reaction.emoji.name === '✅') {
                // Approve the request
                await requestUser.send({
                    embeds: [{
                        color: 0x00ff00,
                        title: '✅ Premium Access Approved!',
                        description: `**Congratulations ${premiumRequest.username}!**\n\nYour premium login request has been **approved**.\n\n🎉 **Whitelisted Complete**\n\nYou now have access to premium features!`,
                        footer: {
                            text: 'Welcome to Premium!'
                        },
                        timestamp: new Date().toISOString()
                    }]
                });
                
                // Edit the original DM to show it's been approved
                await reaction.message.edit({
                    embeds: [{
                        ...reaction.message.embeds[0],
                        color: 0x00ff00,
                        title: '✅ Premium Request - APPROVED',
                        footer: {
                            text: `Approved by ${user.username} - User has been notified`
                        }
                    }]
                });
                
                console.log(`Premium request approved for ${premiumRequest.username} (${premiumRequest.userId}) by ${user.username}`);
                
            } else if (reaction.emoji.name === '❌') {
                // Decline the request
                await requestUser.send({
                    embeds: [{
                        color: 0xff0000,
                        title: '❌ Premium Request Declined',
                        description: `**Sorry ${premiumRequest.username}**\n\nYour premium access request has been **declined**.\n\nPlease contact support if you have questions.`,
                        footer: {
                            text: 'Premium Request Declined'
                        },
                        timestamp: new Date().toISOString()
                    }]
                });
                
                // Edit the original DM to show it's been declined
                await reaction.message.edit({
                    embeds: [{
                        ...reaction.message.embeds[0],
                        color: 0xff0000,
                        title: '❌ Premium Request - DECLINED',
                        footer: {
                            text: `Declined by ${user.username} - User has been notified`
                        }
                    }]
                });
                
                console.log(`Premium request declined for ${premiumRequest.username} (${premiumRequest.userId}) by ${user.username}`);
            }
            
            // Remove the request from memory
            slashCommandHandler.removePremiumRequest(reaction.message.id);
            
        } catch (error) {
            console.error('Error processing premium request:', error);
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
