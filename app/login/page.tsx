import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { DiscordLoginButton } from "@/components/discord-login-button"

const errorMessages: Record<string, string> = {
  oauth_denied: "You denied the Discord authorization request.",
  invalid_state: "Invalid authentication state. Please try again.",
  config_error: "Server configuration error. Please contact support.",
  token_exchange_failed: "Failed to exchange authorization code. Please try again.",
  user_fetch_failed: "Failed to fetch your Discord profile. Please try again.",
  database_error: "Database error occurred. Please try again later.",
  unexpected_error: "An unexpected error occurred. Please try again or contact support.",
  cookies_required: "Please accept cookies to sign in with Discord. Cookies are essential for authentication.",
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error
  const errorMessage = error ? errorMessages[error] || "An unknown error occurred." : null

  return (
    <main className="relative min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 bg-[url('/login/pattern.png')] bg-repeat bg-[length:240px_auto] mix-blend-screen [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)]"
        />
        <div className="absolute -inset-[10px] opacity-50">
          <div
            aria-hidden="true"
            className="absolute top-0 -left-4 w-72 h-72 rounded-full bg-foreground/15 mix-blend-screen filter blur-xl opacity-70 animate-blob"
          />
          <div
            aria-hidden="true"
            className="absolute top-0 -right-4 w-72 h-72 rounded-full bg-foreground/12 mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-8 left-20 w-72 h-72 rounded-full bg-foreground/10 mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000"
          />
        </div>
      </div>

      <Card className="relative z-10 w-full max-w-md backdrop-blur-sm bg-card/95 border-2">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Welcome to TRADE</CardTitle>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CardDescription>Sign in with Discord to access your profile and start trading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <DiscordLoginButton />
          
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
