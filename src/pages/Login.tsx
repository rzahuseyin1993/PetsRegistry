import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint, LogIn, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const generateCaptcha = () => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(captchaInput) !== captcha.answer) {
      toast.error("Incorrect CAPTCHA answer. Please try again.");
      refreshCaptcha();
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      refreshCaptcha();
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <PawPrint className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">Welcome Back</CardTitle>
            <p className="text-sm text-muted-foreground">Sign in to manage your pets</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-lg" />
              </div>

              {/* CAPTCHA */}
              <div className="space-y-2">
                <Label>Verify you're human</Label>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <div className="flex h-10 items-center justify-center rounded-md bg-primary/10 px-4">
                    <span className="font-mono text-lg font-bold text-primary select-none">{captcha.question}</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="Answer"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    required
                    className="w-24 rounded-lg text-center"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={refreshCaptcha} title="New question">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              <Button className="w-full gap-2 rounded-lg" type="submit" disabled={loading}>
                <LogIn className="h-4 w-4" /> {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">Sign Up</Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
