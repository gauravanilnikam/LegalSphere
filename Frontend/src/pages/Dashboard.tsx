import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Download,
  Eye,
  Plus,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
        // Fetch unassigned/pending requests for my company
        const pendingRes = await fetch(`${API_BASE}/api/v1/requests/unassigned`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        // Fetch tasks assigned to me
        const myRes = await fetch(`${API_BASE}/api/v1/requests/assigned`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (pendingRes.ok && myRes.ok) {
            const pendingData = await pendingRes.json();
            const myData = await myRes.json();
            setAvailableRequests(pendingData);
            setMyTasks(myData);
        }
    } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast({ title: "Error", description: "Failed to load dashboard data", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAssignToMe = async (requestId: string) => {
    try {
        const response = await fetch(`${API_BASE}/api/v1/requests/${requestId}/assign`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            toast({ title: "Success", description: "Request assigned to you" });
            fetchData(); // Refresh lists
        } else {
            const data = await response.json();
            toast({ title: "Error", description: data.message || "Failed to assign request", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Error", description: "Failed to assign request", variant: "destructive" });
    }
  };

  const handleMarkComplete = async (requestId: string) => {
      try {
          const response = await fetch(`${API_BASE}/api/v1/requests/${requestId}/status?status=COMPLETED`, {
              method: "PUT",
              headers: { "Authorization": `Bearer ${token}` }
          });

          if (response.ok) {
              toast({ title: "Success", description: "Task marked as completed" });
              fetchData();
          } else {
              const text = await response.text();
              toast({ title: "Error", description: text || "Failed to update status", variant: "destructive" });
          }
      } catch (error) {
          toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-500/10 text-green-500 border-green-500/30",
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      review: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      expired: "bg-red-500/10 text-red-500 border-red-500/30",
      in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      completed: "bg-green-500/10 text-green-500 border-green-500/30",
    };
    return variants[status.toLowerCase()] || variants.pending;
  };

  // Combine lists for the "All Contracts" view if needed, or just show Available Requests
  // For the main table, let's show Available Requests (Pending) as that's the "Inbox" for Legal Team
  
  const filteredRequests = availableRequests.filter((req) => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    // req.requestedBy.department is available from backend
    const matchesDepartment = departmentFilter === "all" || req.requestedBy?.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Legal Team Dashboard</h1>
        <p className="text-muted-foreground">
          {user?.companyName} - Manage incoming contract requests
        </p>
      </div>

      {/* Stats Cards - Calculated from real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in">
        <Card className="card-professional hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Requests
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{availableRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for assignment
            </p>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Active Tasks
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{myTasks.filter(t => t.status === 'in_progress').length}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Completed
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">{myTasks.filter(t => t.status === 'completed').length}</div>
                <p className="text-xs text-muted-foreground">Contracts finalized</p>
            </CardContent>
        </Card>
      </div>

      {/* Available Requests Table */}
      <Card className="card-professional">
        <CardHeader>
            <CardTitle>Incoming Requests (Unassigned)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[160px] bg-background/50">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {/* Extract unique departments from requests */}
                  {Array.from(new Set(availableRequests.map(r => r.requestedBy?.department))).filter(Boolean).map((dept: any) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300" onClick={fetchData}>
              Refresh List
            </Button>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Title</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Department</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Due Date</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Priority</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredRequests.length === 0 ? (
                      <tr>
                          <td colSpan={6} className="p-4 text-center text-muted-foreground">No pending requests found.</td>
                      </tr>
                  ) : filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group"
                    >
                      <td className="p-4 align-middle font-medium">{request.title}</td>
                      <td className="p-4 align-middle">{request.requestedBy?.department}</td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline" className={getStatusBadge(request.status)}>
                          {request.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">{request.dueDate}</td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline" className={
                            request.priority === 'high' ? 'text-red-500 border-red-500' : 
                            request.priority === 'medium' ? 'text-yellow-500 border-yellow-500' : 'text-green-500 border-green-500'
                        }>
                            {request.priority}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary/80"
                            onClick={() => handleAssignToMe(request.id)}
                        >
                          Accept Task
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* My Tasks Section */}
      <Card className="card-professional mt-8">
        <CardHeader>
            <CardTitle>My Active Tasks</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Title</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Requester</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myTasks.length === 0 ? (
                            <tr><td colSpan={4} className="p-4 text-center">No tasks assigned to you.</td></tr>
                        ) : myTasks.map(task => (
                            <tr key={task.id} className="border-b hover:bg-muted/50">
                                <td className="p-4">{task.title}</td>
                                <td className="p-4">{task.requestedBy?.fullName} ({task.requestedBy?.department})</td>
                                <td className="p-4"><Badge variant="secondary">{task.status.replace("_", " ")}</Badge></td>
                                <td className="p-4">
                                    {task.status !== 'completed' && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleMarkComplete(task.id)}>
                                                Mark Complete
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
