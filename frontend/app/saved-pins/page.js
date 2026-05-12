'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function PinCard({ pin }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{ breakInside: 'avoid', marginBottom: '12px', borderRadius: '16px', overflow: 'hidden', position: 'relative', cursor: 'pointer', backgroundColor: '#e0e0e0' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img src={pin.imageUrl} alt={pin.title} style={{ width: '100%', display: 'block' }} />
      {hover && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '10px' }}>
          <button className="btn btn-danger btn-sm rounded-pill px-3">저장 취소</button>
        </div>
      )}
      {pin.title && (
        <div style={{ padding: '8px 10px 10px', backgroundColor: '#fff' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pin.title}</p>
        </div>
      )}
    </div>
  );
}

export default function SavedPinsPage() {
  const router = useRouter();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    axios.get(`/api/saved-pins/users/${userId}`)
      .then((res) => setPins(res.data.data))
      .catch((err) => setError(err.response?.data?.message || '불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">불러오는 중...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="px-4 py-4" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 유저 프로필 */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h1 className="fw-bold" style={{ fontSize: 28 }}>저장한 아이디어</h1>
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#767676", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>정원</div>
          <div>
            <p className="fw-bold mb-0">김정원</p>
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>팔로잉 0명</p>
          </div>
          <button className="btn btn-outline-secondary rounded-pill btn-sm px-3">프로필 공유</button>
        </div>
      </div>

      {/* 탭 */}
      <ul className="nav gap-1 mb-3" style={{ borderBottom: "1px solid #ddd" }}>
        {[{ key: "pin", label: "핀", href: "/saved-pins" }, { key: "board", label: "보드", href: "/boards" }].map(({ key, label, href }) => (
          <li key={key} className="nav-item">
            <button
              className="nav-link px-3 pb-2"
              style={{
                border: "none", background: "none", fontWeight: key === "pin" ? 700 : 500,
                color: key === "pin" ? "#111" : "#767676",
                borderBottom: key === "pin" ? "2px solid #111" : "2px solid transparent",
              }}
              onClick={() => router.push(href)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* 핀 목록 */}
      {pins.length === 0
        ? <p style={{ color: '#767676' }}>저장된 핀이 없습니다.</p>
        : (
          <div style={{ columns: 4, columnGap: '12px' }}>
            {pins.map((pin) => (
              <PinCard key={pin.savedPinId} pin={pin} />
            ))}
          </div>
        )
      }
    </div>
  );
}