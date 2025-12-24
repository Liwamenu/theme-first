import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  User,
  Phone,
  CreditCard,
  Banknote,
  AlertCircle,
  Loader2,
  Bell,
  Check,
  Home,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "@/hooks/useLocation";
import { useOrder } from "@/hooks/useOrder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { OrderPayload, Order } from "@/types/restaurant";

interface CheckoutModalProps {
  onClose: () => void;
  onOrderComplete: (order: Order) => void;
}

type OrderType = "inPerson" | "online";
type CheckoutStep = "type" | "details" | "payment" | "confirm";

export function CheckoutModal({ onClose, onOrderComplete }: CheckoutModalProps) {
  const { restaurant, enabledPaymentMethods, canOrderOnline, canOrderInPerson } = useRestaurant();
  const { items, getTotal, clearCart } = useCart();
  const { getLocation, checkDistance, getDistanceFromRestaurant, loading: locationLoading } = useLocation();
  const { addOrder } = useOrder();

  const [step, setStep] = useState<CheckoutStep>("type");
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "" });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [orderNote, setOrderNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithinRange, setIsWithinRange] = useState(false);

  const total = getTotal();
  const tableNumber = restaurant.tableNumber;

  const handleSelectOrderType = async (type: OrderType) => {
    setOrderType(type);

    if (type === "online") {
      try {
        await getLocation();
        const withinRange = checkDistance(restaurant.latitude, restaurant.longitude, restaurant.maxDistance);
        setIsWithinRange(withinRange);

        if (!withinRange) {
          const distance = getDistanceFromRestaurant(restaurant.latitude, restaurant.longitude);
          toast.error(
            `Teslimat alanı dışındasınız. (${distance?.toFixed(1)} km uzaktasınız, max: ${restaurant.maxDistance} km)`,
          );
          return;
        }
        setStep("details");
      } catch (error) {
        toast.error("Konum alınamadı. Online sipariş için konum izni gereklidir.");
        return;
      }
    } else {
      setStep("details");
    }
  };

  const handleDetailsSubmit = () => {
    if (orderType === "inPerson") {
      // For in-person, skip payment and go to confirm
      setStep("confirm");
    } else {
      if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
        toast.error("Lütfen tüm bilgileri doldurun");
        return;
      }
      setStep("payment");
    }
  };

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPaymentMethod(paymentId);
    setStep("confirm");
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("type");
      setOrderType(null);
    } else if (step === "payment") {
      setStep("details");
    } else if (step === "confirm") {
      if (orderType === "inPerson") {
        setStep("details");
      } else {
        setStep("payment");
      }
    }
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);

    const selectedPayment = enabledPaymentMethods.find((pm) => pm.id === selectedPaymentMethod);

    const orderPayload: OrderPayload = {
      restaurantId: restaurant.restaurantId,
      orderType: orderType!,
      items: items.map((item) => {
        const portion = item.portion;
        let unitPrice = portion.price;
        if (portion.specialPrice !== null) {
          unitPrice = portion.specialPrice;
        } else if (portion.campaignPrice !== null) {
          unitPrice = portion.campaignPrice;
        }
        const tagTotal = item.selectedTags.reduce((sum, tag) => sum + tag.price * tag.quantity, 0);
        const itemTotal = (unitPrice + tagTotal) * item.quantity;

        return {
          productId: item.product.id,
          productName: item.product.name,
          portionId: item.portion.id,
          portionName: item.portion.name,
          unitPrice,
          quantity: item.quantity,
          selectedTags: item.selectedTags,
          itemTotal,
          note: item.note || "",
        };
      }),
      totalAmount: total,
      orderNote: orderNote || undefined,
      createdAt: new Date().toISOString(),
      ...(orderType === "inPerson"
        ? { tableNumber }
        : {
            customerInfo,
            paymentMethodId: selectedPaymentMethod!,
            paymentMethodName: selectedPayment?.name,
          }),
    };

    try {
      // Send order to API
      console.log("Sending order to https://api.liwamnenu.com/orders:", JSON.stringify(orderPayload, null, 2));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create order with status
      const order: Order = {
        ...orderPayload,
        id: `order-${Date.now()}`,
        status: "pending",
      };

      // Save order
      addOrder(order);

      // Success!
      toast.success(
        orderType === "inPerson" ? "Siparişiniz alındı! Garson çağırılıyor..." : "Siparişiniz başarıyla oluşturuldu!",
      );

      clearCart();
      onOrderComplete(order);
    } catch (error) {
      toast.error("Sipariş oluşturulurken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showBackButton = step !== "type";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto bg-card rounded-t-3xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold">Sipariş Ver</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Step: Order Type */}
          {step === "type" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Sipariş Türü Seçin</h3>

              {canOrderInPerson && (
                <button
                  onClick={() => handleSelectOrderType("inPerson")}
                  className="w-full flex items-center gap-4 p-5 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bell className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-semibold text-lg">Masada Sipariş</h4>
                    <p className="text-sm text-muted-foreground">
                      Siparişinizi masanızda teslim alın ve garson çağırın
                    </p>
                  </div>
                </button>
              )}

              {canOrderOnline && (
                <button
                  onClick={() => handleSelectOrderType("online")}
                  disabled={locationLoading}
                  className="w-full flex items-center gap-4 p-5 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    {locationLoading ? (
                      <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    ) : (
                      <Home className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-semibold text-lg">Online Sipariş</h4>
                    <p className="text-sm text-muted-foreground">
                      Adresinize teslim ({restaurant.maxDistance} km içinde)
                    </p>
                  </div>
                </button>
              )}

              {!canOrderInPerson && !canOrderOnline && (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">Şu an sipariş alınmıyor. Lütfen daha sonra tekrar deneyin.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Details */}
          {step === "details" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                {orderType === "inPerson" ? "Sipariş Bilgisi" : "Teslimat Bilgileri"}
              </h3>

              {orderType === "inPerson" ? (
                <div className="space-y-4">
                  {/* Show table number from restaurant data */}
                  <div className="flex items-center gap-4 p-5 bg-secondary rounded-2xl">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bell className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm text-muted-foreground">Masa Numarası</p>
                      <p className="text-2xl font-bold">{tableNumber}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ad Soyad</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Adınız Soyadınız"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                        className="h-14 pl-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="05XX XXX XX XX"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                        className="h-14 pl-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Teslimat Adresi</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                      <textarea
                        id="address"
                        placeholder="Açık adresiniz"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                        className="w-full min-h-[100px] pl-12 p-4 rounded-xl bg-secondary border-0 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Note */}
              <div>
                <Label htmlFor="orderNote" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Sipariş Notu (Opsiyonel)
                </Label>
                <Textarea
                  id="orderNote"
                  placeholder="Siparişinizle ilgili eklemek istediğiniz not..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="mt-2 rounded-xl resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleDetailsSubmit}
                size="lg"
                className="w-full h-14 text-lg font-semibold rounded-2xl mt-4"
              >
                Devam Et
              </Button>
            </motion.div>
          )}

          {/* Step: Payment */}
          {step === "payment" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Ödeme Yöntemi</h3>

              <div className="space-y-3">
                {enabledPaymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentSelect(method.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                      selectedPaymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      {method.name.includes("Nakit") ? (
                        <Banknote className="w-6 h-6 text-primary" />
                      ) : (
                        <CreditCard className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <span className="font-medium flex-1 text-left">{method.name}</span>
                    {selectedPaymentMethod === method.id && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Sipariş Özeti</h3>

              {/* Order Summary */}
              <div className="bg-secondary rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {orderType === "inPerson" ? (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Masa {tableNumber} - Masada Sipariş</span>
                    </>
                  ) : (
                    <>
                      <Home className="w-4 h-4" />
                      <span>Online Teslimat</span>
                    </>
                  )}
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-medium">
                        ₺
                        {(
                          (item.portion.specialPrice ?? item.portion.campaignPrice ?? item.portion.price) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {orderNote && (
                  <div className="border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Not:</span> {orderNote}
                    </p>
                  </div>
                )}

                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Toplam</span>
                  <span className="text-primary">₺{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                size="lg"
                className="w-full h-14 text-lg font-semibold rounded-2xl shadow-glow"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {orderType === "inPerson" ? "Sipariş Ver" : "Siparişi Onayla"}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
