'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';

export default function AppHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loginHover, setLoginHover] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const token = localStorage.getItem('token');
    const nickname = localStorage.getItem('nickname') || '';
    const profileImg = localStorage.getItem('profileImg') || '';

    const handleLogout = async () => {
        try {
            await axios.post('/api/users/logout', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
        } catch (e) {
        } finally {
            localStorage.clear();
            setShowDropdown(false);
            router.push('/');
        }
    };

    const handleProfileEdit = () => {
        setShowDropdown(false);
        router.push('/profile/edit');
    };

    if (!token) {
        return (
            <nav className="navbar px-4 py-3 d-flex justify-content-between align-items-center border-bottom bg-white">
                <Link href="/" className="text-decoration-none">
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#E60023' }}>
                        Pinterior
                    </span>
                </Link>
                <button
                    className="btn fw-bold px-4 py-2"
                    style={{
                        backgroundColor: loginHover ? '#c0001a' : '#E60023',
                        color: '#fff',
                        borderRadius: '24px',
                        border: 'none',
                        transition: 'background-color 0.18s',
                    }}
                    onClick={() => router.push('/login')}
                    onMouseEnter={() => setLoginHover(true)}
                    onMouseLeave={() => setLoginHover(false)}
                >
                    로그인
                </button>
            </nav>
        );
    }

    return (
        <nav className="navbar px-4 py-2 d-flex align-items-center border-bottom bg-white" style={{ gap: '1rem' }}>
            <input
                type="text"
                className="form-control rounded-pill px-4"
                placeholder="검색"
                style={{ flex: 1, backgroundColor: '#efefef', border: 'none', height: '44px' }}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
            />

            <div className="position-relative">
                <button
                    className="btn d-flex align-items-center gap-2"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{ border: 'none', background: 'transparent' }}
                >
                    {profileImg ? (
                        <Image
                            src={profileImg}
                            alt="profile"
                            width={36}
                            height={36}
                            className="rounded-circle"
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '36px', height: '36px', backgroundColor: '#555', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}
                        >
                            {nickname.charAt(0)}
                        </div>
                    )}
                    <span style={{ fontSize: '0.8rem' }}>▼</span>
                </button>

                {showDropdown && (
                    <div
                        className="position-absolute end-0 mt-2 bg-white shadow rounded-3 p-2"
                        style={{ minWidth: '180px', zIndex: 1000 }}
                    >
                        <button className="btn btn-light w-100 text-start mb-1" onClick={handleProfileEdit}>프로필 편집</button>
                        <button className="btn btn-light w-100 text-start" onClick={handleLogout}>로그아웃</button>
                    </div>
                )}
            </div>
        </nav>
    );
}