import { create } from 'zustand';

interface FlyingEmojiState {
  isVisible: boolean;
  startPosition: { x: number; y: number };
  triggerFlyingEmoji: (x: number, y: number) => void;
  hideFlyingEmoji: () => void;
}

export const useFlyingEmoji = create<FlyingEmojiState>((set) => ({
  isVisible: false,
  startPosition: { x: 0, y: 0 },
  
  triggerFlyingEmoji: (x: number, y: number) => {
    set({ isVisible: true, startPosition: { x, y } });
  },
  
  hideFlyingEmoji: () => {
    set({ isVisible: false });
  },
}));
