// components/MaintenanceModal.tsx
import React from 'react';

export const MaintenanceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-xs mx-auto">
        <h2 className="text-xl font-semibold mb-3">🚀 새로운 기능을 준비 중이에요!(아이스브레이킹)</h2>
        <p className="mb-4 text-sm text-gray-700">
          금일 오후 2:20부터 오후 6시까지  
          <br />
          서비스에 멋진 업데이트를 적용하고 있어요.  
          <br />
          조금만 기다려주세요!
        </p>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          onClick={onClose}
        >
          확인하고 나가기
        </button>
      </div>
    </div>
  );
};
