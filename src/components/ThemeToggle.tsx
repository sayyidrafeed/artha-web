import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/useTheme";

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = (): void => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = (): JSX.Element => {
    if (theme === "system") {
      return <Monitor className="h-4 w-4" />;
    }
    return resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  const getLabel = (): string => {
    if (theme === "system") {
      return "System";
    }
    return theme === "dark" ? "Dark" : "Light";
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={`Current theme: ${getLabel()}. Click to change theme.`}
      title={`Theme: ${getLabel()}`}
    >
      {getIcon()}
    </Button>
  );
}
