import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, AlertTriangle } from 'lucide-react';
import { useRestaurant } from '@/hooks/useRestaurant';

export function RestaurantHeader() {
  const { restaurant, isRestaurantActive, isCurrentlyOpen, getCurrentWorkingHour } = useRestaurant();

  const workingHour = getCurrentWorkingHour;

  return (
    <header className="relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background" />
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="relative container px-4 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl bg-card shadow-card overflow-hidden mb-4 ring-4 ring-primary/20">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop"
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name & Slogan */}
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            {restaurant.name}
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            {restaurant.slogan1} {restaurant.slogan2}
          </p>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {!isRestaurantActive ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full text-sm font-medium"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Restoran Şu An Hizmet Vermiyor</span>
              </motion.div>
            ) : isCurrentlyOpen ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>Açık</span>
                {workingHour && (
                  <span className="text-muted-foreground">
                    • {workingHour.Open} - {workingHour.Close}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>Kapalı</span>
                {workingHour && !workingHour.IsClosed && (
                  <span>• {workingHour.Open}'da açılacak</span>
                )}
              </div>
            )}
          </div>

          {/* Info Row */}
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
            <a
              href={`tel:${restaurant.phoneNumber}`}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{restaurant.phoneNumber}</span>
            </a>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{restaurant.district}, {restaurant.city}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
