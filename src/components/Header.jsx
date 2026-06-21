import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import logo from "../assets/logo.png";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isMain = location.pathname === '/';

  const goBack = () => navigate(-1);
  const goHome = () => navigate('/');

  const BackButton = () =>
    !isMain && (
      <button
        onClick={goBack}
        className="
          w-8 h-8
          flex items-center justify-center
          rounded-full
          text-gray-500
          hover:bg-gray-200
        "
      >
        <ChevronLeft size={20} />
      </button>
    );

  const Title = ({ isMobile = false }) => (
    <button
      onClick={goHome}
      className={isMobile ? 'text-sm font-semibold' : 'text-left w-full'}
    >
      {isMobile ? (
        <h1 className="text-sm font-semibold text-gray-800">Sales Tip Book</h1>
      ) : (
        <div className="w-full">
          {/* 메인 타이틀 */}
          <div className="flex items-center justify-between mb-4 w-full">
            <h1
              className="text-5xl md:text-6xl font-normal tracking-tight leading-tight mb-4"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              <span style={{ color: '#1a1a2e' }}>Sales </span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Tip Book
              </span>
            </h1>
            <img
              src={logo}
              alt="Sales Library"
              className="w-48 h-auto"
            />
          </div>

          {/* 설명 박스 */}
          <div
            className="rounded-xl px-5 py-4 mt-2"
            style={{
              backgroundColor: '#f5f3ff',
              border: '1.5px solid #c4b5fd',
            }}
          >
            <p className="text-sm text-gray-700 leading-relaxed">
              영업 사원 여러분들의 역량 성장을 위한 케이스 라이브러리입니다.
            </p>
            <p
              className="text-sm font-semibold mt-1"
              style={{ color: '#7c3aed' }}
            >
              습득하고 싶은 역량을 클릭 후 관련 사례를 읽어보세요!
            </p>
          </div>
        </div>
      )}
    </button>
  );

  return (
    <>
      {/* PC HEADER */}
      <div className="hidden md:block py-6 mb-6 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <div className="pt-2">
            <BackButton />
          </div>
          <Title />
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden sticky top-0 z-20 h-12 w-full bg-gray-50 border-b border-gray-200 flex items-center justify-center">
        <div className="absolute left-3">
          <BackButton />
        </div>

        <Title isMobile />
      </div>
    </>
  );
}

export default Header;
