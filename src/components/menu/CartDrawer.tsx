import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useRestaurant } from '@/hooks/useRestaurant';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const { formatPrice } = useRestaurant();

  const total = getTotal();

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Sepetim</h2>
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-sm rounded-full">
                  {items.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-lg text-muted-foreground">Sepetiniz boş</p>
                  <p className="text-sm text-muted-foreground/70">
                    Lezzetli yemeklerimizi keşfedin!
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => {
                    const portion = item.portion;
                    let price = portion.price;
                    if (portion.specialPrice !== null) {
                      price = portion.specialPrice;
                    } else if (portion.campaignPrice !== null) {
                      price = portion.campaignPrice;
                    }
                    const tagTotal = item.selectedTags.reduce((sum, tag) => sum + (tag.price * tag.quantity), 0);
                    const itemTotal = (price + tagTotal) * item.quantity;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 bg-secondary/50 rounded-2xl p-3"
                      >
                        <img
                          src={item.product.imageURL}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-sm line-clamp-1">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {item.portion.name}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Selected Tags */}
                          {item.selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedTags.map((tag) => (
                                <span
                                  key={tag.itemId}
                                  className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full"
                                >
                                  {tag.itemName}
                                  {tag.price > 0 && ` +${formatPrice(tag.price)}`}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-full bg-card flex items-center justify-center"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-6 text-center font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="font-bold text-primary">
                              {formatPrice(itemTotal)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={clearCart}
                    className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Sepeti Temizle
                  </button>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Toplam</p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(total)}</p>
                  </div>
                </div>
                <Button
                  onClick={onCheckout}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-2xl shadow-glow"
                >
                  Siparişi Tamamla
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function CartButton({ onClick }: { onClick: () => void }) {
  const { getItemCount, getTotal } = useCart();
  const { formatPrice } = useRestaurant();
  const itemCount = getItemCount();
  const total = getTotal();

  if (itemCount === 0) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      onClick={onClick}
      className="fixed bottom-6 left-4 right-4 z-40 flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground rounded-2xl shadow-glow"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-card text-primary text-xs font-bold rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        </div>
        <span className="font-semibold">Sepeti Görüntüle</span>
      </div>
      <span className="text-lg font-bold">{formatPrice(total)}</span>
    </motion.button>
  );
}
