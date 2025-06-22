import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const Intro: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [showLine2, setShowLine2] = useState(false);
  const [showLine3, setShowLine3] = useState(false);
  const [showLine4, setShowLine4] = useState(false);
  const [showCTA, setShowCTA] = useState(false); // CTA: Call To Action

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowLine2(true), 2500),
      setTimeout(() => setShowLine3(true), 3700),
      setTimeout(() => setShowLine4(true), 4700),
      setTimeout(() => setShowCTA(true), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-pink-100 via-white to-red-100 flex items-center justify-center relative overflow-hidden font-sans">
      {/* 블러 효과 */}
      <div className="absolute w-[300px] h-[300px] bg-pink-300 rounded-full blur-3xl opacity-50 top-10 left-10 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-red-300 rounded-full blur-3xl opacity-40 bottom-10 right-10 animate-pulse" />

      {/* 텍스트 블록 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        className="text-center z-10"
      >
        <motion.h1
          className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight drop-shadow-xl leading-snug"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 1.8, ease: 'easeInOut' }}
        >
          네버엔딩 홍개팅
        </motion.h1>

        {showLine2 && (
          <motion.p
            className="text-lg md:text-2xl text-gray-800 drop-shadow-sm mt-2 font-light tracking-wide leading-relaxed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            정말로 홍대생만을 위한 진짜 소개팅, 이제 시작됩니다.
          </motion.p>
        )}

        {showLine3 && (
          <motion.p
            className="text-lg md:text-2xl text-gray-800 drop-shadow-sm mt-2 font-light tracking-wide leading-relaxed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            홍대생만을 위한 단 하나의 공간.
          </motion.p>
        )}

        {showLine4 && (
          <motion.p
            className="text-lg md:text-2xl text-gray-800 drop-shadow-sm mt-2 font-light tracking-wide leading-relaxed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            당신이 기다리던 진짜, 여기에 있어요.
          </motion.p>
        )}

        {/* CTA 버튼 */}
        {showCTA && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="mt-8"
          >
            <p className="text-lg md:text-xl text-gray-700 mb-4">시작해볼까요?</p>
            <button
              onClick={onFinish}
              className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white text-base font-medium rounded-xl shadow-md transition"
            >
              네!
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
