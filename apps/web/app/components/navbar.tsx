'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import authClient from '../../lib/auth/authClient';
import { useAuth } from '../../lib/auth/authProvider';
import { useSearch } from '../../lib/search/SearchContext';

import AuthModal from './auth/AuthModal';

export default function Navbar() {
  const { setUser, user } = useAuth();
  const { searchValue, setSearchValue } = useSearch();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const getDisplayName = () => {
    if (!user) return 'Guest';
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;
  };

  const getInitials = () => {
    if (!user) return '?';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (
      `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
      user.email.charAt(0).toUpperCase()
    );
  };

  const handleLogout = async () => {
    try {
      await authClient.logout();
    } finally {
      setUser(null);
      setIsProfileMenuOpen(false);
    }
  };

  return (
    <nav
      className="border-b shadow-sm"
      style={{
        backgroundColor: 'var(--white)',
        borderColor: 'var(--background-tertiary)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 flex items-center h-16">
        <Logo />
        <div className="flex-1 flex justify-center px-8">
          <SearchBar value={searchValue} onChange={setSearchValue} />
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <CreateOfferButton />

              <div className="relative">
                <ProfileButton
                  initials={getInitials()}
                  displayName={getDisplayName()}
                  isOpen={isProfileMenuOpen}
                  onClick={() => {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                  }}
                />

                {isProfileMenuOpen && (
                  <ProfileDropdown
                    displayName={getDisplayName()}
                    email={user?.email || 'No email'}
                    onLogout={handleLogout}
                    onNavigate={() => {
                      setIsProfileMenuOpen(false);
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <AuthButton
              onClick={() => {
                setIsAuthModalOpen(true);
              }}
            />
          )}
        </div>
      </div>

      <AuthModal
        open={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
        }}
      />
    </nav>
  );
}

const SearchBar = ({
  onChange,
  value,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="w-full max-w-[500px] relative">
    <div className="relative">
      <input
        type="text"
        placeholder="Rechercher des offres"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="w-full py-2.5 px-4 pl-11 border-2 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          backgroundColor: 'var(--background-secondary)',
          borderColor: 'var(--background-tertiary)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--primary)';
          e.target.style.backgroundColor = 'var(--white)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--background-tertiary)';
          e.target.style.backgroundColor = 'var(--background-secondary)';
        }}
      />
      <Image
        src="/search-icon.svg"
        alt="Search"
        width={16}
        height={16}
        className="absolute left-4 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--text-secondary)' }}
      />
    </div>
  </div>
);

const AuthButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="py-3 px-6 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
    style={{
      backgroundColor: 'var(--primary)',
      color: 'var(--white)',
    }}
  >
    S&apos;authentifier
  </button>
);

const CreateOfferButton = () => (
  <Link href="/create-offer">
    <button
      className="py-2.5 px-5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md whitespace-nowrap"
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--white)',
      }}
    >
      Déposer une annonce
    </button>
  </Link>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NotificationButton = ({ count }: { count: number }) => (
  <button
    className="relative p-2 border-none rounded-lg bg-transparent transition-all duration-200 hover:bg-[var(--background-secondary)]"
    style={{ color: 'var(--text-secondary)' }}
  >
    <Image
      src="/notification-icon.svg"
      alt="Notifications"
      width={20}
      height={20}
    />
    {count > 0 && (
      <span
        className="absolute top-1 right-1 rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold"
        style={{
          backgroundColor: 'var(--error)',
          color: 'var(--white)',
        }}
      >
        {count}
      </span>
    )}
  </button>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MessageButton = () => (
  <button
    className="p-2 border-none rounded-lg bg-transparent transition-all duration-200 hover:bg-[var(--background-secondary)]"
    style={{ color: 'var(--text-secondary)' }}
  >
    <Image src="/message-icon.svg" alt="Messages" width={20} height={20} />
  </button>
);

const ProfileButton = ({
  displayName,
  initials,
  isOpen,
  onClick,
}: {
  initials: string;
  displayName: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 py-1.5 px-3 border-2 rounded-3xl text-sm font-medium transition-all duration-200"
      style={{
        backgroundColor: 'var(--white)',
        borderColor: 'var(--background-tertiary)',
        color: 'var(--text-primary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--background-tertiary)';
        e.currentTarget.style.backgroundColor = 'var(--white)';
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--white)',
        }}
      >
        {initials}
      </div>
      <span>{displayName}</span>
      <Image
        src="/chevron-down-icon.svg"
        alt="Menu"
        width={12}
        height={12}
        className="transition-transform duration-200"
        style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      />
    </button>
  );
};

const ProfileDropdown = ({
  displayName,
  email,
  onLogout,
  onNavigate,
}: {
  displayName: string;
  email: string;
  onLogout: () => void;
  onNavigate: () => void;
}) => (
  <div
    className="absolute top-full right-0 mt-2 w-[200px] border rounded-xl overflow-hidden z-[1000]"
    style={{
      backgroundColor: 'var(--white)',
      borderColor: 'var(--background-tertiary)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    }}
  >
    <div
      className="py-3 px-4 border-b"
      style={{ borderColor: 'var(--background-tertiary)' }}
    >
      <div
        className="font-semibold text-sm"
        style={{ color: 'var(--text-primary)' }}
      >
        {displayName}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {email}
      </div>
    </div>
    <Link
      href="/profile"
      className="block w-full py-3 px-4 border-none bg-transparent text-left text-sm cursor-pointer transition-colors duration-200 hover:bg-[var(--background-secondary)]"
      style={{ color: 'var(--text-primary)' }}
      onClick={onNavigate}
    >
      Mon Profil
    </Link>
    <Link
      href="/profile/settings"
      className="block w-full py-3 px-4 border-none bg-transparent text-left text-sm cursor-pointer transition-colors duration-200 hover:bg-[var(--background-secondary)]"
      style={{ color: 'var(--text-primary)' }}
      onClick={onNavigate}
    >
      Paramètres
    </Link>
    <div
      className="border-t"
      style={{ borderColor: 'var(--background-tertiary)' }}
    >
      <button
        onClick={onLogout}
        className="w-full py-3 px-4 border-none bg-transparent text-left text-sm cursor-pointer transition-colors duration-200 hover:bg-[var(--background-secondary)]"
        style={{ color: 'var(--error)' }}
      >
        Déconnexion
      </button>
    </div>
  </div>
);

const Logo = () => (
  <div className="flex items-center">
    <Link href="/">
      <Image
        src="/logo.png"
        alt="Hired Logo"
        width={120}
        height={40}
        priority
        className="cursor-pointer"
      />
    </Link>
  </div>
);
