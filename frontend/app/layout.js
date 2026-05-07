import './globals.css';

export const metadata = {
  title: 'Pinterior',
  description: '집안 꾸미기 아이디어를 찾아보세요',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}