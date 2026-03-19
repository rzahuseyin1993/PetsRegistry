import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import grapesjs, { Editor } from "grapesjs";
import grapesjsPresetWebpage from "grapesjs-preset-webpage";
import "grapesjs/dist/css/grapes.min.css";
import { Layout, Plus, Save } from "lucide-react";
import { toast } from "sonner";

import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { getCmsStarterTemplate } from "@/lib/cmsStarterTemplates";

const AdminPageBuilder = () => {
  const editorRef = useRef<Editor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [selectedSlug, setSelectedSlug] = useState("home-hero");
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["cms-pages-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cms_pages").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const selectedPage = pages.find((page) => page.slug === selectedSlug);
  const starterTemplate = selectedPage ? getCmsStarterTemplate(selectedPage.slug) : null;
  const selectedPageGjsData = selectedPage?.gjs_data as Record<string, unknown> | null | undefined;
  const hasProjectData = !!selectedPageGjsData && Object.keys(selectedPageGjsData).length > 0 && "pages" in selectedPageGjsData;
  const hasSavedHtml = !!selectedPage?.html_content?.trim();
  const isUsingStarterTemplate = !!selectedPage && !hasProjectData && !hasSavedHtml && !!starterTemplate;

  useEffect(() => {
    if (!selectedPage && pages.length > 0) {
      setSelectedSlug(pages[0].slug);
    }
  }, [pages, selectedPage]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editorRef.current || !selectedPage) return;

      const editor = editorRef.current;
      const { error } = await supabase
        .from("cms_pages")
        .update({
          html_content: editor.getHtml(),
          css_content: editor.getCss(),
          gjs_data: editor.getProjectData(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPage.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Page saved!");
      queryClient.invalidateQueries({ queryKey: ["cms-pages-admin"] });
      queryClient.invalidateQueries({ queryKey: ["cms-page", selectedSlug] });
    },
    onError: () => toast.error("Failed to save"),
  });

  const togglePublish = useMutation({
    mutationFn: async () => {
      if (!selectedPage) return;

      const { error } = await supabase
        .from("cms_pages")
        .update({ is_published: !selectedPage.is_published })
        .eq("id", selectedPage.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(selectedPage?.is_published ? "Unpublished" : "Published!");
      queryClient.invalidateQueries({ queryKey: ["cms-pages-admin"] });
      queryClient.invalidateQueries({ queryKey: ["cms-page", selectedSlug] });
    },
    onError: () => toast.error("Failed to update publish state"),
  });

  const createPage = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cms_pages").insert({ title: newPageTitle, slug: newPageSlug });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Page created!");
      setDialogOpen(false);
      setNewPageTitle("");
      setNewPageSlug("");
      queryClient.invalidateQueries({ queryKey: ["cms-pages-admin"] });
    },
    onError: (error: { message?: string }) => toast.error(error.message || "Failed to create page"),
  });

  useEffect(() => {
    if (!editorContainerRef.current || !selectedPage) return;

    if (editorRef.current) {
      editorRef.current.destroy();
      editorRef.current = null;
    }

    const editor = grapesjs.init({
      container: editorContainerRef.current,
      height: "100%",
      width: "auto",
      storageManager: false,
      noticeOnUnload: false,
      plugins: [grapesjsPresetWebpage],
      pluginsOpts: {
        [grapesjsPresetWebpage as unknown as string]: {},
      },
      canvas: {
        styles: ["https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"],
      },
    });

    if (hasProjectData && selectedPageGjsData) {
      editor.loadProjectData(selectedPageGjsData as any);
    } else if (hasSavedHtml) {
      editor.setComponents(selectedPage.html_content);
      if (selectedPage.css_content) {
        editor.setStyle(selectedPage.css_content);
      }
    } else if (starterTemplate) {
      editor.setComponents(starterTemplate.html);
      editor.setStyle(starterTemplate.css);
    }

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [hasProjectData, hasSavedHtml, selectedPage, selectedPageGjsData, starterTemplate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
          <Layout className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Page Builder</h1>
            <p className="text-xs text-muted-foreground">
              {isUsingStarterTemplate
                ? "Starter layout loaded — edit it visually, then save to create your first version."
                : "Edit the selected page visually and publish when ready."}
            </p>
          </div>

          <Select value={selectedSlug} onValueChange={setSelectedSlug}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pages.map((page) => (
                <SelectItem key={page.slug} value={page.slug}>
                  {page.title} {page.is_published ? "✓" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> New Page
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Title</Label>
                  <Input value={newPageTitle} onChange={(event) => setNewPageTitle(event.target.value)} placeholder="About Us" />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={newPageSlug} onChange={(event) => setNewPageSlug(event.target.value)} placeholder="about-us" />
                </div>
                <Button onClick={() => createPage.mutate()} disabled={!newPageTitle || !newPageSlug}>
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="publish-toggle" className="text-sm text-muted-foreground">
                {selectedPage?.is_published ? "Published" : "Draft"}
              </Label>
              <Switch id="publish-toggle" checked={selectedPage?.is_published ?? false} onCheckedChange={() => togglePublish.mutate()} />
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div ref={editorContainerRef} className="flex-1" />
      </div>
    </div>
  );
};

export default AdminPageBuilder;
