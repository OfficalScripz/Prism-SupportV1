const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const config = {
    BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN,
    CHANNEL_ID: process.env.CHANNEL_ID,
    DEVELOPER_IDS: process.env.DEVELOPER_IDS || ''
};

// Rate limiting
const userCooldowns = new Map();
const COOLDOWN_TIME = 3000;

// Developers file path
const DEVELOPERS_FILE = path.join(__dirname, 'developers.json');

// Initialize developers file
async function initializeDevelopersFile() {
    try {
        await fs.access(DEVELOPERS_FILE);
    } catch (error) {
        const initialData = { developers: [] };
        await fs.writeFile(DEVELOPERS_FILE, JSON.stringify(initialData, null, 2));
        console.log('Created developers.json file');
    }
}

// Developer management functions
function getCoreDeveloperIds() {
    const developerIds = config.DEVELOPER_IDS || '';
    return developerIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
}

async function isCoreDeveloper(userId) {
    const coreIds = getCoreDeveloperIds();
    return coreIds.includes(userId);
}

async function getAddedDevelopers() {
    try {
        await initializeDevelopersFile();
        const data = await fs.readFile(DEVELOPERS_FILE, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.developers || [];
    } catch (error) {
        console.error('Error reading developers file:', error);
        return [];
    }
}

async function isAddedDeveloper(userId) {
    const addedDevs = await getAddedDevelopers();
    return addedDevs.some(dev => dev.id === userId);
}

async function isDeveloper(userId) {
    const isCore = await isCoreDeveloper(userId);
    const isAdded = await isAddedDeveloper(userId);
    return isCore || isAdded;
}

async function addDeveloper(userId, userTag) {
    try {
        await initializeDevelopersFile();
        const isAlreadyAdded = await isAddedDeveloper(userId);
        if (isAlreadyAdded) return false;
        
        const addedDevs = await getAddedDevelopers();
        addedDevs.push({
            id: userId,
            tag: userTag,
            addedAt: new Date().toISOString()
        });
        
        const data = { developers: addedDevs };
        await fs.writeFile(DEVELOPERS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error adding developer:', error);
        return false;
    }
}

async function removeDeveloper(userId) {
    try {
        await initializeDevelopersFile();
        const addedDevs = await getAddedDevelopers();
        const filteredDevs = addedDevs.filter(dev => dev.id !== userId);
        
        if (filteredDevs.length === addedDevs.length) return false;
        
        const data = { developers: filteredDevs };
        await fs.writeFile(DEVELOPERS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error removing developer:', error);
        return false;
    }
}

// Greeting detection
const greetingPatterns = [
    /^(hi|hello|hey|sup|yo)$/,
    /^(hi|hello|hey|sup|yo)\s+(there|bot|everyone|all)$/,
    /^good\s+(morning|afternoon|evening|night)$/,
    /^(what's\s+up|whats\s+up|wassup)$/,
    /^howdy$/,
    /^greetings$/,
    /^(hi|hello|hey)\s+(bot|discord\s*bot)$/,
    /^bot\s+(hi|hello|hey)$/,
    /^(hii+|heyy+|hiii+)$/,
    /^hello\s*world$/,
    /^(oi|ahoy)$/,
    /^how\s+(are\s+you|r\s+u)(\?)?$/,
    /^(what's\s+up|whats\s+up)(\?)?$/,
    /^anyone\s+(there|here)(\?)?$/,
    /^is\s+anyone\s+(online|active|here)(\?)?$/
];

function isGreeting(message) {
    const cleanMessage = message.toLowerCase().trim();
    const normalizedMessage = cleanMessage.replace(/[.,!?;]+/g, '').replace(/\s+/g, ' ').trim();
    return greetingPatterns.some(pattern => pattern.test(normalizedMessage));
}

async function getGreetingResponse(author) {
    const isDev = await isDeveloper(author.id);
    
    if (isDev) {
        const devResponses = [
            `Hello Developer ${author.username}! 👋 Ready to help with Roblox scripting!`,
            `Hey there, Developer ${author.username}! What Roblox scripts can I help you with today?`,
            `Greetings Developer ${author.username}! Your Roblox scripting assistant is here!`,
            `Hello Developer ${author.username}! Need any custom Roblox scripts or executor info?`,
            `Hi Developer ${author.username}! Ready to generate some Roblox scripts for you!`
        ];
        return devResponses[Math.floor(Math.random() * devResponses.length)];
    } else {
        const regularResponses = [
            `Hello ${author.username}! 👋 I'm here to help with Roblox scripting!`,
            `Hey ${author.username}! What Roblox scripts can I help you with today?`,
            `Hi there ${author.username}! Your Roblox scripting assistant is ready to help!`,
            `Hello ${author.username}! Need any custom Roblox scripts or executor info?`,
            `Hey ${author.username}! Ready to help you with Roblox Lua scripting!`,
            `Greetings ${author.username}! Looking for Roblox scripting help or custom scripts?`
        ];
        return regularResponses[Math.floor(Math.random() * regularResponses.length)];
    }
}

// Script generation
function isScriptRequest(message) {
    const scriptKeywords = ['script', 'generate', 'create', 'make', 'code', 'speed', 'fly', 'teleport', 'godmode', 'god mode', 'noclip', 'no clip', 'esp', 'wallhack', 'aimbot', 'infinite', 'auto', 'hack'];
    const requestWords = ['give me', 'can you', 'make me', 'create', 'generate', 'need', 'want', 'show me'];
    
    const hasScriptKeyword = scriptKeywords.some(keyword => message.includes(keyword));
    const hasRequestWord = requestWords.some(word => message.includes(word));
    
    return hasScriptKeyword && (hasRequestWord || message.includes('script'));
}

function generateScript(message) {
    const lowerMessage = message.toLowerCase();
    
    let scriptType = 'speed';
    if (lowerMessage.includes('fly') || lowerMessage.includes('flight')) {
        scriptType = 'fly';
    } else if (lowerMessage.includes('teleport') || lowerMessage.includes('tp')) {
        scriptType = 'teleport';
    } else if (lowerMessage.includes('god') || lowerMessage.includes('infinite health') || lowerMessage.includes('immortal')) {
        scriptType = 'godmode';
    } else if (lowerMessage.includes('noclip') || lowerMessage.includes('no clip') || lowerMessage.includes('walk through walls')) {
        scriptType = 'noclip';
    }
    
    const scripts = {
        speed: `-- Speed Script
local Players = game:GetService("Players")
local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

humanoid.WalkSpeed = 50 -- Change this number for different speeds
print("Speed boosted to " .. humanoid.WalkSpeed)`,
        
        fly: `-- Fly Script
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")
local rootPart = character:WaitForChild("HumanoidRootPart")

local flying = false
local bodyVelocity

local function toggleFly()
    if flying then
        if bodyVelocity then bodyVelocity:Destroy() end
        humanoid.PlatformStand = false
        flying = false
        print("Flying disabled")
    else
        bodyVelocity = Instance.new("BodyVelocity")
        bodyVelocity.MaxForce = Vector3.new(4000, 4000, 4000)
        bodyVelocity.Velocity = Vector3.new(0, 0, 0)
        bodyVelocity.Parent = rootPart
        humanoid.PlatformStand = true
        flying = true
        print("Flying enabled - Press F to toggle")
    end
end

UserInputService.InputBegan:Connect(function(input)
    if input.KeyCode == Enum.KeyCode.F then
        toggleFly()
    end
end)`,
        
        teleport: `-- Teleport Script
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local player = Players.LocalPlayer
local mouse = player:GetMouse()

local function teleport()
    local character = player.Character
    if character then
        local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
        if humanoidRootPart then
            humanoidRootPart.CFrame = CFrame.new(mouse.Hit.Position + Vector3.new(0, 3, 0))
            print("Teleported!")
        end
    end
end

UserInputService.InputBegan:Connect(function(input)
    if input.KeyCode == Enum.KeyCode.T then
        teleport()
    end
end)

print("Press T to teleport to mouse position")`,
        
        godmode: `-- God Mode Script
local Players = game:GetService("Players")
local player = Players.LocalPlayer

local function enableGodMode()
    local character = player.Character
    if character then
        local humanoid = character:FindFirstChild("Humanoid")
        if humanoid then
            humanoid.MaxHealth = math.huge
            humanoid.Health = math.huge
            print("God mode enabled")
        end
    end
end

enableGodMode()
player.CharacterAdded:Connect(function()
    wait(1)
    enableGodMode()
end)`,
        
        noclip: `-- Noclip Script
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")
local player = Players.LocalPlayer
local noclip = false

local function toggleNoclip()
    noclip = not noclip
    local character = player.Character
    if character then
        for _, part in pairs(character:GetDescendants()) do
            if part:IsA("BasePart") then
                part.CanCollide = not noclip
            end
        end
        print(noclip and "Noclip ON" or "Noclip OFF")
    end
end

UserInputService.InputBegan:Connect(function(input)
    if input.KeyCode == Enum.KeyCode.N then
        toggleNoclip()
    end
end)

RunService.Stepped:Connect(function()
    if noclip then
        local character = player.Character
        if character then
            for _, part in pairs(character:GetDescendants()) do
                if part:IsA("BasePart") then
                    part.CanCollide = false
                end
            end
        end
    end
end)

print("Press N to toggle noclip")`
    };
    
    const selectedScript = scripts[scriptType];
    return `Here's a **${scriptType}** script for you:\n\`\`\`lua\n${selectedScript}\n\`\`\``;
}

// Knowledge base
function getExecutorInfo() {
    return `**Popular Roblox Executors:**

🔥 **Synapse X** - Premium executor with excellent compatibility
⚡ **Krnl** - Free executor with good performance
🚀 **Fluxus** - Free executor with regular updates
💎 **Script-Ware** - Paid executor with advanced features
🔧 **Oxygen U** - Free executor for basic scripts

**Tips:**
• Always download from official sources
• Use a VPN for extra safety
• Keep executors updated
• Test scripts in private servers first

**Compatibility varies by game - some games have stronger anti-cheat!**`;
}

function getScriptingBasics() {
    return `**Roblox Lua Scripting Basics:**

📚 **Essential Services:**
\`\`\`lua
local Players = game:GetService('Players')
local UserInputService = game:GetService('UserInputService')
local RunService = game:GetService('RunService')
\`\`\`

🎯 **Common Properties:**
• \`HumanoidRootPart\` - Character's main part
• \`Humanoid.WalkSpeed\` - Movement speed
• \`Humanoid.JumpPower\` - Jump height
• \`CFrame\` - Position and rotation

⌨️ **Input Detection:**
\`\`\`lua
UserInputService.InputBegan:Connect(function(input)
    if input.KeyCode == Enum.KeyCode.F then
        -- Do something when F is pressed
    end
end)
\`\`\`

**Practice with simple scripts first, then move to advanced exploits!**`;
}

// Message handler
async function handleMessage(message) {
    const userId = message.author.id;
    const currentTime = Date.now();
    
    // Rate limiting
    if (userCooldowns.has(userId)) {
        const expirationTime = userCooldowns.get(userId) + COOLDOWN_TIME;
        if (currentTime < expirationTime) {
            console.log(`User ${message.author.tag} is on cooldown`);
            return;
        }
    }
    
    userCooldowns.set(userId, currentTime);
    setTimeout(() => userCooldowns.delete(userId), COOLDOWN_TIME);
    
    const content = message.content.toLowerCase().trim();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let response = '';
    let shouldAddSafetyWarning = false;
    
    if (isGreeting(content)) {
        response = await getGreetingResponse(message.author);
    } else if (isScriptRequest(content)) {
        response = generateScript(content);
        shouldAddSafetyWarning = true;
    } else if (content.includes('executor') || content.includes('exploit')) {
        response = getExecutorInfo();
        shouldAddSafetyWarning = true;
    } else if (content.includes('script') && (content.includes('help') || content.includes('learn') || content.includes('how'))) {
        response = getScriptingBasics();
    } else if (content.includes('help') && (content.includes('roblox') || content.includes('lua') || content.includes('script'))) {
        response = getScriptingBasics();
    } else {
        const responses = [
            "Hey! I'm here to help with Roblox scripting. Ask me about executors, script help, or request custom scripts!",
            "Hi there! Need help with Roblox Lua scripting? I can generate scripts or answer questions about executors!",
            "Hello! I can help you with Roblox scripting, generate custom scripts, or provide info about executors. What do you need?",
            "Hey! Looking for Roblox scripting help? I can create scripts or answer questions about exploiting. Just ask!",
            "Hi! I'm your Roblox scripting assistant. Need custom scripts, executor info, or general scripting help?"
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (shouldAddSafetyWarning) {
        response += "\n\n⚠️ **BEWARE! EXPLOITING CAN GET U BANNED!** ⚠️\n*Use responsibly and at your own risk.*";
    }
    
    if (response) {
        try {
            await message.reply(response);
            console.log(`Responded to ${message.author.tag}: ${response.substring(0, 50)}...`);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}

// Slash command handler
async function handleSlashCommand(interaction) {
    const { commandName, user } = interaction;
    
    const isDev = await isDeveloper(user.id);
    if (!isDev) {
        await interaction.reply({
            content: '❌ Only developers can use this command.',
            ephemeral: true
        });
        return;
    }
    
    try {
        switch (commandName) {
            case 'adddeveloper': {
                const targetUser = interaction.options.getUser('user');
                if (!targetUser) {
                    await interaction.reply({ content: '❌ Please specify a valid user.', ephemeral: true });
                    return;
                }
                
                const isAlreadyDeveloper = await isDeveloper(targetUser.id);
                if (isAlreadyDeveloper) {
                    await interaction.reply({ content: `❌ ${targetUser.tag} is already a developer.`, ephemeral: true });
                    return;
                }
                
                const success = await addDeveloper(targetUser.id, targetUser.tag);
                if (success) {
                    await interaction.reply({ content: `✅ Successfully added ${targetUser.tag} as a developer!`, ephemeral: true });
                    console.log(`Developer added: ${targetUser.tag} (${targetUser.id}) by ${user.tag}`);
                } else {
                    await interaction.reply({ content: '❌ Failed to add developer. Please try again.', ephemeral: true });
                }
                break;
            }
            
            case 'removedeveloper': {
                const targetUser = interaction.options.getUser('user');
                if (!targetUser) {
                    await interaction.reply({ content: '❌ Please specify a valid user.', ephemeral: true });
                    return;
                }
                
                const isCore = await isCoreDeveloper(targetUser.id);
                if (isCore) {
                    await interaction.reply({ content: `❌ Cannot remove ${targetUser.tag} - they are a core developer.`, ephemeral: true });
                    return;
                }
                
                const isAdded = await isAddedDeveloper(targetUser.id);
                if (!isAdded) {
                    await interaction.reply({ content: `❌ ${targetUser.tag} is not an added developer.`, ephemeral: true });
                    return;
                }
                
                const success = await removeDeveloper(targetUser.id);
                if (success) {
                    await interaction.reply({ content: `✅ Successfully removed ${targetUser.tag} from developers.`, ephemeral: true });
                    console.log(`Developer removed: ${targetUser.tag} (${targetUser.id}) by ${user.tag}`);
                } else {
                    await interaction.reply({ content: '❌ Failed to remove developer. Please try again.', ephemeral: true });
                }
                break;
            }
            
            case 'listdevelopers': {
                const coreIds = getCoreDeveloperIds();
                const addedDevs = await getAddedDevelopers();
                
                let response = '**Current Developers:**\n\n';
                
                if (coreIds.length > 0) {
                    response += '**Core Developers:** (from environment)\n';
                    coreIds.forEach(id => {
                        response += `• <@${id}>\n`;
                    });
                    response += '\n';
                }
                
                if (addedDevs.length > 0) {
                    response += '**Added Developers:** (via commands)\n';
                    addedDevs.forEach(dev => {
                        response += `• <@${dev.id}> (${dev.tag})\n`;
                    });
                } else {
                    response += '**Added Developers:** None\n';
                }
                
                response += `\n**Total Developers:** ${coreIds.length + addedDevs.length}`;
                
                await interaction.reply({ content: response, ephemeral: true });
                break;
            }
            
            default:
                await interaction.reply({ content: '❌ Unknown command.', ephemeral: true });
        }
    } catch (error) {
        console.error('Error handling slash command:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: '❌ An error occurred while processing the command.', ephemeral: true });
        }
    }
}

// Create Discord client
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
    
    client.user.setActivity('Roblox Scripts | Be Safe!', { type: 'WATCHING' });
});

// Message event handler
client.on('messageCreate', async (message) => {
    if (message.author.bot || message.system || message.channel.id !== config.CHANNEL_ID) {
        return;
    }

    try {
        await handleMessage(message);
    } catch (error) {
        console.error('Error handling message:', error);
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
        await handleSlashCommand(interaction);
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