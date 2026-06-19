import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Avatar from 'boring-avatars';
import EvaluationReport from './EvaluationReport';

// ─────────────────────────────────────────────
// API 호출 헬퍼 (메인 챗봇 전용, botType='main')
// ─────────────────────────────────────────────

/** 1단계: 상황 설정 + 첫 대사 */
async function apiSetup({ customerType, situation, episode }) {
  const res = await fetch('/api/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ botType: 'main', customerType, situation, episode })
  });
  if (!res.ok) throw new Error(`setup failed: ${res.status}`);
  // { reply, status, score, systemPrompt }
  return res.json();
}

/** 2단계: 매 턴 대화 */
async function apiTurn({ systemPrompt, messages, previousScore, forceEnd = false }) {
  const res = await fetch('/api/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages, previousScore, forceEnd })
  });
  if (!res.ok) throw new Error(`turn failed: ${res.status}`);
  // { reply, status, score, messages }
  return res.json();
}

/** 3단계: 최종 평가 리포트 */
async function apiDebrief({ systemPrompt, messages }) {
  const res = await fetch('/api/debrief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages })
  });
  if (!res.ok) throw new Error(`debrief failed: ${res.status}`);
  // { result, score, strengths, improvements, keyTakeaway, raw? }
  return res.json();
}

// ─────────────────────────────────────────────
// RoleplayPanel 컴포넌트
// ─────────────────────────────────────────────

const MAX_TURNS = 5;

