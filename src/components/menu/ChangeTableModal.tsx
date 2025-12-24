import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Loader2, Check, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

interface ChangeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableChange: (tableNumber: number) => void;
  currentTable: number;
}

export function ChangeTableModal({ isOpen, onClose, onTableChange, currentTable }: ChangeTableModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedTable, setScannedTable] = useState<number | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setIsScanning(false);
      setScannedTable(null);
      setScannerError(null);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.log("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
  };

  const extractTableNumber = (url: string): number | null => {
    try {
      // Try to parse as URL first
      const urlObj = new URL(url);
      const tableParam = urlObj.searchParams.get("tableNumber");
      if (tableParam) {
        const tableNum = parseInt(tableParam, 10);
        if (!isNaN(tableNum) && tableNum > 0) {
          return tableNum;
        }
      }
    } catch {
      // If not a valid URL, try to find tableNumber pattern directly
      const match = url.match(/tableNumber=(\d+)/);
      if (match) {
        const tableNum = parseInt(match[1], 10);
        if (!isNaN(tableNum) && tableNum > 0) {
          return tableNum;
        }
      }
    }
    return null;
  };

  const handleStartScanner = async () => {
    setIsScanning(true);
    setScannerError(null);

    // Wait for DOM to update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      scannerRef.current = new Html5Qrcode(scannerContainerId);
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Successfully scanned
          const tableNum = extractTableNumber(decodedText);
          
          if (tableNum) {
            setScannedTable(tableNum);
            stopScanner();
            setIsScanning(false);
          } else {
            toast.error("Geçersiz QR kod. Lütfen restoran QR kodunu tarayın.");
          }
        },
        () => {
          // QR code not found - this is called frequently, ignore
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setIsScanning(false);
      
      if (err instanceof Error) {
        if (err.message.includes("Permission")) {
          setScannerError("Kamera izni gerekli. Lütfen kamera erişimine izin verin.");
        } else if (err.message.includes("NotFoundError") || err.message.includes("No camera")) {
          setScannerError("Kamera bulunamadı. Lütfen kameralı bir cihaz kullanın.");
        } else {
          setScannerError("Kamera açılamadı. Lütfen tekrar deneyin.");
        }
      } else {
        setScannerError("Kamera açılamadı. Lütfen tekrar deneyin.");
      }
    }
  };

  const handleConfirmTable = () => {
    if (scannedTable && scannedTable !== currentTable) {
      onTableChange(scannedTable);
      toast.success(`Masa ${scannedTable} olarak değiştirildi!`);
      onClose();
    } else if (scannedTable === currentTable) {
      toast.info("Zaten bu masadasınız.");
      onClose();
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-4 bottom-4 z-50 max-w-md mx-auto flex items-center"
          >
            <div className="bg-card rounded-3xl overflow-hidden shadow-elegant max-h-full overflow-y-auto w-full">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold">Masa Değiştir</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Current Table */}
                <div className="flex items-center gap-4 p-4 bg-secondary rounded-2xl">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Mevcut Masa</p>
                    <p className="text-xl font-bold">{currentTable}</p>
                  </div>
                  {scannedTable && (
                    <>
                      <div className="text-muted-foreground">→</div>
                      <div className="flex-1 text-right">
                        <p className="text-sm text-muted-foreground">Yeni Masa</p>
                        <p className="text-xl font-bold text-primary">{scannedTable}</p>
                      </div>
                    </>
                  )}
                </div>

                {!scannedTable ? (
                  <>
                    {/* QR Scanner Area */}
                    <div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden border-2 border-dashed border-border">
                      {isScanning ? (
                        <div id={scannerContainerId} className="w-full h-full" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                          {scannerError ? (
                            <>
                              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <X className="w-8 h-8 text-destructive" />
                              </div>
                              <p className="text-destructive text-center px-4 text-sm">{scannerError}</p>
                            </>
                          ) : (
                            <>
                              <QrCode className="w-16 h-16 text-muted-foreground" />
                              <p className="text-muted-foreground text-center px-4">Yeni masanızdaki QR kodu tarayın</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={isScanning ? () => { stopScanner(); setIsScanning(false); } : handleStartScanner}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold rounded-2xl"
                    >
                      {isScanning ? (
                        <>
                          <X className="w-5 h-5 mr-2" />
                          İptal
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5 mr-2" />
                          QR Kod Tara
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Success State */}
                    <div className="aspect-video bg-green-50 dark:bg-green-950/20 rounded-2xl flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-green-600 dark:text-green-400 font-medium">Masa {scannedTable} bulundu!</p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => { setScannedTable(null); setScannerError(null); }}
                        variant="outline"
                        size="lg"
                        className="flex-1 h-14 text-lg font-semibold rounded-2xl"
                      >
                        Tekrar Tara
                      </Button>
                      <Button
                        onClick={handleConfirmTable}
                        size="lg"
                        className="flex-1 h-14 text-lg font-semibold rounded-2xl"
                      >
                        Onayla
                      </Button>
                    </div>
                  </>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Masa değiştirmek için yeni masanızdaki QR kodu taramanız gerekmektedir.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
