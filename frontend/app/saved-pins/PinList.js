"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import PinCard from '@/components/PinCard';

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
        const userId = localStorage.getItem('userId');
        if (!userId) {
            router.push('/login');
            return;
        }
        const work = async () => {
            try {
                const [resBoards, res] = await Promise.all([
                    axios.get(`/api/boards/user/${userId}`),
                    axios.get(`/api/saved-pins/users/${userId}`)
                ]);
                setBoards(resBoards.data.data);
                setPins(res.data.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        work();
    }, []);

    // 저장
    const handleSave = async (pinId, boardId) => {
        try {
            await axios.post('/api/saved-pins', { pinId, boardId });
        } catch (err) {
            console.log(err);
        }
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
                                        saved={true}
                                        showTitle={true}
                                        onUnsave={(boardId) => handleSave(pin.pinId, boardId)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )
            }
        </>
    );
}

export default PinList;