import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ChevronLeft } from 'lucide-react';
import { getEpisodes, getMentors, getCompetencies } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ChatBot from '../components/ChatBot';
import Footer from '../components/Footer';

function EpisodePage() {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEpisodes().then(data => {
        const found = data.find(e => e.episode_id === episodeId);
        setEpisode(found);
        if (found) {
          return getMentors().then(mentors => {
            const foundMentor = mentors.find(m => m.mentor_id === found.mentor_id);
            setMentor(foundMentor);
          });
        }
      }),
      getCompetencies().then(data => setCompetencies(data))
    ]).then(() => setLoading(false));
  }, [episodeId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* 뒤로가기 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(`/skill/${episode.competency_id_1}`)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <Header />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {/* 제목 */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{episode.제목}</h1>

          {/* 역량 해시태그 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[episode.competency_id_1, episode.competency_id_2, episode.competency_id_3, episode.competency_id_4]
              .filter(id => id)
              .map(id => {
                const competency = competencies.find(c => c.competency_id === id);
                return competency ? (
                  <span
                    key={id}
                    onClick={() => navigate(`/skill/${competency.competency_id}`)}
                    className="inline-block bg-indigo-50 text-indigo-500 text-xs font-medium px-3 py-1 rounded-md cursor-pointer hover:bg-indigo-100 transition-all"
                  >
                    #{competency.역량명}
                  </span>
                ) : null;
              })}
          </div>

          {/* 멘토 정보 */}
          {mentor && (
            <div
              onClick={() => navigate(`/mentor/${mentor.mentor_id}`)}
              className="flex items-center gap-3 mt-4 mb-8 cursor-pointer hover:opacity-80"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span>👤</span>
              </div>
              <div>
                <div className="font-medium text-gray-800">{mentor.이름}</div>
                <div className="text-sm text-gray-400">{mentor.직책} | {mentor.팀} | 경력 {mentor.경력}년</div>
              </div>
            </div>
          )}

          {/* SITUATION */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-indigo-600 mb-3">SITUATION</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {episode['상황(SITUATION)']}
            </p>
          </div>

          {/* SALES TIP */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-indigo-600 mb-3">SALES TIP</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {episode['세일즈팁(SALES TIP)']}
            </p>
          </div>

          {/* STAR 구조 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-indigo-600 mb-3">STAR 구조</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: '상황', value: episode['STAR-상황'] },
                { label: '과제', value: episode['STAR-과제'] },
                { label: '행동', value: episode['STAR-행동'] },
                { label: '결과', value: episode['STAR-결과'] },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <span className="inline-block bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded-md mb-2">{label}</span>
                  <div className="text-gray-700 text-sm whitespace-pre-line">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Tip 요약 */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-indigo-600 mb-3">Sales Tip 요약</h2>
            <div className="bg-indigo-50 rounded-xl p-4">
              {episode.세일즈팁요약.split('\n').map((tip, index) => (
                <div key={index} className="flex items-start gap-2 mb-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span className="text-gray-700 text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ChatBot episode={episode} />
      <Footer />
    </div>
  );
}

export default EpisodePage;