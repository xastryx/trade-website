import { SlashCommandBuilder, type ChatInputCommandInteraction, AttachmentBuilder, EmbedBuilder } from "discord.js"
import { sql } from "../lib/database.js"
import type { BotCommand } from "../lib/types.js"
import { parseExcelBuffer, generateExampleExcel } from "../lib/excel-parser.js"

export const excelUpdateCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("excel-update")
    .setDescription("Bulk update Adopt Me items from an Excel file")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("upload")
        .setDescription("Upload an Excel file to update items")
        .addAttachmentOption((option) =>
          option.setName("file").setDescription("Excel file (.xlsx or .xls) with item updates").setRequired(true),
        )
        .addBooleanOption((option) =>
          option.setName("dry-run").setDescription("Preview changes without updating database").setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("template").setDescription("Download an example Excel template file"),
    )
    .addSubcommand((subcommand) => subcommand.setName("help").setDescription("Show instructions for Excel format"))
    .setDefaultMemberPermissions(0), // Admin only

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === "template") {
      await handleTemplate(interaction)
    } else if (subcommand === "help") {
      await handleHelp(interaction)
    } else if (subcommand === "upload") {
      await handleUpload(interaction)
    }
  },
}

async function handleTemplate(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const buffer = generateExampleExcel()
    const attachment = new AttachmentBuilder(buffer, { name: "adoptme_template.xlsx" })

    const embed = new EmbedBuilder()
      .setTitle("📊 Excel Template Downloaded")
      .setDescription(
        "Use this template as a guide for your bulk updates.\n\n" +
          "**Required Column:**\n" +
          "• `name` - Item name (must match existing items)\n\n" +
          "**Optional Columns:**\n" +
          "• `rap_value` - RAP value\n" +
          "• `value_fr` - FR variant value\n" +
          "• `value_f` - F variant value\n" +
          "• `value_r` - R variant value\n" +
          "• `value_n` - Normal variant value\n" +
          "• `value_nfr`, `value_nf`, `value_nr` - Neon variants\n" +
          "• `value_mfr`, `value_mf`, `value_mr`, `value_m` - Mega variants\n" +
          "• `value_h` - Hero variant\n" +
          "• `demand` - Demand level\n" +
          "• `rarity` - Rarity level\n" +
          "• `section` - Item section/category\n" +
          "• `image_url` - Valid HTTP/HTTPS link to item image",
      )
      .setColor(0x5865f2)

    await interaction.editReply({ embeds: [embed], files: [attachment] })
  } catch (error) {
    console.error("[v0] Error generating template:", error)
    await interaction.editReply("Failed to generate template file.")
  }
}

async function handleHelp(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("📖 Excel Update Guide")
    .setDescription(
      "**How to use Excel bulk updates:**\n\n" +
        "1. Download the template using `/excel-update template`\n" +
        "2. Fill in your data (keep the header row)\n" +
        "3. Upload using `/excel-update upload`\n\n" +
        "**Important Rules:**\n" +
        "• First column must be `name` (case-insensitive)\n" +
        "• Item names must match existing items in database\n" +
        "• Only include columns you want to update\n" +
        "• Numeric values must be positive numbers\n" +
        "• Image URLs must be valid HTTP/HTTPS links\n" +
        "• Leave cells empty to skip updating that field\n\n" +
        "**Supported Formats:**\n" +
        "• .xlsx (Excel 2007+)\n" +
        "• .xls (Excel 97-2003)\n\n" +
        "**Tips:**\n" +
        "• Use dry-run mode first to preview changes\n" +
        "• Bot will show detailed errors for invalid rows\n" +
        "• Maximum 1000 items per upload",
    )
    .setColor(0x5865f2)
    .setFooter({ text: "Use /excel-update template to get started" })

  await interaction.reply({ embeds: [embed], ephemeral: true })
}

