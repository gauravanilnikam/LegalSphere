import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  FileText,
  ClipboardList,
  BarChart3,
  Plus,
  Menu,
  X,
  Scale,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock user type - replace with actual auth
const mockUser = {
  role: "legal", // "legal" | "department"
  name: "Sarah Johnson",
  department: "Legal Team",
};

const legalNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Draft Contracts", url: "/draft", icon: FileText },
  { title: "Tasks & Requests", url: "/tasks", icon: ClipboardList },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const departmentNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Create Document", url: "/create", icon: Plus },
  { title: "My Requests", url: "/requests", icon: ClipboardList },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isLegalUser = mockUser.role === "legal";
  const navItems = isLegalUser ? legalNavItems : departmentNavItems;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) =>
    cn(
      "group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
      isActive(path)
        ? "bg-primary/10 text-primary border-l-2 border-primary"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    );

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div className="flex items-center px-6 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-primary" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-semibold text-sidebar-foreground">
                  ContractsHereAI
                </h1>
                <p className="text-xs text-sidebar-foreground/60">
                  {mockUser.department}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-4 py-4">
          <SidebarGroupLabel className="text-sidebar-foreground/80 px-2 mb-2">
            {isLegalUser ? "Legal Tools" : "Document Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                      {isActive(item.url) && !collapsed && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {mockUser.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {isLegalUser ? "Legal Team" : mockUser.department}
                </p>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}