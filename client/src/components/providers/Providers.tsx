import { StoreProvider } from "@/lib/redux";
import { ThemeProvider } from "./ThemProvider";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./ErrorBoundary";

interface ProvidersProps {
  children: React.ReactNode;
}
export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <StoreProvider>
          {children}
          <Toaster />
        </StoreProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