async function handleUpload(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  const attachment = interaction.options.getAttachment("file", true)
  const dryRun = interaction.options.getBoolean("dry-run") || false

  // Validate file
  if (!attachment.name.match(/\.(xlsx|xls)$/i)) {
    await interaction.editReply("Invalid file format. Please upload an Excel file (.xlsx or .xls)")
    return
  }

  if (attachment.size > 10 * 1024 * 1024) {
    // 10MB limit
    await interaction.editReply("File too large. Maximum size is 10MB.")
    return
  }

  try {
    // Download the file
    await interaction.editReply("Downloading and parsing Excel file...")
    const response = await fetch(attachment.url)
    const buffer = Buffer.from(await response.arrayBuffer())

    // Parse the Excel file
    const { items, errors, warnings } = parseExcelBuffer(buffer)

    if (errors.length > 0) {
      const errorMessage =
        "**Parsing Errors:**\n" +
        errors.slice(0, 10).join("\n") +
        (errors.length > 10 ? `\n... and ${errors.length - 10} more errors` : "")

      await interaction.editReply(errorMessage)
      return
    }

    if (items.length === 0) {
      await interaction.editReply("No valid items found in the Excel file.")
      return
    }

    if (items.length > 1000) {
      await interaction.editReply("Too many items. Maximum 1000 items per upload.")
      return
    }

    // Show warnings if any
    let statusMessage = `Found ${items.length} items to update.\n`
    if (warnings.length > 0) {
      statusMessage += `\n**Warnings:**\n${warnings.slice(0, 5).join("\n")}\n`
    }

    if (dryRun) {
      await interaction.editReply(statusMessage + "\n**DRY RUN MODE** - No changes will be made.\n\nProcessing...")
    } else {
      await interaction.editReply(statusMessage + "\nProcessing updates...")
    }

    const results = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const item of items) {
      try {
        if (!dryRun) {
          // Build the item data
          const itemData: any = {
            name: item.name,
            game: "Adopt Me",
            section: item.section || "Pets",
            value: item.value || 0,
            rap_value: item.rap_value || 0,
            neon_value: item.neon_value || 0,
            mega_value: item.mega_value || 0,
            demand: item.demand || null,
            rarity: item.rarity || null,
            image_url: item.image_url || null,
            updated_at: new Date(),
            created_at: new Date(),
          }

          // Add all optional fields from the Excel
          for (const key in item) {
            if (key !== "name" && !itemData.hasOwnProperty(key)) {
              itemData[key] = item[key as keyof typeof item]
            }
          }

          // Use UPSERT - insert if not exists, update if exists
          const columns = Object.keys(itemData)
          const placeholders = columns.map((_, i) => `$${i + 1}`)
          const values = columns.map((col) => itemData[col])

          // Build the UPDATE clause for conflict resolution (exclude created_at)
          const updateColumns = columns.filter((col) => col !== "created_at" && col !== "name" && col !== "game")
          const updateClause = updateColumns.map((col) => `${col} = EXCLUDED.${col}`).join(", ")

          await sql(
            [
              `
              INSERT INTO items (${columns.join(", ")})
              VALUES (${placeholders.join(", ")})
              ON CONFLICT (name, game) 
              DO UPDATE SET ${updateClause}
              RETURNING (xmax = 0) as inserted
            `,
            ] as any,
            ...values,
          )
        }

        // Check if item exists to determine insert vs update for dry run
        const existingItems = await sql`
          SELECT id FROM items WHERE game = 'Adopt Me' AND LOWER(name) = LOWER(${item.name}) LIMIT 1
        `

        if (existingItems.length > 0) {
          results.updated++
        } else {
          results.inserted++
        }
      } catch (error: any) {
        results.failed++
        results.errors.push(`Failed to process "${item.name}": ${error.message}`)
      }
    }

    // Build final response
    const embed = new EmbedBuilder()
      .setTitle(dryRun ? "🔍 Dry Run Results" : "✅ Update Complete")
      .setColor(dryRun ? 0xffa500 : results.failed > 0 ? 0xff6b6b : 0x51cf66)

    let description = ""
    if (dryRun) {
      description += `**Would insert:** ${results.inserted} new items\n`
      description += `**Would update:** ${results.updated} existing items\n`
    } else {
      description += `**Inserted:** ${results.inserted} new items\n`
      description += `**Updated:** ${results.updated} existing items\n`
    }
    description += `**Failed:** ${results.failed} items\n`

    if (results.errors.length > 0) {
      description += `\n**Errors:**\n${results.errors.slice(0, 10).join("\n")}`
      if (results.errors.length > 10) {
        description += `\n... and ${results.errors.length - 10} more errors`
      }
    }

    if (!dryRun && (results.inserted > 0 || results.updated > 0)) {
      description += `\n\n💡 Changes are now live on the website!`
    }

    if (dryRun && (results.inserted > 0 || results.updated > 0)) {
      description += `\n\n💡 Run without dry-run to apply these changes.`
    }

    embed.setDescription(description)

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error("[v0] Error processing Excel upload:", error)
    await interaction.editReply("Failed to process Excel file. Please check the format and try again.")
  }
}
