import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompetencies, getEpisodes } from '../api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import RoleplayPanel from '../components/RoleplayPanel';
import {AboutPage} from '../components/AboutPage';
import { CompetencyInfo } from '../components/CompetencyInfo';


function MainPage() {
  const [competencies, setCompetencies] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [view, setView] = useState('competency');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState('All');
  const [selectedSituation, setSelectedSituation] = useState('All');

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getCompetencies().then(setCompetencies),
      getEpisodes().then(setEpisodes)
    ]).then(() => setLoading(false));
  }, []);

  const areas = [
    { name: 'Common', subtitle: '영업을 위한 기본적인 스킬', color: 'border-gray-500', light: 'bg-white' },
    { name: 'Basic', subtitle: '단계별 영업 핵심 스킬', color: 'border-blue-500', light: 'bg-blue-50' },
    { name: 'Curator', subtitle: '고객 맞춤형 큐레이션 스킬', color: 'border-green-500', light: 'bg-green-50' },
  ];

  const customerTypes = [
    ...new Set(
      episodes
        .flatMap(e => [e.고객유형_01, e.고객유형_02])
        .filter(Boolean)
    )
  ];
  
  const situations = [
    ...new Set(
      episodes
        .flatMap(e => [e.문제상황_01, e.문제상황_02])
        .filter(Boolean)
    )
  ];
  
  const filteredEpisodes = episodes.filter(e =>
    (selectedCustomer === 'All' ||
      e.고객유형_01 === selectedCustomer ||
      e.고객유형_02 === selectedCustomer)
    &&
    (selectedSituation === 'All' ||
      e.문제상황_01 === selectedSituation ||
      e.문제상황_02 === selectedSituation)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* PAGE CONTAINER */}
      <div className="max-w-4xl w-full mx-auto flex-1 px-4 py-4 md:p-8">
        <Header />

        <div className="mt-6 mb-8 flex items-center justify-between">

  {/* MAIN SWITCH */}
    <div className="relative inline-flex w-[360px] bg-gray-200 rounded-full p-1">
      <div
        className={`absolute top-1 bottom-1 left-1 
        w-[calc(33.33%-4px)] bg-white rounded-full shadow-sm 
        transition-transform duration-300 ease-in-out ${
          view === 'roleplay'
            ? 'translate-x-full'
            : view === 'allEpisodes'
            ? 'translate-x-[200%]'
            : 'translate-x-0'
        }`}
      />

      <button
        onClick={() => setView('competency')}
        className={`relative z-10 flex-1 py-2 text-sm ${
          view === 'competency'
            ? 'text-gray-800'
            : 'text-gray-500'
        }`}
      >
        역량
      </button>

      <button
        onClick={() => setView('roleplay')}
        className={`relative z-10 flex-1 py-2 text-sm ${
          view === 'roleplay'
            ? 'text-gray-800'
            : 'text-gray-500'
        }`}
      >
        롤플레잉
      </button>

      <button
        onClick={() => setView('allEpisodes')}
        className={`relative z-10 flex-1 py-2 text-sm ${
          view === 'allEpisodes'
            ? 'text-gray-800'
            : 'text-gray-500'
        }`}
      >
        전체 에피소드
      </button>

    </div>


    {/* GUIDE BUTTON */}
    <div
      className="relative"
      onMouseEnter={() => setIsGuideOpen(true)}
      onMouseLeave={() => setIsGuideOpen(false)}
    >

      <button
        className="
          px-4 py-2 rounded-full text-sm
          border bg-white text-gray-600
          hover:bg-gray-100
        "
      >
        사용 가이드
      </button>


      {/* DROPDOWN */}
      {isGuideOpen && (
        <div
          className="
            absolute right-0 top-full
            pt-2
            z-50
          "
        >
          <div
            className="
              w-56 bg-white
              rounded-xl shadow-lg
              border border-gray-200
              overflow-hidden
            "
          >

            <button
              onClick={() => {
                setView('about');
                setIsGuideOpen(false);
              }}
              className="
                w-full text-left
                px-4 py-3
                hover:bg-gray-50
              "
            >
              <div className="font-semibold text-sm">
                Sales Library란 무엇인가요?
              </div>

              <div className="text-xs text-gray-400 mt-1">
                
              </div>
            </button>


            <button
              onClick={() => {
                setView('competencyInfo');
                setIsGuideOpen(false);
              }}
              className="
                w-full text-left
                px-4 py-3
                hover:bg-gray-50
              "
            >
              <div className="font-semibold text-sm">
                어떤 역량인가요?
              </div>

              <div className="text-xs text-gray-400 mt-1">
                
              </div>
            </button>
          </div>
        </div>
      )}

    </div>

  </div>

        {/* VIEW AREA */}
        <div className="relative overflow-hidden">
          {/* COMPETENCY VIEW */}
          <div className={`transition-all duration-300 ${view === 'competency' ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-4 absolute'}`}>
            {areas.map(area => (
              <div key={area.name} className="mb-10">
                <div className={`mb-4 border-l-4 ${area.color} pl-3`}>
                  <h2 className="text-xl font-bold leading-tight">{area.name}</h2>
                  {area.subtitle && <p className="text-xs text-gray-400 mt-0.5">{area.subtitle}</p>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {competencies
                    .filter(c => c.영역 === area.name)
                    .map(competency => (
                      <div
                        key={competency.competency_id}
                        onClick={() => navigate(`/skill/${competency.competency_id}`)}
                        className={`${area.light} rounded-xl p-5 shadow-sm hover:shadow-lg cursor-pointer transition`}
                      >
                        <div className="text-3xl mb-3">{competency.아이콘}</div>
                        <div className="font-semibold text-sm">{competency.역량명}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* ALL EPISODES VIEW */}
          <div
            className={`transition-all duration-300 ${
              view === 'allEpisodes'
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 pointer-events-none -translate-x-4 absolute'
            }`}
          >
            <h3 className="font-bold text-lg mb-4 text-blue-800">
              모든 에피소드 ({episodes.length}건)
            </h3>

            <div className="flex gap-3 mb-5">

              <select
                className="flex-1 p-2 rounded-lg border border-gray-200 text-sm"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="All">
                  고객 유형
                </option>

                {customerTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>


              <select
                className="flex-1 p-2 rounded-lg border border-gray-200 text-sm"
                value={selectedSituation}
                onChange={(e) => setSelectedSituation(e.target.value)}
              >
                <option value="All">
                  문제 상황
                </option>

                {situations.map(situation => (
                  <option key={situation} value={situation}>
                    {situation}
                  </option>
                ))}
              </select>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredEpisodes.map((episode) => (
                <div
                  key={episode.episode_id}
                  onClick={() =>
                    navigate(`/episode/${episode.episode_id}`)
                  }
                  className="
                    bg-gray-50 rounded-lg p-3
                    border border-gray-300
                    hover:shadow-md cursor-pointer
                  "
                >
                  <h1 className="text-sm font-bold text-gray-800 mb-2">
                    {episode.제목}
                  </h1>

                  <div className="text-xs text-gray-400">
                    {episode.문제상황_01}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ABOUT VIEW */}
          <div
            className={`transition-all duration-300 ${
              view === 'about'
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 pointer-events-none -translate-x-4 absolute'
            }`}
          >
            <AboutPage />
          </div>

          {/* COMPETENCY INFO VIEW */}
          <div
            className={`transition-all duration-300 ${
              view === 'competencyInfo'
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 pointer-events-none -translate-x-4 absolute'
            }`}
          >
            <CompetencyInfo />
          </div>

          {/* ROLEPLAY VIEW */}
          {view === 'roleplay' && (
            <div className="transition-all duration-300 opacity-100">
              <RoleplayPanel episodes={episodes} competencies={competencies} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MainPage;