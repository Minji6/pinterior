'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [previewImg, setPreviewImg] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      router.replace('/login');
      return;
    }

    fetch(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 200) {
          const data = json.data;
          setProfile(data);
          setNickname(data.nickname || '');
          setBio(data.bio || '');
          if (data.profileImg) {
            const viewUrl = data.profileImg.replace(
              /\/api\/users\/(\d+)\/image$/,
              '/api/users/$1/image/view'
            );
            setPreviewImg(`http://localhost:8080${viewUrl}`);
          }
        }
      })
      .catch(() => setError('프로필을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewImg(URL.createObjectURL(file));
  };

  const handleImageDelete = async () => {
    if (!confirm('프로필 이미지를 삭제하시겠습니까?')) return;
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const res = await fetch(`/api/users/${userId}/image/delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.status === 200) {
      setPreviewImg(null);
      setSelectedFile(null);
      setProfile((prev) => ({ ...prev, profileImg: null }));
      localStorage.removeItem('profileImg');
    } else {
      alert(json.message);
    }
  };

  const handleSave = async () => {
    if (!nickname || nickname.length < 2 || nickname.length > 20) {
      setNicknameError('닉네임은 2~20자로 입력해주세요.');
      return;
    }
    if (bio.length > 200) {
      setError('소개는 200자 이내로 입력해주세요.');
      return;
    }

    setSaving(true);
    setError('');
    setNicknameError('');

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    try {
      // 1. 이미지 수정
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const imgRes = await fetch(`/api/users/${userId}/image`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const imgJson = await imgRes.json();
        if (imgJson.status !== 200) {
          setError(imgJson.message);
          setSaving(false);
          return;
        }
        const newImgUrl = imgJson.data.profileImg.replace(
          /\/api\/users\/(\d+)\/image$/,
          '/api/users/$1/image/view'
        );
        localStorage.setItem('profileImg', `http://localhost:8080${newImgUrl}`);
      }

      // 2. 닉네임 수정
      if (nickname !== profile.nickname) {
        const nickRes = await fetch(`/api/users/${userId}/nickname`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nickname }),
        });
        const nickJson = await nickRes.json();
        if (nickJson.status === 409) {
          setNicknameError('이미 사용 중인 닉네임입니다.');
          setSaving(false);
          return;
        }
        if (nickJson.status !== 200) {
          setError(nickJson.message);
          setSaving(false);
          return;
        }
        localStorage.setItem('nickname', nickname);
      }

      // 3. 소개 수정
      const bioValue = bio.trim() === '' ? null : bio.trim();
      if (bioValue !== profile.bio) {
        const bioRes = await fetch(`/api/users/${userId}/bio`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bio: bioValue }),
        });
        const bioJson = await bioRes.json();
        if (bioJson.status !== 200) {
          setError(bioJson.message);
          setSaving(false);
          return;
        }
      }

      // 저장 완료 → 하드 이동 (캐시 무시하고 완전히 새로 로드)
      window.location.href = '/mypage';
    } catch (e) {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>프로필 수정</h2>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.imageSection}>
        <div className={styles.avatarWrap}>
          {previewImg ? (
            <img src={previewImg} alt="프로필 이미지" className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>
              {nickname?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className={styles.imageButtons}>
          <button className={styles.btnSecondary} onClick={() => fileInputRef.current.click()}>
            이미지 변경
          </button>
          {previewImg && (
            <button className={styles.btnDanger} onClick={handleImageDelete}>
              이미지 삭제
            </button>
          )}
        </div>
        <input
          type="file"
          accept="image/jpg,image/jpeg,image/png,image/gif"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>닉네임 <span className={styles.required}>*</span></label>
        <input
          type="text"
          className={`${styles.input} ${nicknameError ? styles.inputError : ''}`}
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setNicknameError('');
          }}
          maxLength={20}
          placeholder="2~20자로 입력해주세요"
        />
        {nicknameError && <p className={styles.fieldError}>{nicknameError}</p>}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>소개</label>
        <textarea
          className={styles.textarea}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          placeholder="소개를 입력해주세요 (최대 200자)"
          rows={4}
        />
        <p className={styles.charCount}>{bio.length} / 200</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnCancel} onClick={() => router.push('/mypage')}>
          취소
        </button>
        <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
}