import { StoreProvider } from "@/lib/redux";
import { ThemeProvider } from "./ThemProvider";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./ErrorBoundary";
import { SidebarProvider } from "../ui";

interface ProvidersProps {
  children: React.ReactNode;
}
export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <StoreProvider>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </StoreProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
