"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import PinCard from '@/components/PinCard';
import SavedPinEditModal from '@/components/SavedPinEditModal';

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

    // 저장 핀 목록 조회
    useEffect(() => {
        if (!loginUserId) {
            router.push('/login');
            return;
        }
        (async () => {
            await fetchAll(loginUserId);
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
    // 수정 완료 시 목록 반영
    const handleSaved = (oldSavedPinId, newSavedPin) => {
        setPins(prev => prev.map(p =>
            p.savedPinId === oldSavedPinId ? { ...p, ...newSavedPin } : p
        ));
    };

    // 삭제 완료 시 목록 반영
    const handleDeleted = (savedPinId) => {
        setPins(prev => prev.filter(p => p.savedPinId !== savedPinId));
    };

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
                                        onEditClick={() => setEditTarget(pin)}  // ← 추가
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
                onClose={() => setEditTarget(null)}
                onSaved={handleSaved}
                onDeleted={handleDeleted}
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
