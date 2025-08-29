import { useSelector } from "react-redux";
import { selectHistory, type HistoryState, type RootState } from "@/lib/redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";

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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {history.map((item, index) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onHistorySelect(item)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Conversation {index + 1}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {item.inputText.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-2 flex-wrap">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
