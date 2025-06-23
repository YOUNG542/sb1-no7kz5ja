import React from 'react';

interface Props {
  onClose: () => void;
}

const GenderNoticeModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
        <h2 className="text-lg font-bold mb-3">🚀 업데이트 안내</h2>
        <p className="text-sm text-gray-700 mb-5 leading-relaxed">
          성별 기능이 추가되었고, 이제 유저 리스트에는 <strong>이성만</strong> 표시됩니다. <br />
          <br />
          <span className="text-pink-500 font-medium">💡 모든 사용자분은 [프로필 수정]에서 성별을 꼭 지정해주세요! (그러지 않으면 유저 리스트에 아무도 나타나지 않습니다 ㅜ.ㅜ)</span>
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 transition-all"
        >
          확인했어요
        </button>
      </div>
    </div>
  );
};

export default GenderNoticeModal;
