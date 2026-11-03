import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle2, AlertCircle, FileText, Calendar, Building2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

type RequestItem = {
  id: number;
  title: string;
  description: string;
  date?: string;
  status: string;
  completedDate?: string;
  hasTemplate?: boolean;
};

const Requests = () => {
  const { user, token, logout } = useAuth();
  const department = user?.department || "Department";
  const username = user?.username || "employee";

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [contractType, setContractType] = useState<string>("");
  const [priority, setPriority] = useState<string>("low");
  const [dueDate, setDueDate] = useState<string>("");
  
  // Validation state
  const [touched, setTouched] = useState({ title: false, description: false });

  const isTitleValid = requestTitle.length >= 5;
  const isDescriptionValid = requestDescription.length >= 10;
  const isFormValid = isTitleValid && isDescriptionValid && contractType && priority;

  const [pendingRequests, setPendingRequests] = useState<RequestItem[]>([]);
  const [completedRequests, setCompletedRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // View details & Save as Template state
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [requestDetails, setRequestDetails] = useState<any | null>(null);
  const [templateTitle, setTemplateTitle] = useState<string>("");
  const [templateDescription, setTemplateDescription] = useState<string>("");
  const [draftsByRequest, setDraftsByRequest] = useState<any[]>([]);
  const [savingTemplate, setSavingTemplate] = useState<boolean>(false);

  const fetchRequests = async () => {
    if (!token) return;
    try {
      setLoading(true);

      // Fetch my requests
      const reqRes = await fetch(`${API_BASE}/api/v1/requests/my-requests`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!reqRes.ok) {
        if (reqRes.status === 401 || reqRes.status === 403) {
            logout();
            return;
        }
        throw new Error("Failed to fetch requests");
      }
      const requests = await reqRes.json();

      const pending: RequestItem[] = [];
      const completed: RequestItem[] = [];
      requests.forEach((r: any) => {
        const item: RequestItem = {
          id: r.id,
          title: r.title,
          description: r.description,
          status: (r.status || "pending").replace("_", " "),
          date: r.createdAt?.split("T")[0],
          completedDate: r.updatedAt?.split("T")[0],
          hasTemplate: false,
        };
        if ((r.status || "").toLowerCase() === "completed") completed.push(item);
        else pending.push(item);
      });
      setPendingRequests(pending);
      setCompletedRequests(completed);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreateRequest = async () => {
    setTouched({ title: true, description: true });

    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        title: requestTitle,
        contractType,
        description: requestDescription,
        priority, // low/medium/high accepted
        dueDate: dueDate ? dueDate : null,
        tags: [],
      };
      const res = await fetch(`${API_BASE}/api/v1/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create request");
      }

      toast({ title: "Success", description: "Request sent to legal team" });
      setRequestTitle("");
      setRequestDescription("");
      setContractType("");
      setPriority("low");
      setDueDate("");
      setTouched({ title: false, description: false });
      setIsDialogOpen(false);
      // Refresh lists
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create request", variant: "destructive" });
    }
  };

  const handleDownloadTemplate = (requestId: number) => {
    toast({ title: "Success", description: "Template downloaded successfully" });
  };

  // Open View Details dialog and fetch latest details
  const openViewDetails = async (request: RequestItem) => {
    try {
      setSelectedRequest(request);
      setViewDetailsOpen(true);
      const res = await fetch(`${API_BASE}/api/v1/requests/${request.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch request details");
      const data = await res.json();
      setRequestDetails(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load details", variant: "destructive" });
    }
  };

  // Open Save as Template dialog, fetch drafts for the request
  const openSaveTemplate = async (request: RequestItem) => {
    try {
      setSelectedRequest(request);
      setTemplateDialogOpen(true);
      setTemplateTitle(`${request.title} Template`);
      setTemplateDescription(`Template based on request #${request.id}`);
      const res = await fetch(`${API_BASE}/api/v1/drafts/by-request/${request.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch drafts for request");
      const drafts = await res.json();
      setDraftsByRequest(drafts || []);
    } catch (err: any) {
      setDraftsByRequest([]);
      toast({ title: "Error", description: err.message || "Failed to load drafts", variant: "destructive" });
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedRequest) return;
    if (!templateTitle.trim()) {
      toast({ title: "Error", description: "Template title is required", variant: "destructive" });
      return;
    }
    const draft = draftsByRequest.find((d: any) => d.isFinal) || draftsByRequest[0];
    if (!draft) {
      toast({ title: "No Draft Found", description: "There is no draft linked to this request to save as a template.", variant: "destructive" });
      return;
    }
    try {
      setSavingTemplate(true);
      // Fetch request details if not loaded to get contractType
      let ctype = requestDetails?.contractType;
      if (!ctype && selectedRequest) {
        const res = await fetch(`${API_BASE}/api/v1/requests/${selectedRequest.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          ctype = data?.contractType || "NDA";
        } else {
          ctype = "NDA";
        }
      }
      const payload = {
        title: templateTitle.trim(),
        contractType: ctype || "NDA",
        description: templateDescription.trim(),
        content: draft.content,
      };
      const saveRes = await fetch(`${API_BASE}/api/v1/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!saveRes.ok) {
        const text = await saveRes.text();
        throw new Error(text || "Failed to save template");
      }
      toast({ title: "Template Saved", description: "Template added to the library." });
      setTemplateDialogOpen(false);
      setTemplateTitle("");
      setTemplateDescription("");
      setDraftsByRequest([]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save template", variant: "destructive" });
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="mx-auto max-w-screen-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Requests & Tasks</h1>
            <p className="text-muted-foreground">Manage your legal document requests</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Create New Request</DialogTitle>
                <DialogDescription>
                  Submit a detailed request to the legal team. Fields marked with * are required.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Request Title <span className="text-red-500">*</span></Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Employment Contract for New Hire" 
                    value={requestTitle} 
                    onChange={(e) => {
                      setRequestTitle(e.target.value);
                      if (!touched.title) setTouched(prev => ({ ...prev, title: true }));
                    }} 
                    onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                    className={touched.title && !isTitleValid ? "border-red-500" : (touched.title && isTitleValid ? "border-green-500" : "")}
                  />
                  <div className="flex justify-between text-xs">
                    <span className={touched.title && !isTitleValid ? "text-red-500" : "text-muted-foreground"}>
                      Min 5 characters
                    </span>
                    <span className="text-muted-foreground">{requestTitle.length}/50</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Contract Type <span className="text-red-500">*</span></Label>
                    <Input id="contractType" placeholder="e.g., NDA, Vendor" value={contractType} onChange={(e) => setContractType(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
                    <select id="priority" className="w-full border rounded px-3 py-2 bg-background" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Details <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="description" 
                    placeholder="Provide detailed information about what you need..." 
                    value={requestDescription} 
                    onChange={(e) => {
                      setRequestDescription(e.target.value);
                      if (!touched.description) setTouched(prev => ({ ...prev, description: true }));
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
                    className={`min-h-[150px] ${touched.description && !isDescriptionValid ? "border-red-500" : (touched.description && isDescriptionValid ? "border-green-500" : "")}`}
                  />
                  <div className="flex justify-between text-xs">
                    <span className={touched.description && !isDescriptionValid ? "text-red-500" : "text-muted-foreground"}>
                      Min 10 characters. Include all relevant details.
                    </span>
                    <span className="text-muted-foreground">{requestDescription.length} chars</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (optional)</Label>
                  <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
                   <Building2 className="w-4 h-4" />
                   Requesting Department: <span className="font-medium text-foreground">{department}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRequest} disabled={!isFormValid}>Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="p-4 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid gap-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          <CardDescription>{request.description}</CardDescription>
                        </div>
                        <Badge variant={request.status.toLowerCase() === "pending" ? "secondary" : "default"}>{request.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <p>Submitted: {request.date || "-"}</p>
                          <p>Department: {department}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openViewDetails(request)}>View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid gap-4">
              {completedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <CardDescription>{request.description}</CardDescription>
                      </div>
                      <Badge>{request.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p>Submitted: {request.date || "-"}</p>
                        <p>Department: {department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openViewDetails(request)}>View Details</Button>
                        <Button size="sm" onClick={() => openSaveTemplate(request)}>Save as Template</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* View Details Modal */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <DialogTitle className="text-2xl">{requestDetails?.title || selectedRequest?.title}</DialogTitle>
                  <DialogDescription>Request ID: #{requestDetails?.id || selectedRequest?.id}</DialogDescription>
                </div>
                <Badge 
                   variant={
                     (requestDetails?.status || selectedRequest?.status || "pending").toString().toLowerCase() === "completed" 
                     ? "default" 
                     : "secondary"
                   }
                   className="text-sm px-3 py-1"
                >
                  {(requestDetails?.status || selectedRequest?.status || "Pending").toString().replace("_", " ")}
                </Badge>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Contract Type
                </div>
                <div className="font-medium text-sm truncate" title={requestDetails?.contractType || "-"}>
                  {requestDetails?.contractType || "-"}
                </div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Priority
                </div>
                <div className={`font-medium text-sm capitalize ${
                  requestDetails?.priority === 'high' ? 'text-red-500' : 
                  requestDetails?.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {requestDetails?.priority || "-"}
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Due Date
                </div>
                <div className="font-medium text-sm">
                  {requestDetails?.dueDate || "No due date"}
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                 <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" /> Assigned To
                </div>
                <div className="font-medium text-sm truncate">
                  {requestDetails?.assignedTo?.fullName || "Unassigned"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Description & Requirements
                </h3>
                <div className="bg-muted/20 p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed border">
                  {requestDetails?.description || selectedRequest?.description}
                </div>
              </div>

              {requestDetails?.requirements && requestDetails.requirements.length > 0 && (
                 <div className="space-y-2">
                   <h3 className="text-sm font-semibold text-foreground">Specific Requirements</h3>
                   <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                     {requestDetails.requirements.map((req: string, idx: number) => (
                       <li key={idx}>{req}</li>
                     ))}
                   </ul>
                 </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-4">
                <Building2 className="w-3 h-3" />
                <span>Requested by {requestDetails?.requestedBy?.fullName || department} on {requestDetails?.createdAt ? new Date(requestDetails.createdAt).toLocaleDateString() : "Unknown date"}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Save as Template Modal */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
              <DialogDescription>Save the final draft linked to this request into the template library</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="templateTitle">Template Title</Label>
                <Input id="templateTitle" value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)} placeholder="e.g., Standard NDA Template" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateDesc">Description (optional)</Label>
                <Textarea id="templateDesc" value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} placeholder="Short description for this template" />
              </div>
              <div>
                <Label>Drafts Linked to Request</Label>
                <p className="text-sm text-muted-foreground">{draftsByRequest.length > 0 ? `${draftsByRequest.length} draft(s) found${draftsByRequest.some((d:any)=>d.isFinal) ? ", including a final draft." : "."}` : "No drafts found."}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTemplate} disabled={savingTemplate || draftsByRequest.length === 0}>{savingTemplate ? "Saving..." : "Save Template"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Requests;
