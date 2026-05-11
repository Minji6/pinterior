import './globals.css';
import BootstrapClient from '../components/BootstrapClient';
import AppHeader from '../components/AppHeader';
import AppSidebar from '../components/AppSidebar';
import AuthContextProvider from '@/contexts/AuthContext';
import AxiosConfig from '@/apis/AxiosConfig';

export const metadata = {
  title: 'Pinterior',
  description: '인테리어 이미지 큐레이션 서비스',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthContextProvider>

          {/* Axios 설정 컴포넌트 */}
          <AxiosConfig />

          <BootstrapClient />
          <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* 사이드바 — 전체 높이 */}
            <AppSidebar />

            {/* 오른쪽 영역 — 헤더 + 콘텐츠 */}
            <div className="d-flex flex-column flex-grow-1">
              <AppHeader />
              <main className="flex-grow-1" style={{ backgroundColor: '#f8f8f8' }}>
                {children}
              </main>
            </div>
          </div>

        </AuthContextProvider>
      </body>
    </html>
  );
}