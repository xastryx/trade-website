import { getSession } from "@/lib/auth/session"
import { removeFromInventory } from "@/lib/db/inventory"
import { createActivity } from "@/lib/db/activities"

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params

  try {
    await removeFromInventory(id, session.discordId)

    await createActivity(session.discordId, "remove_inventory", { inventory_id: id })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error removing from inventory:", error)
    return Response.json({ error: "Failed to remove from inventory" }, { status: 500 })
  }
}
