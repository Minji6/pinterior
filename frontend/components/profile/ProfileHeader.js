import { useRef } from "react";
import styles from "./ProfileHeader.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function ProfileHeader({ user, isMyProfile, onProfileUpdate }) {
  const fileInputRef = useRef(null);

  const profileImgUrl = user.profileImg
    ? `${BASE_URL}${user.profileImg}`
    : null;

  const handleImageClick = () => {
    if (!isMyProfile) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${BASE_URL}/api/users/${user.userId}/image`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      onProfileUpdate?.({ profileImg: data.data.profileImg });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.avatarWrapper} onClick={handleImageClick}>
        {profileImgUrl ? (
          <img src={profileImgUrl} alt="프로필" className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>
            {user.nickname?.charAt(0) ?? "?"}
          </div>
        )}
        {isMyProfile && (
          <div className={styles.avatarOverlay}>변경</div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpg,image/jpeg,image/png,image/gif"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
      </div>

      <div className={styles.info}>
        <h1 className={styles.nickname}>{user.nickname}</h1>
        <p className={styles.loginId}>{user.loginId}</p>
        {user.bio && <p className={styles.bio}>{user.bio}</p>}

        {isMyProfile && (
          <div className={styles.buttonGroup}>
            <button className={styles.btnSecondary}>프로필 공유</button>
            <button className={styles.btnSecondary}>프로필 수정</button>
          </div>
        )}
      </div>
    </div>
  );
}