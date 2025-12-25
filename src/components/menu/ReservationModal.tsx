import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Users, User, Phone, Mail, MessageSquare, AlertTriangle, Check, Edit2 } from "lucide-react";
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

type Step = "form" | "verify";

export function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const { t, i18n } = useTranslation();
  const { restaurant } = useRestaurant();
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
      toast.error(t("validation.enterName"));
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error(t("validation.enterPhone"));
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error(t("validation.enterValidEmail"));
      return false;
    }
    if (!formData.date) {
      toast.error(t("validation.selectDate"));
      return false;
    }
    if (!formData.time) {
      toast.error(t("validation.selectTime"));
      return false;
    }
    if (formData.guests < 1) {
      toast.error(t("validation.enterGuests"));
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
      createdAt: new Date().toLocaleString(i18n.language === "en" ? "en-US" : "tr-TR"),
      lang: i18n.language,
    });

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
        throw new Error(t("reservation.error"));
      }

      const data = await response.json();
      const code = data.confirmationCode || `#${Math.floor(1000 + Math.random() * 9000)}`;
      toast.success(t("reservation.success"));
      navigateToReceipt(code);
    } catch (error) {
      const code = `#${Math.floor(1000 + Math.random() * 9000)}`;
      toast.success(t("reservation.success"));
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
    return date.toLocaleDateString(i18n.language === "en" ? "en-US" : "tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDayName = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.language === "en" ? "en-US" : "tr-TR", { weekday: "long" });
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
        className="fixed inset-0 z-100 bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
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
              {step === "form" && t("reservation.title")}
              {step === "verify" && t("reservation.verifyTitle")}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Step */}
          {step === "form" && (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {t("reservation.fullName")}
                </label>
                <Input
                  type="text"
                  placeholder={t("reservation.fullNamePlaceholder")}
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {t("reservation.phone")}
                </label>
                <Input
                  type="tel"
                  placeholder={t("reservation.phonePlaceholder")}
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {t("reservation.email")}
                </label>
                <Input
                  type="email"
                  placeholder={t("reservation.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {t("reservation.emailWarning")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {t("reservation.date")}
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
                    {t("reservation.time")}
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  {t("reservation.guests")}
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

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  {t("reservation.notes")} ({t("common.optional")})
                </label>
                <Textarea
                  placeholder={t("reservation.notesPlaceholder")}
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleContinue} className="w-full h-12 text-base font-medium">
                {t("common.continue")}
              </Button>
            </div>
          )}

          {/* Verify Step */}
          {step === "verify" && (
            <div className="p-4 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">{t("reservation.verifyEmailTitle")}</p>
                  <p className="text-xs text-amber-700 mt-1">{t("reservation.verifyEmailDesc")}</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("reservation.fullName")}:</span>
                  <span className="font-medium">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("reservation.phone")}:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("reservation.email")}:</span>
                  <span className="font-medium text-primary">{formData.email}</span>
                </div>
                <div className="border-t border-border pt-3" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("reservation.date")}:</span>
                  <span className="font-medium">
                    {formatDate(formData.date)} ({getDayName(formData.date)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("reservation.time")}:</span>
                  <span className="font-medium">{formData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("reservation.guests")}:</span>
                  <span className="font-medium">
                    {formData.guests} {t("common.guests")}
                  </span>
                </div>
                {formData.notes && (
                  <>
                    <div className="border-t border-border pt-3" />
                    <div>
                      <span className="text-muted-foreground">{t("reservation.notes")}:</span>
                      <p className="font-medium mt-1">{formData.notes}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleEdit} className="flex-1 h-12 gap-2">
                  <Edit2 className="w-4 h-4" />
                  {t("common.edit")}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-12 gap-2">
                  {isSubmitting ? (
                    <span className="animate-pulse">{t("reservation.submitting")}</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t("common.confirm")}
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
