"use client"

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import PinCard from '@/components/PinCard';
import SavedPinEditModal from '@/components/SavedPinEditModal';
import PinUpdatePanel from '@/components/PinUpdatePanel';

function getColCount() {
    const w = window.innerWidth;
    if (w < 480) return 2;
    if (w < 768) return 3;
    if (w < 1024) return 4;
    if (w < 1280) return 5;
    return 6;
}

////////////////////////////////////////
// 핀 목록 컴포넌트
////////////////////////////////////////
function PinList() {
    // 상태 정의
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [colCount, setColCount] = useState(getColCount);
    const [boards, setBoards] = useState([]);
    const [editTargetId, setEditTargetId] = useState(null);    // 남이 만든 핀 → SavedPinEditModal
    const [updateTargetId, setUpdateTargetId] = useState(null);// 내가 만든 핀 → PinUpdatePanel
    const [loginUserId, setLoginUserId] = useState(() => {
        const userId = localStorage.getItem('userId');
        return userId ? Number(userId) : null;
    });

    // 라우터 객체 얻기
    const router = useRouter();

    // 화면 크기에 따른 컬럼 수 설정
    useEffect(() => {
        const handleResize = () => setColCount(getColCount());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 저장 핀 + 보드 재조회
    const fetchAll = useCallback(async (userId) => {
        try {
            const [resBoards, res] = await Promise.all([
                axios.get(`/api/boards/user/${userId}`),
                axios.get(`/api/saved-pins/users/${userId}`)
            ]);
            setBoards(resBoards.data.data);
            setPins(res.data.data);
        } catch (err) {
            console.log(err);
        }
    }, []);

    // 초기 로드
    useEffect(() => {
        if (!userId) {
            router.push('/login');
            return;
        }
        (async () => {
            await fetchAll(userId);
            setLoading(false);
        })();
    }, [fetchAll, router, loginUserId]);

    // 저장
    const handleSave = async (pinId, boardId) => {
        try {
            await axios.post('/api/saved-pins', { pinId, boardId });
        } catch (err) {
            console.log(err);
        }
    };

    // 수정/삭제 완료 → 전체 재조회
    const refetch = useCallback(async () => {
        const userId = localStorage.getItem('userId');
        if (userId) await fetchAll(userId);
    }, [fetchAll]);

    // 수정 클릭: 내 핀이면 PinUpdatePanel, 아니면 SavedPinEditModal
    const handleEditClick = (pin) => {
        if (pin.pinUserId === loginUserId) {
            setUpdateTargetId(pin.savedPinId);
        } else {
            setEditTargetId(pin.savedPinId);
        }
    };

    // 매 렌더에서 최신 pins 배열로부터 lookup — refetch 후 stale 방지
    const editTarget = editTargetId != null ? pins.find(p => p.savedPinId === editTargetId) : null;
    const updateTarget = updateTargetId != null ? pins.find(p => p.savedPinId === updateTargetId) : null;

    // 로딩 가드
    if (loading) return <div>로딩 중...</div>;

    // 컬럼 분배
    const columns = Array.from({ length: colCount }, () => []);
    pins.forEach((pin, i) => columns[i % colCount].push(pin));

    return (
        <>
            {pins.length === 0
                ? <p style={{ color: '#767676' }}>저장된 핀이 없습니다.</p>
                : (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        {columns.map((col, colIdx) => (
                            <div key={colIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {col.map(pin => (
                                    <PinCard
                                        key={pin.savedPinId}
                                        pin={pin}
                                        saved={false}
                                        boards={boards}
                                        showTitle={false}
                                        onSave={(boardId) => handleSave(pin.pinId, boardId)}
                                        onEditClick={() => handleEditClick(pin)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )
            }

            {/* 남이 만든 핀 수정 모달 (보드 변경/삭제) */}
            <SavedPinEditModal
                key={editTarget?.savedPinId}
                show={!!editTarget}
                savedPin={editTarget}
                boards={boards}
                onClose={() => setEditTargetId(null)}
                onSaved={async () => { await refetch(); setEditTargetId(null); }}
                onDeleted={async () => { await refetch(); setEditTargetId(null); }}
            />

            {/* 내가 만든 핀 수정 패널 */}
            {updateTarget && (
                <PinUpdatePanel
                    key={`${updateTarget.savedPinId}-${updateTarget.boardId ?? 'null'}`}
                    pinId={updateTarget.pinId}
                    savedPinId={updateTarget.savedPinId}
                    initialBoardId={updateTarget.boardId ?? null}
                    onClose={() => setUpdateTargetId(null)}
                    onSuccess={async () => { await refetch(); setUpdateTargetId(null); }}
                />
            )}
        </>
    );
}

export default PinList;
