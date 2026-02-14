import { Github, Chrome, AlertCircle } from "lucide-react";
import { Button, Alert, AlertDescription } from "@/components/ui";
import { useSignIn } from "../hooks/useAuth";
import type { OAuthProvider } from "@/schemas/auth";

export interface LoginButtonProps {
  provider: OAuthProvider;
  className?: string;
}

export function LoginButton({ provider, className }: LoginButtonProps): JSX.Element {
  const { mutate: signIn, isPending, error } = useSignIn();

  const handleClick = (): void => {
    signIn(provider);
  };

  const icon =
    provider === "github" ? <Github className="h-4 w-4" /> : <Chrome className="h-4 w-4" />;

  const label = provider === "github" ? "Sign in with GitHub" : "Sign in with Google";

  return (
    <div className="space-y-2">
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
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
