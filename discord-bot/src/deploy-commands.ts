import { REST, Routes } from "discord.js"
import dotenv from "dotenv"
import { addItemCommand } from "./commands/additem.js"
import { editItemCommand } from "./commands/edititem.js"
import { removeItemCommand } from "./commands/removeitem.js"
import { bulkAddItemCommand } from "./commands/bulkadditem.js"
import { analyticsCommand } from "./commands/analytics.js"
import { excelUpdateCommand } from "./commands/excel-update.js"

dotenv.config()

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error("❌ Error: DISCORD_BOT_TOKEN is not set!")
  console.error("📝 Please create a .env file in the discord-bot folder with:")
  console.error("   DISCORD_BOT_TOKEN=your_bot_token_here")
  console.error("   DISCORD_CLIENT_ID=your_client_id_here")
  console.error("   DISCORD_GUILD_ID=your_guild_id_here")
  process.exit(1)
}

if (!process.env.DISCORD_CLIENT_ID) {
  console.error("❌ Error: DISCORD_CLIENT_ID is not set!")
  console.error("📝 Please add DISCORD_CLIENT_ID to your .env file")
  process.exit(1)
}

if (!process.env.DISCORD_GUILD_ID) {
  console.error("❌ Error: DISCORD_GUILD_ID is not set!")
  console.error("📝 Please add DISCORD_GUILD_ID to your .env file")
  process.exit(1)
}

const commands = [
  addItemCommand.data.toJSON(),
  editItemCommand.data.toJSON(),
  removeItemCommand.data.toJSON(),
  bulkAddItemCommand.data.toJSON(),
  analyticsCommand.data.toJSON(),
  excelUpdateCommand.data.toJSON(),
]

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN)
;(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`)

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands },
    )

    console.log(`✅ Successfully reloaded ${(data as any).length} application (/) commands.`)
  } catch (error) {
    console.error("❌ Error deploying commands:", error)
  }
})()
