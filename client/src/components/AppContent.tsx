import { useRef } from "react";
import { Sparkles } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { ChangeTone } from "@/components/ChangeTone";
import { ModeToggle } from "@/components/theme";
import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
  Separator,
} from "@/components/ui";
import { type HistoryState } from "@/lib/redux";

export function AppContent() {
  const changeToneRef = useRef<{
    handleHistorySelect: (item: HistoryState) => void;
  } | null>(null);
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const handleHistorySelect = (historyItem: HistoryState) => {
    if (changeToneRef.current) {
      changeToneRef.current.handleHistorySelect(historyItem);
    }
    // Close the sidebar after selecting an item
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  return (
    <>
      <AppSidebar onHistorySelect={handleHistorySelect} />
      <SidebarInset>
        {/* Header with sidebar trigger and title */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-base sm:text-xl font-semibold flex gap-2 items-center">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Tone Changer</span>
          </h1>

          {/* Undo/Redo buttons and Theme Toggle */}
          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
          </div>
        </header>
        <ChangeTone ref={changeToneRef} />
      </SidebarInset>
    </>
  );
}
