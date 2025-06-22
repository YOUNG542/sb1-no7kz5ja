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
           📱 iPhone 사용자는 Safari로 열어주세요. <br />
          1. 하단의 <strong>공유 버튼</strong> 누르기 <br />
          2. <strong>"홈 화면에 추가"</strong> 선택하면 설치 완료!
        </p>
      )}
      {platform === 'android' && (
        <p>
        오른쪽 위 점 세 개 공유버튼 클릭 후 '홈 화면에 추가하기'로 앱 설치
      </p>
      )}
    </div>
  );
};
