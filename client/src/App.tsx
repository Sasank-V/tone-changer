import { Providers } from "./components/providers";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import ChangeTone from "./components/ChangeTone";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./components/ModeToggle";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Undo, Redo } from "lucide-react";
import type { HistoryState } from "@/lib/redux/slices";
import { undo, redo, selectCanUndo, selectCanRedo } from "@/lib/redux/slices";
import type { AppDispatch, RootState } from "@/lib/redux/store";

function AppContent() {
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
          <h1 className="text-xl font-semibold">Tone Changer</h1>

          {/* Undo/Redo buttons and Theme Toggle */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="h-8 px-3"
            >
              <Undo className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              className="h-8 px-3"
            >
              <Redo className="h-4 w-4 mr-1" />
              Redo
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

function App() {
  return (
    <Providers>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </Providers>
  );
}

export default App;
