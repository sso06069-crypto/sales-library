import React from 'react';

function EvaluationReport({ reportData }) {
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-purple-100">
      <h2 className="text-xl font-bold text-purple-900 mb-6 text-center">훈련 결과 리포트</h2>
      <div className="flex justify-center mb-8">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-purple-600">
            {reportData.score ?? '-'}점
          </div>
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" className="stroke-purple-100" strokeWidth="8" fill="none" />
            <circle cx="64" cy="64" r="56" className="stroke-purple-600" strokeWidth="8" fill="none" 
                    strokeDasharray={`${reportData.score * 3.5} 352`} strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-xl">
          <p className="text-[10px] text-green-600 font-bold uppercase">잘한 점</p>
          <ul className="text-xs text-green-900 mt-2 list-disc pl-4">{(reportData.strengths ?? []).map(s => <li key={s.title}>{s.title}: {s.description}</li>)}</ul>
        </div>
        <div className="p-4 bg-red-50 rounded-xl">
          <p className="text-[10px] text-red-600 font-bold uppercase">부족한 점</p>
          <ul className="text-xs text-red-900 mt-2 list-disc pl-4">{(reportData.improvements ?? []).map(s => <li key={s.title}>{s.title}: {s.description}</li>)}</ul>
        </div>
      </div>
      <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
        <p className="text-[10px] text-purple-600 font-bold uppercase text-center">핵심 노하우</p>
        <p className="text-sm text-purple-900 font-medium text-center mt-2">{reportData.keyTakeaway}</p>
      </div>
    </div>
  );
}

export default EvaluationReport; // 딱 한 번만 마지막에 써주세요!