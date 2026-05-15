'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SearchBar from './SearchBar';
import Image from 'next/image';

export default function AppHeader() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [authState, setAuthState] = useState({
    token: null,
    nickname: '',
    profileImg: '',
  });

  const syncAuth = () => {
    setAuthState({
      token: localStorage.getItem('token'),
      nickname: localStorage.getItem('nickname') || '',
      profileImg: localStorage.getItem('profileImg') || '',
    });
  };

  useEffect(() => {
    setMounted(true);
    syncAuth();

    window.addEventListener('auth:login', syncAuth);
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('auth:login', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  if (!mounted) return null;

  const { token, nickname, profileImg: rawProfileImg } = authState;

  const profileImg = rawProfileImg
    ? rawProfileImg.replace(
      /\/api\/users\/(\d+)\/image$/,
      '/api/users/$1/image/view'
    )
    : '';

  const handleLogout = async () => {
    try {
      await axios.post('/api/users/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
    } finally {
      localStorage.clear();
      syncAuth();
      setShowDropdown(false);
      router.push('/');
    }
  };

  const handleProfileEdit = () => {
    setShowDropdown(false);
    router.push('/mypage');
  };

  if (!token) {
    return (
      <nav className="navbar px-4 py-3 d-flex justify-content-between align-items-center border-bottom bg-white">
        <Link href="/" className="text-decoration-none">
          <Image
            src="/logo.png"
            alt="Pinterior"
            width={120}
            height={32}
            style={{ height: '32px', objectFit: 'contain' }}
          />
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

  return (
    <nav className="navbar px-4 py-2 d-flex align-items-center border-bottom bg-white" style={{ gap: '1rem', position: 'relative', zIndex: 200 }}>

      <Suspense fallback={<div style={{ flex: 1 }} />}>
        <SearchBar />
      </Suspense>

      <div className="position-relative">
        <button
          className="btn d-flex align-items-center gap-2"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ border: 'none', background: 'transparent' }}
        >
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