import { Wallet } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui"
import { LoginButton } from "../components/login-button"

export function LoginPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Artha</CardTitle>
          <CardDescription>
            Sign in to access your personal finance dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <LoginButton provider="github" className="w-full" />
            <LoginButton provider="google" className="w-full" />
          </div>
          <div className="rounded-md bg-muted/50 p-3 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Owner Access Only</p>
            <p className="mt-1 text-xs">
              This application is restricted to the owner account only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
