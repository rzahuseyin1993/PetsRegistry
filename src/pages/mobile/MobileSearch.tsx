import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

const MobileSearch = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [searchTerm, setSearchTerm] = useState(params.get("q") || "");
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(false);
  const isRunningRef = useRef(false);
  const navigate = useNavigate();

  const handleScanSuccess = useCallback((scannedText: string) => {
    setShowScanner(false);
    const petIdMatch = scannedText.match(/\/pet\/([a-f0-9-]+)/i);
    if (petIdMatch) {
      toast.success("Pet found! Redirecting...");
      navigate(`/pet/${petIdMatch[1]}`);
    } else if (scannedText.match(/^[a-f0-9-]{36}$/i)) {
      toast.success("Pet found! Redirecting...");
      navigate(`/pet/${scannedText}`);
    } else {
      setQuery(scannedText);
      setSearchTerm(scannedText);
      toast.info("QR code scanned — searching...");
    }
  }, [navigate]);

  useEffect(() => {
    if (!showScanner) return;

    mountedRef.current = true;
    isRunningRef.current = false;
    const scannerId = "mobile-search-qr-reader";

    const startScanner = async () => {
      const el = document.getElementById(scannerId);
      if (!el || !mountedRef.current) return;

      try {
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          (decodedText) => { if (mountedRef.current) handleScanSuccess(decodedText); },
          () => {}
        );

        if (mountedRef.current) {
          isRunningRef.current = true;
        } else {
          try { await scanner.stop(); scanner.clear(); } catch (_) {}
        }
      } catch (err: any) {
        isRunningRef.current = false;
        console.error("QR Scanner error:", err);
        if (mountedRef.current) toast.error("Could not access camera. Please allow camera permission.");
        setShowScanner(false);
      }
    };

    const timer = setTimeout(startScanner, 200);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      if (scannerRef.current && isRunningRef.current) {
        isRunningRef.current = false;
        scannerRef.current.stop()
          .then(() => { try { scannerRef.current?.clear(); } catch (_) {} })
          .catch(() => {})
          .finally(() => { scannerRef.current = null; });
      } else if (scannerRef.current) {
        try { scannerRef.current.clear(); } catch (_) {}
        scannerRef.current = null;
      }
    };
  }, [showScanner, handleScanSuccess]);

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ["mobile-search", searchTerm],
    queryFn: async () => {
      let q = supabase.from("pets").select("*, pet_images(image_url, sort_order)");
      if (searchTerm.trim()) {
        q = q.or(`name.ilike.%${searchTerm}%,pet_code.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%,species.ilike.%${searchTerm}%`);
      }
      const { data } = await q.order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  return (
    <div className="p-4 space-y-4">

      {/* ✅ Full screen QR scanner overlay — iPhone compatible */}
      {showScanner && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black">
          <div className="flex items-center justify-between p-4">
            <p className="text-sm font-medium text-white">Scan Pet QR Code</p>
            <Button
              variant="ghost" size="sm"
              onClick={() => setShowScanner(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-center px-4">
            <div id="mobile-search-qr-reader" style={{ width: "100%", maxWidth: "350px" }} />
          </div>
          <p className="pb-8 text-center text-xs text-white/60">
            Point camera at a PetsRegistry QR code
          </p>
        </div>
      )}

      {/* Search + QR button */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, ID, breed…"
          className="h-10 rounded-xl text-sm"
        />
        <Button
          type="button" variant="outline" size="sm"
          className="h-10 rounded-xl px-3 shrink-0"
          onClick={() => setShowScanner(true)}
        >
          <Camera className="h-4 w-4" />
        </Button>
        <Button type="submit" size="sm" className="h-10 rounded-xl px-3 shrink-0">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">{pets.length} pets found</p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {pets.map((pet: any) => {
            const img = pet.pet_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
            return (
              <Link key={pet.id} to={`/pet/${pet.id}`}>
                <Card className="overflow-hidden">
                  <div className="aspect-square bg-muted">
                    <img src={img?.image_url || "/placeholder.svg"} alt={pet.name} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="p-2.5">
                    <p className="truncate text-sm font-semibold text-foreground">{pet.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{pet.breed || pet.species}</p>
                    <Badge variant={pet.status === "lost" ? "destructive" : "secondary"} className="mt-1 text-[10px]">
                      {pet.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileSearch;
