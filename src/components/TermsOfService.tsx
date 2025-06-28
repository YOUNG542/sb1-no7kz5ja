// src/components/legal/TermsOfService.tsx

import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-sm leading-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">이용약관</h1>

      <p>
        본 약관은 네버엔딩 홍개팅(이하 "서비스")의 이용조건과 책임사항 등을 규정합니다. 서비스를 이용하실 경우, 본 약관에 동의한 것으로 간주됩니다.
      </p>

      <h2 className="mt-6 font-semibold">1. 서비스 목적</h2>
      <p>홍익대학교 소속 사용자 간 익명 기반 소개팅 및 커뮤니티 기능 제공</p>

      <h2 className="mt-6 font-semibold">2. 사용자 의무</h2>
      <ul className="list-disc pl-6">
        <li>타인에게 불쾌감을 주는 언행, 비속어, 성적인 대화 금지</li>
        <li>허위 정보 입력 및 도배 행위 금지</li>
        <li>다른 사람의 사진 또는 정보를 도용하는 행위 금지</li>
      </ul>

      <h2 className="mt-6 font-semibold">3. 서비스 제한 및 제재</h2>
      <p>이용약관을 위반할 경우 경고 없이 서비스 이용이 제한되거나, 계정이 차단될 수 있습니다.</p>

      <h2 className="mt-6 font-semibold">4. 콘텐츠 소유 및 사용</h2>
      <p>
        사용자가 작성한 콘텐츠(포스트, 댓글 등)의 저작권은 사용자에게 있으나, 서비스 내에서의 비영리적 활용에 동의하는 것으로 간주됩니다.
      </p>

      <h2 className="mt-6 font-semibold">5. 운영자 권리</h2>
      <p>서비스 운영자는 사용자 보호와 건전한 커뮤니티 유지를 위해 콘텐츠 및 사용자 활동을 모니터링할 수 있습니다.</p>

      <h2 className="mt-6 font-semibold">6. 책임의 한계</h2>
      <p>본 서비스는 사용자 간의 매칭과 커뮤니케이션을 중개할 뿐, 직접적인 책임을 지지 않습니다.</p>

      <p className="mt-6 text-xs text-gray-500">시행일자: 2025년 6월 28일</p>
    </div>
  );
};