function RoleplayPanel({ episodes, navigate }) {
  // 설정 단계
  const [step, setStep] = useState('setup'); // 'setup' | 'chat' | 'result'
  const [customerType, setCustomerType] = useState('');
  const [situation, setSituation] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  // 대화 상태
  const [messages, setMessages] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [score, setScore] = useState(50);           // 현재 호감도
  const [prevScore, setPrevScore] = useState(50);   // 직전 호감도 (하락 감지용)
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 결과
  const [reportData, setReportData] = useState(null);

  const getFavorabilityColors = (s) => {
    if (s >= 70) return ['#10B981', '#34D399', '#A7F3D0'];
    if (s >= 40) return ['#6366F1', '#818CF8', '#C7D2FE'];
    return ['#F43F5E', '#FB7185', '#FDA4AF'];
  };

  const isMistake = score < prevScore; // 이번 턴에 점수가 내려갔는지

  // ── 1단계: 설정 완료 → 세션 시작 ──
  const handleStart = async () => {
    if (!customerType || !situation) return alert('모두 선택해주세요!');

    const matches = episodes.filter(e =>
      (e.고객유형_01 === customerType || e.고객유형_02 === customerType) &&
      (e.문제상황_01 === situation   || e.문제상황_02 === situation)
    );
    if (matches.length === 0) return alert('조건에 맞는 상황이 없습니다.');

    const targetEpisode = matches[Math.floor(Math.random() * matches.length)];
    setSelectedEpisode(targetEpisode);
    setScore(50);
    setPrevScore(50);
    setIsLoading(true);

    try {
      const data = await apiSetup({ customerType, situation, episode: targetEpisode });
      setSystemPrompt(data.systemPrompt);
      setScore(data.score ?? 50);
      setPrevScore(data.score ?? 50);
      setMessages([{ role: 'assistant', content: data.reply }]);
      setStep('chat');

      if (data.status !== 'ongoing') {
        await runDebrief([{ role: 'assistant', content: data.reply }], data.systemPrompt);
      }
    } catch (err) {
      console.error('setup 오류:', err);
      alert('시작 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 2단계: 매 턴 전송 ──
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const data = await apiTurn({
        systemPrompt,
        messages: nextMessages,
        previousScore: score
      });

      // 점수 업데이트: 이전 값 보존 후 새 값 설정 (하락 감지용)
      setPrevScore(score);
      setScore(data.score ?? score);
      setMessages(data.messages);

      const newUserTurns = data.messages.filter(m => m.role === 'user').length;

      if (data.status !== 'ongoing') {
        setIsLoading(false);
        await runDebrief(data.messages, systemPrompt);
        return;
      }

      if (newUserTurns >= MAX_TURNS) {
        setIsLoading(false);
        await handleForceEnd(data.messages);
        return;
      }
    } catch (err) {
      console.error('turn 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── 종료 버튼 ──
  const handleForceEnd = async (history) => {
    try {
      const data = await apiTurn({
        systemPrompt,
        messages: history ?? messages,
        previousScore: score,
        forceEnd: true
      });
      setPrevScore(score);
      setScore(data.score ?? score);
      await runDebrief(data.messages, systemPrompt);
    } catch (err) {
      console.error('강제 종료 오류:', err);
    }
  };

  // ── 3단계: 디브리핑 ──
  const runDebrief = async (history, sp) => {
    try {
      const data = await apiDebrief({ systemPrompt: sp ?? systemPrompt, messages: history });
      setReportData(data);
    } catch (err) {
      console.error('디브리핑 오류:', err);
      setReportData({
        result: 'unknown',
        score: null,
        strengths: [],
        improvements: [],
        keyTakeaway: '',
        raw: '결과 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setStep('result');
    }
  };

  // ── 설정 화면 ──
  if (step === 'setup') {
    const customerTypes = [...new Set(
      episodes.flatMap(e => [e.고객유형_01, e.고객유형_02]).filter(Boolean)
    )];
    const situations = [...new Set(
      episodes
        .filter(e => e.고객유형_01 === customerType || e.고객유형_02 === customerType)
        .flatMap(e => [e.문제상황_01, e.문제상황_02])
        .filter(Boolean)
    )];

    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border-2 border-purple-200 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-purple-800">영업 롤플레잉 설정</h2>
        <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-700 leading-relaxed">
          <p className="font-bold mb-2">본 롤플레잉은 실제 내부 사례를 기반으로 제작되었습니다.</p>
          <p>당신은 영업사원이며 챗봇은 당신이 선택한 상황에 기반한 '고객'으로 활동합니다!</p>
          <p>고객의 마음을 사로잡아 호감도를 올리고 문제를 성공적으로 해결해보세요!</p>
        </div>
        <select
          className="w-full mb-3 p-3 border-2 border-purple-200 rounded-lg"
          onChange={e => setCustomerType(e.target.value)}
        >
          <option value="">고객 유형 선택</option>
          {customerTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="w-full mb-6 p-3 border-2 border-purple-200 rounded-lg"
          onChange={e => setSituation(e.target.value)}
        >
          <option value="">문제 상황 선택</option>
          {situations.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? '시작 중...' : '시작하기'}
        </button>
      </div>
    );
  }

  // ── 대화/결과 화면 ──
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 max-w-xl mx-auto flex flex-col h-[650px]">

      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-purple-100 bg-purple-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            size={60}
            name={customerType}
            variant="beam"
            colors={getFavorabilityColors(score)}
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-purple-600 uppercase">고객 유형</span>
            <span className="font-extrabold text-purple-950 text-base">{customerType}</span>
            {/* 호감도 수치 표시 */}
            <span className="text-xs text-purple-500 mt-0.5">호감도 {score}점</span>
          </div>
        </div>
        <button
          onClick={() => setStep('setup')}
          className="text-xs text-red-500 font-bold border border-red-200 px-3 py-1.5 rounded-lg bg-white"
        >
          종료
        </button>
      </div>

      {/* 결과 화면 */}
      {step === 'result' ? (
        <div className="flex-1 overflow-y-auto p-4 bg-purple-50/20">
          {reportData
            ? <EvaluationReport reportData={reportData} />
            : <div className="text-center p-10 text-purple-400">결과를 불러오는 중입니다...</div>
          }
        </div>

      ) : (
        // 대화 화면
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-900'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-purple-400 animate-pulse px-4">작성 중...</div>
            )}

            {/* 호감도 하락 알림 */}
            {isMistake && step === 'chat' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex justify-between items-center mx-4">
                <span className="text-xs text-red-600 font-bold">호감도가 하락했습니다.</span>
                <button
                  onClick={() => navigate(`/episode/${selectedEpisode?.episode_id}`)}
                  className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg"
                >
                  우수 사례 보기
                </button>
              </div>
            )}
          </div>

          {/* 입력 */}
          <div className="p-4 border-t border-purple-50">
            <button
              onClick={() => handleForceEnd()}
              disabled={isLoading || messages.filter(m => m.role === 'user').length === 0}
              className="w-full mb-4 py-2 text-xs font-bold text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 disabled:opacity-40"
            >
              대화 종료 및 평가받기
            </button>
            <div className="flex gap-2">
              <input
                value={input}
                disabled={isLoading}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1 border-2 border-purple-100 rounded-xl px-4 py-2"
                placeholder="메시지 입력..."
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-purple-600 text-white p-3 rounded-xl disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RoleplayPanel;