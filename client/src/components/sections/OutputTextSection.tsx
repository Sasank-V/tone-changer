import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Button,
} from "@/components/ui";
import { Copy, Check, RotateCcw } from "lucide-react";
import { useState } from "react";

export const OutputTextSection = ({
  outputText,
  isLoading = false,
  showTryAgain = false,
  onTryAgain,
  tryAgainDisabled = false,
}: {
  outputText: string;
  isLoading?: boolean;
  showTryAgain?: boolean;
  onTryAgain?: () => void;
  tryAgainDisabled?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (outputText) {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Output</CardTitle>
          <div className="flex gap-2">
            {outputText && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-3"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            )}
            {showTryAgain && onTryAgain && (
              <Button
                onClick={onTryAgain}
                disabled={tryAgainDisabled}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <RotateCcw />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="relative w-full h-full">
          <Textarea
            value={outputText}
            readOnly
            placeholder={
              isLoading
                ? "Generating response..."
                : "Output will appear here after tone change"
            }
            className="w-full h-full resize-none border-none focus:ring-0 focus:outline-none"
            disabled={isLoading}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">
                  Processing...
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
