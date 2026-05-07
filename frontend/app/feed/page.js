'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function FeedPage() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/users/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (e) {
    } finally {
      localStorage.clear();
      router.push('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f8f8' }}>
      <nav className="navbar px-4 py-3 d-flex justify-content-between align-items-center border-bottom bg-white">
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#E60023' }}>
          Pinterior
        </span>
        <button
          className="btn fw-bold px-4 py-2"
          style={{ backgroundColor: '#E60023', color: '#fff', borderRadius: '24px', border: 'none' }}
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </nav>

      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <h2 className="fw-bold">메인 피드</h2>
          <p className="text-muted mt-2">핀 목록이 여기에 표시될 예정입니다.</p>
        </div>
      </div>
    </div>
  );
}