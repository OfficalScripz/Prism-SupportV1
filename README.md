# Roblox Discord Bot

A 24/7 Discord bot that provides automated responses for Roblox scripting assistance, script generation, and executor information with built-in safety warnings.

## Features

- **24/7 Automatic Responses**: Responds to every message in configured Discord channel
- **Developer Recognition**: Special greetings for designated developers
- **Script Generation**: Creates Roblox Lua scripts (speed, fly, teleport, god mode, etc.)
- **Safety Warnings**: Includes appropriate warnings with exploit-related content
- **Slash Commands**: Secure developer management commands
- **Rate Limiting**: Prevents spam with user-specific cooldowns

## Environment Variables

Required environment variables:

- `DISCORD_BOT_TOKEN` - Your Discord bot token
- `CHANNEL_ID` - The Discord channel ID where the bot should respond
- `DEVELOPER_IDS` - Comma-separated list of Discord user IDs for core developers

## Deployment

1. Set the required environment variables
2. Run `npm install` to install dependencies
3. Run `npm start` to start the bot

The bot will automatically connect to Discord and begin monitoring the specified channel.