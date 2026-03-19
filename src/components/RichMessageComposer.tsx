import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bold, Italic, Underline, Link, Image, Paperclip, List, ListOrdered, Code, X, FileText, Eye } from "lucide-react";
import DOMPurify from "dompurify";

type Attachment = {
  name: string;
  url: string;
  type: string;
  size: number;
};

type RichMessageComposerProps = {
  value: string;
  onChange: (val: string) => void;
  isHtml: boolean;
  onIsHtmlChange: (val: boolean) => void;
  attachments: Attachment[];
  onAttachmentsChange: (att: Attachment[]) => void;
  placeholder?: string;
  maxLength?: number;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const RichMessageComposer = ({
  value,
  onChange,
  isHtml,
  onIsHtmlChange,
  attachments,
  onAttachmentsChange,
  placeholder = "Type your message…",
  maxLength = 10000,
}: RichMessageComposerProps) => {
  const [uploading, setUploading] = useState(false);
  const [editorMode, setEditorMode] = useState<"visual" | "html" | "preview">("visual");
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    syncContent();
  };

  const syncContent = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      if (!isHtml && html !== value) {
        onIsHtmlChange(true);
      }
    }
  }, [onChange, isHtml, onIsHtmlChange, value]);

  const handleInsertLink = () => {
    const url = prompt("Enter URL:");
    if (url) execCommand("createLink", url);
  };

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File "${file.name}" exceeds 5MB limit`);
      return null;
    }
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image`);
        continue;
      }
      const url = await uploadFile(file, "admin-attachments");
      if (url && editorRef.current) {
        execCommand("insertHTML", `<img src="${url}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`);
      }
    }
    setUploading(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const newAttachments: Attachment[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file, "admin-attachments");
      if (url) {
        newAttachments.push({
          name: file.name,
          url,
          type: file.type,
          size: file.size,
        });
      }
    }
    onAttachmentsChange([...attachments, ...newAttachments]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Message</Label>
        <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as any)}>
          <TabsList className="h-7">
            <TabsTrigger value="visual" className="text-xs px-2 py-0.5 gap-1">
              <FileText className="h-3 w-3" /> Visual
            </TabsTrigger>
            <TabsTrigger value="html" className="text-xs px-2 py-0.5 gap-1">
              <Code className="h-3 w-3" /> HTML
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs px-2 py-0.5 gap-1">
              <Eye className="h-3 w-3" /> Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Toolbar */}
      {editorMode === "visual" && (
        <div className="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-border bg-muted/50 p-1">
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => execCommand("bold")} title="Bold">
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => execCommand("italic")} title="Italic">
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => execCommand("underline")} title="Underline">
            <Underline className="h-3.5 w-3.5" />
          </Button>
          <div className="mx-1 w-px bg-border" />
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => execCommand("insertUnorderedList")} title="Bullet List">
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => execCommand("insertOrderedList")} title="Numbered List">
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
          <div className="mx-1 w-px bg-border" />
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleInsertLink} title="Insert Link">
            <Link className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => imageInputRef.current?.click()} title="Insert Image" disabled={uploading}>
            <Image className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => fileInputRef.current?.click()} title="Attach File" disabled={uploading}>
            <Paperclip className="h-3.5 w-3.5" />
          </Button>
          {uploading && <span className="ml-2 text-xs text-muted-foreground animate-pulse">Uploading…</span>}
        </div>
      )}

      {/* Visual Editor */}
      {editorMode === "visual" && (
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[150px] max-h-[300px] overflow-auto rounded-b-md border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          onInput={syncContent}
          onBlur={syncContent}
          dangerouslySetInnerHTML={{ __html: value }}
          data-placeholder={placeholder}
          style={{ wordBreak: "break-word" }}
        />
      )}

      {/* HTML Source Editor */}
      {editorMode === "html" && (
        <textarea
          className="min-h-[150px] max-h-[300px] w-full rounded-md border border-border bg-background p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onIsHtmlChange(true);
          }}
          placeholder="Write HTML here…"
          maxLength={maxLength}
        />
      )}

      {/* Preview */}
      {editorMode === "preview" && (
        <div className="min-h-[150px] max-h-[300px] overflow-auto rounded-md border border-border bg-muted/30 p-3">
          {value ? (
            <div
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
            />
          ) : (
            <p className="text-muted-foreground text-sm italic">Nothing to preview</p>
          )}
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleAttachmentUpload} />

      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs">Attachments ({attachments.length})</Label>
          <div className="space-y-1">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs">
                <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
                <a href={att.url} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline flex-1">
                  {att.name}
                </a>
                <span className="text-muted-foreground shrink-0">{formatFileSize(att.size)}</span>
                <Button type="button" size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => removeAttachment(i)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RichMessageComposer;
