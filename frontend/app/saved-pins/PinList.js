"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { savedBtnStyle } from '../../components/PinStyles';

function getColCount() {
    const w = window.innerWidth;
    if (w < 480) return 2;
    if (w < 768) return 3;
    if (w < 1024) return 4;
    if (w < 1280) return 5;
    return 6;
}
////////////////////////////////////////
// 핀 카드 컴포넌트
////////////////////////////////////////
function PinCard({ pin, hovered, onMouseEnter, onMouseLeave, onUnsave }) {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#efefef' }}>
                {pin.imageUrl && (
                    <img
                        src={pin.imageUrl}
                        alt={pin.title || ''}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgLoaded(true)}
                        draggable="false"
                        style={{ width: '100%', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
                    />
                )}
                {hovered && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}>
                        <button
                            onClick={onUnsave}
                            style={{ ...savedBtnStyle, position: 'absolute', top: 8, right: 8, padding: '8px 16px', fontSize: '0.875rem' }}
                        >
                            저장 취소
                        </button>
                    </div>
                )}
            </div>
            {pin.title && (
                <div style={{ padding: '6px 4px 0' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pin.title}
                    </p>
                </div>
            )}
        </div>
    );
}

////////////////////////////////////////
// 핀 목록 컴포넌트
////////////////////////////////////////
function PinList() {
    // 상태 정의
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredPin, setHoveredPin] = useState(null);
    const [colCount, setColCount] = useState(getColCount);


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
                const res = await axios.get(`/api/saved-pins/users/${userId}`);
                setPins(res.data.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        work();
    }, []);

    // 저장 취소
    const handleUnsave = async (e, savedPinId) => {
        e.stopPropagation();
        try {
            await axios.delete(`/api/saved-pins/${savedPinId}`);
            setPins(prev => prev.filter(p => p.savedPinId !== savedPinId));
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
                                        hovered={hoveredPin === pin.savedPinId}
                                        onMouseEnter={() => setHoveredPin(pin.savedPinId)}
                                        onMouseLeave={() => setHoveredPin(null)}
                                        onUnsave={(e) => handleUnsave(e, pin.savedPinId)}
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