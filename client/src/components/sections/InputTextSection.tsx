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
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg">Enter your text</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="relative w-full h-full">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-full resize-none border-none focus:ring-0 focus:outline-none"
            disabled={isLoading}
          />
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
