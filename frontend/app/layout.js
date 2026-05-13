import './globals.css';
import BootstrapClient from '../components/BootstrapClient';
import AppHeader from '../components/AppHeader';
import ClientLayout from '../components/ClientLayout';
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
          <ClientLayout>
            <AppHeader />
            <main className="flex-grow-1" style={{ backgroundColor: '#f8f8f8' }}>
              {children}
            </main>
          </ClientLayout>

        </AuthContextProvider>
      </body>
    </html>
  );
}