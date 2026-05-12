'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProfileHeader from '../profile/ProfileHeader';
import styles from './page.module.css';

export default function MyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      router.replace('/login');
      return;
    }

    setLoading(true);

    fetch(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 200) {
          setProfile(json.data);
        } else {
          setError(json.message);
        }
      })
      .catch(() => setError('프로필을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <ProfileHeader
        profile={profile}
        onEditClick={() => router.push('/mypage/edit')}
      />

      <div className={styles.tabSection}>
        <button
          className={`${styles.tab} ${activeTab === 'created' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('created')}
        >
          생성됨
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'saved' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          저장됨
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'created' && (
          // TODO: 생성됨 탭 — 내가 등록한 핀 목록 컴포넌트 여기에 붙이기
          <div data-tab="created" />
        )}
        {activeTab === 'saved' && (
          // TODO: 저장됨 탭 — 내가 저장한 핀/보드 목록 컴포넌트 여기에 붙이기
          <div data-tab="saved" />
        )}
      </div>
    </div>
  );
}