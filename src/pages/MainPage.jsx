import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMentors, getCompetencies } from '../api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';

function MainPage() {
  const [competencies, setCompetencies] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [view, setView] = useState('competency');
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCompetencies().then(data => setCompetencies(data)),
      getMentors().then(data => setMentors(data))
    ]).then(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') === 'mentor') {
      setView('mentor');
    }
  }, [location]);

  const areas = [
    { name: 'Common', color: 'border-gray-500', bg: 'bg-gray-500', light: 'bg-white' },
    { name: 'Basic', color: 'border-blue-500', bg: 'bg-blue-500', light: 'bg-blue-50' },
    { name: 'Curator', color: 'border-green-500', bg: 'bg-green-500', light: 'bg-green-50' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Header />

        {/* 스위치 */}
        <div className="relative inline-flex bg-gray-200 rounded-full p-1 mb-8">
        <div
          className={`absolute top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-300 ease-in-out ${
            view === 'competency' ? 'left-1 right-[calc(50%+2px)]' : 'left-[calc(50%+2px)] right-1'
          }`}
        />
        <button
          onClick={() => setView('competency')}
          className={`relative z-10 px-6 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
            view === 'competency' ? 'text-gray-800' : 'text-gray-500'
          }`}
        >
          역량
        </button>
        <button
          onClick={() => setView('mentor')}
          className={`relative z-10 px-6 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
            view === 'mentor' ? 'text-gray-800' : 'text-gray-500'
          }`}
        >
          멘토
        </button>
      </div>

        {/* 뷰 컨테이너 */}
        <div className="relative min-h-screen">
          {/* 역량 뷰 */}
          <div className={`transition-all duration-300 ease-in-out ${
            view === 'competency'
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 absolute pointer-events-none -translate-x-5'
          }`}>
            {areas.map(area => (
              <div key={area.name} className="mb-10">
                <h2 className={`text-xl font-bold text-gray-700 mb-4 border-l-4 ${area.color} pl-3`}>
                  {area.name}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {competencies
                    .filter(c => c.영역 === area.name)
                    .map(competency => (
                      <div
                        key={competency.competency_id}
                        onClick={() => navigate(`/skill/${competency.competency_id}`)}
                        className={`${area.light} rounded-xl p-5 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 border border-gray-100 hover:${area.color} hover:-translate-y-1 hover:bg-opacity-80`}                      >
                        <div className="text-3xl mb-3">{competency.아이콘}</div>
                        <div className="font-semibold text-gray-800 text-sm">{competency.역량명}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* 멘토 뷰 */}
          <div className={`transition-all duration-300 ease-in-out ${
            view === 'mentor'
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 absolute pointer-events-none translate-x-5'
          }`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mentors.map(mentor => (
                <div
                  key={mentor.mentor_id}
                  onClick={() => navigate(`/mentor/${mentor.mentor_id}`)}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 border border-gray-100 hover:border-indigo-300 hover:-translate-y-1 hover:bg-indigo-50"
                >
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">{mentor.이름} {mentor.직책}</div>
                    <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <span>{mentor.팀}</span>
                      <span className="text-gray-300">|</span>
                      <span>{mentor['담당 상품']}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MainPage;