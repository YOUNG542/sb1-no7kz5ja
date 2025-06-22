// components/pwa.tsx
import { useEffect, useState } from 'react';

export const PwaPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'android' | 'ios' | null>(null);

  const isIos = () =>
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  const isAndroid = () =>
    /android/.test(window.navigator.userAgent.toLowerCase());

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;

  useEffect(() => {
    // Android: beforeinstallprompt 이벤트 캐치
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone()) {
        setPlatform('android');
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    // iOS Safari의 경우 수동 안내
    if (isIos() && !isStandalone()) {
      setPlatform('ios');
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt || !platform) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow z-50 text-sm">
      {platform === 'android' && deferredPrompt && (
        <button
          onClick={async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
              console.log('User accepted the install prompt');
            } else {
              console.log('User dismissed the install prompt');
            }
            setDeferredPrompt(null);
            setShowPrompt(false);
          }}
        >
          앱 설치 안내 (Chrome 설치 창 띄우기)
        </button>
      )}

      {platform === 'ios' && (
        <div>
          <p>
            Safari에서{' '}
            <strong>공유 버튼 → "홈 화면에 추가"</strong>를 눌러 설치하세요.
          </p>
        </div>
      )}
    </div>
  );
};
