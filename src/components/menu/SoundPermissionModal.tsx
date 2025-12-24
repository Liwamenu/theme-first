import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SoundPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export function SoundPermissionModal({ isOpen, onAllow, onDeny }: SoundPermissionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-4 bottom-4 z-[60] max-w-md mx-auto flex items-center"
          >
            <div className="bg-card rounded-3xl overflow-hidden shadow-elegant max-h-full overflow-y-auto w-full">
              {/* Icon */}
              <div className="pt-8 pb-4 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Volume2 className="w-10 h-10 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 text-center space-y-4">
                <h2 className="text-xl font-bold">Ses Bildirimlerini Aç</h2>
                
                <p className="text-muted-foreground">
                  Sipariş durumunuz değiştiğinde sesli bildirim almak ister misiniz? 
                  Siparişiniz hazır olduğunda size söyleyeceğiz!
                </p>

                <div className="bg-secondary rounded-xl p-4 text-left">
                  <h4 className="font-medium mb-2">🔊 Neden izin vermeliyim?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sipariş durumu değişikliklerini sesli olarak duyun</li>
                    <li>• "Siparişiniz hazır!" gibi bildirimler alın</li>
                    <li>• Telefonunuza bakmadan güncel kalın</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={onDeny}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-lg font-semibold rounded-2xl"
                  >
                    <VolumeX className="w-5 h-5 mr-2" />
                    Hayır
                  </Button>
                  <Button
                    onClick={onAllow}
                    size="lg"
                    className="flex-1 h-14 text-lg font-semibold rounded-2xl"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    İzin Ver
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
