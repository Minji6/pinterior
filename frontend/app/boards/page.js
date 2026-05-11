"use client";

import { useState } from "react";
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
function CreateCard() {
  return (
    <div style={{ width: 236, cursor: "pointer" }}>
      <div style={{ height: 160, borderRadius: 16, backgroundColor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="btn btn-light btn-sm rounded-pill px-3 fw-semibold" style={{ fontSize: 14 }}>만들기</span>
      </div>
    </div>
  );
}

// ─── 메인 ───────────────────────────────────────────────────
export default function BoardListContent() {
  const [activeTab, setActiveTab] = useState("board");

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
          {/* 만들기 버튼 */}
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-danger rounded-pill px-4 fw-bold" style={{ fontSize: 15 }}>만들기</button>
          </div>

          {/* 보드 그리드 */}
          <div className="d-flex flex-wrap gap-3">
            {DUMMY_BOARDS.map((board) => (
              <BoardCard key={board.boardId} board={board} />
            ))}
            <CreateCard />
          </div>
        </>
      )}
    </div>
  );
}

const imgFill = { width: "100%", height: "100%", objectFit: "cover", display: "block" };