import { LogOut } from "lucide-react"
import { Button } from "@/components/ui"
import { useSignOut } from "../hooks/use-auth"

export interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline"
  className?: string
}

export function LogoutButton({
  variant = "ghost",
  className,
}: LogoutButtonProps): JSX.Element {
  const { mutate: signOut, isPending } = useSignOut()

  const handleClick = (): void => {
    signOut()
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={handleClick}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </Button>
  )
}
