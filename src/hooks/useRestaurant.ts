import { useMemo } from 'react';
import { restaurantData } from '@/data/restaurant';
import { RestaurantData, Product, WorkingHour } from '@/types/restaurant';

export interface Category {
  id: string;
  name: string;
  image: string;
  sortOrder: number;
  products: Product[];
}

export function useRestaurant() {
  const data = restaurantData.restaurantData;

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

  const categories = useMemo((): Category[] => {
    const visibleProducts = data.Products.filter(p => !p.hide);
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
  }, [data]);

  const recommendedProducts = useMemo(() => {
    return data.Products.filter(p => p.recommendation && !p.hide);
  }, [data]);

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
  };
}
