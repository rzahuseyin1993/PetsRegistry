import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileSidebar from "@/components/MobileSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileDown, Lock, Check, Eye, Upload, Trash2, Plus } from "lucide-react";
import { flyerTemplates, type FlyerTemplate } from "@/lib/flyerTemplates";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CustomTemplate {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  created_by: string;
  template_type: string;
}

interface FormData {
  petName: string;
  species: string;
  breed: string;
  color: string;
  description: string;
  lastSeenAddress: string;
  contactPhone: string;
  reward: string;
  imageUrl: string;
  petId: string;
}

/* ─── Template Preview Renderers ─── */

const renderBoldSplit = (t: FlyerTemplate, d: FormData) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: t.fontFamily }}>
    {/* Top red banner */}
    <div style={{ background: t.headerColor, color: t.headerText, padding: "18px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "40px", fontWeight: 900, letterSpacing: "4px", lineHeight: 1 }}>MISSING DOG</div>
      <div style={{ fontSize: "11px", marginTop: "6px", opacity: 0.9, letterSpacing: "1px" }}>A CRY FOR HELP FOR OUR FURRY FRIEND.</div>
    </div>
    {/* Large photo */}
    <div style={{ flex: "0 0 auto", position: "relative" }}>
      {d.imageUrl ? (
        <img src={d.imageUrl} alt="Pet" crossOrigin="anonymous" style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ width: "100%", height: "200px", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: "14px" }}>Pet Photo</div>
      )}
      {/* Name overlay */}
      <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(255,255,255,0.95)", borderRadius: "8px", padding: "8px 14px" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: t.bodyText }}>{d.petName || "PET NAME"}</div>
        <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "2px" }}>
          {d.breed && <>Breed: {d.breed}<br /></>}
          {d.color && <>Color: {d.color}<br /></>}
          {d.species && <>Size: {d.species}</>}
        </div>
      </div>
    </div>
    {/* Details */}
    <div style={{ flex: 1, padding: "14px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {d.description && <div style={{ fontSize: "11px", color: t.bodyText, lineHeight: 1.5, textAlign: "center" }}>{d.description}</div>}
      {d.lastSeenAddress && (
        <div style={{ background: t.bgAccent, borderRadius: "6px", padding: "6px 12px", textAlign: "center", fontSize: "11px", fontWeight: 600 }}>
          📍 Last seen at {d.lastSeenAddress}
        </div>
      )}
      {d.reward && (
        <div style={{ background: t.headerColor, color: t.headerText, borderRadius: "6px", padding: "8px", textAlign: "center", fontSize: "18px", fontWeight: 800 }}>
          {d.reward} REWARD
        </div>
      )}
    </div>
    {/* Footer CTA */}
    <div style={{ background: t.ctaColor, color: t.ctaText, padding: "14px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "10px", letterSpacing: "1px" }}>CALL OR TEXT WITH ANY INFORMATION</div>
      <div style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "2px", marginTop: "4px" }}>{d.contactPhone || "+123 456 7890"}</div>
    </div>
  </div>
);

const renderCenteredPhoto = (t: FlyerTemplate, d: FormData) => (
  <div style={{ height: "100%", background: t.bgColor, fontFamily: t.fontFamily, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
    {/* Decorative blobs */}
    <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: t.bgAccent, opacity: 0.5 }} />
    <div style={{ position: "absolute", bottom: "60px", left: "-40px", width: "100px", height: "100px", borderRadius: "50%", background: t.bgAccent, opacity: 0.4 }} />
    {/* Header */}
    <div style={{ textAlign: "center", padding: "24px 20px 8px", position: "relative", zIndex: 1 }}>
      <div style={{ fontSize: "38px", fontWeight: 900, color: t.headerColor, letterSpacing: "3px", lineHeight: 1 }}>MISSING</div>
      <div style={{ fontSize: "11px", color: t.bodyText, marginTop: "4px", opacity: 0.7 }}>SINCE RECENTLY</div>
      <div style={{ fontSize: "13px", color: t.bodyText, marginTop: "10px", fontStyle: "italic" }}>Please Help Us Finding...</div>
    </div>
    {/* Pet name in script style */}
    <div style={{ textAlign: "center", fontSize: "32px", fontWeight: 700, color: t.accentColor, fontStyle: "italic", marginTop: "4px", position: "relative", zIndex: 1 }}>
      {d.petName || "Pet Name"}
    </div>
    {/* Photo */}
    <div style={{ display: "flex", justifyContent: "center", margin: "12px 0", position: "relative", zIndex: 1 }}>
      {d.imageUrl ? (
        <img src={d.imageUrl} alt="Pet" crossOrigin="anonymous" style={{ width: "180px", height: "180px", objectFit: "cover", borderRadius: "16px", border: `4px solid ${t.accentColor}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }} />
      ) : (
        <div style={{ width: "180px", height: "180px", borderRadius: "16px", background: "#E5E7EB", border: `4px solid ${t.accentColor}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Photo</div>
      )}
    </div>
    {/* Last seen & reward */}
    <div style={{ padding: "0 24px", display: "flex", gap: "8px", justifyContent: "center", position: "relative", zIndex: 1 }}>
      {d.lastSeenAddress && (
        <div style={{ background: t.headerColor, color: t.headerText, borderRadius: "20px", padding: "6px 14px", fontSize: "10px", fontWeight: 700 }}>
          📍 Last Seen: {d.lastSeenAddress}
        </div>
      )}
      {d.reward && (
        <div style={{ background: t.accentColor, color: t.accentText, borderRadius: "20px", padding: "6px 14px", fontSize: "12px", fontWeight: 800 }}>
          REWARD {d.reward}
        </div>
      )}
    </div>
    {d.description && <div style={{ padding: "10px 30px", fontSize: "10px", textAlign: "center", color: t.bodyText, lineHeight: 1.5, position: "relative", zIndex: 1 }}>{d.description}</div>}
    {/* Contact */}
    <div style={{ marginTop: "auto", padding: "16px 20px", textAlign: "center", position: "relative", zIndex: 1 }}>
      <div style={{ fontSize: "11px", color: t.bodyText }}>Call us if you find them at</div>
      <div style={{ fontSize: "26px", fontWeight: 900, color: t.headerColor, marginTop: "4px" }}>{d.contactPhone || "+123 456 7890"}</div>
    </div>
  </div>
);

const renderFramedElegant = (t: FlyerTemplate, d: FormData) => (
  <div style={{ height: "100%", background: t.bgColor, fontFamily: t.fontFamily, display: "flex", flexDirection: "column", padding: "16px", border: `6px solid ${t.headerColor}` }}>
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ fontSize: "34px", fontWeight: 900, color: t.headerColor, letterSpacing: "3px" }}>MISSING PET</div>
      <div style={{ fontSize: "12px", color: t.bodyText, marginTop: "4px" }}>PLEASE HELP FIND OUR FRIEND, {(d.petName || "BUDDY").toUpperCase()}</div>
    </div>
    {/* Scalloped photo frame */}
    <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
      <div style={{ width: "190px", height: "190px", borderRadius: "50%", border: `6px solid ${t.bgAccent}`, overflow: "hidden", boxShadow: `0 0 0 8px ${t.bgColor}, 0 0 0 10px ${t.bgAccent}` }}>
        {d.imageUrl ? (
          <img src={d.imageUrl} alt="Pet" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Photo</div>
        )}
      </div>
    </div>
    {/* Details table */}
    <div style={{ padding: "8px 24px", display: "flex", flexDirection: "column", gap: "4px" }}>
      {[
        d.breed && { label: "Breed", value: d.breed },
        d.color && { label: "Color", value: d.color },
        d.species && { label: "Species", value: d.species },
      ].filter(Boolean).map((item: any, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center", gap: "8px", fontSize: "12px" }}>
          <span style={{ fontWeight: 700, color: t.bodyText }}>{item.label}:</span>
          <span style={{ color: t.bodyText }}>{item.value}</span>
        </div>
      ))}
    </div>
    {d.description && <div style={{ padding: "6px 20px", fontSize: "10px", textAlign: "center", color: t.bodyText, lineHeight: 1.5 }}>{d.description}</div>}
    {/* Reward */}
    {d.reward && (
      <div style={{ margin: "8px 40px", background: t.ctaColor, color: t.ctaText, borderRadius: "8px", padding: "10px", textAlign: "center", fontSize: "16px", fontWeight: 800 }}>
        🏆 REWARD {d.reward}
      </div>
    )}
    {d.lastSeenAddress && (
      <div style={{ textAlign: "center", fontSize: "10px", color: t.bodyText, marginTop: "4px" }}>📍 Last Seen: {d.lastSeenAddress}</div>
    )}
    {/* Footer */}
    <div style={{ marginTop: "auto", textAlign: "center", padding: "10px 0" }}>
      <div style={{ fontSize: "10px", color: t.bodyText }}>If you have any information, please contact us</div>
      <div style={{ fontSize: "14px", fontWeight: 800, color: t.headerColor, marginTop: "4px" }}>{d.petName ? `Contact: ` : ""}{d.contactPhone || "+123 456 7890"}</div>
    </div>
  </div>
);

const renderBannerAction = (t: FlyerTemplate, d: FormData) => (
  <div style={{ height: "100%", background: t.bgColor, fontFamily: t.fontFamily, display: "flex", flexDirection: "column" }}>
    {/* Green top band */}
    <div style={{ background: t.headerColor, color: t.headerText, padding: "6px", textAlign: "center", fontSize: "10px", letterSpacing: "1px" }}>
      Help Reunite a Furry Friend
    </div>
    {/* MISSING DOG banner */}
    <div style={{ background: t.accentColor, color: t.accentText, padding: "12px", textAlign: "center" }}>
      <div style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "4px" }}>MISSING DOG</div>
    </div>
    {/* Info section */}
    <div style={{ padding: "12px 24px", display: "flex", flexDirection: "column", gap: "6px" }}>
      {[
        d.breed && { label: "Breed", value: d.breed },
        d.color && { label: "Color", value: d.color },
        d.species && { label: "Size", value: d.species },
      ].filter(Boolean).map((item: any, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center", gap: "12px", fontSize: "13px" }}>
          <span style={{ fontWeight: 700, color: t.bodyText, minWidth: "50px", textAlign: "right" }}>{item.label}</span>
          <span style={{ color: t.bodyText }}>: {item.value}</span>
        </div>
      ))}
    </div>
    {d.description && <div style={{ padding: "4px 24px", fontSize: "10px", textAlign: "center", color: t.bodyText, lineHeight: 1.5 }}>{d.description}</div>}
    {d.lastSeenAddress && (
      <div style={{ textAlign: "center", fontSize: "10px", color: t.bodyText, margin: "6px 0" }}>📍 {d.lastSeenAddress}</div>
    )}
    {/* Contact CTA */}
    <div style={{ textAlign: "center", margin: "8px 20px", fontSize: "11px", color: t.headerColor, fontStyle: "italic" }}>
      If found, please call
    </div>
    <div style={{ margin: "0 40px", background: t.accentColor, color: t.accentText, borderRadius: "8px", padding: "10px", textAlign: "center", fontSize: "20px", fontWeight: 900, letterSpacing: "1px" }}>
      {d.contactPhone || "+123 456-7890"}
    </div>
    {d.reward && (
      <div style={{ textAlign: "center", margin: "8px 0", fontSize: "14px", fontWeight: 700, color: t.headerColor }}>
        Reward: {d.reward}
      </div>
    )}
    {/* Large photo at bottom */}
    <div style={{ flex: 1, marginTop: "8px", overflow: "hidden" }}>
      {d.imageUrl ? (
        <img src={d.imageUrl} alt="Pet" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Pet Photo</div>
      )}
    </div>
  </div>
);

