'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, LayoutGrid, PlusCircle, Settings } from 'lucide-react';
import CreatePanel from './CreatePanel';

export default function AppSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  const menuItems = [
    { href: '/feed', icon: <Home size={24} />, label: '홈' },
    { href: '/boards', icon: <LayoutGrid size={24} />, label: '보드' },
  ];

  return (
    <aside
      className="d-flex flex-column align-items-center py-3 border-end bg-white"
      style={{ width: '80px', minHeight: '100vh' }}
    >
      <Link href="/feed" className="text-decoration-none mb-4">
        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#E60023' }}>P</span>
      </Link>
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          title={item.label}
          className="d-flex align-items-center justify-content-center mb-2 text-decoration-none text-dark rounded-3"
          style={{ width: '48px', height: '48px', backgroundColor: pathname === item.href ? '#efefef' : 'transparent' }}
        >
          {item.icon}
        </Link>
      ))}

      {/* 만들기 버튼 */}
      <button
        onClick={() => setIsCreateOpen(!isCreateOpen)}
        title="만들기"
        className="d-flex align-items-center justify-content-center mb-2 border-0 bg-transparent rounded-3"
        style={{ width: '48px', height: '48px', cursor: 'pointer' }}
      >
        <PlusCircle size={24} />
      </button>

      {/* 만들기 슬라이드 패널 */}
      <CreatePanel isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <div className="mt-auto">
        <Link
          href="/feed"
          title="설정"
          className="d-flex align-items-center justify-content-center text-decoration-none text-dark rounded-3"
          style={{ width: '48px', height: '48px' }}
        >
          <Settings size={24} />
        </Link>
      </div>
    </aside>
  );
}
