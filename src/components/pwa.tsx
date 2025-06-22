// components/pwa.tsx
import { useEffect, useState } from 'react';

export const PwaPrompt = () => {
  const [platform, setPlatform] = useState<'android' | 'ios' | null>(null);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);

  const isIos = () =>
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  const isAndroid = () =>
    /android/.test(window.navigator.userAgent.toLowerCase());

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;

  useEffect(() => {
    if (isIos()) {
      setPlatform('ios');
    } else if (isAndroid()) {
      setPlatform('android');
    }
    setIsStandaloneMode(isStandalone());
  }, []);

  if (!platform || isStandaloneMode) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow z-50 text-sm">
      {platform === 'ios' && (
        <p>
          사파리에서{' '}
          <strong>공유 버튼 → "홈 화면에 추가"</strong>를 눌러주세요.
        </p>
      )}
      {platform === 'android' && (
        <p>
          크롬 우측 상단의{' '}
          <strong>⋮ 버튼 → "홈 화면에 추가"</strong>를 눌러주세요.
        </p>
      )}
    </div>
  );
};
