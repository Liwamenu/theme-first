import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Users, User, Phone, Mail, MessageSquare, AlertTriangle, Check, Edit2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurant } from "@/hooks/useRestaurant";
import { toast } from "sonner";
import { API_URLS, COUNTRY_CODES, isTurkishPhone, CountryCode } from "@/lib/api";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReservationFormData {
  fullName: string;
  countryCode: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  notes: string;
}

type Step = "form" | "verify" | "code";

export function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const { t, i18n } = useTranslation();
  const { restaurant } = useRestaurant();
  const [step, setStep] = useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>({
    fullName: "",
    countryCode: "TR",
    phone: "",
    email: "",
    date: "",
    time: "",
    guests: 2,
    notes: "",
  });

  const selectedCountry = COUNTRY_CODES.find(c => c.code === formData.countryCode) || COUNTRY_CODES[0];
  const isTurkish = isTurkishPhone(formData.countryCode);

  const handleInputChange = (field: keyof ReservationFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountrySelect = (country: CountryCode) => {
    setFormData((prev) => ({ ...prev, countryCode: country.code }));
    setShowCountryDropdown(false);
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

  const handleSendCode = async () => {
    setIsSendingCode(true);
    try {
      const fullPhone = `${selectedCountry.dialCode}${formData.phone}`;
      const apiUrl = isTurkish ? API_URLS.sendReservationCodeSMS : API_URLS.sendReservationCodeEmail;
      
      // Simulate API call for testing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Uncomment when API is ready:
      // const response = await fetch(apiUrl, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     restaurantId: restaurant.restaurantId,
      //     phone: fullPhone,
      //     email: formData.email,
      //   }),
      // });
      // if (!response.ok) throw new Error("Failed to send code");

      toast.success(t(isTurkish ? "reservation.codeSentSMS" : "reservation.codeSentEmail"));
      setStep("code");
    } catch (error) {
      toast.error(t("reservation.codeSendError"));
    } finally {
      setIsSendingCode(false);
    }
  };

  const navigateToReceipt = (code: string) => {
    const fullPhone = `${selectedCountry.dialCode}${formData.phone}`;
    const params = new URLSearchParams({
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      restaurantPhone: restaurant.phoneNumber,
      fullName: formData.fullName,
      phone: fullPhone,
      date: formData.date,
      time: formData.time,
      guests: formData.guests.toString(),
      notes: formData.notes,
      confirmationCode: code,
      createdAt: new Date().toLocaleString(i18n.language === "en" ? "en-US" : "tr-TR"),
      lang: i18n.language,
    });

    resetForm();
    onClose();
    window.open(`/reservation-receipt?${params.toString()}`, "_blank");
  };

  const handleSubmit = async () => {
    if (!verificationCode.trim()) {
      toast.error(t("validation.enterCode"));
      return;
    }

    setIsSubmitting(true);
    try {
      const fullPhone = `${selectedCountry.dialCode}${formData.phone}`;
      
      // Simulate API call for testing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const code = `#${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Uncomment when API is ready:
      // const response = await fetch(API_URLS.reservations, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     restaurantId: restaurant.restaurantId,
      //     fullName: formData.fullName,
      //     phone: fullPhone,
      //     email: formData.email,
      //     date: formData.date,
      //     time: formData.time,
      //     guests: formData.guests,
      //     notes: formData.notes,
      //     verificationCode: verificationCode,
      //   }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json().catch(() => ({}));
      //   if (errorData.code === "INVALID_CODE") {
      //     toast.error(t("reservation.invalidCode"));
      //     return;
      //   }
      //   throw new Error(t("reservation.error"));
      // }
      // const data = await response.json();
      // const code = data.confirmationCode || `#${Math.floor(1000 + Math.random() * 9000)}`;

      toast.success(t("reservation.success"));
      navigateToReceipt(code);
    } catch (error) {
      toast.error(t("reservation.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep("form");
    setVerificationCode("");
    setFormData({
      fullName: "",
      countryCode: "TR",
      phone: "",
      email: "",
      date: "",
      time: "",
      guests: 2,
      notes: "",
    });
  };

  const handleClose = () => {
    resetForm();
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
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
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
              {step === "code" && t("reservation.enterCodeTitle")}
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
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="h-12 px-3 bg-secondary border border-input rounded-lg flex items-center gap-2 hover:bg-secondary/80 transition-colors min-w-[100px]"
                    >
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {COUNTRY_CODES.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-sm flex-1">{country.name}</span>
                            <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input
                    type="tel"
                    placeholder={t("reservation.phonePlaceholder")}
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="h-12 flex-1"
                  />
                </div>
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
                  <p className="text-sm font-medium text-amber-800">
                    {t(isTurkish ? "reservation.verifySMSTitle" : "reservation.verifyEmailTitle")}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {t(isTurkish ? "reservation.verifySMSDesc" : "reservation.verifyEmailDesc")}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("reservation.fullName")}:</span>
                  <span className="font-medium">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("reservation.phone")}:</span>
                  <span className="font-medium">{selectedCountry.dialCode} {formData.phone}</span>
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
                <Button onClick={handleSendCode} disabled={isSendingCode} className="flex-1 h-12 gap-2">
                  {isSendingCode ? (
                    <span className="animate-pulse">{t("reservation.sendingCode")}</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t("reservation.sendCode")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Code Entry Step */}
          {step === "code" && (
            <div className="p-4 space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-primary">
                  {t(isTurkish ? "reservation.codeSentToPhone" : "reservation.codeSentToEmail", {
                    contact: isTurkish ? `${selectedCountry.dialCode} ${formData.phone}` : formData.email
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("reservation.verificationCode")}</label>
                <Input
                  type="text"
                  placeholder={t("reservation.codePlaceholder")}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="h-14 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
              </div>

              <Button
                variant="link"
                onClick={handleSendCode}
                disabled={isSendingCode}
                className="w-full text-sm"
              >
                {t("reservation.resendCode")}
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("verify")} className="flex-1 h-12">
                  {t("common.back")}
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
