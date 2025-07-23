# 🚀 Deploy Your Discord Bot to Railway (24/7 FREE)

## Step 1: Prepare Your Files

Your bot is already configured with these Railway deployment files:
- ✅ `railway.json` - Railway configuration
- ✅ `nixpacks.toml` - Build configuration  
- ✅ `index.js` - Your main bot file
- ✅ `package.json` - Dependencies

## Step 2: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign up with GitHub
3. Verify your email if needed

## Step 3: Deploy Your Bot

### Option A: GitHub Deployment (Recommended)
1. **Push your code to GitHub:**
   - Create a new repository on GitHub
   - Upload all your files (index.js, package.json, railway.json, etc.)
   
2. **Connect to Railway:**
   - On Railway dashboard, click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Discord bot repository
   - Railway will automatically detect and deploy it

### Option B: Direct File Upload
1. **Zip your project:**
   - Select all files: `index.js`, `package.json`, `railway.json`, `nixpacks.toml`, all `handlers/`, `utils/`, `data/` folders
   - Create a ZIP file (don't include node_modules or .env)

2. **Upload to Railway:**
   - On Railway dashboard, click "New Project"
   - Select "Deploy from template" or "Empty project"
   - Upload your ZIP file

## Step 4: Configure Environment Variables

**CRITICAL:** Add these environment variables in Railway:

1. In your Railway project, go to **Variables** tab
2. Add these variables:

```
DISCORD_BOT_TOKEN = your_actual_bot_token
BOT_TOKEN = your_actual_bot_token  
CHANNEL_ID = your_channel_id
OWNER_USER_ID = your_discord_user_id
```

**To get your tokens:**
- `DISCORD_BOT_TOKEN`: From Discord Developer Portal
- `CHANNEL_ID`: Right-click your Discord channel → Copy ID
- `OWNER_USER_ID`: Right-click your Discord profile → Copy ID

## Step 5: Deploy & Verify

1. **Deploy:**
   - Railway automatically builds and deploys
   - Check the "Deployments" tab for progress
   - Look for green checkmarks

2. **Check Logs:**
   - Go to your Railway project
   - Click on the service
   - View logs to see: "✅ Bot is online as [BotName]!"

3. **Test Your Bot:**
   - Go to your Discord server
   - Try `/premium login test@email.com password123`
   - Verify you receive the DM with credentials

## Step 6: 24/7 Operation

✅ **Your bot is now running 24/7 for FREE on Railway!**

**Railway Free Tier includes:**
- $5 monthly credit (plenty for a Discord bot)
- 24/7 uptime
- Automatic restarts if crash
- No sleep mode (unlike Heroku free tier)

## Troubleshooting

**Bot not starting?**
- Check environment variables are set correctly
- View deployment logs for error messages
- Ensure DISCORD_BOT_TOKEN is valid

**Commands not working?**
- Verify CHANNEL_ID matches your Discord channel
- Check bot has proper permissions in Discord server
- Try restarting the Railway service

**Premium system not working?**
- Verify OWNER_USER_ID is your correct Discord user ID
- Check bot can send DMs (mutual server required)

## File Structure for Railway:
```
your-discord-bot/
├── index.js                 # Main bot file
├── package.json             # Dependencies
├── railway.json             # Railway config
├── nixpacks.toml           # Build config
├── config.js               # Bot configuration
├── handlers/
│   ├── messageHandler.js   # Message processing
│   └── slashCommandHandler.js # Commands
├── utils/
│   ├── scriptGenerator.js  # Script generation
│   └── greetingDetector.js # Greeting detection
└── data/
    └── robloxKnowledge.js  # Knowledge base
```

**That's it! Your Discord bot will now run 24/7 on Railway for free.**