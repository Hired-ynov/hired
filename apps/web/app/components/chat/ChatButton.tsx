'use client';

import React from 'react';
import ChatContent from './ChatContent';
import { useChat } from './ChatProvider';
import { useAuth } from '@/lib/auth/authProvider';

export default function ChatButton() {
  const { user } = useAuth();
  const { hasNewMessages, toggleChat } = useChat();

  // Don't render chat button if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        aria-label="Open chat"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(109, 90, 234, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 999,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow =
            '0 6px 20px rgba(109, 90, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow =
            '0 4px 12px rgba(109, 90, 234, 0.4)';
        }}
      >
        {/* Chat Icon - Using a simple SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            color: 'var(--white)',
          }}
        >
          <path
            d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"
            fill="currentColor"
          />
          <circle cx="8" cy="10" r="1.5" fill="currentColor" />
          <circle cx="12" cy="10" r="1.5" fill="currentColor" />
          <circle cx="16" cy="10" r="1.5" fill="currentColor" />
        </svg>

        {/* Notification Badge */}
        {hasNewMessages && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: 'var(--error)',
              color: 'var(--white)',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              border: '2px solid var(--white)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            •
          </span>
        )}
      </button>

      <ChatContent />

      {/* Add pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
