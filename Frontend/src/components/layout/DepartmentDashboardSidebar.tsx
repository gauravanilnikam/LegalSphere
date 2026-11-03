import { LayoutDashboard, FileText, ListTodo, BarChart3, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarProvider, // removed to avoid nested providers
  // SidebarTrigger, // trigger lives in layout header
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/department/dashboard", icon: LayoutDashboard },
  { title: "Documents", url: "/department/documents", icon: FileText },
  { title: "Requests", url: "/department/requests", icon: ListTodo },
  { title: "Analytics", url: "/department/analytics", icon: BarChart3 },
];

const DepartmentSidebarContent = () => {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const department = localStorage.getItem("userDepartment") || "Department";
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname.startsWith(path);
  const getNavClassName = (path: string) =>
    cn(
      "group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
      isActive(path)
        ? "bg-primary/10 text-primary border-l-2 border-primary"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    );

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userDepartment");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">ContractsHereAI</h2>
              <p className="text-xs text-sidebar-foreground/60">{department}</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="bg-sidebar">
        <SidebarGroup className="px-4 py-4">
          <SidebarGroupLabel className="text-sidebar-foreground/80 px-2 mb-2">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
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
      </SidebarContent>

      <div className="mt-auto p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </Sidebar>
  );
};

const DepartmentDashboardSidebar = () => {
  return <DepartmentSidebarContent />;
};

export default DepartmentDashboardSidebar;
