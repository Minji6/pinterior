'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BoardBtn, saveBtnStyle, savedBtnStyle, dropdownStyle } from './PinStyles';

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
 */
function PinCard({ pin, saved, boards = [], onSave, onUnsave, showTitle = false }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const minHeight = pin.imageUrl ? 'auto' : `${120 + (pin.pinId % 5) * 40}px`;

  const handleCardClick = () => {
    router.push(`/pin/${pin.pinId}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    setSaveModalOpen(prev => !prev);
  };

  const handleUnsave = (e) => {
    e.stopPropagation();
    onUnsave?.();
  };

  const handleBoardSelect = (e, boardId) => {
    e.stopPropagation();
    onSave?.(boardId);
    setSaveModalOpen(false);
  };

  return (
    <div
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
                  <div onClick={(e) => e.stopPropagation()} style={dropdownStyle}>
                    <p style={{ fontSize: '0.8rem', color: '#767676', margin: '0 0 6px', fontWeight: '600' }}>보드에 저장</p>
                    {boards.length === 0 ? (
                      <BoardBtn label="보드 없이 저장" onClick={(e) => handleBoardSelect(e, null)} />
                    ) : (
                      boards.map(b => (
                        <BoardBtn key={b.boardId} label={b.boardName} onClick={(e) => handleBoardSelect(e, b.boardId)} />
                      ))
                    )}
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
