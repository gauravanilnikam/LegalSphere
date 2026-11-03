import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DepartmentDashboardLayout } from "./components/layout/DepartmentDashboardLayout";
import Dashboard from "./pages/Dashboard";
import DraftContracts from "./pages/DraftContracts";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DepartmentDashboard from "./pages/department/DepartmentDashboard";
import Documents from "./pages/department/Documents";
import Requests from "./pages/department/Requests";
import DepartmentAnalytics from "./pages/department/DepartmentAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            
            {/* Legal Team Routes */}
            <Route element={<ProtectedRoute allowedRoles={["LEGAL_TEAM"]} />}>
              <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
              <Route path="/draft" element={<DashboardLayout><DraftContracts /></DashboardLayout>} />
              <Route path="/tasks" element={<DashboardLayout><Tasks /></DashboardLayout>} />
              <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
            </Route>

            {/* Shared Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/create" element={<DashboardLayout><DraftContracts /></DashboardLayout>} />
              <Route path="/requests" element={<DashboardLayout><Tasks /></DashboardLayout>} />
            </Route>
            
            {/* Department Routes */}
            <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
              <Route path="/department/dashboard" element={<DepartmentDashboardLayout><DepartmentDashboard /></DepartmentDashboardLayout>} />
              <Route path="/department/documents" element={<DepartmentDashboardLayout><Documents /></DepartmentDashboardLayout>} />
              <Route path="/department/requests" element={<DepartmentDashboardLayout><Requests /></DepartmentDashboardLayout>} />
              <Route path="/department/analytics" element={<DepartmentDashboardLayout><DepartmentAnalytics /></DepartmentDashboardLayout>} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
