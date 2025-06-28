// src/components/legal/PrivacyPolicy.tsx

import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-sm leading-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">개인정보처리방침</h1>

      <p>
        네버엔딩 홍개팅(이하 "서비스")은 사용자님의 개인정보를 매우 중요하게 생각하며, 『개인정보 보호법』 등 관련 법령을 준수합니다.
        본 방침은 사용자가 서비스 이용 시 제공하는 개인정보가 어떤 방식으로 수집, 이용, 보관되는지를 설명합니다.
      </p>

      <h2 className="mt-6 font-semibold">1. 수집하는 개인정보 항목</h2>
      <ul className="list-disc pl-6">
        <li>식별정보: Firebase UID, 닉네임</li>
        <li>프로필 정보: 한줄소개, 성별, (추후) 프로필 사진</li>
        <li>서비스 이용기록: 메시지 내용, 포스트 작성 기록, 리액션</li>
      </ul>

      <h2 className="mt-6 font-semibold">2. 수집 목적</h2>
      <p>서비스 제공, 사용자 간 매칭 및 커뮤니케이션 기능 구현, 사용자 맞춤 경험 제공, 부정행위 방지 및 문의 대응 등을 위해 사용됩니다.</p>

      <h2 className="mt-6 font-semibold">3. 보관 및 파기</h2>
      <p>
        수집된 개인정보는 서비스 이용 기간 동안 보관되며, 계정 삭제 시 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보관해야 할 경우에는 해당 기간 동안만 보관합니다.
      </p>

      <h2 className="mt-6 font-semibold">4. 제3자 제공</h2>
      <p>서비스는 사용자의 개인정보를 외부에 제공하지 않으며, 광고 플랫폼(Google 등)과도 직접 연결되어 있지 않습니다.</p>

      <h2 className="mt-6 font-semibold">5. 이용자의 권리</h2>
      <p>
        사용자는 언제든지 본인의 개인정보를 조회하거나 수정, 삭제할 수 있습니다.
      </p>


      <p className="mt-6 text-xs text-gray-500">시행일자: 2025년 6월 28일</p>
    </div>
  );
};
