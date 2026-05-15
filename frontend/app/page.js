"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CARD_COUNT = 24;
const cards = Array.from({ length: CARD_COUNT }, (_, i) => {
  const angle = (360 / CARD_COUNT) * i;
  const isOuter = i % 2 === 0;
  const r = isOuter ? 48 : 34;
  const rad = (angle * Math.PI) / 180;
  const x = 50 + r * Math.cos(rad);
  const y = 50 + r * Math.sin(rad);
  const PALETTES = [
    "#e8d5c4", "#c9d8cc", "#d4cce8", "#e8cfd4", "#cce0e8",
    "#e8e4cc", "#d8cce8", "#cce8d8", "#e4d4c8", "#c8d4e4",
    "#e8d4cc", "#cce4cc", "#ddd4e8", "#e8cccc", "#ccd8e8",
    "#e8d8cc", "#cce8e4", "#e4cce8", "#cce8cc", "#e8e0cc",
    "#ccd4e8", "#e8ccdc", "#d4e8cc", "#e0cce8",
  ];
  return {
    id: i,
    x,
    y,
    bg: PALETTES[i % PALETTES.length],
    w: isOuter ? 80 : 65,
    h: isOuter ? 104 : 84,
    tilt: -12 + (i % 5) * 4,
  };
});

function Button({ children, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: primary ? "14px 32px" : "13px 28px",
        borderRadius: 100,
        fontSize: 15,
        fontWeight: 500,
        cursor: "pointer",
        border: primary ? "none" : "1.5px solid #bbb",
        background: primary ? "#111" : "transparent",
        color: primary ? "#fff" : "#111",
        fontFamily: "inherit",
        transition: "background 0.18s, color 0.18s, border-color 0.18s, transform 0.12s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = primary ? "#E60023" : "transparent";
        e.currentTarget.style.borderColor = primary ? "transparent" : "#E60023";
        e.currentTarget.style.color = primary ? "#fff" : "#E60023";
        e.currentTarget.style.transform = "scale(1.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = primary ? "#111" : "transparent";
        e.currentTarget.style.borderColor = primary ? "transparent" : "#bbb";
        e.currentTarget.style.color = primary ? "#fff" : "#111";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
}

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/feed");
    }
  }, [router]);

  return (
    <>
      <style>{`
        @keyframes orbitCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbitCCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#f8f7f5",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.5s ease",
        }}
      >
        {/* 네비 */}
        <nav style={{ position: "absolute", top: 20, left: 28, zIndex: 20 }}>
          <img
            src="/logo.png"
            alt="Pinterior"
            style={{
              height: 48,
              width: "auto",
              mixBlendMode: "multiply",
              display: "block",
            }}
          />
        </nav>

        {/* 궤도 레이어 */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 0,
            height: 0,
            zIndex: 1,
          }}
        >
          {/* 바깥 궤도 — 시계 방향 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              animation: "orbitCW 60s linear infinite",
              willChange: "transform",
            }}
          >
            {cards.filter((_, i) => i % 2 === 0).map((card) => (
              <div
                key={card.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `translate(${(card.x - 50) * 14}px, ${(card.y - 50) * 8}px)`,
                  width: card.w,
                  height: card.h,
                  marginLeft: -card.w / 2,
                  marginTop: -card.h / 2,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: card.bg,
                    borderRadius: 12,
                    opacity: 0.82,
                    animation: "orbitCCW 60s linear infinite",
                    transform: `rotate(${card.tilt}deg)`,
                    willChange: "transform",
                  }}
                />
              </div>
            ))}
          </div>

          {/* 안쪽 궤도 — 반시계 방향 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              animation: "orbitCCW 45s linear infinite",
              willChange: "transform",
            }}
          >
            {cards.filter((_, i) => i % 2 !== 0).map((card) => (
              <div
                key={card.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `translate(${(card.x - 50) * 10}px, ${(card.y - 50) * 6}px)`,
                  width: card.w,
                  height: card.h,
                  marginLeft: -card.w / 2,
                  marginTop: -card.h / 2,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: card.bg,
                    borderRadius: 12,
                    opacity: 0.82,
                    animation: "orbitCW 45s linear infinite",
                    transform: `rotate(${card.tilt}deg)`,
                    willChange: "transform",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 바깥 블러 마스크 */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            maskImage:
              "radial-gradient(ellipse 65% 60% at 50% 50%, transparent 0%, transparent 28%, rgba(0,0,0,0.3) 48%, rgba(0,0,0,0.8) 65%, black 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 65% 60% at 50% 50%, transparent 0%, transparent 28%, rgba(0,0,0,0.3) 48%, rgba(0,0,0,0.8) 65%, black 100%)",
            pointerEvents: "none",
          }}
        />

        {/* 중앙 페이드 오버레이 */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            background:
              "radial-gradient(ellipse 55% 50% at 50% 50%, #f8f7f5 0%, #f8f7f5 26%, rgba(248,247,245,0.9) 46%, rgba(248,247,245,0.3) 65%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* 히어로 */}
        <main
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            padding: "2rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 54px)",
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-2px",
              color: "#0f0f0f",
              marginBottom: 18,
            }}
          >
            당신의 공간을
            <br />
            <em style={{ fontStyle: "normal", color: "#E60023" }}>아이디어</em>로 채우세요
          </h1>

          <p style={{ fontSize: 16, color: "#666", lineHeight: 1.7, marginBottom: 40 }}>
            마음에 드는 인테리어 핀을 저장하고,
            <br />
            보드로 정리하고, 함께 나눠보세요.
          </p>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button primary onClick={() => router.push("/login")}>
              시작하기
            </Button>
            <Button onClick={() => router.push("/feed?guest=true")}>
              둘러보기
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}