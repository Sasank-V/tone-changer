import * as React from "react";
import { HistorySection } from "@/components/sections";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { HistoryState } from "@/lib/redux";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onHistorySelect?: (historyItem: HistoryState) => void;
}

export function AppSidebar({ onHistorySelect, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-2">
          <h2 className="text-lg font-semibold">Chat History</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <HistorySection onHistorySelect={onHistorySelect || (() => {})} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
