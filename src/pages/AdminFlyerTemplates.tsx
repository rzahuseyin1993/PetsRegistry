import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { FileText, Plus, Trash2, Upload, Eye, EyeOff } from "lucide-react";

const AdminFlyerTemplates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: templates = [] } = useQuery({
    queryKey: ["admin-flyer-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flyer_templates" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Get creator emails
      const userIds = [...new Set((data || []).map((d: any) => d.created_by))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, email").in("user_id", userIds);
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p.email]));
      return (data || []).map((d: any) => ({ ...d, creatorEmail: profileMap[d.created_by] || "—" }));
    },
  });

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim() || !user) return;
    setUploading(true);
    try {
      const ext = uploadFile.name.split(".").pop();
      const path = `admin/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("flyer-templates").upload(path, uploadFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("flyer-templates").getPublicUrl(path);
      const { error: insertError } = await supabase.from("flyer_templates" as any).insert({
        name: uploadName.trim(),
        description: uploadDesc.trim() || null,
        image_url: urlData.publicUrl,
        created_by: user.id,
        template_type: "admin",
      });
      if (insertError) throw insertError;
      toast.success("Template uploaded!");
      setShowUpload(false);
      setUploadName("");
      setUploadDesc("");
      setUploadFile(null);
      queryClient.invalidateQueries({ queryKey: ["admin-flyer-templates"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    const { error } = await supabase.from("flyer_templates" as any).update({ is_active: !currentlyActive }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(currentlyActive ? "Template hidden" : "Template activated"); queryClient.invalidateQueries({ queryKey: ["admin-flyer-templates"] }); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("flyer_templates" as any).delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Template deleted"); queryClient.invalidateQueries({ queryKey: ["admin-flyer-templates"] }); }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-background p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" /> Flyer Templates
            </h1>
            <p className="text-sm text-muted-foreground">Manage flyer templates. Upload admin templates or review member uploads.</p>
          </div>
          <Button className="gap-2" onClick={() => setShowUpload(true)}>
            <Plus className="h-4 w-4" /> Upload Template
          </Button>
        </div>

        <Card className="mt-8">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No templates yet.</TableCell></TableRow>
                ) : templates.map((tmpl: any) => (
                  <TableRow key={tmpl.id}>
                    <TableCell>
                      <img src={tmpl.image_url} alt={tmpl.name} className="h-12 w-9 rounded object-cover border border-border" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{tmpl.name}</div>
                      {tmpl.description && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{tmpl.description}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tmpl.template_type === "admin" ? "default" : "secondary"}>
                        {tmpl.template_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{tmpl.creatorEmail}</TableCell>
                    <TableCell>
                      <Badge className={tmpl.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}>
                        {tmpl.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(tmpl.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleToggleActive(tmpl.id, tmpl.is_active)}>
                          {tmpl.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(tmpl.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Admin Template</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">Upload an A4 background image (portrait). Pet details will be overlaid on top.</p>
              <div><Label>Template Name</Label><Input value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="Premium Design" /></div>
              <div><Label>Description (optional)</Label><Input value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} placeholder="Brief description" /></div>
              <div>
                <Label>Background Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              </div>
              {uploadFile && (
                <img src={URL.createObjectURL(uploadFile)} alt="Preview" className="h-40 w-full rounded-lg object-cover border border-border" />
              )}
              <Button className="w-full gap-2" onClick={handleUpload} disabled={uploading || !uploadFile || !uploadName.trim()}>
                <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminFlyerTemplates;
