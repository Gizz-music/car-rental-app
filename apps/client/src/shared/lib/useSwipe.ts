import { useRef, type TouchEvent } from "react";

const MIN_SWIPE_DISTANCE = 50;

interface SwipeHandlers {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

// Горизонтальный свайп пальцем; вертикальные жесты игнорируются
export const useSwipe = ({ onSwipeLeft, onSwipeRight }: SwipeHandlers) => {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    start.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (!start.current) {
      return;
    }

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.current.x;
    const dy = touch.clientY - start.current.y;
    start.current = null;

    if (Math.abs(dx) < MIN_SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy)) {
      return;
    }
    if (dx < 0) {
      onSwipeLeft();
    } else {
      onSwipeRight();
    }
  };

  return { onTouchStart, onTouchEnd };
};
