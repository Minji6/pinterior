'use client';

import styles from './ProfileHeader.module.css';

export default function ProfileHeader({ profile, onEditClick }) {
  const myUserId =
    typeof window !== 'undefined'
      ? Number(localStorage.getItem('userId'))
      : null;
  const isOwner = myUserId === profile.userId;

  const profileImgSrc = (() => {
    if (!profile.profileImg) return null;
    const viewUrl = profile.profileImg.replace(
      /\/api\/users\/(\d+)\/image$/,
      '/api/users/$1/image/view'
    );
    return `http://localhost:8080${viewUrl}`;
  })();

  return (
    <div className={styles.profileSection}>
      <div className={styles.avatarWrap}>
        {profileImgSrc ? (
          <img src={profileImgSrc} alt="프로필 이미지" className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>
            {profile.nickname?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className={styles.profileInfo}>
        <h1 className={styles.nickname}>{profile.nickname}</h1>
        <p className={styles.email}>{profile.email}</p>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

        {isOwner && (
          <div className={styles.actions}>
            <button className={styles.btnEdit} onClick={onEditClick}>
              프로필 수정
            </button>
          </div>
        )}
      </div>
    </div>
  );
}