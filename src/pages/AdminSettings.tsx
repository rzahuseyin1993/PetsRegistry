import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Mail, Globe, Bell, Lock, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("key");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      const map: Record<string, string> = {};
      settings.forEach((s: any) => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(values)) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key);
        if (error) throw error;
      }
      toast.success("Settings saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: currentPassword,
    });
    if (signInError) {
      setChangingPassword(false);
      toast.error("Current password is incorrect");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) toast.error("Failed to change password: " + error.message);
    else {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const mobileEnabled = values["mobile_site_enabled"] !== "false";

  const handleMobileToggle = (checked: boolean) => {
    setValues((prev) => ({ ...prev, mobile_site_enabled: checked ? "true" : "false" }));
  };

  const settingGroups = [
    {
      title: "Email Configuration",
      description: "Configure email addresses used across the platform",
      icon: Mail,
      fields: [
        { key: "site_email", label: "Site Email", placeholder: "admin@petsregistry.org", description: "Main contact email displayed on the site" },
        { key: "notification_email", label: "Notification Sender Email", placeholder: "notifications@petsregistry.org", description: "From address for system notifications" },
        { key: "support_email", label: "Support Email", placeholder: "support@petsregistry.org", description: "Receives contact form submissions and support requests" },
      ],
    },
    {
      title: "Site Settings",
      description: "General site configuration",
      icon: Globe,
      fields: [
        { key: "site_name", label: "Site Name", placeholder: "PetsRegistry", description: "Displayed in headers and emails" },
      ],
    },
    {
      title: "Notification Settings",
      description: "Configure alert and notification behavior",
      icon: Bell,
      fields: [
        { key: "lost_pet_alert_radius_km", label: "Lost Pet Alert Radius (km)", placeholder: "5", description: "Radius in kilometers for sending lost pet alerts to nearby users" },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 bg-background p-6 md:p-8">
          <div className="flex justify-center pt-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-background p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage site-wide configuration</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="mt-8 space-y-6">
          {/* Mobile Site Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5 text-primary" />
                Mobile Site
              </CardTitle>
              <CardDescription>Enable or disable the mobile version of the website (/m)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="text-sm font-medium">{mobileEnabled ? "Mobile site is active" : "Mobile site is disabled"}</p>
                  <p className="text-xs text-muted-foreground">When disabled, visitors accessing /m will be redirected to the desktop site</p>
                </div>
                <Switch checked={mobileEnabled} onCheckedChange={handleMobileToggle} />
              </div>
            </CardContent>
          </Card>

          {settingGroups.map((group) => {
            const Icon = group.icon;
            return (
              <Card key={group.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5 text-primary" />
                    {group.title}
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Input
                        id={field.key}
                        value={values[field.key] || ""}
                        placeholder={field.placeholder}
                        onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>Update your admin account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-current-password">Current Password</Label>
                  <Input id="admin-current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-new-password">New Password</Label>
                  <Input id="admin-new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-confirm-password">Confirm New Password</Label>
                  <Input id="admin-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <Button type="submit" variant="outline" disabled={changingPassword} className="gap-2">
                  <Lock className="h-4 w-4" />
                  {changingPassword ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
