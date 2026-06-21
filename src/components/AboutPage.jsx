import React from 'react';
import soloCharacter from '../assets/solo.png'; // 1. 이미지 경로 확인 후 import!
import soloTable from '../assets/solo_table.png';

export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl">
      
      {/* 상단 캐릭터 배치 */}
      <div className="flex items-center gap-4 mb-8 bg-blue-50 p-6 rounded-2xl">
    
       {/* 2. 이미지 태그 사용 */}
        <img src={soloCharacter} alt="솔로 캐릭터" className="w-20 h-20" /> 
        <div>
          <h2 className="text-xl font-bold text-blue-900">🏠✨안녕하세요! 한솔 큐레이터 '솔로(SOLO)'입니다!</h2>
          <p className="text-gray-600 mt-1">신입 큐레이터 여러분이 최고의 전문가로 성장하도록 꼼꼼하게 도와드릴게요.</p>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Sales Library란?</h1>
      <p className="text-gray-700 leading-relaxed mb-6">
        본 Sales Library는 단순한 영업사원을 넘어, 현장의 여건과 트렌드에 맞는 
        <strong className="text-blue-600"> '최적의 통합 솔루션'을 제안하는 큐레이터</strong>로의 역량 강화를 위해 설계되었습니다.
      </p>


      {/* ... (표 내용) ... */}
      <div className="overflow-x-auto mb-10">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-4 border">구분</th>
              <th className="p-4 border">영업사원</th>
              <th className="p-4 border">큐레이터</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            <tr className="border-b"><td className="p-4 font-bold border">판매 방식</td><td className="p-4 border">단순 제품 스펙 전달</td><td className="p-4 border">맞춤형 통합 솔루션 제안</td></tr>
            <tr className="border-b"><td className="p-4 font-bold border">고객 관계</td><td className="p-4 border">일회성 거래 중심</td><td className="p-4 border">전략적 동반 파트너십</td></tr>
            <tr className="border-b"><td className="p-4 font-bold border">영업 태도</td><td className="p-4 border">수동적 요구 대응</td><td className="p-4 border">주도적 가치 창출(크로스셀링)</td></tr>
            <tr className="border-b"><td className="p-4 font-bold border">설명 관점</td><td className="p-4 border">단가 중심</td><td className="p-4 border">디자인, 질감, 시공성 중심</td></tr>
          </tbody>
        </table>
      </div>

      {/* 하단 캐릭터 배치 */}
      <div className="text-center p-8">
        <p className="text-lg font-bold text-gray-800">
          "현장에서 최고의 전문가로 성장할 여러분의 활약을 솔로(SOLO)가 응원합니다!💚💙"
        </p>
      </div>

      <div className="mt-10 flex justify-center">
      <img 
    src={soloTable} 
    alt="솔로의 핵심 역량 가이드 표" 
    className="w-full max-w-xl rounded-2xl shadow-md border border-gray-100" 
      />
      </div>
    </div>
  );
}