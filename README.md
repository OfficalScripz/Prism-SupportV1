# Roblox Discord Bot

A 24/7 Discord bot that provides automated responses for Roblox scripting assistance, script generation, and executor information with built-in safety warnings.

## Features

- **24/7 Automatic Responses**: Responds to every message in configured Discord channel
- **Developer Recognition**: Special greetings for designated developers
- **Script Generation**: Creates Roblox Lua scripts (speed, fly, teleport, god mode, etc.)
- **Safety Warnings**: Includes appropriate warnings with exploit-related content
- **Slash Commands**: Secure developer management commands
- **Rate Limiting**: Prevents spam with user-specific cooldowns

## Bot Capabilities

### Message Responses
- Greeting detection and personalized responses
- Roblox script generation with safety warnings
- Executor information and guidance
- Lua scripting help and tutorials
- General Roblox assistance

### Developer Features
- Secret-based core developers (permanent)
- Command-added developers (manageable)
- Slash commands: `/adddeveloper`, `/removedeveloper`, `/listdevelopers`
- Secure access control (developers only)

## Setup

### Prerequisites
- Node.js 16 or higher
- Discord bot token
- Discord channel ID

### Environment Variables
Create these environment variables in your hosting platform:

```
DISCORD_BOT_TOKEN=your_discord_bot_token_here
CHANNEL_ID=your_discord_channel_id_here
DEVELOPER_IDS=comma_separated_user_ids_here
```

### Installation
1. Clone this repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run: `npm start`

## Deployment on Railway

1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically

## Usage

### Basic Commands
- Say "hi" or "hello" → Bot greets you
- Ask "create a speed script" → Bot generates Lua script with warnings
- Ask "help with roblox executors" → Bot provides executor information

### Developer Commands (Slash Commands)
- `/adddeveloper @user` - Add user as developer
- `/removedeveloper @user` - Remove user from developers
- `/listdevelopers` - View all current developers

## Safety Features

- Built-in safety warnings for all exploit-related content
- Rate limiting to prevent abuse
- Channel-specific operation
- Secure developer management

## License

MIT License