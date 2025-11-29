import { sql } from "@/lib/neon/server"

export interface AdoptMePetValue {
  id?: string
  name: string
  game: "Adopt Me"
  section: string

  // Core values
  base_value: number
  neon_value: number
  mega_value: number

  // Potion bonuses
  fly_bonus?: number
  ride_bonus?: number

  // Display metadata
  image_url?: string
  rarity?: string
  demand?: string

  // Value tracking
  last_value_update: Date
  value_notes?: string

  // Audit trail stored in JSONB
  value_history?: Array<{
    variant: "base" | "neon" | "mega"
    old_value: number
    new_value: number
    changed_at: Date
    changed_by?: string
    reason?: string
  }>

  created_at?: Date
  updated_at?: Date
}

export async function getAdoptMePets(): Promise<AdoptMePetValue[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        game,
        section,
        value as base_value,
        neon_value,
        mega_value,
        fly_bonus,
        ride_bonus,
        image_url,
        rarity,
        demand,
        updated_at as last_value_update,
        created_at,
        updated_at
      FROM items
      WHERE game = 'Adopt Me'
      ORDER BY value DESC
    `

    return result.map((pet: any) => ({
      ...pet,
      base_value: Number(pet.base_value) || 0,
      neon_value: Number(pet.neon_value) || 0,
      mega_value: Number(pet.mega_value) || 0,
      fly_bonus: Number(pet.fly_bonus) || 50,
      ride_bonus: Number(pet.ride_bonus) || 50,
    }))
  } catch (error) {
    console.error("[v0] Error fetching Adopt Me pets:", error)
    return []
  }
}

export async function updatePetValue(
  id: string,
  variant: "base" | "neon" | "mega",
  newValue: number,
  changedBy?: string,
  reason?: string,
): Promise<boolean> {
  try {
    const fieldName = variant === "base" ? "value" : variant === "neon" ? "neon_value" : "mega_value"

    // Get current value for history
    const current = await sql`
      SELECT ${sql(fieldName)} as current_value
      FROM items
      WHERE id = ${id}
    `

    if (current.length === 0) return false

    const oldValue = Number(current[0].current_value) || 0

    // Create history entry
    const historyEntry = {
      variant,
      old_value: oldValue,
      new_value: newValue,
      changed_at: new Date(),
      changed_by: changedBy,
      reason,
    }

    // Update the value
    await sql`
      UPDATE items
      SET 
        ${sql(fieldName)} = ${newValue},
        updated_at = NOW()
      WHERE id = ${id}
    `

    return true
  } catch (error) {
    console.error("[v0] Error updating pet value:", error)
    return false
  }
}

export async function createAdoptMePet(
  pet: Omit<AdoptMePetValue, "id" | "created_at" | "updated_at" | "last_value_update">,
): Promise<AdoptMePetValue | null> {
  try {
    const result = await sql`
      INSERT INTO items (
        name,
        game,
        section,
        value,
        neon_value,
        mega_value,
        fly_bonus,
        ride_bonus,
        image_url,
        rarity,
        demand
      ) VALUES (
        ${pet.name},
        'Adopt Me',
        ${pet.section},
        ${pet.base_value},
        ${pet.neon_value},
        ${pet.mega_value},
        ${pet.fly_bonus || 50},
        ${pet.ride_bonus || 50},
        ${pet.image_url || null},
        ${pet.rarity || null},
        ${pet.demand || null}
      )
      RETURNING *
    `

    if (result.length === 0) return null

    return {
      ...result[0],
      base_value: Number(result[0].value),
      neon_value: Number(result[0].neon_value),
      mega_value: Number(result[0].mega_value),
    } as AdoptMePetValue
  } catch (error) {
    console.error("[v0] Error creating Adopt Me pet:", error)
    return null
  }
}
