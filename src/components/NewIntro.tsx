import React, { useEffect, useState } from 'react';


interface Props {
  onFinish: () => void;
}

export const NewIntro: React.FC<Props> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startFadeOut = setTimeout(() => {
      setFadeOut(true);
    }, 1200); // 1.2초 후 페이드아웃 시작

    const finish = setTimeout(() => {
      onFinish();
    }, 1500); // 1.5초 후 화면 전환

    return () => {
      clearTimeout(startFadeOut);
      clearTimeout(finish);
    };
  }, [onFinish]);

  return (
    <div
      className={`flex flex-col justify-center items-center h-screen bg-white text-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
     <img
        src="/intrologo.png" // ✅ public 디렉토리 기준 경로
        alt="로고"
        className="w-20 h-20 mb-4 object-contain"
      />
      <h1 className="text-3xl font-extrabold text-pink-500 mb-2 tracking-wide">
        네버엔딩 홍개팅
      </h1>
      <p className="text-gray-600 text-sm">
        지금 이 순간, 새로운 연결이 시작됩니다.
      </p>
    </div>
  );
};
