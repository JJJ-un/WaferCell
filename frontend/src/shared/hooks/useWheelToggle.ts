import { useState, useCallback, type WheelEvent } from 'react';

interface UseWheelToggleOptions {
  initialVisible?: boolean;
  threshold?: number;
  onScrollDown?: () => void;
  onScrollUp?: () => void;
}

/**
 * 마우스 휠 스크롤 방향에 따라 상태(토글/숨김)를 관리하는 공통 커스텀 훅
 */
export const useWheelToggle = (options?: UseWheelToggleOptions) => {
  const { initialVisible = true, threshold = 10, onScrollDown, onScrollUp } = options ?? {};
  const [isVisible, setIsVisible] = useState<boolean>(initialVisible);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.deltaY > threshold) {
        setIsVisible(false);
        onScrollDown?.();
      } else if (e.deltaY < -threshold) {
        setIsVisible(true);
        onScrollUp?.();
      }
    },
    [threshold, onScrollDown, onScrollUp]
  );

  return {
    isVisible,
    setIsVisible,
    handleWheel,
  };
};
