import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

const labels = {
  top: ["Professional"],
  left: ["Concise"],
  right: ["Expanded"],
  bottom: ["Casual"],
};

interface TonePickerSectionProps {
  tonePos: { row: number; col: number };
  setTonePos: (pos: { row: number; col: number }) => void;
  disabled?: boolean;
  onCenterCell?: () => void;
}

export const TonePickerSection = ({
  tonePos,
  setTonePos,
  disabled = false,
  onCenterCell,
}: TonePickerSectionProps) => {
  const grid = [0, 1, 2];
  const handleClick = (row: number, col: number) => {
    if (!disabled) {
      setTonePos({ row, col });
      if (row === 1 && col === 1 && onCenterCell) {
        onCenterCell();
      }
    }
  };
  return (
    <section className="w-full h-full flex items-center justify-center relative">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="font-semibold">Adjust Tone</h1>
        <div className="relative">
          <div
            className={cn(
              "grid grid-cols-3 grid-row-3",
              disabled && "opacity-50 pointer-events-none"
            )}
          >
            {grid.map((r) =>
              grid.map((c) => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleClick(r, c)}
                  className={cn(
                    "size-20 border flex items-center justify-center cursor-pointer select-none",
                    disabled && "cursor-not-allowed"
                  )}
                >
                  {r == 1 && c == 1 && (
                    <RotateCcw className="text-muted-foreground size-4" />
                  )}
                </div>
              ))
            )}
            {/* Labels */}
            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
              {labels.top}
            </span>
            <span className="absolute -rotate-90 -left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {labels.left}
            </span>
            <span className="absolute -right-3 rotate-90 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {labels.right}
            </span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
              {labels.bottom}
            </span>

            {/* Cursor */}
            <motion.div
              className="absolute w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-md flex items-center justify-center"
              animate={{
                top: tonePos.row * 5 + 1.75 + "rem",
                left: tonePos.col * 5 + 1.75 + "rem",
              }}
            ></motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
