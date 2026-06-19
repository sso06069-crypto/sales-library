import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, X, Send, CheckCircle2, XCircle, Loader2,
  ThumbsUp, AlertTriangle, ArrowLeft, Quote
} from 'lucide-react';

const ANALYZING_MESSAGES = [
  'AI가 소통 과정을 분석중입니다...',
  '강점과 약점을 정리하고 있어요...',
  '핵심 한 줄을 뽑아내고 있어요...'
];

const CONFETTI_PIECES = [
  { left: '8%',  color: '#6366F1', delay: '0s',    duration: '2.4s' },
  { left: '18%', color: '#22C55E', delay: '0.15s', duration: '2.1s' },
  { left: '28%', color: '#F59E0B', delay: '0.3s',  duration: '2.6s' },
  { left: '38%', color: '#EC4899', delay: '0.05s', duration: '2.3s' },
  { left: '50%', color: '#6366F1', delay: '0.25s', duration: '2.5s' },
  { left: '62%', color: '#22C55E', delay: '0.1s',  duration: '2.2s' },
  { left: '72%', color: '#F59E0B', delay: '0.35s', duration: '2.4s' },
  { left: '82%', color: '#EC4899', delay: '0.2s',  duration: '2.1s' },
  { left: '92%', color: '#6366F1', delay: '0.4s',  duration: '2.6s' },
  { left: '46%', color: '#22C55E', delay: '0.5s',  duration: '2.3s' }
];

// ─── API 헬퍼 ────────────────────────────────

async function apiSetup(episode) {
  const res = await fetch('/api/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ botType: 'episode', episode })
  });
  if (!res.ok) throw new Error(`setup failed: ${res.status}`);
  return res.json();
}

async function apiTurn({ systemPrompt, messages, previousScore, forceEnd = false }) {
  const res = await fetch('/api/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages, previousScore, forceEnd })
  });
  if (!res.ok) throw new Error(`turn failed: ${res.status}`);
  return res.json();
}

async function apiDebrief({ systemPrompt, messages }) {
  const res = await fetch('/api/debrief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages })
  });
  if (!res.ok) throw new Error(`debrief failed: ${res.status}`);
  return res.json();
}

// ─── ChatBot ────────────────────────────────

