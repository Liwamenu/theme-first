import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  X,
  Calendar,
  Clock,
  Users,
  User,
  Phone,
  Mail,
  MessageSquare,
  AlertTriangle,
  Check,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurant } from "@/hooks/useRestaurant";
import { toast } from "sonner";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReservationFormData {
  fullName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  notes: string;
}

type Step = "form" | "verify" | "success";

export function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const { restaurant } = useRestaurant();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>({
    fullName: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    guests: 2,
    notes: "",
  });

  const handleInputChange = (field: keyof ReservationFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Lütfen adınızı giriniz");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Lütfen telefon numaranızı giriniz");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Lütfen geçerli bir e-posta adresi giriniz");
      return false;
    }
    if (!formData.date) {
      toast.error("Lütfen tarih seçiniz");
      return false;
    }
    if (!formData.time) {
      toast.error("Lütfen saat seçiniz");
      return false;
    }
    if (formData.guests < 1) {
      toast.error("Lütfen kişi sayısını giriniz");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setStep("verify");
    }
  };

  const handleEdit = () => {
    setStep("form");
  };

  const navigateToReceipt = (code: string) => {
    const params = new URLSearchParams({
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      restaurantPhone: restaurant.phoneNumber,
      fullName: formData.fullName,
      phone: formData.phone,
      date: formData.date,
      time: formData.time,
      guests: formData.guests.toString(),
      notes: formData.notes,
      confirmationCode: code,
      createdAt: new Date().toLocaleString("tr-TR"),
    });
    
    // Reset modal state
    setStep("form");
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      date: "",
      time: "",
      guests: 2,
      notes: "",
    });
    onClose();
    
    // Open receipt in new tab
    window.open(`/reservation-receipt?${params.toString()}`, "_blank");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("https://api.liwamenu.com/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: restaurant.restaurantId,
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          date: formData.date,
          time: formData.time,
          guests: formData.guests,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Rezervasyon oluşturulamadı");
      }

      const data = await response.json();
      const code = data.confirmationCode || `#${Math.floor(1000 + Math.random() * 9000)}`;
      toast.success("Rezervasyonunuz alındı!");
      navigateToReceipt(code);
    } catch (error) {
      const code = `#${Math.floor(1000 + Math.random() * 9000)}`;
      toast.success("Rezervasyonunuz alındı!");
      navigateToReceipt(code);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      date: "",
      time: "",
      guests: 2,
      notes: "",
    });
    onClose();
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getDayName = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", { weekday: "long" });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-card rounded-2xl shadow-xl my-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">
              {step === "form" && "Rezervasyon Yap"}
              {step === "verify" && "Bilgilerinizi Doğrulayın"}
              {step === "success" && "Rezervasyon Fişi"}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Step */}
          {step === "form" && (
            <div className="p-4 space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Ad Soyad
                </label>
                <Input
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Telefon Numarası
                </label>
                <Input
                  type="tel"
                  placeholder="0555 123 45 67"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  E-posta Adresi
                </label>
                <Input
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Sizinle bu e-posta üzerinden iletişime geçilecektir. Doğru girdiğinizden emin olun.
                </p>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Tarih
                  </label>
                  <Input
                    type="date"
                    min={getMinDate()}
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Saat
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Kişi Sayısı
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.guests}
                  onChange={(e) => handleInputChange("guests", parseInt(e.target.value) || 1)}
                  className="h-12"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Özel Not (İsteğe Bağlı)
                </label>
                <Textarea
                  placeholder="Cam kenarı masa, doğum günü pastası vb."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Continue Button */}
              <Button onClick={handleContinue} className="w-full h-12 text-base font-medium">
                Devam Et
              </Button>
            </div>
          )}

          {/* Verify Step */}
          {step === "verify" && (
            <div className="p-4 space-y-4">
              {/* Warning Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">E-posta Adresinizi Kontrol Edin</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Rezervasyon onayı ve hatırlatmalar bu adrese gönderilecektir.
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ad Soyad:</span>
                  <span className="font-medium">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefon:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E-posta:</span>
                  <span className="font-medium text-primary">{formData.email}</span>
                </div>
                <div className="border-t border-border pt-3" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarih:</span>
                  <span className="font-medium">
                    {formatDate(formData.date)} ({getDayName(formData.date)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saat:</span>
                  <span className="font-medium">{formData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kişi Sayısı:</span>
                  <span className="font-medium">{formData.guests} Kişi</span>
                </div>
                {formData.notes && (
                  <>
                    <div className="border-t border-border pt-3" />
                    <div>
                      <span className="text-muted-foreground">Özel Not:</span>
                      <p className="font-medium mt-1">{formData.notes}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleEdit} className="flex-1 h-12 gap-2">
                  <Edit2 className="w-4 h-4" />
                  Düzenle
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-12 gap-2">
                  {isSubmitting ? (
                    <span className="animate-pulse">Gönderiliyor...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Onayla
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
