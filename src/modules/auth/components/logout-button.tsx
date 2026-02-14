import { LogOut, AlertCircle } from "lucide-react";
import { Button, Alert, AlertDescription } from "@/components/ui";
import { useSignOut } from "../hooks/useAuth";

export interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  className?: string;
}

export function LogoutButton({ variant = "ghost", className }: LogoutButtonProps): JSX.Element {
  const { mutate: signOut, isPending, error } = useSignOut();

  const handleClick = (): void => {
    signOut();
  };

  return (
    <div className="space-y-2">
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
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
