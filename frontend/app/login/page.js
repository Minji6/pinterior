'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './LoginPage.module.css';

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/feed');
    }
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/users/login', { email, password });
      const { token, userId, nickname, profileImg } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('nickname', nickname);
      localStorage.setItem(
        'profileImg',
        profileImg && profileImg.startsWith('/')
          ? `http://localhost:8080${profileImg}`
          : ''
      );

      window.dispatchEvent(new Event('auth:login'));

      router.push('/feed');
    } catch (err) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginRoot}>
      <div className={styles.loginCard}>

        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
          </div>
          <span className={styles.logoText}>Pinterior</span>
        </div>

        <h1 className={styles.loginHeading}>오신 것을 환영합니다</h1>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>이메일</label>
          <input
            type="email"
            className={styles.formInput}
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoComplete="email"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>비밀번호</label>
          <div className={styles.formInputWrap}>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${styles.formInput} ${styles.formInputWithIcon}`}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.pwToggle}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          className={styles.loginBtn}
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading && <span className={styles.spinner} />}
          {loading ? '로그인 중...' : '로그인'}
        </button>

      </div>
    </div>
  );
}