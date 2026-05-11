'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BoardsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
    }
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        <h2 className="fw-bold">보드 목록</h2>
        <p className="text-muted mt-2">보드 목록이 여기에 표시될 예정입니다.</p>
      </div>
    </div>
  );
}