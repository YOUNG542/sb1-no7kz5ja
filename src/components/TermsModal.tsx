// src/components/TermsModal.tsx

import React, { useState } from 'react';

interface TermsModalProps {
  onAgree: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onAgree }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">서비스 이용 동의</h2>
        <p className="text-sm text-gray-600 mb-4">
          서비스를 계속 이용하시려면 아래 약관을 확인하고 동의해 주세요.
        </p>

        {/* ✅ 약관 요약 스크롤 박스 */}
        <div className="h-48 overflow-y-auto text-xs border p-3 rounded-md text-gray-700 bg-gray-50 mb-4">
          <p className="font-bold mb-1">[이용약관 요약]</p>
          <p>
            네버엔딩 홍개팅은 홍익대학교 소속 사용자 간 익명 기반 소개팅 및 커뮤니티 기능을 제공합니다. <br />
            사용자는 타인에게 불쾌감을 주는 언행, 성적 표현, 도배, 도용 행위를 해서는 안 됩니다. <br />
            위반 시 경고 없이 계정이 차단될 수 있으며, 사용자가 작성한 포스트 및 댓글 등은 
            서비스 내 비영리적 범위에서 활용될 수 있습니다. <br />
            운영자는 건전한 커뮤니티 유지를 위해 콘텐츠를 모니터링할 수 있으며, 사용자 간 매칭 및 대화에 대한 직접적인 책임은 지지 않습니다.
          </p>

          <p className="mt-3 font-bold">[개인정보처리방침 요약]</p>
          <p>
          서비스는 이름, 나이 등 법적 개인정보를 수집하지 않으며, 닉네임, 한줄소개, 성별, (추후 프로필 사진) 등 최소한의 익명 프로필 정보만 수집됩니다. <br />
메시지 내역, 포스트, 리액션 기록은 매칭 및 커뮤니케이션 기능 제공을 위해 저장되며, 계정 삭제 시 사용자 식별 정보(nickname 등)는 제거되지만 콘텐츠는 비식별화된 형태로 일부 유지될 수 있습니다. <br />
제3자에게 개인정보를 제공하지 않으며, 광고 플랫폼과도 연결되어 있지 않습니다.
          </p>
        </div>

        {/* ✅ 체크박스 */}
        <div className="text-sm text-gray-700 mb-4 flex items-start gap-2">
          <input
            type="checkbox"
            id="agree"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agree">
            위 약관과 개인정보처리방침에 동의합니다.
          </label>
        </div>

        <button
          disabled={!checked}
          onClick={onAgree}
          className="w-full py-2 rounded-xl font-semibold text-white bg-pink-500 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-pink-600 transition"
        >
          동의하고 계속하기
        </button>
      </div>
    </div>
  );
};
