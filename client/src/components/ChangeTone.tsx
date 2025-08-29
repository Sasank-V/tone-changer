import {
  InputTextSection,
  TonePickerSection,
  OutputTextSection,
} from "@/components/sections";
import { useDispatch, useSelector } from "react-redux";
import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  addHistory,
  incrementTryAgain,
  selectCurrentState,
  type HistoryState,
  type AppDispatch,
  type RootState,
  useChangeToneMutation,
} from "@/lib/redux";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { RotateCcw } from "lucide-react";

const defaultTone = { row: 1, col: 1 };

interface ChangeToneRef {
  handleHistorySelect: (historyItem: HistoryState) => void;
}

const ChangeTone = forwardRef<ChangeToneRef>((_, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [tonePos, setTonePos] = useState(defaultTone);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  // Get current state from Redux for undo/redo
  const currentState = useSelector((state: RootState) =>
    selectCurrentState(state)
  );

  // RTK Query mutation
  const [changeTone, { isLoading: isChangingTone }] = useChangeToneMutation();

  // Sync local state with Redux current state (for undo/redo)
  useEffect(() => {
    if (currentState) {
      setInputText(currentState.inputText);
      setOutputText(currentState.output);
      setTonePos({
        row: currentState.toneState.y,
        col: currentState.toneState.x,
      });
      setCurrentHistoryId(currentState.id);
    }
  }, [currentState]);

  // Map matrix position to tone labels
  const toneMatrixMap = useMemo(
    () => [
      [
        ["concise", "professional"],
        ["professional"],
        ["expanded", "professional"],
      ],
      [["concise"], ["center"], ["expanded"]],
      [["casual", "concise"], ["casual"], ["casual", "expanded"]],
    ],
    []
  );

  // Handle tone change with API call
  const handleToneChange = async (newTonePos: { row: number; col: number }) => {
    setTonePos(newTonePos);

    // If center position or no input text, just update position
    if (
      (newTonePos.row === 1 && newTonePos.col === 1) ||
      inputText.trim() === ""
    ) {
      return;
    }

    try {
      const tones = toneMatrixMap[newTonePos.row][newTonePos.col];
      const response = await changeTone({
        text: inputText,
        tones,
      }).unwrap();

      const newOutput = response.result;
      setOutputText(newOutput);

      // Save to history: inputText + tones = output
      const historyItem = {
        inputText,
        tones,
        toneState: { x: newTonePos.col, y: newTonePos.row },
        output: newOutput,
        tryAgainCount: 0,
      };

      dispatch(addHistory(historyItem));
      setCurrentHistoryId(historyItem.inputText + tones.join("") + Date.now()); // Simple ID
      toast.success("Tone changed successfully");
    } catch (error) {
      console.error("Failed to change tone:", error);
      toast.error("Tone change failed, try again later");
    }
  };

  // Handle try again
  const handleTryAgain = async () => {
    if (inputText.trim() === "" || (tonePos.row === 1 && tonePos.col === 1)) {
      return;
    }

    try {
      const tones = toneMatrixMap[tonePos.row][tonePos.col];
      const response = await changeTone({
        text: inputText,
        tones,
        tryAgain: true,
      }).unwrap();

      const newOutput = response.result;
      setOutputText(newOutput);

      // Update try again count and save new history item
      if (currentHistoryId) {
        dispatch(incrementTryAgain(currentHistoryId));
      }

      const historyItem = {
        inputText,
        tones,
        toneState: { x: tonePos.col, y: tonePos.row },
        output: newOutput,
        tryAgainCount: 1,
      };

      dispatch(addHistory(historyItem));
      toast.success("Generated new version");
    } catch (error) {
      console.error("Failed to try again:", error);
      toast.error("Try again failed");
    }
  };

  // Handle history selection from sidebar
  const handleHistorySelect = (historyItem: HistoryState) => {
    setInputText(historyItem.inputText);
    setOutputText(historyItem.output);
    setTonePos({
      row: historyItem.toneState.y,
      col: historyItem.toneState.x,
    });
    setCurrentHistoryId(historyItem.id);
    toast.success("History item loaded successfully");
  };

  // Expose handleHistorySelect via ref
  useImperativeHandle(ref, () => ({
    handleHistorySelect,
  }));

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Main content area with responsive layout */}
      <div className="h-full p-6">
        {/* Mobile layout: Input -> Tone Picker -> Output */}
        <div className="flex flex-col gap-4 lg:hidden">
          <div
            className="flex-shrink-0"
            style={{ height: "40vh", minHeight: 200 }}
          >
            <InputTextSection
              text={inputText}
              setText={setInputText}
              isLoading={isChangingTone}
            />
          </div>

          <div
            className="flex-shrink-0"
            style={{ height: "50vh", minHeight: 120 }}
          >
            <TonePickerSection
              tonePos={tonePos}
              setTonePos={handleToneChange}
              disabled={isChangingTone || inputText.trim() === ""}
            />

            {/* Try Again Button */}
            {outputText && (
              <Button
                onClick={handleTryAgain}
                disabled={isChangingTone || inputText.trim() === ""}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>

          <div
            className="flex-shrink-0 overflow-y-auto"
            style={{ height: "40vh", minHeight: 200 }}
          >
            <OutputTextSection
              outputText={outputText}
              isLoading={isChangingTone}
            />
          </div>
        </div>

        {/* Desktop layout: Input/Output column + Tone Picker column */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 h-full overflow-hidden">
          {/* Left column - Input and Output */}
          <div className="flex flex-col gap-4 h-full overflow-hidden">
            <div className="flex-1 min-h-0">
              <InputTextSection
                text={inputText}
                setText={setInputText}
                isLoading={isChangingTone}
              />
            </div>
            <div className="flex-1 min-h-0">
              <OutputTextSection
                outputText={outputText}
                isLoading={isChangingTone}
              />
            </div>
          </div>

          {/* Right column - Tone Picker */}
          <div className="flex flex-col items-center justify-center gap-4 h-full">
            <TonePickerSection
              tonePos={tonePos}
              setTonePos={handleToneChange}
              disabled={isChangingTone || inputText.trim() === ""}
            />

            {/* Try Again Button */}
            {outputText && (
              <Button
                onClick={handleTryAgain}
                disabled={isChangingTone || inputText.trim() === ""}
                variant="outline"
                className="mt-4"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ChangeTone.displayName = "ChangeTone";

export default ChangeTone;
