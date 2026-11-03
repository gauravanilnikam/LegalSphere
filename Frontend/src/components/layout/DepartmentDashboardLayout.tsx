import { ReactNode } from "react";
import DepartmentDashboardSidebar from "./DepartmentDashboardSidebar";
import { RoleSwitcher } from "@/components/common/RoleSwitcher";
import { Button } from "@/components/ui/button";
import { Bell, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface DepartmentDashboardLayoutProps {
  children: ReactNode;
}

export const DepartmentDashboardLayout = ({ children }: DepartmentDashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DepartmentDashboardSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header - aligned with Legal layout */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-foreground hover:bg-accent" />
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search documents, requests..."
                    className="pl-10 w-80 bg-background/50 border-border"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative hover:bg-accent">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <Settings className="w-4 h-4" />
                </Button>
                <RoleSwitcher />
              </div>
            </div>
          </header>

          {/* Main Content - aligned with Legal layout */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full pattern-background">
              <div className="h-full bg-background/95 backdrop-blur-sm">
                {/* Standard page padding and container to match legal */}
                <div className="p-6">
                  <div className="mx-auto max-w-screen-2xl">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
