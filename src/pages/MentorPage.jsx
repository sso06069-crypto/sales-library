import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMentors, getEpisodes, getCompetencies } from '../api';
import Header from '../components/Header';
import { ChevronLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';

function MentorPage() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [competencies, setCompetencies] = useState([]);

  useEffect(() => {
    Promise.all([
      getMentors().then(data => {
        const found = data.find(m => m.mentor_id === mentorId);
        setMentor(found);
      }),
      getEpisodes().then(data => {
        const filtered = data.filter(e => e.mentor_id === mentorId && e.공개여부 === 'TRUE');
        setEpisodes(filtered);
      }),
      getCompetencies().then(data => setCompetencies(data))
    ]).then(() => setLoading(false));
  }, [mentorId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* 뒤로가기 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/?view=mentor')}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <Header />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          {/* 프로필 */}
          <div className="flex items-center gap-6 mb-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{mentor.이름}</h1>
              <div className="text-gray-500">{mentor.직책} | {mentor['담당 상품']} | {mentor.팀}</div>
              <div className="text-sm text-gray-400 mt-1">경력 {mentor.경력}년 · {mentor.주고객유형}</div>
            </div>
          </div>

          {/* 업무 철학 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-bold text-indigo-400 mb-1">업무 철학</div>
            <div className="text-gray-700">{mentor.업무철학}</div>
          </div>
        </div>

        {/* 관련 에피소드 */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">관련 에피소드</h2>
        <div className="flex flex-col gap-4">
          {episodes.map(episode => (
            <div
            key={episode.episode_id}
            onClick={() => navigate(`/episode/${episode.episode_id}`)}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-100 hover:border-indigo-300"
          >
            <h3 className="font-bold text-gray-800 mb-2">{episode.제목}</h3>
            <div className="flex flex-wrap gap-2">
              {[episode.competency_id_1, episode.competency_id_2, episode.competency_id_3, episode.competency_id_4]
                .filter(id => id)
                .map(id => {
                  const competency = competencies.find(c => c.competency_id === id);
                  return competency ? (
                    <span
                      key={id}
                      className="inline-block bg-indigo-50 text-indigo-500 text-xs font-medium px-3 py-1 rounded-md"
                    >
                      #{competency.역량명}
                    </span>
                  ) : null;
                })}
            </div>
          </div>
          ))}
          {episodes.length === 0 && (
            <div className="text-center text-gray-400 py-8">등록된 에피소드가 없습니다.</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MentorPage;