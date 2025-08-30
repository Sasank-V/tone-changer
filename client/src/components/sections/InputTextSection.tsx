import { Button } from "@/components/ui";
import { Undo, Redo } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  undo,
  redo,
  selectCanUndo,
  selectCanRedo,
  type AppDispatch,
  type RootState,
} from "@/lib/redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from "@/components/ui";

export const InputTextSection = ({
  text,
  setText,
  isLoading = false,
}: {
  text: string;
  setText: (t: string) => void;
  isLoading?: boolean;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const canUndo = useSelector((state: RootState) => selectCanUndo(state));
  const canRedo = useSelector((state: RootState) => selectCanRedo(state));

  const handleUndo = () => {
    dispatch(undo());
  };
  const handleRedo = () => {
    dispatch(redo());
  };
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex justify-between items-center">
        <CardTitle className="text-lg">Enter your text</CardTitle>
        {/* Undo/Redo buttons */}
        <div className="flex items-center gap-2 mt-2">
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
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="relative w-full h-full">
          <Textarea
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= 1000) {
                setText(e.target.value);
              }
            }}
            maxLength={1000}
            placeholder="Type or paste your text here... (max 1000 characters)"
            className="w-full h-full resize-none border-none focus:ring-0 focus:outline-none"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-4 text-xs text-muted-foreground">
            {text.length}/1000
          </div>
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="flex items-center gap-2"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
