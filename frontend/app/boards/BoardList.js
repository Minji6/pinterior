"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Pencil } from 'lucide-react';
import BoardEditModal from '@/components/BoardEditModal';
import BoardDeleteModal from '@/components/BoardDeleteModal';

////////////////////////////////////////
// 상수 정의
////////////////////////////////////////
const imgFill = { width: "100%", height: "100%", objectFit: "cover", display: "block" };

function formatRelativeTime(dateStr) {
    if (dateStr == null) return "-";
    const diff = new Date() - new Date(dateStr);
    const diffMin = Math.floor(diff / (1000 * 60));
    const diffHour = Math.floor(diff / (1000 * 60 * 60));
    const diffDay = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffWeek = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    if (diffMin < 1) return "방금 전";
    else if (diffMin < 60) return `${diffMin}분 전`;
    else if (diffHour < 24) return `${diffHour}시간 전`;
    else if (diffDay < 7) return `${diffDay}일 전`;
    else if (diffWeek < 5) return `${diffWeek}주 전`;
    else return `${Math.floor(diffDay / 30)}달 전`;
}

////////////////////////////////////////
// 보드 카드 컴포넌트
////////////////////////////////////////
function BoardCard({ board, onClick, onEditClick }) {
    const [hover, setHover] = useState(false);
    const t = board.thumbnails || [];

    return (
        <div
            style={{ width: 270, cursor: "pointer" }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            <div style={{ display: "flex", height: 160, borderRadius: 16, overflow: "hidden", position: "relative", backgroundColor: "#e0e0e0" }}>
                <div style={{ flex: 2, borderRight: "2px solid #fff", overflow: "hidden" }}>
                    {t[0] ? <Image src={t[0]} alt="" style={imgFill} width={100} height={100} />
                        : <div style={{ width: "100%", height: "100%", backgroundColor: "#e0e0e0" }} />}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1, borderBottom: "2px solid #fff", overflow: "hidden" }}>
                        {t[1] ? <Image src={t[1]} alt="" style={imgFill} width={100} height={100} />
                            : <div style={{ width: "100%", height: "100%", backgroundColor: "#e0e0e0" }} />}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        {t[2] ? <Image src={t[2]} alt="" style={imgFill} width={100} height={100} />
                            : <div style={{ width: "100%", height: "100%", backgroundColor: "#e0e0e0" }} />}
                    </div>
                </div>
                {hover && (
                    <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 16, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 10 }}>
                        <button
                            className="btn btn-light btn-sm rounded-circle"
                            style={{ width: 36, height: 36 }}
                            onClick={(e) => { e.stopPropagation(); onEditClick(board); }}
                        >
                            <Pencil size={16} />
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-2">
                <p className="fw-bold mb-0" style={{ fontSize: 15 }}>{board.boardName}</p>
                <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                    핀 {board.pinCount ?? 0}개 · {formatRelativeTime(board.updatedAt)}
                </p>
            </div>
        </div>
    );
}

////////////////////////////////////////
// 만들기 카드 컴포넌트
////////////////////////////////////////
function CreateCard({ onOpen }) {
    return (
        <div style={{ width: 270, cursor: "pointer" }}>
            <div style={{ height: 160, borderRadius: 16, backgroundColor: "#bebeba", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="btn btn-light btn-sm rounded-pill px-3 fw-semibold" style={{ fontSize: 14 }} onClick={onOpen}>
                    만들기
                </span>
            </div>
        </div>
    );
}

////////////////////////////////////////
// 보드 목록 컴포넌트
////////////////////////////////////////
function BoardList({ newBoard, onOpenModal }) {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const router = useRouter();

    const displayBoards = (() => {
        if (!newBoard) return boards;
        const alreadyIn = boards.some(b => b.boardId === newBoard.boardId);
        return alreadyIn ? boards : [...boards, newBoard];
    })();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) { router.push('/login'); return; }
        const work = async () => {
            try {
                const res = await axios.get(`/api/boards/user/${userId}`);
                setBoards(res.data.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        work();
    }, []);

    // 수정 완료 시 목록 반영
    const handleEdited = (updated) => {
        setBoards(prev => prev.map(b => b.boardId === updated.boardId ? { ...b, ...updated } : b));
    };

    // 삭제 완료 시 목록 반영
    const handleDeleted = (boardId) => {
        setBoards(prev => prev.filter(b => b.boardId !== boardId));
        setDeleteTarget(null);  // ← 추가
        setEditTarget(null);
    };

    if (loading) return <div>로딩 중...</div>;

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 270px)', gap: 14.7 }}>
                {displayBoards.map((board) => (
                    <BoardCard
                        key={board.boardId}
                        board={board}
                        onClick={() => router.push(`/boards/${board.boardId}`)}
                        onEditClick={(b) => setEditTarget(b)}
                    />
                ))}
                <CreateCard onOpen={onOpenModal} />
            </div>

            <BoardEditModal
                key={editTarget?.boardId}
                show={!!editTarget}
                board={editTarget}
                onClose={() => setEditTarget(null)}
                onEdited={handleEdited}
                onDeleteClick={() => setDeleteTarget(editTarget)}
            />

            <BoardDeleteModal
                show={!!deleteTarget}
                board={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDeleted={handleDeleted}
            />
        </>
    );
}

export default BoardList;