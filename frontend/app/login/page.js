'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/users/login', { email, password });
      const { token, userId, nickname, profileImg } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('profileImg', profileImg || '');
      router.push('/feed');
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', backgroundColor: '#f8f8f8' }}
    >
      <div className="bg-white rounded-4 shadow p-5" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold">Pinterior에 오신 것을 환영합니다</h2>
        </div>

        {error && (
          <div className="alert alert-danger py-2 text-center">{error}</div>
        )}

        <div className="mb-3">
          <input
            type="email"
            className="form-control rounded-3 py-2"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3 position-relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control rounded-3 py-2"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            type="button"
            className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <button
          className="btn btn-danger w-100 rounded-pill py-2 fw-bold"
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </div>
    </div>
  );
}