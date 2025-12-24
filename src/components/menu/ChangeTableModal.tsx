import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChangeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableChange: (tableNumber: number) => void;
  currentTable: number;
}

export function ChangeTableModal({ isOpen, onClose, onTableChange, currentTable }: ChangeTableModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedTable, setScannedTable] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setScannedTable(null);
    }
  }, [isOpen]);

  const handleScanQR = () => {
    setIsScanning(true);

    // In a real implementation, this would open a QR scanner
    // For demo purposes, we'll simulate scanning by reading URL params
    // The QR code format: https://${tenant}.liwamenu.com?restaurantId=${id}&tableNumber=${num}

    // Check current URL for tableNumber param (simulating QR scan result)
    const urlParams = new URLSearchParams(window.location.search);
    const tableFromUrl = urlParams.get("tableNumber");

    // Simulate scanning delay
    setTimeout(() => {
      if (tableFromUrl) {
        const tableNum = parseInt(tableFromUrl, 10);
        if (!isNaN(tableNum) && tableNum > 0) {
          setScannedTable(tableNum);
          setIsScanning(false);
          return;
        }
      }

      // Demo: Show instruction to user
      toast.info("QR kodu tarayarak masa numarasını değiştirebilirsiniz. URL'ye ?tableNumber=X ekleyin.");
      setIsScanning(false);
    }, 1500);
  };

  const handleConfirmTable = () => {
    if (scannedTable && scannedTable !== currentTable) {
      onTableChange(scannedTable);
      toast.success(`Masa ${scannedTable} olarak değiştirildi!`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/6 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div className="bg-card rounded-3xl overflow-hidden shadow-elegant">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold">Masa Değiştir</h2>
                </div>
                <button
                  onClick={onClose}
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
                    <div className="aspect-square bg-secondary rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border">
                      {isScanning ? (
                        <>
                          <Loader2 className="w-12 h-12 text-primary animate-spin" />
                          <p className="text-muted-foreground">QR kod taranıyor...</p>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-16 h-16 text-muted-foreground" />
                          <p className="text-muted-foreground text-center px-4">Yeni masanızdaki QR kodu tarayın</p>
                        </>
                      )}
                    </div>

                    <Button
                      onClick={handleScanQR}
                      disabled={isScanning}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold rounded-2xl"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Taranıyor...
                        </>
                      ) : (
                        <>
                          <QrCode className="w-5 h-5 mr-2" />
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
                        onClick={() => setScannedTable(null)}
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
