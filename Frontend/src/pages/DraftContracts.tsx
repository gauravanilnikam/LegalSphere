import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  FileText,
  Download,
  Copy,
  Wand2,
  Shield,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { useAuth } from "@/context/AuthContext";

// API constants for saving drafts
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function DraftContracts() {
  const { token } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [contractType, setContractType] = useState("NDA Template");
  const [partyA, setPartyA] = useState("");
  const [partyB, setPartyB] = useState("");
  const [responseJson, setResponseJson] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [StarterKit],
    content: undefined,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none p-4 bg-background/30 rounded-lg border border-border focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (responseJson && editor) {
      const doc = buildTipTapDocFromResponseJson(responseJson);
      editor.commands.setContent(doc);
    }
  }, [responseJson, editor]);

  const formatContractForExport = (contractData: any) => {
    let contractText = `${contractData.contractTitle}\n`;
    contractText += `${"=".repeat(contractData.contractTitle.length)}\n\n`;
    contractText += `Contract Type: ${contractData.contractType}\n`;
    contractText += `Party A: ${contractData.partyA}\n`;
    contractText += `Party B: ${contractData.partyB}\n`;
    contractText += `Generated: ${new Date(contractData.generatedAt).toLocaleDateString()}\n`;
    contractText += `Effective Date: ${contractData.effectiveDate}\n`;
    contractText += `Expiration Date: ${contractData.expirationDate}\n\n`;
    if (contractData.preamble) {
      contractText += `PREAMBLE\n${"=".repeat(8)}\n${contractData.preamble}\n\n`;
    }
    if (contractData.sections && contractData.sections.length > 0) {
      contractText += `CONTRACT TERMS\n${"=".repeat(13)}\n\n`;
      contractData.sections.forEach((section: any) => {
        contractText += `${section.sectionNumber}. ${section.title}\n`;
        contractText += `${"-".repeat(section.title.length + 3)}\n`;
        contractText += `${section.content}\n\n`;
      });
    }
    if (contractData.conclusion) {
      contractText += `SIGNATURES\n${"=".repeat(10)}\n${contractData.conclusion}\n\n`;
    }
    contractText += `GOVERNING LAW AND JURISDICTION\n${"=".repeat(30)}\n`;
    contractText += `Jurisdiction: ${contractData.jurisdiction}\n`;
    contractText += `Governing Law: ${contractData.governingLaw}\n`;
    return contractText;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !contractType || !partyA.trim() || !partyB.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide contract type, prompt, Party A, and Party B.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/contracts/draft`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, contractType, partyA, partyB }),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResponseJson(data);
      toast({ title: "Draft Generated", description: "Received contract JSON from backend." });
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err?.message || "An error occurred while generating the draft.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const Toolbar = () => (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive("bold") ? "bg-muted" : ""}>Bold</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive("italic") ? "bg-muted" : ""}>Italic</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleStrike().run()} className={editor?.isActive("strike") ? "bg-muted" : ""}>Strike</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={editor?.isActive("heading", { level: 1 }) ? "bg-muted" : ""}>H1</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive("heading", { level: 2 }) ? "bg-muted" : ""}>H2</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={editor?.isActive("heading", { level: 3 }) ? "bg-muted" : ""}>H3</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive("bulletList") ? "bg-muted" : ""}>Bulleted List</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={editor?.isActive("orderedList") ? "bg-muted" : ""}>Numbered List</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={editor?.isActive("blockquote") ? "bg-muted" : ""}>Quote</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>HR</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().undo().run()}>Undo</Button>
      <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().redo().run()}>Redo</Button>
    </div>
  );

  const handleCopyFromEditor = () => {
    if (!editor) return;
    const text = editor.getText();
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Editor content copied to clipboard" });
  };

  const buildTipTapDocFromResponseJson = (contractData: any) => {
    const content: any[] = [];
    if (contractData.contractTitle) {
      content.push({ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: contractData.contractTitle }] });
    }
    const metaLines: string[] = [];
    if (contractData.contractType) metaLines.push(`Contract Type: ${contractData.contractType}`);
    if (contractData.partyA) metaLines.push(`Party A: ${contractData.partyA}`);
    if (contractData.partyB) metaLines.push(`Party B: ${contractData.partyB}`);
    if (contractData.effectiveDate) metaLines.push(`Effective Date: ${contractData.effectiveDate}`);
    if (contractData.expirationDate) metaLines.push(`Expiration Date: ${contractData.expirationDate}`);
    if (contractData.jurisdiction) metaLines.push(`Jurisdiction: ${contractData.jurisdiction}`);
    if (contractData.governingLaw) metaLines.push(`Governing Law: ${contractData.governingLaw}`);
    metaLines.forEach((line) => content.push({ type: "paragraph", content: [{ type: "text", text: line }] }));
    content.push({ type: "horizontalRule" });
    if (contractData.preamble) {
      content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Preamble" }] });
      content.push({ type: "paragraph", content: [{ type: "text", text: contractData.preamble }] });
    }
    if (contractData.sections && Array.isArray(contractData.sections)) {
      content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Contract Terms" }] });
      for (const section of contractData.sections) {
        content.push({ type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: `${section.sectionNumber}. ${section.title}` }] });
        if (section.content) content.push({ type: "paragraph", content: [{ type: "text", text: section.content }] });
        if (section.subsections && Array.isArray(section.subsections) && section.subsections.length) {
          content.push({ type: "bulletList", content: section.subsections.map((sub: string) => ({ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: sub }] }] })) });
        }
      }
    }
    if (contractData.conclusion) {
      content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Signatures" }] });
      content.push({ type: "paragraph", content: [{ type: "text", text: contractData.conclusion }] });
    }
    return { type: "doc", content };
  };

  const tiptapJsonToDocx = (docJson: any) => {
    const paragraphs: Paragraph[] = [];
    const toTextRuns = (node: any): TextRun[] => {
      if (!node?.content) return [];
      return node.content.filter((c: any) => c.type === "text").map((t: any) => new TextRun({
        text: t.text || "",
        bold: !!t.marks?.some((m: any) => m.type === "bold"),
        italics: !!t.marks?.some((m: any) => m.type === "italic"),
        strike: !!t.marks?.some((m: any) => m.type === "strike"),
      }));
    };
    const walk = (node: any) => {
      if (!node) return;
      switch (node.type) {
        case "heading": {
          const level = node.attrs?.level || 1;
          const text = (node.content || []).map((c: any) => c.text || "").join("");
          let headingLevel = HeadingLevel.HEADING_1;
          if (level === 1) headingLevel = HeadingLevel.HEADING_1;
          else if (level === 2) headingLevel = HeadingLevel.HEADING_2;
          else if (level === 3) headingLevel = HeadingLevel.HEADING_3;
          else headingLevel = HeadingLevel.HEADING_4 as any;
          paragraphs.push(new Paragraph({ text, heading: headingLevel }));
          break;
        }
        case "paragraph": {
          const runs = toTextRuns(node);
          paragraphs.push(new Paragraph({ children: runs.length ? runs : [new TextRun("")] }));
          break;
        }
        case "bulletList": {
          (node.content || []).forEach((li: any) => {
            const paraNode = li.content?.find((n: any) => n.type === "paragraph");
            const runs = toTextRuns(paraNode || {});
            paragraphs.push(new Paragraph({ children: runs, bullet: { level: 0 } }));
          });
          break;
        }
        case "orderedList": {
          let index = 1;
          (node.content || []).forEach((li: any) => {
            const paraNode = li.content?.find((n: any) => n.type === "paragraph");
            const text = (paraNode?.content || []).map((c: any) => c.text || "").join("");
            paragraphs.push(new Paragraph({ text: `${index}. ${text}` }));
            index++;
          });
          break;
        }
        case "blockquote": {
          const paraNode = (node.content || []).find((n: any) => n.type === "paragraph");
          const runs = toTextRuns(paraNode || {});
          paragraphs.push(new Paragraph({ children: runs }));
          break;
        }
        case "horizontalRule": {
          paragraphs.push(new Paragraph(""));
          break;
        }
        default: {
          if (Array.isArray(node.content)) node.content.forEach(walk);
        }
      }
    };
    if (Array.isArray(docJson?.content)) docJson.content.forEach(walk);
    const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
    return doc;
  };

  const handleCopyFromEditorClick = () => {
    handleCopyFromEditor();
  };

  const handleExportDocx = async () => {
    if (!editor) return;
    try {
      const tiptapJson = editor.getJSON();
      const doc = tiptapJsonToDocx(tiptapJson);
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      // Define name for the exported docx
      const name = (responseJson?.contractTitle || "contract-draft").toString().replace(/\s+/g, "-");
      a.href = url;
      a.download = `${name}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Exported", description: "DOCX file downloaded" });
    } catch (e: any) {
      toast({ title: "Export Failed", description: e?.message || "Could not export DOCX", variant: "destructive" });
    }
  };

  // Helper to convert Blob to Base64 string
  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl?.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  // Save editor content as a Draft via backend API
  const handleSaveDraft = async () => {
    if (!editor) {
      toast({ title: "Error", description: "Editor is not ready", variant: "destructive" });
      return;
    }
    try {
      const tiptapJson = editor.getJSON();
      const doc = tiptapJsonToDocx(tiptapJson);
      const blob = await Packer.toBlob(doc);
      const docxBase64 = await blobToBase64(blob);

      // Also download DOCX locally
      const name = (responseJson?.contractTitle || "contract-draft").toString().replace(/\s+/g, "-");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      const payload = {
        title: (responseJson?.contractTitle || "Draft Contract").toString(),
        contractType,
        content: JSON.stringify(tiptapJson),
        docxBase64,
      };
      const res = await fetch(`${API_BASE}/api/v1/drafts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to save draft");
      }
      const data = await res.json();
      toast({ title: "Saved", description: `Draft saved (ID: ${data?.id || "unknown"}) and DOCX downloaded` });
    } catch (e: any) {
      toast({ title: "Save Failed", description: e?.message || "Could not save draft", variant: "destructive" });
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants = {
      low: { class: "bg-green-500/10 text-green-500 border-green-500/30", icon: Shield },
      medium: { class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", icon: AlertTriangle },
      high: { class: "bg-red-500/10 text-red-500 border-red-500/30", icon: AlertTriangle },
    };
    return variants[riskLevel as keyof typeof variants] || variants.medium;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Draft Contracts</h1>
        <p className="text-muted-foreground">Generate and customize legal contracts with AI assistance and real-time risk analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                AI Contract Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Contract Type</label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NDA Template">NDA Template</SelectItem>
                    <SelectItem value="Founders Agreement">Founders Agreement</SelectItem>
                    <SelectItem value="Shareholders Agreement (SHA)">Shareholders Agreement (SHA)</SelectItem>
                    <SelectItem value="MSA + SOW Template">MSA + SOW Template</SelectItem>
                    <SelectItem value="Vendor Agreement">Vendor Agreement</SelectItem>
                    <SelectItem value="Employment Agreement + IP Assignment">Employment Agreement + IP Assignment</SelectItem>
                    <SelectItem value="Privacy Policy">Privacy Policy</SelectItem>
                    <SelectItem value="Terms & Conditions">Terms & Conditions</SelectItem>
                    <SelectItem value="ESOP Plan">ESOP Plan</SelectItem>
                    <SelectItem value="Refund/Return + Cancellation Policy">Refund/Return + Cancellation Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Party A</label>
                  <Input placeholder="e.g., Tech Innovations Inc." value={partyA} onChange={(e) => setPartyA(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Party B</label>
                  <Input placeholder="e.g., Digital Solutions LLC" value={partyB} onChange={(e) => setPartyB(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Contract Description</label>
                <Textarea placeholder="Describe the contract requirements, key terms, parties involved, and any specific clauses needed..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} className="bg-background/50" />
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-primary hover:bg-primary/90">
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Contract
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {responseJson && responseJson.riskAnalysis && (
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-500" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Overall Risk:</span>
                  <Badge className={getRiskBadge(responseJson.riskAnalysis.overallRisk).class}>
                    {responseJson.riskAnalysis.overallRisk.toUpperCase()}
                  </Badge>
                </div>

                {responseJson.riskAnalysis.summary && (
                  <div className="p-3 bg-background/30 rounded-lg border border-border">
                    <p className="text-sm text-foreground">{responseJson.riskAnalysis.summary}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {responseJson.riskAnalysis.risks && responseJson.riskAnalysis.risks.map((risk: any, index: number) => {
                    const riskData = getRiskBadge(risk.type);
                    return (
                      <div key={index} className="p-3 border border-border rounded-lg bg-background/30">
                        <div className="flex items-start gap-2 mb-2">
                          <riskData.icon className="w-4 h-4 mt-0.5 text-current" />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-foreground">{risk.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                            {risk.location && (<span className="text-xs text-primary mt-1 block">{risk.location}</span>)}
                            {risk.recommendation && (<p className="text-xs text-green-400 mt-2 font-medium">Recommendation: {risk.recommendation}</p>)}
                          </div>
                          <Badge variant="outline" className={`${riskData.class} text-xs`}>{risk.type}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="card-professional">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Draft Output
                </CardTitle>
                {responseJson && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyFromEditorClick} disabled={!editor}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Contract
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportDocx} disabled={!editor}>
                      <Download className="w-4 h-4 mr-2" />
                      Export DOCX
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSaveDraft} disabled={!editor}>
                      Save Draft
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {responseJson ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Toolbar />
                    <EditorContent editor={editor} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-center">
                  <div className="space-y-4">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium text-foreground">No Contract Generated Yet</h3>
                      <p className="text-muted-foreground">Fill out the form on the left and click generate to create your contract.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