const renderEditorial = (t: FlyerTemplate, d: FormData) => (
  <div style={{ height: "100%", background: `linear-gradient(160deg, ${t.bgColor}, ${t.bgAccent})`, fontFamily: t.fontFamily, display: "flex", flexDirection: "column" }}>
    {/* Header */}
    <div style={{ textAlign: "center", padding: "20px 20px 8px" }}>
      <div style={{ fontSize: "12px", color: t.bodyText, letterSpacing: "2px", opacity: 0.8 }}>HELP REUNITE A FURRY FRIEND</div>
      <div style={{ fontSize: "38px", fontWeight: 900, color: t.headerColor, letterSpacing: "4px", marginTop: "6px" }}>MISSING DOG</div>
    </div>
    {/* Photo */}
    <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
      {d.imageUrl ? (
        <img src={d.imageUrl} alt="Pet" crossOrigin="anonymous" style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "20px", border: `4px solid rgba(255,255,255,0.5)`, boxShadow: "0 12px 32px rgba(0,0,0,0.2)" }} />
      ) : (
        <div style={{ width: "200px", height: "200px", borderRadius: "20px", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)" }}>Photo</div>
      )}
    </div>
    {/* Name */}
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ display: "inline-block", background: t.accentColor, color: t.accentText, borderRadius: "20px", padding: "6px 24px", fontSize: "12px", fontWeight: 700, letterSpacing: "1px" }}>
        {(d.petName || "PET NAME").toUpperCase()}
      </div>
    </div>
    {/* Details */}
    <div style={{ padding: "4px 28px", display: "flex", flexDirection: "column", gap: "4px" }}>
      {[
        d.breed && `Breed: ${d.breed}`,
        d.color && `Color: ${d.color}`,
        d.species && `Species: ${d.species}`,
      ].filter(Boolean).map((line, i) => (
        <div key={i} style={{ textAlign: "center", fontSize: "12px", color: t.bodyText }}>{line}</div>
      ))}
    </div>
    {d.description && <div style={{ padding: "6px 28px", fontSize: "10px", textAlign: "center", color: t.bodyText, opacity: 0.9, lineHeight: 1.5 }}>{d.description}</div>}
    {d.lastSeenAddress && (
      <div style={{ textAlign: "center", margin: "6px 30px", background: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "6px 12px", fontSize: "10px", color: t.bodyText }}>📍 Last Seen: {d.lastSeenAddress}</div>
    )}
    {/* Reward */}
    {d.reward && (
      <div style={{ margin: "6px 50px", background: t.headerColor, color: t.headerText, borderRadius: "8px", padding: "8px", textAlign: "center", fontSize: "16px", fontWeight: 800 }}>
        REWARD {d.reward}
      </div>
    )}
    {/* Contact */}
    <div style={{ marginTop: "auto", padding: "16px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "10px", color: t.bodyText, opacity: 0.8 }}>CALL OR TEXT WITH ANY INFORMATION</div>
      <div style={{ fontSize: "26px", fontWeight: 900, color: t.headerColor, marginTop: "4px" }}>{d.contactPhone || "+123 456 7890"}</div>
    </div>
  </div>
);

const renderTemplate = (template: FlyerTemplate, formData: FormData) => {
  switch (template.layout) {
    case "bold-split": return renderBoldSplit(template, formData);
    case "centered-photo": return renderCenteredPhoto(template, formData);
    case "framed-elegant": return renderFramedElegant(template, formData);
    case "banner-action": return renderBannerAction(template, formData);
    case "editorial": return renderEditorial(template, formData);
    default: return renderBoldSplit(template, formData);
  }
};

/* ─── Main Component ─── */

const LostFlyerBuilder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("report");
  const flyerRef = useRef<HTMLDivElement>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<FlyerTemplate>(flyerTemplates[0]);
  const [selectedCustom, setSelectedCustom] = useState<CustomTemplate | null>(null);
  const [formData, setFormData] = useState<FormData>({
    petName: "", species: "", breed: "", color: "",
    description: "", lastSeenAddress: "", contactPhone: "",
    reward: "", imageUrl: "", petId: "",
  });
  const [generating, setGenerating] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: hasSubscription } = useQuery({
    queryKey: ["flyer-subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("flyer_subscriptions" as any)
        .select("id, expires_at")
        .eq("user_id", user!.id)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();
      return !!data;
    },
  });

  const { data: customTemplates = [] } = useQuery({
    queryKey: ["custom-flyer-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flyer_templates" as any)
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CustomTemplate[];
    },
  });

  const { data: report } = useQuery({
    queryKey: ["flyer-report", reportId],
    enabled: !!reportId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lost_reports")
        .select("*, pets(id, name, species, breed, color, pet_code, pet_images(image_url, sort_order))")
        .eq("id", reportId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (report) {
      const pet = report.pets as any;
      const image = pet?.pet_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
      setFormData({
        petName: pet?.name || "", species: pet?.species || "",
        breed: pet?.breed || "", color: pet?.color || "",
        description: report.description || "",
        lastSeenAddress: report.last_seen_address || "",
        contactPhone: report.contact_phone || "",
        reward: report.reward || "", imageUrl: image?.image_url || "",
        petId: pet?.id || "",
      });
    }
  }, [report]);

  const selectBuiltIn = (tmpl: FlyerTemplate) => { setSelectedTemplate(tmpl); setSelectedCustom(null); };
  const selectCustom = (tmpl: CustomTemplate) => { setSelectedCustom(tmpl); };

  const handleDownloadPDF = async () => {
    if (!hasSubscription) { toast.error("Please subscribe to download flyers."); return; }
    if (!flyerRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2, useCORS: true, allowTaint: true,
        backgroundColor: selectedCustom ? "#FFFFFF" : selectedTemplate.bgColor,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`Lost-${formData.petName || "Pet"}-Flyer.pdf`);
      toast.success("Flyer downloaded!");
    } catch { toast.error("Failed to generate PDF"); }
    finally { setGenerating(false); }
  };

  const handleSubscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("flyer-checkout", { body: { user_id: user?.id } });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else toast.error("Could not create checkout session");
    } catch { toast.error("Payment service unavailable."); }
  };

  const handleUploadTemplate = async () => {
    if (!uploadFile || !uploadName.trim() || !user) return;
    setUploading(true);
    try {
      const ext = uploadFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("flyer-templates").upload(path, uploadFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("flyer-templates").getPublicUrl(path);
      const { error: insertError } = await supabase.from("flyer_templates" as any).insert({
        name: uploadName.trim(), description: uploadDesc.trim() || null,
        image_url: urlData.publicUrl, created_by: user.id, template_type: "member",
      });
      if (insertError) throw insertError;
      toast.success("Template uploaded!");
      setShowUpload(false); setUploadName(""); setUploadDesc(""); setUploadFile(null);
      queryClient.invalidateQueries({ queryKey: ["custom-flyer-templates"] });
    } catch (err: any) { toast.error(err.message || "Failed to upload"); }
    finally { setUploading(false); }
  };

  const handleDeleteTemplate = async (id: string) => {
    const { error } = await supabase.from("flyer_templates" as any).delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); queryClient.invalidateQueries({ queryKey: ["custom-flyer-templates"] }); }
  };

  const isCustom = !!selectedCustom;

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 bg-background p-6 md:p-8 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              <div className="flex items-center gap-2 md:hidden">
                <MobileSidebar />
                Lost Pet Flyer Builder
              </div>
            </h1>
            <p className="text-sm text-muted-foreground">Choose a template, customize details, and download a printable A4 flyer.</p>
          </div>
          {hasSubscription ? (
            <Badge className="bg-emerald-100 text-emerald-700 gap-1"><Check className="h-3 w-3" /> Subscribed</Badge>
          ) : (
            <Button onClick={handleSubscribe} className="gap-2"><Lock className="h-4 w-4" /> Subscribe — $2/month</Button>
          )}
        </div>

        {/* Built-in templates */}
        <div className="mt-6">
          <Label className="text-base font-semibold">Poster Templates</Label>
          <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-3">
            {flyerTemplates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => selectBuiltIn(tmpl)}
                className={`group relative rounded-xl border-2 p-3 text-left transition-all ${
                  !isCustom && selectedTemplate.id === tmpl.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`h-16 w-full rounded-lg ${tmpl.previewColor}`} />
                <p className="mt-2 text-xs font-semibold text-foreground">{tmpl.name}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{tmpl.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom templates */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Custom Templates</Label>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowUpload(true)}>
              <Plus className="h-3 w-3" /> Upload Template
            </Button>
          </div>
          {customTemplates.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No custom templates yet. Upload an A4 background image to create one.</p>
          ) : (
            <div className="mt-2 grid-cols-3 sm:grid-cols-5 gap-3">
              {customTemplates.map((tmpl) => (
                <div key={tmpl.id} className="relative group">
                  <button
                    onClick={() => selectCustom(tmpl)}
                    className={`w-full rounded-xl border-2 p-2 text-left transition-all ${
                      selectedCustom?.id === tmpl.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={tmpl.image_url} alt={tmpl.name} className="h-20 w-full rounded-lg object-cover" />
                    <p className="mt-1 text-xs font-semibold text-foreground truncate">{tmpl.name}</p>
                    <Badge className="mt-1 text-[9px]" variant="secondary">{tmpl.template_type}</Badge>
                  </button>
                  {tmpl.created_by === user?.id && (
                    <button onClick={() => handleDeleteTemplate(tmpl.id)} className="absolute -right-1 -top-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* Edit form */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-lg font-semibold text-foreground">Flyer Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Pet Name</Label><Input value={formData.petName} onChange={(e) => setFormData({ ...formData, petName: e.target.value })} placeholder="Buddy" /></div>
                <div><Label>Species</Label><Input value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} placeholder="Dog" /></div>
                <div><Label>Breed</Label><Input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} placeholder="Golden Retriever" /></div>
                <div><Label>Color</Label><Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="Golden" /></div>
              </div>
              <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Any distinguishing features..." rows={3} /></div>
              <div><Label>Last Seen Address</Label><Input value={formData.lastSeenAddress} onChange={(e) => setFormData({ ...formData, lastSeenAddress: e.target.value })} placeholder="123 Main St" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Contact Phone</Label><Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} placeholder="+1 234 567 890" /></div>
                <div><Label>Reward</Label><Input value={formData.reward} onChange={(e) => setFormData({ ...formData, reward: e.target.value })} placeholder="$100" /></div>
              </div>
              <div><Label>Pet Image URL</Label><Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." /></div>
              <Button className="w-full gap-2" onClick={handleDownloadPDF} disabled={generating || !hasSubscription}>
                {!hasSubscription ? <><Lock className="h-4 w-4" /> Subscribe to Download</> : <><FileDown className="h-4 w-4" /> {generating ? "Generating..." : "Download A4 PDF"}</>}
              </Button>
            </CardContent>
          </Card>

          {/* Live A4 Preview */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Live Preview (A4)</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-border shadow-lg" style={{ aspectRatio: "210/297", maxHeight: "580px" }}>
              <div
                ref={flyerRef}
                style={{
                  width: "420px",
                  height: "594px",
                  transform: "scale(0.67)",
                  transformOrigin: "top left",
                  overflow: "hidden",
                  position: "relative",
                  ...(isCustom ? {
                    backgroundImage: `url(${selectedCustom!.image_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    fontFamily: "'Helvetica', sans-serif",
                  } : {}),
                }}
              >
                {isCustom ? (
                  <>
                    <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.75)" }} />
                    <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
                      {renderBoldSplit(flyerTemplates[0], formData)}
                    </div>
                  </>
                ) : (
                  renderTemplate(selectedTemplate, formData)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Template Dialog */}
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Custom Template</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">Upload an A4 background image (portrait). Pet details will be overlaid on top.</p>
              <div><Label>Template Name</Label><Input value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="My Custom Design" /></div>
              <div><Label>Description (optional)</Label><Input value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} placeholder="Brief description" /></div>
              <div><Label>Background Image</Label><Input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} /></div>
              {uploadFile && <img src={URL.createObjectURL(uploadFile)} alt="Preview" className="h-40 w-full rounded-lg object-cover border border-border" />}
              <Button className="w-full gap-2" onClick={handleUploadTemplate} disabled={uploading || !uploadFile || !uploadName.trim()}>
                <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default LostFlyerBuilder;
