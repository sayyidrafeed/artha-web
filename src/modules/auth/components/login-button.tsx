import { Github, Chrome } from "lucide-react"
import { Button } from "@/components/ui"
import { useSignIn } from "../hooks/use-auth"
import type { OAuthProvider } from "@/schemas/auth"

export interface LoginButtonProps {
  provider: OAuthProvider
  className?: string
}

export function LoginButton({
  provider,
  className,
}: LoginButtonProps): JSX.Element {
  const { mutate: signIn, isPending } = useSignIn()

  const handleClick = (): void => {
    signIn(provider)
  }

  const icon =
    provider === "github" ? (
      <Github className="h-4 w-4" />
    ) : (
      <Chrome className="h-4 w-4" />
    )

  const label =
    provider === "github" ? "Sign in with GitHub" : "Sign in with Google"

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={handleClick}
      disabled={isPending}
    >
      {icon}
      <span>{label}</span>
    </Button>
  )
}
