'use client';
import { useState, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { BoardBtn, saveBtnStyle, savedBtnStyle } from './PinStyles';
import { ToastContext } from '@/contexts/ToastContext';

/**
 * 공통 PinCard 컴포넌트
 *
 * props:
 * - pin: { pinId, imageUrl, title }
 * - saved: boolean (이미 저장된 핀인지)
 * - boards: [{ boardId, boardName }]
 * - onSave: (boardId) => void
 * - onUnsave: () => void
 * - showTitle: boolean (제목 표시 여부, 기본 false)
 * - onEditClick: () => void (수정 버튼 클릭 핸들러)
 */
function PinCard({ pin, saved, boards = [], onSave, onUnsave, showTitle = false, onEditClick }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const cardRef = useRef(null);
  const { showToast } = useContext(ToastContext);

  const minHeight = pin.imageUrl ? 'auto' : `${120 + (pin.pinId % 5) * 40}px`;

  const calcDropdownPos = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const btnRight = rect.right - 8;
    const btnTop = rect.top + 8 + 36;
    const spaceBelow = window.innerHeight - btnTop;
    const top = spaceBelow < 200 ? btnTop - 200 : btnTop;
    setDropdownPos({ top, left: btnRight - 160 });
  };

  const handleCardClick = () => {
    router.push(`/pin/${pin.pinId}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    calcDropdownPos();
    setSaveModalOpen(prev => !prev);
  };

  const handleUnsave = (e) => {
    e.stopPropagation();
    onUnsave?.();
  };

  const handleBoardSelect = async (e, boardId, boardName) => {
    e.stopPropagation();
    try {
        await onSave?.(boardId, boardName);
        const message = boardName ? `${boardName}에 저장되었습니다` : '저장되었습니다';
        showToast(message);
    } catch (err) {
        showToast(err.response?.data?.message || '저장 중 오류가 발생했습니다.', 'error');
    }
    setSaveModalOpen(false);

  };

  return (
    <div
      ref={cardRef}
      style={{ position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setSaveModalOpen(false); }}
      onClick={handleCardClick}
    >
      <div style={{
        position: 'relative', borderRadius: '16px',
        overflow: 'hidden', backgroundColor: '#efefef', minHeight,
      }}>
        {pin.imageUrl && (
          <img
            src={pin.imageUrl}
            alt={pin.title || ''}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            draggable="false"
            style={{
              width: '100%', display: 'block',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
              userSelect: 'none',
            }}
          />
        )}
        {hovered && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}>
            {/* 수정 버튼 — onEditClick 있을 때만 표시 */}
            {onEditClick && (
              <button
                onClick={(e) => { e.stopPropagation(); onEditClick(); }}
                style={{
                  position: 'absolute', top: 8, left: 8,
                  padding: '6px 12px', borderRadius: 20, border: 'none',
                  backgroundColor: '#fff', fontWeight: 600,
                  fontSize: '0.8rem', cursor: 'pointer',
                }}
              >
                수정
              </button>
            )}
            {saved ? (
              <button
                onClick={handleUnsave}
                style={{ ...savedBtnStyle, position: 'absolute', top: 8, right: 8, padding: '8px 16px', fontSize: '0.875rem' }}
              >
                저장됨
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveClick}
                  style={{ ...saveBtnStyle, position: 'absolute', top: 8, right: 8, padding: '8px 16px', fontSize: '0.875rem' }}
                >
                  저장
                </button>
                {saveModalOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'fixed',
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      backgroundColor: '#fff', borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      padding: '12px', minWidth: '160px', zIndex: 9999,
                    }}
                  >
                    <p style={{ fontSize: '0.8rem', color: '#767676', margin: '0 0 6px', fontWeight: '600' }}>보드에 저장</p>
                    {boards.map(b => (
                      <BoardBtn key={b.boardId} label={b.boardName} onClick={(e) => handleBoardSelect(e, b.boardId, b.boardName)} />
                    ))}
                    <BoardBtn label="보드 없이 저장" onClick={(e) => handleBoardSelect(e, null, null)} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {showTitle && pin.title && (
        <p style={{ margin: '4px 4px 0', fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.3' }}>
          {pin.title}
        </p>
      )}
    </div>
  );
}

export default PinCard;
