"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

// ─── 더미 데이터 ─────────────────────────────────────────────
const DUMMY_BOARDS = [
  { boardId: 1, boardName: "첫번째핀", pinCount: 2, updatedAt: "33분", thumbnails: ["/sample1.jpg", "/sample2.jpg", "/sample3.jpg"] },
  { boardId: 2, boardName: "1234", pinCount: 0, updatedAt: "1시간", thumbnails: [] },
];

// ─── 보드 카드 ───────────────────────────────────────────────
function BoardCard({ board }) {
  const [hover, setHover] = useState(false);
  const t = board.thumbnails;

  return (
    <div
      style={{ width: 236, cursor: "pointer" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: "flex", height: 160, borderRadius: 16, overflow: "hidden", position: "relative", backgroundColor: "#e0e0e0" }}>
        <div style={{ flex: 2, borderRight: "2px solid #fff", overflow: "hidden" }}>
          {t[0] ? <img src={t[0]} alt="" style={imgFill} /> : <div style={{ width: "100%", height: "100%", backgroundColor: "#d5d5d5" }} />}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, borderBottom: "2px solid #fff", overflow: "hidden" }}>
            {t[1] ? <img src={t[1]} alt="" style={imgFill} /> : <div style={{ width: "100%", height: "100%", backgroundColor: "#ccc" }} />}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            {t[2] ? <img src={t[2]} alt="" style={imgFill} /> : <div style={{ width: "100%", height: "100%", backgroundColor: "#c0c0c0" }} />}
          </div>
        </div>

        {hover && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 16, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 10 }}>
            <button className="btn btn-light btn-sm rounded-circle" style={{ width: 36, height: 36 }}>
              ✏️
            </button>
          </div>
        )}
      </div>

      <div className="mt-2">
        <p className="fw-bold mb-0" style={{ fontSize: 15 }}>{board.boardName}</p>
        <p className="text-muted mb-0" style={{ fontSize: 13 }}>핀 {board.pinCount}개 · {board.updatedAt}</p>
      </div>
    </div>
  );
}

// ─── 만들기 카드 ─────────────────────────────────────────────
function CreateCard({ onOpen }) {
  return (
    <div style={{ width: 236, cursor: "pointer" }}>
      <div style={{ height: 160, borderRadius: 16, backgroundColor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="btn btn-light btn-sm rounded-pill px-3 fw-semibold" style={{ fontSize: 14 }} onClick={onOpen}>
          만들기
        </span>
      </div>
    </div>
  );
}

// ─── 메인 ───────────────────────────────────────────────────
export default function BoardListContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("board");
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      router.replace('/login');
      return;
    }

    fetch(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 200) setProfile(json.data);
      })
      .catch(() => {});
  }, []);

  const profileImgSrc = profile?.profileImg
    ? `http://localhost:8080${profile.profileImg.replace(/\/api\/users\/(\d+)\/image$/, '/api/users/$1/image/view')}`
    : null;

  return (
    <div className="px-4 py-4" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 헤더 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold" style={{ fontSize: 28 }}>저장한 아이디어</h1>

        {profile && (
          <div
            className="d-flex align-items-center gap-3"
            onClick={() => router.push('/mypage')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            style={{
              cursor: 'pointer',
              transition: 'background-color 0.15s',
              borderRadius: 16,
              padding: '8px 12px',
            }}
          >
            {profileImgSrc ? (
              <img
                src={profileImgSrc}
                alt="프로필"
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#767676', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {profile.nickname.charAt(0)}
              </div>
            )}
            <div>
              <p className="fw-bold mb-0" style={{ fontSize: 14 }}>{profile.nickname}</p>
              {profile.bio && <p className="text-muted mb-0" style={{ fontSize: 12 }}>{profile.bio}</p>}
            </div>
          </div>
        )}
      </div>

      {/* 탭 */}
      <ul className="nav gap-1 mb-3" style={{ borderBottom: "1px solid #ddd" }}>
        {[{ key: "pin", label: "핀" }, { key: "board", label: "보드" }].map(({ key, label }) => (
          <li key={key} className="nav-item">
            <button
              className="nav-link px-3 pb-2"
              style={{
                border: "none", background: "none", fontWeight: activeTab === key ? 700 : 500,
                color: activeTab === key ? "#111" : "#767676",
                borderBottom: activeTab === key ? "2px solid #111" : "2px solid transparent",
              }}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* 보드 탭 */}
      {activeTab === "board" && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-danger rounded-pill px-4 fw-bold" style={{ fontSize: 15 }} onClick={() => setShowModal(true)}>
              만들기
            </button>
          </div>

          <div className="d-flex flex-wrap gap-3">
            {DUMMY_BOARDS.map((board) => (
              <BoardCard key={board.boardId} board={board} />
            ))}
            <CreateCard onOpen={setShowModal} />
          </div>
        </>
      )}

      {/* 모달 */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-3">

              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">보드 만들기</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">보드 이름 *</label>
                <input className="form-control mb-3" placeholder="보드 이름을 입력하세요" maxLength={50} />
                <label className="form-label fw-semibold">설명 (선택)</label>
                <input className="form-control" placeholder="보드 설명을 입력하세요" />
              </div>

              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>
                  취소
                </button>
                <button className="btn btn-dark rounded-pill px-4">생성</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const imgFill = { width: "100%", height: "100%", objectFit: "cover", display: "block" };