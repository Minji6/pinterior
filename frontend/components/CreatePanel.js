'use client';
import { useRouter } from 'next/navigation';
import { X, Bookmark, LayoutGrid, Layers } from 'lucide-react';
import BoardCreateModal from './BoardCreateModal';
import { useState } from 'react';

const CreatePanel = ({ isOpen, onClose }) => {
    const router = useRouter();
    const [showBoardModal, setShowBoardModal] = useState(false);


    if (!isOpen) return null;

    const menuItems = [
        {
            icon: <Bookmark size={22} color="#fff" />,
            iconBg: '#E60023',
            iconBorder: false,
            label: '핀',
            desc: '사진이나 동영상을 게시하고 링크, 스티커, 효과 등을 추가하세요.',
            onClick: () => { router.push('/pin/create'); onClose(); },
        },
        {
            icon: <LayoutGrid size={22} color="#fff" />,
            iconBg: '#E60023',
            iconBorder: true,
            label: '보드',
            desc: '보드를 만들어 좋아하는 핀 컬렉션을 정리하세요.',
            onClick: () => setShowBoardModal(true),
        },
    ];


    return (
        <>
            <div style={{
                width: '320px',
                height: '100%',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
            }}>
                {/* 헤더 */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <span style={{ fontSize: '20px', fontWeight: '700' }}>만들기</span>
                    <button
                        onClick={onClose}
                        className="d-flex align-items-center justify-content-center border-0 bg-transparent"
                        style={{ width: '32px', height: '32px', cursor: 'pointer', padding: 0 }}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* 메뉴 아이템 */}
                <div className="d-flex flex-column gap-2">
                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            onClick={item.onClick}
                            className="d-flex align-items-center gap-3 rounded-4"
                            style={{
                                padding: '14px 12px',
                                background: '#f8f8f8',
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#efefef'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f8f8f8'}
                        >
                            <div
                                className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    background: item.iconBg,
                                    border: item.iconBorder ? '1.5px solid #ddd' : 'none',
                                }}
                            >
                                {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>
                                    {item.label} &rsaquo;
                                </div>
                                <div style={{ fontSize: '12px', color: '#767676', lineHeight: '1.5' }}>
                                    {item.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <BoardCreateModal
                show={showBoardModal}
                onClose={() => setShowBoardModal(false)}
            />
        </>
    );
};

export default CreatePanel;
