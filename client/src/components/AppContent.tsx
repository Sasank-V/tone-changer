import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Undo, Redo, Sparkles } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { ChangeTone } from "@/components/ChangeTone";
import { ModeToggle } from "@/components/theme";
import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
  Separator,
  Button,
} from "@/components/ui";
import {
  undo,
  redo,
  selectCanUndo,
  selectCanRedo,
  type HistoryState,
  type AppDispatch,
  type RootState,
} from "@/lib/redux";

export function AppContent() {
  const changeToneRef = useRef<{
    handleHistorySelect: (item: HistoryState) => void;
  } | null>(null);
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const dispatch = useDispatch<AppDispatch>();
  const canUndo = useSelector((state: RootState) => selectCanUndo(state));
  const canRedo = useSelector((state: RootState) => selectCanRedo(state));

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

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="h-7 px-2 text-sm sm:h-8 sm:px-3"
            >
              <Undo className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden xs:inline">Undo</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              className="h-7 px-2 text-sm sm:h-8 sm:px-3"
            >
              <Redo className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden xs:inline">Redo</span>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <ModeToggle />
          </div>
        </header>
        <ChangeTone ref={changeToneRef} />
      </SidebarInset>
    </>
  );
}
