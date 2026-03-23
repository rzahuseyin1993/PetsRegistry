import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

const MobileScan = () => {
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  const handleScanSuccess = useCallback(
    (scannedText: string) => {
      setScanning(false);

      // Stop scanner immediately after successful scan
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }

      const petIdMatch = scannedText.match(/\/pet\/([a-f0-9-]+)/i);
      if (petIdMatch) {
        toast.success("Pet found! Redirecting...");
        navigate(`/pet/${petIdMatch[1]}`);
      } else if (scannedText.match(/^[a-f0-9-]{36}$/i)) {
        toast.success("Pet found! Redirecting...");
        navigate(`/pet/${scannedText}`);
      } else {
        toast.info("QR scanned — searching...");
        navigate(`/m/search?q=${encodeURIComponent(scannedText)}`);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (!scanning) return;

    const scannerId = "mobile-qr-reader";

    const timer = setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" }, // ✅ rear camera on iPhone
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // scan errors are normal — ignore
          }
        );
      } catch (err) {
        console.error("QR Scanner error:", err);
        toast.error("Could not access camera. Please allow camera permission.");
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, [scanning, handleScanSuccess]);

  const handleCancel = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => scannerRef.current?.clear())
        .catch(() => {});
    }
    navigate("/m");
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      {scanning ? (
        <div className="w-full max-w-sm space-y-4">
          <h1 className="font-display text-lg font-bold text-foreground">
            Scan Pet QR Code
          </h1>
          <p className="text-sm text-muted-foreground">
            Point your camera at a PetsRegistry QR code
          </p>
          {/* ✅ html5-qrcode renders into this div */}
          <div className="overflow-hidden rounded-2xl border border-border">
            <div id="mobile-qr-reader" style={{ width: "100%" }} />
          </div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" /> Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <ScanLine className="mx-auto h-16 w-16 text-primary/30" />
          <p className="text-sm text-muted-foreground">Processing scan...</p>
        </div>
      )}
    </div>
  );
};

export default MobileScan;
