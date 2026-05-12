"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// ─── 보드 카드 ───────────────────────────────────────────────
function BoardCard({ board }) {
  const [hover, setHover] = useState(false);
  const t = board.thumbnails || [];

  return (
    <div
      style={{ width: 236, cursor: "pointer" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* 썸네일 그리드 */}
      <div style={{ display: "flex", height: 160, borderRadius: 16, overflow: "hidden", position: "relative", backgroundColor: "#e0e0e0" }}>
        {/* 왼쪽 큰 썸네일 */}
        <div style={{ flex: 2, borderRight: "2px solid #fff", overflow: "hidden" }}>
          {t[0] ? <img src={t[0]} alt="" style={imgFill} /> : <div style={{ width: "100%", height: "100%", backgroundColor: "#d5d5d5" }} />}
        </div>
        {/* 오른쪽 작은 썸네일 2개 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, borderBottom: "2px solid #fff", overflow: "hidden" }}>
            {t[1] ? <img src={t[1]} alt="" style={imgFill} /> : <div style={{ width: "100%", height: "100%", backgroundColor: "#ccc" }} />}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            {t[2] ? <img src={t[2]} alt="" style={imgFill} /> : <div style={{ width: "100%", height: "100%", backgroundColor: "#c0c0c0" }} />}
          </div>
        </div>

        {/* 호버 오버레이 + 수정 버튼 */}
        {hover && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 16, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 10 }}>
            <button className="btn btn-light btn-sm rounded-circle" style={{ width: 36, height: 36 }}>
              ✏️
            </button>
          </div>
        )}
      </div>

      {/* 카드 정보 */}
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
  const [activeTab, setActiveTab] = useState("board");
  const [showModal, setShowModal] = useState(false);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    axios.get(`/api/boards/user/${userId}`)
      .then((res) => {
        setBoards(res.data.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || '보드 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


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
                border: "none", background: "none", fontWeight: key === "board" ? 700 : 500,
                color: key === "board" ? "#111" : "#767676",
                borderBottom: key === "board" ? "2px solid #111" : "2px solid transparent",
              }}
              onClick={() => router.push(href)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>


      {/* 보드 탭 */}
      {activeTab === "board" && (
        <>
          {/* 만들기 버튼 */}
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-danger rounded-pill px-4 fw-bold" style={{ fontSize: 15 }} onClick={() => setShowModal(true)}>
              만들기
            </button>
          </div>

          {/* 보드 그리드 */}
          <div className="d-flex flex-wrap gap-3">
            {boards.map((board) => (
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