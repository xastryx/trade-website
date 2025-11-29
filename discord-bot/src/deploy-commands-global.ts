import { REST, Routes } from "discord.js"
import dotenv from "dotenv"
import { addItemCommand } from "./commands/additem.js"
import { editItemCommand } from "./commands/edititem.js"
import { removeItemCommand } from "./commands/removeitem.js"
import { bulkAddItemCommand } from "./commands/bulkadditem.js"
import { analyticsCommand } from "./commands/analytics.js"
import { excelUpdateCommand } from "./commands/excel-update.js"

dotenv.config()

const commands = [
  addItemCommand.data.toJSON(),
  editItemCommand.data.toJSON(),
  removeItemCommand.data.toJSON(),
  bulkAddItemCommand.data.toJSON(),
  analyticsCommand.data.toJSON(),
  excelUpdateCommand.data.toJSON(),
]

const rest = new REST().setToken(process.env.DISCORD_TOKEN!)

;(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} global application (/) commands.`)
    console.log(`⚠️  Note: Global commands can take up to 1 hour to update across all servers.`)

    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
      { body: commands },
    )

    console.log(`✅ Successfully reloaded ${(data as any).length} global application (/) commands.`)
    console.log(`⏳ Commands will be available globally within 1 hour.`)
  } catch (error) {
    console.error("❌ Error deploying commands:", error)
  }
})()
