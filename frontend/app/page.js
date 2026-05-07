'use client';
import { useRouter } from 'next/navigation';

const styles = `
  .login-btn {
    background-color: #E60023;
    color: #fff;
    border: none;
    border-radius: 24px;
    font-size: 1rem;
    font-weight: bold;
    padding: 10px 24px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
  }
  .login-btn:hover {
    background-color: #ad081b;
    transform: scale(1.03);
  }
  .login-btn:active {
    background-color: #8b0616;
    transform: scale(0.98);
  }
`;

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <style>{styles}</style>

      <nav className="navbar px-4 py-3 d-flex justify-content-between align-items-center border-bottom">
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#E60023' }}>
          Pinterior
        </span>
        <button className="login-btn" onClick={() => router.push('/login')}>
          로그인
        </button>
      </nav>

      <div className="text-center py-5">
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>
          집안 꾸미기 아이디어를 찾아보세요
        </h1>
        <p className="text-muted mt-3 fs-5">
          인테리어 영감을 발견하고 저장해보세요
        </p>
        <button
          className="btn btn-danger rounded-pill px-5 py-2 mt-4 fs-5"
          onClick={() => router.push('/login')}
        >
          시작하기
        </button>
      </div>

      <div className="container-fluid px-4">
        <div className="row g-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-6 col-md-4 col-lg-2">
              <div
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: '16px',
                  height: i % 2 === 0 ? '280px' : '220px',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}