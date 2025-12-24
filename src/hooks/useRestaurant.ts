import { useMemo } from 'react';
import { create } from 'zustand';
import { restaurantData as initialRestaurantData } from '@/data/restaurant';
import { RestaurantData, Product, WorkingHour } from '@/types/restaurant';

export interface Category {
  id: string;
  name: string;
  image: string;
  sortOrder: number;
  products: Product[];
}

interface RestaurantStore {
  restaurantData: RestaurantData;
  setTableNumber: (tableNumber: number) => void;
}

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  restaurantData: initialRestaurantData.restaurantData,
  setTableNumber: (tableNumber: number) => 
    set((state) => ({
      restaurantData: { ...state.restaurantData, tableNumber }
    })),
}));

export function useRestaurant() {
  const { restaurantData: data, setTableNumber } = useRestaurantStore();

  const isRestaurantActive = useMemo(() => {
    return data.isActive && data.licenseIsActive && !data.hide;
  }, [data]);

  const getCurrentWorkingHour = useMemo((): WorkingHour | null => {
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7
    return data.WorkingHours.find(wh => wh.Day === dayOfWeek) || null;
  }, [data]);

  const isCurrentlyOpen = useMemo(() => {
    const workingHour = getCurrentWorkingHour;
    if (!workingHour || workingHour.IsClosed) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return currentTime >= workingHour.Open && currentTime <= workingHour.Close;
  }, [getCurrentWorkingHour]);

  // Get currently active menu based on day and time
  const activeMenu = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Find active menu plan
    for (const menu of data.Menus) {
      for (const plan of menu.plans) {
        if (plan.days.includes(dayOfWeek)) {
          if (currentTime >= plan.startTime && currentTime <= plan.endTime) {
            return menu;
          }
        }
      }
    }
    return null;
  }, [data]);

  // Get allowed category IDs from active menu
  const allowedCategoryIds = useMemo(() => {
    if (!activeMenu) {
      // If no active menu, show all categories
      return null;
    }
    return new Set(activeMenu.categoryIds);
  }, [activeMenu]);

  const categories = useMemo((): Category[] => {
    let visibleProducts = data.Products.filter(p => !p.hide);
    
    // Filter by menu categories if there's an active menu
    if (allowedCategoryIds) {
      visibleProducts = visibleProducts.filter(p => allowedCategoryIds.has(p.categoryId));
    }

    const categoryMap = new Map<string, Category>();

    visibleProducts.forEach(product => {
      if (!categoryMap.has(product.categoryId)) {
        categoryMap.set(product.categoryId, {
          id: product.categoryId,
          name: product.categoryName,
          image: product.categoryImage,
          sortOrder: product.categorySortOrder,
          products: [],
        });
      }
      categoryMap.get(product.categoryId)!.products.push(product);
    });

    // Sort products within each category
    categoryMap.forEach(category => {
      category.products.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return Array.from(categoryMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [data, allowedCategoryIds]);

  // Format price with money sign
  const formatPrice = (price: number): string => {
    const formatted = price.toFixed(2);
    if (data.moneySign) {
      return `${data.moneySign}${formatted}`;
    }
    return formatted;
  };

  const recommendedProducts = useMemo(() => {
    let products = data.Products.filter(p => p.recommendation && !p.hide);
    
    // Filter by menu categories if there's an active menu
    if (allowedCategoryIds) {
      products = products.filter(p => allowedCategoryIds.has(p.categoryId));
    }
    
    return products;
  }, [data, allowedCategoryIds]);

  const enabledPaymentMethods = useMemo(() => {
    return data.PaymentMethods.filter(pm => pm.enabled);
  }, [data]);

  const canOrderOnline = data.onlineOrder && isRestaurantActive && isCurrentlyOpen;
  const canOrderInPerson = data.inPersonOrder && isRestaurantActive && isCurrentlyOpen;

  return {
    restaurant: data,
    isRestaurantActive,
    isCurrentlyOpen,
    getCurrentWorkingHour,
    categories,
    recommendedProducts,
    enabledPaymentMethods,
    canOrderOnline,
    canOrderInPerson,
    setTableNumber,
    formatPrice,
    activeMenu,
  };
}
