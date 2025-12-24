import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReservationReceipt() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const restaurantName = searchParams.get("restaurantName") || "";
  const restaurantAddress = searchParams.get("restaurantAddress") || "";
  const restaurantPhone = searchParams.get("restaurantPhone") || "";
  const fullName = searchParams.get("fullName") || "";
  const phone = searchParams.get("phone") || "";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const guests = searchParams.get("guests") || "";
  const notes = searchParams.get("notes") || "";
  const confirmationCode = searchParams.get("confirmationCode") || "";
  const createdAt = searchParams.get("createdAt") || "";

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getDayName = (dateStr: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", { weekday: "long" });
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    document.title = "Rezervasyon Fişi";
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      {/* Print-only receipt */}
      <div
        id="receipt-content"
        className="bg-white text-black p-6 shadow-lg border border-border w-full max-w-sm print:shadow-none print:border-none print:p-0 print:max-w-none print:w-[80mm]"
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        {/* Header */}
        <div className="text-center">
          <h3 className="font-bold text-lg">{restaurantName}</h3>
          <p className="text-xs">{restaurantAddress}</p>
          <p className="text-xs">Tel: {restaurantPhone}</p>
        </div>

        <div className="border-t-2 border-b border-black my-3 h-1" />

        <div className="text-center font-bold text-lg">YENİ REZERVASYON</div>

        <div className="border-t border-dashed border-black my-3" />

        {/* Customer Info */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Müşteri:</span>
            <span className="font-bold">{fullName}</span>
          </div>
          <div className="flex justify-between">
            <span>Telefon:</span>
            <span className="font-bold">{phone}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black my-3" />

        {/* Reservation Details */}
        <div className="space-y-1">
          <div className="flex justify-between text-base">
            <span>TARİH:</span>
            <span className="font-bold">{formatDate(date)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span>GÜN:</span>
            <span className="font-bold capitalize">{getDayName(date)}</span>
          </div>
          <div className="flex justify-between text-lg mt-1">
            <span>SAAT:</span>
            <span className="font-bold">{time}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Misafir:</span>
            <span className="font-bold">{guests} Kişi</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black my-3" />

        {/* Notes */}
        <div className="text-sm">
          <span>ÖZEL İSTEKLER:</span>
          <div className="border-2 border-black p-2 mt-1 font-bold uppercase">{notes || "YOK"}</div>
        </div>

        <div className="border-t border-dashed border-black my-3" />

        {/* Footer */}
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Oluşturma:</span>
            <span className="font-bold">{createdAt}</span>
          </div>
          <div className="flex justify-between">
            <span>Onay Kodu:</span>
            <span className="font-bold">{confirmationCode}</span>
          </div>
        </div>

        <div className="text-center text-xs mt-5">*** Rezervasyonunuz alınmıştır ***</div>
      </div>

      {/* Action Buttons - Hidden when printing */}
      <div className="flex gap-3 mt-6 w-full max-w-sm print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex-1 h-12 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </Button>
        <Button onClick={handlePrint} className="flex-1 h-12 gap-2">
          <Printer className="w-4 h-4" />
          Yazdır
        </Button>
      </div>
    </div>
  );
}
