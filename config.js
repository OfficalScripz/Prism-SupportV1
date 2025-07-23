require('dotenv').config();

module.exports = {
    BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || 'your_bot_token_here',
    CHANNEL_ID: process.env.CHANNEL_ID || 'your_channel_id_here',
    
    // Developer user IDs (from environment variable)
    DEVELOPER_IDS: process.env.DEVELOPER_IDS ? process.env.DEVELOPER_IDS.split(',').map(id => id.trim()) : [],
    
    // Safety messages
    SAFETY_WARNINGS: [
        'Remember, be careful when exploiting!',
        'BEWARE! EXPLOITING CAN GET U BANNED!',
        '⚠️ Always use exploits responsibly and understand the risks!',
        '🚨 Exploiting violates Roblox ToS and can result in permanent bans!',
        '💡 Remember: With great power comes great responsibility!'
    ],
    
    // Bot settings
    RESPONSE_DELAY: 1000, // 1 second delay before responding
    MAX_SCRIPT_LENGTH: 1500, // Maximum characters in generated scripts
};
