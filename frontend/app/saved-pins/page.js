'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PinList from './PinList';

export default function SavedPinsPage() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div className="px-4 py-4">
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
      </div>
      <div style={{ padding: '4px 4px 0' }}>
        <PinList />
      </div>
    </div>
  );
}