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
          1. 오른쪽 아래에{' '}
          <strong>공유 버튼 → "safari로 열기"</strong>를 눌러주세요. 2. safari에서 공유 버튼 누르고 '홈 화면에 추가'로 설치해주세요.
        </p>
      )}
      {platform === 'android' && (
        <p>
          현재 계신 웹사이트에서{' '}
          <strong>⋮ 모양과 같은 공유 버튼 → "홈 화면에 추가"</strong>로 설치해주세요.
        </p>
      )}
    </div>
  );
};
