import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function Documents() {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/templates`, { 
        headers: { 
          "Authorization": `Bearer ${token}` 
        } 
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (token) fetchTemplates(); 
  }, [token]);

  const openTemplate = (tpl: any) => {
    try {
      const content = typeof tpl.content === "string" ? tpl.content : JSON.stringify(tpl.content);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<pre style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;">${content.replace(/[<>&]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;"}[c] as string))}</pre>`);
        win.document.close();
      }
    } catch (e: any) {
      toast({ title: "Open Failed", description: e.message || "Cannot open template", variant: "destructive" });
    }
  };

  const downloadDocx = async (tpl: any) => {
    if (!tpl.hasDocx) {
      toast({ title: "No DOCX", description: "DOCX not available for this template" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/templates/${tpl.id}/docx`, { 
        headers: { 
          "Authorization": `Bearer ${token}` 
        } 
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${String(tpl.title || "template").replace(/\s+/g, "-")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast({ title: "Download Failed", description: e.message || "Could not download DOCX", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold">Department Documents</h1>
        <p className="text-muted-foreground">Browse saved templates</p>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : templates.length > 0 ? (
        <div className="grid gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{tpl.title}</CardTitle>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <Badge>{tpl.contractType}</Badge>
                    {tpl.timesUsed != null && <span>Used {tpl.timesUsed} times</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openTemplate(tpl)}>
                    <Eye className="w-4 h-4 mr-1" /> Open
                  </Button>
                  <Button size="sm" onClick={() => downloadDocx(tpl)} disabled={!tpl.hasDocx}>
                    <Download className="w-4 h-4 mr-1" /> Download DOCX
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {typeof tpl.description === "string" ? tpl.description : "No description"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-muted-foreground">No templates found</CardContent>
        </Card>
      )}
    </div>
  );
}