function ChatBot({ episode }) {
  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState([]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [score, setScore]             = useState(50);
  const [input, setInput]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  // 'idle' | 'chat' | 'analyzing' | 'result' | 'report'
  const [phase, setPhase]             = useState('idle');
  const [debrief, setDebrief]         = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [analyzingIdx, setAnalyzingIdx]     = useState(0);

  const debriefHistoryRef = useRef(null);
  // ref로 phase 값을 보관 — useEffect 의존성 없이 현재값을 읽기 위해
  const phaseRef = useRef('idle');
  phaseRef.current = phase;

  const MAX_TURNS = 10;
  const userTurnCount = messages.filter(m => m.role === 'user').length;

  // 분석중 문구 로테이션
  useEffect(() => {
    if (phase !== 'analyzing') return;
    setAnalyzingIdx(0);
    const timer = setInterval(() => {
      setAnalyzingIdx(prev => (prev + 1) % ANALYZING_MESSAGES.length);
    }, 1600);
    return () => clearInterval(timer);
  }, [phase]);

  // 채팅창이 열릴 때 세션 시작 (idle 상태일 때만)
  useEffect(() => {
    if (!isOpen) return;
    if (phaseRef.current !== 'idle') return;

    let cancelled = false;

    const startSession = async () => {
      setPhase('chat');
      setIsLoading(true);
      try {
        const data = await apiSetup(episode);
        if (cancelled) return;
        setSystemPrompt(data.systemPrompt);
        setScore(data.score ?? 50);
        setMessages([{ role: 'assistant', content: data.reply }]);
        if (data.status !== 'ongoing') {
          await runDebrief([{ role: 'assistant', content: data.reply }], data.systemPrompt);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('setup 오류:', err);
        setMessages([{ role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.' }]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    startSession();
    return () => { cancelled = true; };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 디브리핑 ──
  const runDebrief = async (history, sp) => {
    debriefHistoryRef.current = history;
    setPhase('analyzing');
    try {
      const data = await apiDebrief({ systemPrompt: sp ?? systemPrompt, messages: history });
      setDebrief(data);
    } catch (err) {
      console.error('디브리핑 오류:', err);
      setDebrief({
        result: 'unknown', score: null,
        strengths: [], improvements: [], keyTakeaway: '',
        raw: '디브리핑 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    } finally {
      setPhase('result');
    }
  };

  // ── 매 턴 전송 ──
  const handleSend = async () => {
    if (!input.trim() || isLoading || phase !== 'chat') return;

    const userMsg = { role: 'user', content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const data = await apiTurn({ systemPrompt, messages: nextMessages, previousScore: score });
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
      setMessages(prev => [...prev, { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── 종료 버튼 ──
  const handleManualEnd = async () => {
    if (isLoading || phase !== 'chat' || userTurnCount === 0) return;
    await handleForceEnd(messages);
  };

  const handleForceEnd = async (history) => {
    setPhase('analyzing');
    try {
      const data = await apiTurn({ systemPrompt, messages: history, previousScore: score, forceEnd: true });
      setScore(data.score ?? score);
      await runDebrief(data.messages, systemPrompt);
    } catch (err) {
      console.error('강제 종료 오류:', err);
      setPhase('chat');
    }
  };

  const handleRetryDebrief = () => {
    if (debriefHistoryRef.current) runDebrief(debriefHistoryRef.current, systemPrompt);
  };

  return (
    <>
      <style>{`
        .rp-confetti-piece {
          position: absolute; top: -10px; width: 6px; height: 10px;
          border-radius: 1px; opacity: 0.9;
          animation-name: rp-confetti-fall;
          animation-timing-function: ease-in;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
        }
        @keyframes rp-confetti-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(220px) rotate(540deg); opacity: 0; }
        }
        .rp-shake { animation: rp-shake-kf 0.5s ease-in-out; }
        @keyframes rp-shake-kf {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(5px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(3px); }
        }
      `}</style>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:-translate-y-1 flex items-center justify-center z-50"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* 채팅 창 */}
      <div className={`fixed bottom-28 right-8 w-80 h-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 transition-all duration-300 ease-out ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-indigo-600 rounded-t-2xl shrink-0">
          <div>
            <div className="text-white font-semibold text-sm">롤플레잉 챗봇</div>
            <div className="text-indigo-200 text-xs">
              {phase === 'chat' ? `${userTurnCount}/${MAX_TURNS}턴` : '시뮬레이션 종료'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {phase === 'chat' && userTurnCount > 0 && (
              <button onClick={handleManualEnd}
                className="text-xs text-indigo-100 hover:text-white border border-indigo-300 rounded-full px-2 py-1 transition-all">
                종료
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-indigo-200 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          {phase === 'report' ? (
            showTranscript
              ? <TranscriptView messages={messages} onBack={() => setShowTranscript(false)} />
              : <ReportView debrief={debrief} onShowTranscript={() => setShowTranscript(true)} onRetry={handleRetryDebrief} />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-700 rounded-bl-none'
                    }`}>{msg.content}</div>
                  </div>
                ))}
                {isLoading && phase === 'chat' && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-400 px-3 py-2 rounded-xl rounded-bl-none text-sm">입력 중...</div>
                  </div>
                )}
              </div>
              {phase === 'analyzing' && <AnalyzingOverlay text={ANALYZING_MESSAGES[analyzingIdx]} />}
              {phase === 'result'    && <ResultOverlay debrief={debrief} onShowReport={() => setPhase('report')} />}
            </>
          )}
        </div>

        {/* 입력 */}
        {phase === 'chat' && (
          <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 shrink-0">
            <input type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="메시지를 입력하세요..."
              disabled={isLoading}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 disabled:bg-gray-50"
            />
            <button onClick={handleSend} disabled={isLoading}
              className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50">
              <Send size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── 서브 컴포넌트 ────────────────────────────

function AnalyzingOverlay({ text }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-sm">
      <Loader2 size={28} className="text-indigo-500 animate-spin" />
      <div className="text-sm font-medium text-gray-700 text-center px-6">{text}</div>
      <div className="text-xs text-gray-400">잠시만 기다려주세요</div>
    </div>
  );
}

function ResultOverlay({ debrief, onShowReport }) {
  const isSuccess = debrief?.result === 'success';
  const isFail    = debrief?.result === 'fail';
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm overflow-hidden">
      {isSuccess && (
        <div className="absolute inset-0 pointer-events-none">
          {CONFETTI_PIECES.map((p, i) => (
            <span key={i} className="rp-confetti-piece"
              style={{ left: p.left, backgroundColor: p.color, animationDelay: p.delay, animationDuration: p.duration }} />
          ))}
        </div>
      )}
      <div className={`relative w-64 rounded-2xl bg-white shadow-xl px-5 py-6 flex flex-col items-center gap-3 ${isFail ? 'rp-shake' : ''}`}>
        {isSuccess && <CheckCircle2 size={40} className="text-emerald-500" />}
        {isFail    && <XCircle size={40} className="text-rose-500" />}
        {!isSuccess && !isFail && <AlertTriangle size={40} className="text-amber-500" />}
        <div className="text-center">
          <div className={`text-base font-bold ${isSuccess ? 'text-emerald-600' : isFail ? 'text-rose-600' : 'text-amber-600'}`}>
            {isSuccess ? '미션 성공' : isFail ? '미션 실패' : '시뮬레이션 종료'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {isSuccess ? '고객의 마음을 여는 데 성공했어요' : isFail ? '이번엔 접근이 닿지 않았어요' : '결과를 확인해보세요'}
          </div>
        </div>
        <button onClick={onShowReport}
          className="mt-1 w-full text-sm font-medium bg-indigo-600 text-white rounded-xl py-2 hover:bg-indigo-700 transition-all">
          분석 결과 보기
        </button>
      </div>
    </div>
  );
}

function ReportView({ debrief, onShowTranscript, onRetry }) {
  if (!debrief) return null;
  const isSuccess = debrief.result === 'success';
  const isFail    = debrief.result === 'fail';
  const isUnknown = debrief.result === 'unknown';
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
          isSuccess ? 'bg-emerald-50 text-emerald-600' : isFail ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {isSuccess && <CheckCircle2 size={13} />}
          {isFail    && <XCircle size={13} />}
          {isUnknown && <AlertTriangle size={13} />}
          {isSuccess ? '종합 평가: 성공' : isFail ? '종합 평가: 실패' : '평가 결과 확인 필요'}
        </span>
        <button onClick={onShowTranscript} className="text-xs text-gray-400 hover:text-indigo-500 transition-all">
          대화 다시 보기
        </button>
      </div>
      {isUnknown ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-xs text-gray-600 leading-relaxed">
          <p className="mb-2">분석 결과를 정돈된 형식으로 불러오지 못했습니다.</p>
          {debrief.raw && <p className="text-gray-500 mb-3">{debrief.raw}</p>}
          <button onClick={onRetry} className="text-indigo-600 font-medium hover:underline">다시 분석하기</button>
        </div>
      ) : (
        <>
          <section>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
              <ThumbsUp size={13} className="text-emerald-500" /> 잘한 점
            </div>
            <div className="flex flex-col gap-2">
              {debrief.strengths.length === 0 && <div className="text-xs text-gray-400">기록된 강점이 없습니다.</div>}
              {debrief.strengths.map((s, i) => (
                <div key={i} className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-3 py-2.5">
                  <div className="text-xs font-semibold text-emerald-700">{s.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">{s.description}</div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
              <AlertTriangle size={13} className="text-amber-500" /> 아쉬운 점
            </div>
            {debrief.improvements.length === 0 ? (
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5 text-xs text-gray-500">특별히 아쉬운 점은 없습니다.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {debrief.improvements.map((s, i) => (
                  <div key={i} className="rounded-xl bg-amber-50/60 border border-amber-100 px-3 py-2.5">
                    <div className="text-xs font-semibold text-amber-700">{s.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">{s.description}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
          {debrief.keyTakeaway && (
            <section className="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-3 flex gap-2">
              <Quote size={14} className="text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-700 leading-relaxed font-medium">{debrief.keyTakeaway}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function TranscriptView({ messages, onBack }) {
  return (
    <div className="flex flex-col gap-3">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 transition-all mb-1">
        <ArrowLeft size={13} /> 리포트로 돌아가기
      </button>
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
            msg.role === 'user'
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-700 rounded-bl-none'
          }`}>{msg.content}</div>
        </div>
      ))}
    </div>
  );
}

export default ChatBot;