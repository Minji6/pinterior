'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, LayoutGrid, PlusCircle, Bell, MessageCircle, Settings } from 'lucide-react';


export default function AppSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  const menuItems = [
    { href: '/feed', icon: <Home size={24} />, label: '홈' },
    { href: '/saved-pins', icon: <LayoutGrid size={24} />, label: '보드' },
    { href: '/pin/create', icon: <PlusCircle size={24} />, label: '만들기' },
  ];

  return (
    <aside
      className="d-flex flex-column align-items-center py-3 border-end bg-white"
      style={{ width: '80px', minHeight: '100vh', flexShrink: 0 }}
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