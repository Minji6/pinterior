'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import ProfileHeader from '../profile/ProfileHeader';
import BoardList from '../boards/BoardList';
import PinList from '../saved-pins/PinList';
import BoardCreateModal from '@/components/BoardCreateModal';
import PinCard from '@/components/PinCard';
import styles from './page.module.css';

function getColCount() {
  const w = window.innerWidth;
  if (w < 480) return 2;
  if (w < 768) return 3;
  if (w < 1024) return 4;
  if (w < 1280) return 5;
  return 6;
}

function MyPinList() {
  const [pins, setPins] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colCount, setColCount] = useState(getColCount);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => setColCount(getColCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) { router.push('/login'); return; }
    const work = async () => {
      try {
        const [resPins, resBoards] = await Promise.all([
          axios.get(`/api/pins/user/${userId}`),
          axios.get(`/api/boards/user/${userId}`),
        ]);
        const rawPins = resPins.data.data ?? [];
        setPins(rawPins.map(pin => ({
          ...pin,
          imageUrl: pin.imageUrl ? `http://localhost:8080${pin.imageUrl}` : null,
        })));
        setBoards(resBoards.data.data ?? []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    work();
  }, []);

  const handleSave = async (pinId, boardId) => {
    try {
      await axios.post('/api/saved-pins', { pinId, boardId });
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  const columns = Array.from({ length: colCount }, () => []);
  pins.forEach((pin, i) => columns[i % colCount].push(pin));

  return pins.length === 0
    ? <p style={{ color: '#767676' }}>등록한 핀이 없습니다.</p>
    : (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {columns.map((col, colIdx) => (
          <div key={colIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {col.map(pin => (
              <PinCard
                key={pin.pinId}
                pin={pin}
                saved={false}
                boards={boards}
                showTitle={false}
                onSave={(boardId) => handleSave(pin.pinId, boardId)}
              />
            ))}
          </div>
        ))}
      </div>
    );
}

export default function MyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) { router.replace('/login'); return; }

    fetch(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 200) setProfile(json.data);
        else setError(json.message);
      })
      .catch(() => setError('프로필을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>

      {/* 헤더 */}
      <ProfileHeader
        profile={profile}
        onEditClick={() => router.push('/mypage/edit')}
      />

      {/* 탭 */}
      <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid #e9e9e9', marginBottom: 12 }}>
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

      {/* 만들기 버튼 - 생성됨 탭에서만 */}
      {activeTab === 'created' && (
        <div ref={dropdownRef} style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 24, marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                padding: '10px 20px', borderRadius: 14, border: 'none',
                backgroundColor: dropdownOpen ? '#111' : '#E60023',
                color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer',
              }}
            >
              만들기
            </button>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                backgroundColor: '#fff', borderRadius: 16,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                minWidth: 140, zIndex: 100, padding: '8px 0',
              }}>
                {[
                  { label: '핀', onClick: () => { setDropdownOpen(false); router.push('/pin/create'); } },
                  { label: '보드', onClick: () => { setDropdownOpen(false); setShowBoardModal(true); } },
                ].map(item => (
                  <div key={item.label} style={{ padding: '0 8px' }}>
                    <button
                      onClick={item.onClick}
                      style={{
                        width: '100%', padding: '12px 16px',
                        border: 'none', background: 'none',
                        textAlign: 'left', fontSize: 15,
                        fontWeight: 500, cursor: 'pointer', borderRadius: 12,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {item.label}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.tabContent}>
        {activeTab === 'created' && <MyPinList />}
        {activeTab === 'saved' && (
          <>
            <BoardList
              refreshKey={boardRefreshKey}
              onOpenModal={() => setShowBoardModal(true)}
            />
            <div style={{ marginTop: 40 }}>
              <PinList />
            </div>
          </>
        )}
      </div>

      <BoardCreateModal
        show={showBoardModal}
        onClose={() => {
          setShowBoardModal(false);
          setBoardRefreshKey(k => k + 1);
        }}
      />
    </div>
  );
}