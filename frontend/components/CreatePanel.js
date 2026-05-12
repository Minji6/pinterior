'use client';
import { useRouter } from 'next/navigation';
import { X, Bookmark, LayoutGrid, Layers } from 'lucide-react';

const CreatePanel = ({ isOpen, onClose }) => {
    const router = useRouter();

    const menuItems = [
        {
            icon: <Bookmark size={22} color="#fff" />,
            iconBg: '#E60023',
            iconBorder: false,
            label: '핀',
            desc: '사진이나 동영상을 게시하고 링크, 스티커, 효과 등을 추가하세요.',
            path: '/pin/create',
        },
        {
            icon: <LayoutGrid size={22} color="#333" />,
            iconBg: '#fff',
            iconBorder: true,
            label: '보드',
            desc: '보드를 만들어 좋아하는 핀 컬렉션을 정리하세요.',
            path: '/board/create',
        },
        {
            icon: <Layers size={22} color="#333" />,
            iconBg: '#fff',
            iconBorder: true,
            label: '콜라주',
            desc: '아이디어를 섞고 일치시켜 비전을 구축하고 새로운 것을 만들어 보세요.',
            path: '/collage/create',
        },
    ];

    const handleClick = (path) => {
        router.push(path);
        onClose();
    };

    return (
        <>
            {/* 배경 오버레이 */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 99,
                    }}
                />
            )}

            {/* 슬라이드 패널 */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: '80px',
                    height: '100vh',
                    width: '300px',
                    background: '#fff',
                    boxShadow: '4px 0 16px rgba(0,0,0,0.08)',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-110%)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 16px',
                }}
            >
                {/* 헤더 */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <span style={{ fontSize: '20px', fontWeight: '700' }}>만들기</span>
                    <button
                        onClick={onClose}
                        className="d-flex align-items-center justify-content-center border-0 rounded-circle"
                        style={{ width: '36px', height: '36px', background: '#efefef', cursor: 'pointer' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 메뉴 아이템 */}
                <div className="d-flex flex-column gap-2">
                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            onClick={() => handleClick(item.path)}
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
        </>
    );
};

export default CreatePanel;
