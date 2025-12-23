import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '@/types/restaurant';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setCurrentOrder: (order: Order | null) => void;
  getOrders: () => Order[];
}

export const useOrder = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,
      
      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders],
          currentOrder: order,
        }));
      },
      
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
          currentOrder: state.currentOrder?.id === orderId 
            ? { ...state.currentOrder, status } 
            : state.currentOrder,
        }));
      },
      
      setCurrentOrder: (order) => {
        set({ currentOrder: order });
      },
      
      getOrders: () => get().orders,
    }),
    {
      name: 'restaurant-orders',
    }
  )
);
