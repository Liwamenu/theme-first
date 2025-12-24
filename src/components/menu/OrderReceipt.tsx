import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, ChefHat, Package, Truck, XCircle, Bell, Home, Receipt, MapPin, Phone, User } from 'lucide-react';
import { Order } from '@/types/restaurant';
import { useRestaurant } from '@/hooks/useRestaurant';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface OrderReceiptProps {
  order: Order;
  onBack: () => void;
}

const statusConfig: Record<Order['status'], { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Onay Bekleniyor', icon: <Clock className="w-5 h-5" />, color: 'text-amber-500' },
  confirmed: { label: 'Onaylandı', icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-primary' },
  preparing: { label: 'Hazırlanıyor', icon: <ChefHat className="w-5 h-5" />, color: 'text-blue-500' },
  ready: { label: 'Hazır', icon: <Package className="w-5 h-5" />, color: 'text-green-500' },
  delivered: { label: 'Teslim Edildi', icon: <Truck className="w-5 h-5" />, color: 'text-green-600' },
  cancelled: { label: 'İptal Edildi', icon: <XCircle className="w-5 h-5" />, color: 'text-destructive' },
};

const statusSteps: Order['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

export function OrderReceipt({ order, onBack }: OrderReceiptProps) {
  const { restaurant, formatPrice } = useRestaurant();
  const status = statusConfig[order.status];
  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Sipariş Detayı</h1>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6 pb-24">
        {/* Receipt Card */}
        <div className="bg-card rounded-3xl shadow-elegant overflow-hidden">
          {/* Receipt Header */}
          <div className="bg-primary/5 p-6 text-center border-b border-dashed border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold">{restaurant.name}</h2>
            <p className="text-muted-foreground text-sm mt-1">{restaurant.address}</p>
            <p className="text-muted-foreground text-sm">{restaurant.phoneNumber}</p>
          </div>

          {/* Order Info */}
          <div className="p-6 border-b border-dashed border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm">Sipariş No</span>
              <span className="font-mono font-semibold">#{order.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm">Tarih</span>
              <span className="font-medium">
                {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: tr })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Sipariş Türü</span>
              <div className="flex items-center gap-2">
                {order.orderType === 'inPerson' ? (
                  <>
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="font-medium">Masa {order.tableNumber}</span>
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4 text-primary" />
                    <span className="font-medium">Online Teslimat</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="p-6 border-b border-dashed border-border">
            <h3 className="font-semibold mb-4">Sipariş Durumu</h3>
            
            {isCancelled ? (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-xl">
                <XCircle className="w-6 h-6 text-destructive" />
                <span className="font-medium text-destructive">Sipariş İptal Edildi</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const stepConfig = statusConfig[step];
                  
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
                          isCurrent && 'ring-4 ring-primary/20'
                        )}
                      >
                        {stepConfig.icon}
                      </div>
                      <span className={cn(
                        'text-xs mt-2 text-center',
                        isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                      )}>
                        {stepConfig.label}
                      </span>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={cn(
                            'absolute h-0.5 w-full top-5 left-1/2',
                            isActive ? 'bg-primary' : 'bg-secondary'
                          )}
                          style={{ display: 'none' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer Info (for online orders) */}
          {order.orderType === 'online' && order.customerInfo && (
            <div className="p-6 border-b border-dashed border-border">
              <h3 className="font-semibold mb-4">Teslimat Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span>{order.customerInfo.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span>{order.customerInfo.phone}</span>
                </div>
                {order.customerInfo.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>{order.customerInfo.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="p-6 border-b border-dashed border-border">
            <h3 className="font-semibold mb-4">Sipariş Detayları</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.quantity}x</span>
                      <span>{item.productName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.portionName}</p>
                    {item.selectedTags.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.selectedTags.map(tag => 
                          `${tag.itemName}${tag.quantity > 1 ? ` x${tag.quantity}` : ''}`
                        ).join(', ')}
                      </div>
                    )}
                    {item.note && (
                      <p className="text-xs text-muted-foreground italic mt-1">Not: {item.note}</p>
                    )}
                  </div>
                  <span className="font-medium">{formatPrice(item.itemTotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Note */}
          {order.orderNote && (
            <div className="p-6 border-b border-dashed border-border">
              <h3 className="font-semibold mb-2">Sipariş Notu</h3>
              <p className="text-muted-foreground">{order.orderNote}</p>
            </div>
          )}

          {/* Payment */}
          {order.paymentMethodName && (
            <div className="p-6 border-b border-dashed border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ödeme Yöntemi</span>
                <span className="font-medium">{order.paymentMethodName}</span>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="p-6 bg-primary/5">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">Toplam</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Receipt Footer Pattern */}
          <div className="h-4 bg-card" style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 2px, transparent 2px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 8px',
          }} />
        </div>
      </div>
    </motion.div>
  );
}
