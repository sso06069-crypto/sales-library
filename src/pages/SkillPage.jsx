import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompetencies, getEpisodes, getMentors } from '../api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import Avatar from 'boring-avatars';

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
          c =>
            String(c.competency_id) === String(competencyId)
        );

        setCompetency(found);
      }),

      getMentors().then(setMentors),

      getEpisodes().then(data => {
        const filtered = data.filter(e => {

          const ids = [
            e.competency_id_1,
            e.competency_id_2,
            e.competency_id_3,
            e.competency_id_4
          ];

          return (
            ids.some(
              id =>
                String(id) === String(competencyId)
            ) &&
            e.공개여부 === 'TRUE'
          );
        });

        setEpisodes(filtered);
      })

    ]).then(() => {
      setLoading(false);
    });

  }, [competencyId]);


  const getMentor = (mentorId) => {
    return mentors.find(
      mentor => mentor.mentor_id === mentorId
    );
  };


  const filteredEpisodes = episodes.filter(e =>
    e.제목.includes(search) ||
    e['상황(SITUATION)'].includes(search) ||
    e['세일즈팁(SALES TIP)'].includes(search)
  );


  if (loading) {
    return <LoadingSpinner />;
  }


  return (
    <div
      className="
        min-h-screen
        bg-gray-50
        flex
        flex-col
      "
    >

      <div
        className="
          px-3
          py-3
          md:p-8
          flex-1
        "
      >

        <div
          className="
            max-w-3xl
            mx-auto
            space-y-6 md:space-y-10
          "
        >

          <Header />


          {/* COMPETENCY */}
          {competency && (

            <div
              className="
                mb-4
                md:mb-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <span
                  className="
                    text-xl
                    md:text-4xl
                  "
                >
                  {competency.아이콘}
                </span>


                <h1
                  className="
                    text-lg
                    md:text-3xl
                    font-bold
                    text-gray-800
                  "
                >
                  {competency.역량명}
                </h1>

              </div>


              <p
                className="
                  text-xs
                  md:text-base
                  text-gray-500
                  mt-1
                  leading-snug
                "
              >
                {competency.설명}
              </p>

            </div>

          )}



          {/* SEARCH */}
          <input
            type="text"
            placeholder="에피소드 검색..."
            value={search}
            onChange={e =>
              setSearch(e.target.value)
            }
            className="
              w-full
              border
              border-gray-300
              rounded-lg
              px-3
              py-1.5
              md:py-2
              text-sm
              md:text-base
              mb-3
              md:mb-5
              focus:outline-none
              focus:border-indigo-400
            "
          />

          {/* EPISODE COUNT */}
          <div
            className="
              flex
              justify-between
              items-center
              mb-1
              md:mb-2
            "
          >
            <span className="text-sm md:text-base font-semibold text-gray-700">
              에피소드 개수 {filteredEpisodes.length}개
            </span>
          </div>


          {/* EPISODES */}
          <div
            className="
              flex
              flex-col
              gap-2
              md:gap-3
            "
          ></div>

          {/* EPISODES */}
          <div
            className="
              flex
              flex-col
              gap-2
              md:gap-3
            "
          >

            {filteredEpisodes.map(episode => {

              const mentor =
                getMentor(episode.mentor_id);


              return (

                <div
                  key={episode.episode_id}
                  onClick={() =>
                    navigate(
                      `/episode/${episode.episode_id}`
                    )
                  }
                  className="
                    bg-white
                    rounded-lg
                    p-3
                    md:p-6
                    shadow-sm
                    hover:shadow-md
                    cursor-pointer
                    transition
                    border
                    border-gray-100
                  "
                >


                  <h3
                    className="
                      text-sm
                      md:text-lg
                      font-bold
                      text-gray-800
                      mb-1.5
                    "
                  >
                    {episode.제목}
                  </h3>


                  {/* TAGS */}
                  <div
                    className="
                      flex
                      flex-wrap
                      gap-1.5
                      md:gap-2
                      mb-2
                    "
                  >

                    {[
                      episode.competency_id_1,
                      episode.competency_id_2,
                      episode.competency_id_3,
                      episode.competency_id_4
                    ]
                    .filter(Boolean)
                    .map(id => {

                      const skill =
                        competencies.find(
                          c =>
                            String(c.competency_id) === String(id)
                        );

                      const getColor = (name) => {
    if (['디지털 리터러시', '전략적 커뮤니케이션', '자기주도적 성과관리', '프로페셔널 매너'].includes(name)) 
      return 'bg-gray-100 text-gray-600';
    if (['제/상품 및 시공절차', '시장 및 산업 인사이트', '현장대응 및 문제해결', '고객관계 구축'].includes(name)) 
      return 'bg-blue-50 text-blue-600';
    if (['통합솔루션', '가치 창출 크로스셀링', '전략적 시장리딩', '파트너십 매니지먼트'].includes(name)) 
      return 'bg-green-50 text-green-700';
    return 'bg-indigo-50 text-indigo-500'; // 기본값
  };  

                      return skill ? (

                        <span
      key={id}
      className={`${getColor(skill.역량명)} text-[10px] md:text-xs font-medium px-2 py-[2px] rounded-md`}
    >
                          #{skill.역량명}
                        </span>

                      ) : null;

                    })}

                  </div>



                  {/* MENTOR */}
                  {mentor && (
  <div className="flex items-center gap-2 mt-1">
    <Avatar
      size={24}
      name={mentor.mentor_id}
      variant="beam"
      colors={["#FF6B6B", "#FFE66D", "#4ECDC4", "#45B7D1", "#96CEB4"]}
    />
    <div className="text-[10px] md:text-xs text-gray-400">
      {mentor.팀} | {mentor['담당 상품']}
    </div>
  </div>
)}


                  

                </div>
              );
            })}



            {filteredEpisodes.length === 0 && (

              <div
                className="
                  text-center
                  text-gray-400
                  py-10
                  text-sm
                "
              >
                에피소드가 없습니다.
              </div>

            )}

          </div>

        </div>

      </div>


      <Footer />

    </div>
  );
}

export default SkillPage;
