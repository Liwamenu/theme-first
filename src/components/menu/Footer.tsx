import { Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { useRestaurant } from '@/hooks/useRestaurant';

const dayNames = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export function Footer() {
  const { restaurant } = useRestaurant();
  const { SocialLinks, WorkingHours } = restaurant;

  const socialLinks = [
    { url: SocialLinks.facebookUrl, icon: Facebook, label: 'Facebook' },
    { url: SocialLinks.instagramUrl, icon: Instagram, label: 'Instagram' },
    { url: SocialLinks.youtubeUrl, icon: Youtube, label: 'YouTube' },
    { url: SocialLinks.whatsappUrl, icon: MessageCircle, label: 'WhatsApp' },
  ].filter(link => link.url);

  return (
    <footer className="bg-card border-t border-border mt-8">
      <div className="container px-4 py-8">
        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-center mb-4">Bizi Takip Edin</h3>
            <div className="flex justify-center gap-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Working Hours */}
        <div className="max-w-md mx-auto">
          <h3 className="font-semibold text-center mb-4">Çalışma Saatleri</h3>
          <div className="bg-secondary rounded-2xl p-4 space-y-2">
            {WorkingHours.map((wh) => (
              <div
                key={wh.Day}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{dayNames[wh.Day]}</span>
                {wh.IsClosed ? (
                  <span className="text-destructive font-medium">Kapalı</span>
                ) : (
                  <span className="font-medium">{wh.Open} - {wh.Close}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">{restaurant.name}</p>
          <p>{restaurant.address}</p>
          <p className="mt-1">{restaurant.phoneNumber}</p>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {restaurant.name}. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
