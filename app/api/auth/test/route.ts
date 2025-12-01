export const dynamic = "force-dynamic"

export async function GET() {
  console.log("[v0] TEST ENDPOINT HIT")

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  return Response.json({
    message: "Test endpoint working",
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientIdLength: clientId?.length || 0,
    clientSecretLength: clientSecret?.length || 0,
  })
}
