import React from 'react';
import soloCharacter from '../assets/solo.png'; // 캐릭터 불러오기
import commonImg from '../assets/common.png';
import basicImg from '../assets/basic.png';
import curatorImg from '../assets/curator.png';

export function CompetencyInfo() {
  // Tailwind는 동적으로 조합된 클래스명(`bg-${color}-100`)을 빌드 시 인식하지 못하므로
  // 색상별 클래스 전체를 미리 고정된 문자열로 정의해둡니다.
  const colorStyles = {
    gray: {
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-700',
      titleText: 'text-gray-900',
      border: 'border-gray-200',
      accent: 'bg-gray-500',
    },
    blue: {
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      titleText: 'text-blue-950',
      border: 'border-blue-100',
      accent: 'bg-blue-500',
    },
    green: {
      badgeBg: 'bg-green-50',
      badgeText: 'text-green-700',
      titleText: 'text-green-950',
      border: 'border-green-100',
      accent: 'bg-green-500',
    },
  };

  const areas = [
    {
      id: 'Common', title: '공통 역량', subtitle: 'Common', color: 'gray', icon: '🌟', img: commonImg,
      desc: '모든 영업사원이 일관성, 신뢰성, 효율성을 확보하기 위해 갖춰야 할 실행 방식입니다.',
      items: [
        { name: '디지털 리터러시', kpi: 'AI Tool 활용 제안서 작성, SNS 채널 분석 및 콘텐츠 기획, 타겟팅 및 데이터 분석 능력' },
        { name: '전략적 커뮤니케이션', kpi: '문서화 능력, 고객 유형별 논리 전환, 복합 이해관계 조율 및 대안 설계 능력' },
        { name: '자기주도적 성과관리', kpi: '목표 실행력, 데이터 분석을 통한 성과 도출, 민첩한 액션 및 노하우 자산화 능력' },
        { name: '프로페셔널 매너', kpi: '일정 관리 및 위기 대응, 고객 맥락별 감성 지능 발휘, 신뢰 구축 능력' }
      ]
    },
    {
      id: 'Basic', title: '기본 역량', subtitle: 'Basic', color: 'blue', icon: '🔰', img: basicImg,
      desc: '현장에서 실질적인 성과를 창출하기 위한 핵심 전문 스킬셋입니다.',
      items: [
        { name: '제/상품 및 시공 절차', kpi: '전문 지식 숙지, 최적화된 큐레이션, 리스크 매니지먼트 및 표준화 능력' },
        { name: '시장 및 산업 인사이트', kpi: '시장 조사 및 타겟팅, 경쟁사 분석, 기회 발굴 및 파트너 영입 플랜 기획력' },
        { name: '현장대응 및 문제해결', kpi: '신속한 문제 진단 및 조율, 구조적 원인 분석 및 프로세스 개선 능력' },
        { name: '고객관계 구축', kpi: '라포 형성 및 지속적 네트워킹, 잠재 니즈 파악 및 로열티 관리 능력' }
      ]
    },
    {
      id: 'Curator', title: '심화 역량', subtitle: 'Curator', color: 'green', icon: '💎', img: curatorImg,
      desc: '개별 판매를 넘어 가치 창출과 전략적 파트너 역할을 수행하는 최고 단계입니다.',
      items: [
        { name: '통합 솔루션 제안', kpi: '믹스 앤 매치 구성, 구조화 기획력, 스토리텔링 및 프로젝트 리딩 능력' },
        { name: '가치 창출 크로스셀링', kpi: '심층 상담을 통한 잠재 니즈 발굴, 전략적 조합 및 구매 로드맵 설계 능력' },
        { name: '전략적 시장 리딩', kpi: '정보 민감성 및 전략적 사고, 사업 개발(BD) 및 마켓 인플루언스 기획력' },
        { name: '파트너십 매니지먼트', kpi: '장기 협력 구조 설계, 갈등 상황 협상력, 네트워크 확장 및 상생 컨설팅 능력' }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:px-10 md:py-16 bg-white">

      {/* 상단 캐릭터 인사 */}
      <div className="flex items-center gap-5 mb-16 pb-10 border-b border-gray-100">
        <img src={soloCharacter} alt="솔로 캐릭터" className="w-14 h-14 shrink-0" />
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-400 uppercase mb-1">
            Competency Model
          </p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            큐레이터 역량 체계도
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            솔로와 함께 큐레이터로 성장하기 위한 핵심 역량을 살펴볼까요?
          </p>
        </div>
      </div>

      {/* 영역 리스트 */}
      <div className="space-y-20">
        {areas.map((area, areaIdx) => {
          const c = colorStyles[area.color];
          return (
            <section key={area.id}>

              {/* 영역 헤더 */}
              <div className="flex items-center gap-4 mb-6">
                <span
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${c.accent}`}
                >
                  {String(areaIdx + 1).padStart(2, '0')}
                </span>
                <div>
                  <span className={`inline-block text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded ${c.badgeBg} ${c.badgeText} mb-1`}>
                    {area.subtitle}
                  </span>
                  <h3 className={`text-xl font-bold ${c.titleText}`}>{area.title}</h3>
                </div>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed mb-6 ml-13 md:ml-13">
                {area.desc}
              </p>

              {/* 영역 대표 이미지 */}
              <img
                src={area.img}
                alt={area.title}
                className="w-full max-h-56 object-cover rounded-xl mb-8 border border-gray-100"
              />

              {/* 영역별 상세 역량 카드 리스트 */}
              <div className="grid md:grid-cols-2 gap-3">
                {area.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-xl border ${c.border} bg-white hover:shadow-sm transition-shadow`}
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.kpi}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}