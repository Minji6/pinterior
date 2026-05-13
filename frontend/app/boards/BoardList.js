"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Pencil } from 'lucide-react';

////////////////////////////////////////
// 상수 정의
////////////////////////////////////////
const imgFill = { width: "100%", height: "100%", objectFit: "cover", display: "block" };

function formatRelativeTime(dateStr) {
    if (dateStr == null) {
        return "-";
    }

    const diff = new Date() - new Date(dateStr);

    const diffMin = Math.floor(diff / (1000 * 60));
    const diffHour = Math.floor(diff / (1000 * 60 * 60));
    const diffDay = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffWeek = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

    if (diffMin < 1) { return "방금 전"; }
    else if (diffMin < 60) { return `${diffMin}분 전`; }
    else if (diffHour < 24) { return `${diffHour}시간 전`; }
    else if (diffDay < 7) { return `${diffDay}일 전`; }
    else if (diffWeek < 5) { return `${diffWeek}주 전`; }
    else { return `${Math.floor(diffDay / 30)}달 전`; }


}

////////////////////////////////////////
// 보드 카드 컴포넌트
////////////////////////////////////////
function BoardCard({ board }) {
    // 상태 정의
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
                    {t[0]
                        ? <Image src={t[0]} alt="" style={imgFill} width={100} height={100} />
                        : <div style={{ width: "100%", height: "100%", backgroundColor: "#e0e0e0" }} />
                    }
                </div>
                {/* 오른쪽 작은 썸네일 2개 */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1, borderBottom: "2px solid #fff", overflow: "hidden" }}>
                        {t[1]
                            ? <Image src={t[1]} alt="" style={imgFill} width={100} height={100} />
                            : <div style={{ width: "100%", height: "100%", backgroundColor: "#e0e0e0" }} />
                        }
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        {t[2]
                            ? <Image src={t[2]} alt="" style={imgFill} width={100} height={100} />
                            : <div style={{ width: "100%", height: "100%", backgroundColor: "#e0e0e0" }} />
                        }
                    </div>
                </div>

                {/* 호버 오버레이 + 수정 버튼 */}
                {hover && (
                    <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 16, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 10 }}>
                        <button className="btn btn-light btn-sm rounded-circle" style={{ width: 36, height: 36 }}>
                            <Pencil size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* 카드 정보 */}
            <div className="mt-2">
                <p className="fw-bold mb-0" style={{ fontSize: 15 }}>{board.boardName}</p>
                <p className="text-muted mb-0" style={{ fontSize: 13 }}>핀 {board.pinCount}개 · {formatRelativeTime(board.updatedAt)}</p>
            </div>
        </div>
    );
}

////////////////////////////////////////
// 만들기 카드 컴포넌트
////////////////////////////////////////
function CreateCard({ onOpen }) {
    return (
        <div style={{ width: 236, cursor: "pointer" }}>
            <div style={{ height: 160, borderRadius: 16, backgroundColor: "#bebeba", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span
                    className="btn btn-light btn-sm rounded-pill px-3 fw-semibold"
                    style={{ fontSize: 14 }}
                    onClick={onOpen}
                >
                    만들기
                </span>
            </div>
        </div>
    );
}

////////////////////////////////////////
// 보드 목록 컴포넌트
////////////////////////////////////////
function BoardList({ showModal, setShowModal }) {
    // 상태 정의
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', description: '' });
    const isInvalid = form.name.trim() === '' || form.name.length > 50;

    // 라우터 객체 얻기
    const router = useRouter();

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleCreate = async () => {
        if (form.name.trim() === '') return;

        try {
            const res = await axios.post('/api/boards', {
                boardName: form.name,
                boardInfo: form.description
            });
            setBoards(prev => [...prev, res.data.data]);
            setShowModal(false);
            setForm({ name: '', description: '' });
        } catch (err) {
            console.log(err);
        }
    };

    // 보드 목록 조회
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            router.push('/login');
            return;
        }
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

    // 로딩 가드
    if (loading) return <div>로딩 중...</div>;

    return (
        <>
            {/* 보드 그리드 */}
            <div className="d-flex flex-wrap gap-3">
                {boards.map((board) => (
                    <BoardCard key={board.boardId} board={board} />
                ))}
                <CreateCard onOpen={() => setShowModal(true)} />
            </div>

            {/* 보드 생성 모달 */}
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
                                <input
                                    className="form-control mb-3"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="보드 이름을 입력하세요"
                                />
                                {form.name.length > 50 && (
                                    <p className="text-danger" style={{ fontSize: 12 }}>보드 이름은 50자 이하여야 합니다.</p>
                                )}
                                <label className="form-label fw-semibold">설명 (선택)</label>
                                <input
                                    className="form-control"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="보드 설명을 입력하세요"
                                />
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-outline-secondary rounded-pill px-4"
                                    onClick={() => { setShowModal(false); setForm({ name: '', description: '' }); }}>
                                    취소
                                </button>
                                <button className="btn btn-dark rounded-pill px-4" onClick={handleCreate} disabled={isInvalid}>
                                    만들기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default BoardList;