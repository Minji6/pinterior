"use client"
import { useRouter } from "next/navigation";
import BoardList from "./BoardList";
import { useState } from "react";

function BoardListContent() {
    // 상태 정의
    const [showModal, setShowModal] = useState(false);

    // 라우터 객체 얻기
    const router = useRouter();

    return (
        <div className="px-4 py-4" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            {/* 유저 프로필 */}
            <div className="d-flex justify-content-between align-items-start mb-4">
                <h1 className="fw-bold" style={{ fontSize: 28 }}>저장한 아이디어</h1>
                <div className="d-flex align-items-center gap-3">
                    <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#767676", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                        정원
                    </div>
                    <div>
                        <p className="fw-bold mb-0">user</p>
                        <p className="text-muted mb-0" style={{ fontSize: 13 }}>팔로잉 0명</p>
                    </div>
                    <button className="btn btn-outline-secondary rounded-pill btn-sm px-3">프로필 공유</button>
                </div>
            </div>

            {/* 탭 */}
            <ul className="nav gap-1 mb-3" style={{ borderBottom: "1px solid #ddd" }}>
                {[
                    { key: "pin", label: "핀", href: "/saved-pins" },
                    { key: "board", label: "보드", href: "/boards" }
                ].map(({ key, label, href }) => (
                    <li key={key} className="nav-item">
                        <button
                            className="nav-link px-3 pb-2"
                            style={{
                                border: "none",
                                background: "none",
                                fontWeight: key === "board" ? 700 : 500,
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


            {/* 만들기 버튼 */}
            <div className="d-flex justify-content-end mb-3">
                <button
                    className="btn btn-danger rounded-pill px-4 fw-bold"
                    style={{ fontSize: 15 }}
                    onClick={() => setShowModal(true)}
                >
                    만들기
                </button>
            </div>

            <BoardList showModal={showModal} setShowModal={setShowModal} />

        </div>
    );
}

export default BoardListContent;