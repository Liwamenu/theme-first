import { create } from 'zustand';
import { CartItem, Product, Portion, SelectedTagItem } from '@/types/restaurant';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, portion: Portion, selectedTags: SelectedTagItem[], quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (product, portion, selectedTags, quantity = 1) => {
    const id = `${product.id}-${portion.id}-${Date.now()}`;
    const newItem: CartItem = {
      id,
      product,
      portion,
      quantity,
      selectedTags,
    };
    set((state) => ({
      items: [...state.items, newItem],
    }));
  },
  
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },
  
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  getTotal: () => {
    const items = get().items;
    return items.reduce((total, item) => {
      // Get the best price for this portion
      const portion = item.portion;
      let price = portion.price;
      if (portion.specialPrice !== null) {
        price = portion.specialPrice;
      } else if (portion.campaignPrice !== null) {
        price = portion.campaignPrice;
      }
      
      // Add tag prices
      const tagTotal = item.selectedTags.reduce((sum, tag) => sum + (tag.price * tag.quantity), 0);
      
      return total + ((price + tagTotal) * item.quantity);
    }, 0);
  },
  
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
