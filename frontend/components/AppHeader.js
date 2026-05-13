'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SearchBar from './SearchBar';

export default function AppHeader() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // 컴포넌트 마운트 확인 (localStorage 접근을 위해 클라이언트 환경 보장)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const token = localStorage.getItem('token');
  const nickname = localStorage.getItem('nickname') || '';
  const rawProfileImg = localStorage.getItem('profileImg') || '';

  // 프로필 이미지 URL 변환 (view 엔드포인트로 교체)
  const profileImg = rawProfileImg
    ? rawProfileImg.replace(
        /\/api\/users\/(\d+)\/image$/,
        '/api/users/$1/image/view'
      )
    : '';

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await axios.post('/api/users/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (e) {
    } finally {
      localStorage.clear();
      setShowDropdown(false);
      router.push('/');
    }
  };

  // 프로필 편집 페이지 이동
  const handleProfileEdit = () => {
    setShowDropdown(false);
    router.push('/mypage');
  };

  // 비로그인 상태 헤더
  if (!token) {
    return (
      <nav className="navbar px-4 py-3 d-flex justify-content-between align-items-center border-bottom bg-white">
        <Link href="/" className="text-decoration-none">
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#E60023' }}>
            Pinterior
          </span>
        </Link>
        <button
          className="btn fw-bold px-4 py-2"
          style={{ backgroundColor: '#E60023', color: '#fff', borderRadius: '24px', border: 'none' }}
          onClick={() => router.push('/login')}
        >
          로그인
        </button>
      </nav>
    );
  }

  // 로그인 상태 헤더
  return (
    <nav className="navbar px-4 py-2 d-flex align-items-center border-bottom bg-white" style={{ gap: '1rem', position: 'relative', zIndex: 200 }}>

      {/* 검색창 컴포넌트 - useSearchParams 사용으로 Suspense로 감싸기 */}
      <Suspense fallback={<div style={{ flex: 1 }} />}>
        <SearchBar />
      </Suspense>

      {/* 프로필 이미지 + 드롭다운 */}
      <div className="position-relative">
        <button
          className="btn d-flex align-items-center gap-2"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ border: 'none', background: 'transparent' }}
        >
          {/* 프로필 이미지가 있으면 이미지, 없으면 닉네임 첫 글자 */}
          {profileImg ? (
            <img
              src={profileImg}
              alt="profile"
              style={{ borderRadius: '50%', objectFit: 'cover', width: '36px', height: '36px' }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px', backgroundColor: '#555', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              {nickname.charAt(0)}
            </div>
          )}
          <span style={{ fontSize: '0.8rem' }}>▼</span>
        </button>

        {/* 프로필 드롭다운 메뉴 */}
        {showDropdown && (
          <div
            className="position-absolute end-0 mt-2 bg-white shadow rounded-3 p-2"
            style={{ minWidth: '180px', zIndex: 1000 }}
          >
            <button className="btn btn-light w-100 text-start mb-1" onClick={handleProfileEdit}>프로필 편집</button>
            <button className="btn btn-light w-100 text-start" onClick={handleLogout}>로그아웃</button>
          </div>
        )}
      </div>
    </nav>
  );
}