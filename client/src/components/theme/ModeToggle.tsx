import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    // smaller on very small screens, normal on sm+
    const cls = "h-3 w-3 sm:h-[1.2rem] sm:w-[1.2rem]";
    switch (theme) {
      case "light":
        return <Sun className={cls} />;
      case "dark":
        return <Moon className={cls} />;
      case "system":
        return <Monitor className={cls} />;
      default:
        return <Sun className={cls} />;
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      title={`Current theme: ${theme}. Click to toggle`}
      className="p-1 sm:p-2"
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
