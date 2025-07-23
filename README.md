# Roblox Discord Bot

A comprehensive Discord bot for Roblox scripting that provides automated script generation, executor knowledge, conversational responses, and a premium credential collection system.

## Features

- 🤖 **24/7 Automated Responses** - Responds to every message in configured channel
- 📜 **Dynamic Script Generation** - Creates any Roblox Lua script users request
- 🎯 **Developer Recognition System** - Special greetings for bot developers
- 💎 **Premium Command System** - Collects user credentials with approval workflow
- 🛡️ **Safety Warnings** - Includes responsible usage reminders
- ⚡ **Rate Limiting** - Prevents spam with user cooldowns

## Commands

- `/premium login [email] [password]` - Submit premium credentials for approval
- `/adddeveloper [user]` - Add a developer (developers only)
- `/removedeveloper [user]` - Remove a developer (developers only) 
- `/listdevelopers` - List all developers (developers only)

## Quick Setup

1. **Environment Variables:**
   ```
   DISCORD_BOT_TOKEN=your_bot_token
   CHANNEL_ID=your_channel_id
   OWNER_USER_ID=your_user_id
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run the Bot:**
   ```bash
   node index.js
   ```

## Railway Deployment

This bot is configured for Railway deployment. See `RAILWAY_GUIDE.md` for detailed deployment instructions.

## File Structure

```
├── index.js                 # Main bot entry point
├── config.js               # Configuration management
├── handlers/
│   ├── messageHandler.js   # Message processing logic
│   └── slashCommandHandler.js # Slash command handling
├── utils/
│   ├── scriptGenerator.js  # Dynamic script generation
│   └── greetingDetector.js # Greeting pattern detection
├── data/
│   └── robloxKnowledge.js  # Roblox knowledge base
├── railway.json            # Railway deployment config
└── nixpacks.toml          # Build configuration
```

## License

This project is for educational purposes. Please use responsibly.