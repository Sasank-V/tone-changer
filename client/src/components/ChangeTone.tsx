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

const defaultTone = { row: 1, col: 1 };

interface ChangeToneRef {
  handleHistorySelect: (historyItem: HistoryState) => void;
}

export const ChangeTone = forwardRef<ChangeToneRef>((_, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [tonePos, setTonePos] = useState(defaultTone);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [showTryAgain, setShowTryAgain] = useState<boolean>(false);
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
      setShowTryAgain(true);

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
      setOutputText("");
      setShowTryAgain(true);
      toast.error("Tone change failed, try again later");
    }
  };

  // Callback for center cell (1,1)
  const handleCenterCell = () => {
    setOutputText("");
    setShowTryAgain(false);
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
      setShowTryAgain(true);

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
      setShowTryAgain(true);
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
      <div className="p-6">
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
            className="flex flex-col gap-2 items-center"
            style={{ height: "50vh", minHeight: 120 }}
          >
            <TonePickerSection
              tonePos={tonePos}
              setTonePos={handleToneChange}
              disabled={isChangingTone || inputText.trim() === ""}
              onCenterCell={handleCenterCell}
            />
          </div>

          <div
            className="flex-shrink-0 overflow-y-auto"
            style={{ height: "40vh", minHeight: 200 }}
          >
            <OutputTextSection
              outputText={outputText}
              isLoading={isChangingTone}
              showTryAgain={showTryAgain}
              onTryAgain={handleTryAgain}
              tryAgainDisabled={isChangingTone || inputText.trim() === ""}
            />
          </div>
        </div>

        {/* Desktop layout: Input/Output column + Tone Picker column */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)] overflow-hidden">
          {/* Left column - Input and Output */}
          <div className="flex flex-col gap-4 h-full overflow-y-auto">
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
                showTryAgain={showTryAgain}
                onTryAgain={handleTryAgain}
                tryAgainDisabled={isChangingTone || inputText.trim() === ""}
              />
            </div>
          </div>

          {/* Right column - Tone Picker */}
          <div className="flex flex-col items-center justify-center gap-4 h-full overflow-y-auto">
            <TonePickerSection
              tonePos={tonePos}
              setTonePos={handleToneChange}
              disabled={isChangingTone || inputText.trim() === ""}
              onCenterCell={handleCenterCell}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

ChangeTone.displayName = "ChangeTone";
