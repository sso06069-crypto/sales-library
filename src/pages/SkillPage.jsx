import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompetencies, getEpisodes, getMentors } from '../api';
import Header from '../components/Header';
import { ChevronLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';

function SkillPage() {
  const { competencyId } = useParams();
  const navigate = useNavigate();
  const [competency, setCompetency] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCompetencies().then(data => {
        setCompetencies(data);
    
        const found = data.find(
          c => String(c.competency_id) === String(competencyId)
        );
    
        setCompetency(found);
      }),
      getMentors().then(data => setMentors(data)),
      getEpisodes().then(data => {
        const filtered = data.filter(e => {
          const ids = [
            e.competency_id_1,
            e.competency_id_2,
            e.competency_id_3,
            e.competency_id_4
          ];
    
          return ids.some(
            id => String(id) === String(competencyId)
          ) && e.공개여부 === 'TRUE';
        });
    
        setEpisodes(filtered);
      })
    ]).then(() => setLoading(false));
  }, [competencyId]);

  const getMentor = (mentorId) => mentors.find(m => m.mentor_id === mentorId);

  const filteredEpisodes = episodes.filter(e =>
    e.제목.includes(search) ||
    e['상황(SITUATION)'].includes(search) ||
    e['세일즈팁(SALES TIP)'].includes(search)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <Header />
        </div>

        {/* 역량 헤더 */}
        {competency && (
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{competency.아이콘}</span>
              <h1 className="text-3xl font-bold text-gray-800">{competency.역량명}</h1>
            </div>
            <p className="text-gray-500 mt-2">{competency.설명}</p>
          </div>
        )}

        {/* 검색 */}
        <input
          type="text"
          placeholder="에피소드 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-indigo-400"
        />

        {/* 에피소드 목록 */}
        <div className="flex flex-col gap-4">
          {filteredEpisodes.map(episode => {
            const mentor = getMentor(episode.mentor_id);
            return (
              <div
                key={episode.episode_id}
                onClick={() => navigate(`/episode/${episode.episode_id}`)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-100 hover:border-indigo-300"
              >
                <h3 className="font-bold text-gray-800 text-lg mb-2">{episode.제목}</h3>

                {/* 스킬 태그 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    episode.competency_id_1,
                    episode.competency_id_2,
                    episode.competency_id_3,
                    episode.competency_id_4
                  ]
                  .filter(Boolean)
                  .map(id => {
                    const skill = competencies.find(
                      c => String(c.competency_id) === String(id)
                    );

                    return skill ? (
                      <span
                        key={id}
                        className="
                          bg-indigo-50
                          text-indigo-500
                          text-xs
                          font-medium
                          px-3
                          py-1
                          rounded-md
                        "
                      >
                        #{skill.역량명}
                      </span>
                    ) : null;
                  })}
                </div>  

                {mentor && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">{mentor.이름}</span>
                      <span className="text-xs text-gray-400 ml-2">{mentor.직책} | {mentor.팀} | 경력 {mentor.경력}년</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredEpisodes.length === 0 && (
            <div className="text-center text-gray-400 py-12">에피소드가 없습니다.</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SkillPage;