import { useSelector } from "react-redux";
import { selectHistory, type HistoryState, type RootState } from "@/lib/redux";
import { Card, CardContent, Badge } from "@/components/ui";

interface HistorySectionProps {
  onHistorySelect: (historyItem: HistoryState) => void;
}

export const HistorySection = ({ onHistorySelect }: HistorySectionProps) => {
  const history = useSelector((state: RootState) => selectHistory(state));

  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No history yet. Start by entering text and changing tones!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {history.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onHistorySelect(item)}
            >
              <CardContent className="pt-0">
                <div className="mb-2">
                  <span className="font-semibold text-xs mr-1">Input:</span>
                  <span className="text-sm text-muted-foreground">
                    {item.inputText.substring(0, 60)}
                    {item.inputText.length > 60 ? "..." : ""}
                  </span>
                </div>
                <div className="mb-2 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-xs">Tones:</span>
                  {item.tones.map((tone) => (
                    <Badge key={tone} variant="secondary" className="text-xs">
                      {tone}
                    </Badge>
                  ))}
                  {item.tryAgainCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Try Again: {item.tryAgainCount}
                    </Badge>
                  )}
                </div>
                {item.output && (
                  <div className="mb-2">
                    <span className="font-semibold text-xs mr-1">Output:</span>
                    <span className="text-sm text-muted-foreground">
                      {item.output.substring(0, 60)}
                      {item.output.length > 60 ? "..." : ""}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
