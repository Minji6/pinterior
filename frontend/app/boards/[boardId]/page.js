'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import PinCard from '@/components/PinCard';
import BoardEditModal from '@/components/BoardEditModal';
import BoardDeleteModal from '@/components/BoardDeleteModal';
import { Pencil } from 'lucide-react';
import PinUpdatePanel from '@/components/PinUpdatePanel';

function getColCount() {
    const w = window.innerWidth;
    if (w < 480) return 2;
    if (w < 768) return 3;
    if (w < 1024) return 4;
    if (w < 1280) return 5;
    return 6;
}

export default function BoardDetailPage() {
    const { boardId } = useParams();
    const router = useRouter();
    const [boardInfo, setBoardInfo] = useState(null);
    const [pins, setPins] = useState([]);
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [colCount, setColCount] = useState(getColCount);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [updateTargetId, setUpdateTargetId] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    // 화면 크기에 따른 컬럼 수 설정
    useEffect(() => {
        const handleResize = () => setColCount(getColCount());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 보드 내 핀 목록 + 보드 목록 조회
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) { router.push('/login'); return; }

        const work = async () => {
            try {
                const [resBoard, resBoards] = await Promise.all([
                    axios.get(`/api/boards/${boardId}`),
                    axios.get(`/api/boards/user/${userId}`),
                ]);

                const detail = resBoard.data.data;
                // 보드 정보 세팅 (남의 보드도 정상 출력)
                setBoardInfo({
                    boardId: detail.boardId,
                    boardName: detail.boardName,
                    boardInfo: detail.boardInfo,
                    pinCount: detail.pins?.length ?? 0,
                });
                // 핀 목록 세팅
                setPins(detail.pins ?? []);
                // 소유자 여부 확인
                setIsOwner(detail.ownerId === Number(userId));
                // 저장 시 보드 선택용 목록
                setBoards(resBoards.data.data ?? []);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        work();
    }, [boardId]);

    const handleSave = async (pinId, targetBoardId) => {
        try {
            await axios.post('/api/saved-pins', { pinId, targetBoardId });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    // 수정 완료
    const handleEdited = (updated) => {
        setBoardInfo(prev => ({ ...prev, ...updated }));
    };

    // 삭제 완료
    const handleDeleted = () => {
        router.push('/boards');
    };

    if (loading) return <div>로딩 중...</div>;

    // 컬럼 분배
    const columns = Array.from({ length: colCount }, () => []);
    pins.forEach((pin, i) => columns[i % colCount].push(pin));

    return (
        <div style={{ margin: '0 auto', padding: '32px 16px 0' }}>

            {/* 보드 헤더 */}
            <div className="d-flex justify-content-between align-items-start mb-4"
                style={{ margin: 30 }}>
                <div>
                    <h2 className="fw-bold mb-1"
                        style={{ fontSize: 28 }}>
                        {boardInfo?.boardName ?? ''}
                    </h2>
                    {boardInfo?.boardInfo && (
                        <p className="text-muted mb-1" style={{ fontSize: 14 }}>{boardInfo.boardInfo}</p>
                    )}
                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>핀 {pins.length}개</p>
                </div>
                {/* 소유자만 수정 버튼 표시 */}
                {isOwner && (
                    <button
                        className="btn btn-light rounded-pill"
                        style={{ width: 48, height: 48 }}
                        onClick={() => setShowEdit(true)}
                    >
                        <Pencil size={24} />
                    </button>
                )}
            </div>

            {/* 핀 목록 */}
            {pins.length === 0
                ? <p style={{ color: '#767676' }}>저장된 핀이 없습니다.</p>
                : (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        {columns.map((col, colIdx) => (
                            <div key={colIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {col.map(pin => (
                                    <PinCard
                                        key={pin.pinId}
                                        pin={pin}
                                        saved={false}
                                        boards={boards}
                                        showTitle={false}
                                        onSave={(targetBoardId, boardName) => handleSave(pin.pinId, targetBoardId, boardName)}
                                        onEditClick={isOwner ? () => setUpdateTargetId(pin.pinId) : null}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )
            }

            {/* 수정/삭제 모달은 소유자만 */}
            {isOwner && (
                <>

                    {/* 수정 모달 */}
                    <BoardEditModal
                        key={showEdit ? boardId : null}
                        show={showEdit}
                        board={boardInfo}
                        onClose={() => setShowEdit(false)}
                        onEdited={handleEdited}
                        onDeleteClick={() => { setShowEdit(false); setShowDelete(true); }}
                    />

                    {/* 삭제 모달 */}
                    <BoardDeleteModal
                        show={showDelete}
                        board={boardInfo}
                        onClose={() => setShowDelete(false)}
                        onDeleted={handleDeleted}
                    />
                </>
            )}

            {/* 핀 수정 패널 */}
            {isOwner && updateTargetId && (
                <PinUpdatePanel
                    key={updateTargetId}
                    pinId={updateTargetId}
                    onClose={() => setUpdateTargetId(null)}
                    onSuccess={async () => {
                        const resBoard = await axios.get(`/api/boards/${boardId}`);
                        setPins(resBoard.data.data ?? []);
                        setUpdateTargetId(null);
                    }}
                />
            )}
        </div>
    );
}